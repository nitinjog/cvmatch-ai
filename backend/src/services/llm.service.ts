import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface AnalysisResult {
  match_percentage: number;
  strengths: string[];
  gaps: string[];
  missing_keywords: string[];
  summary: string;
}

interface Question {
  id: string;
  question: string;
  category: string;
  context: string;
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function callGemini(prompt: string): Promise<string> {
  if (!genAI) throw new Error('Gemini API key not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callOpenRouter(prompt: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OpenRouter API key not configured');

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cvmatch-ai.netlify.app',
        'X-Title': 'CVMatch AI',
      },
    }
  );

  return response.data.choices[0].message.content;
}

async function callLLM(prompt: string): Promise<string> {
  try {
    return await callGemini(prompt);
  } catch (geminiError) {
    console.warn('Gemini failed, trying OpenRouter:', (geminiError as Error).message);
    try {
      return await callOpenRouter(prompt);
    } catch (openRouterError) {
      throw new Error(`All LLM providers failed. Last error: ${(openRouterError as Error).message}`);
    }
  }
}

function extractJSON<T>(text: string): T {
  // Try to extract JSON from markdown code block or raw JSON
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('No JSON found in LLM response');
  return JSON.parse(jsonMatch[1].trim()) as T;
}

export async function analyzeMatch(jdText: string, cvText: string): Promise<AnalysisResult> {
  const prompt = `You are an expert HR analyst. Analyze the match between this job description and CV.

JOB DESCRIPTION:
${jdText.slice(0, 3000)}

CANDIDATE CV:
${cvText.slice(0, 3000)}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "match_percentage": <number 0-100>,
  "strengths": [<array of 3-6 matching strength strings>],
  "gaps": [<array of 3-6 gap/weakness strings>],
  "missing_keywords": [<array of important keywords from JD missing in CV>],
  "summary": "<2-3 sentence overall assessment>"
}`;

  const response = await callLLM(prompt);
  return extractJSON<AnalysisResult>(response);
}

export async function generateQuestions(
  gaps: string[],
  missingKeywords: string[],
  jdText: string
): Promise<Question[]> {
  const prompt = `You are a career coach. Generate targeted interview/improvement questions based on these CV gaps.

JOB CONTEXT: ${jdText.slice(0, 1000)}

IDENTIFIED GAPS: ${gaps.join(', ')}
MISSING KEYWORDS: ${missingKeywords.join(', ')}

Generate 6-8 questions to help the candidate fill these gaps. Return ONLY valid JSON array:
[
  {
    "id": "q1",
    "question": "<specific question>",
    "category": "<Skills|Experience|Education|Certification|Other>",
    "context": "<why this question matters for the role>"
  }
]`;

  const response = await callLLM(prompt);
  return extractJSON<Question[]>(response);
}

export async function generateEnhancedCV(
  jdText: string,
  cvText: string,
  answers: Array<{ question: string; answer: string }>
): Promise<string> {
  const answersText = answers
    .filter((a) => a.answer && a.answer !== 'Not applicable')
    .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
    .join('\n\n');

  const prompt = `You are an expert CV writer. Rewrite and optimize this CV for the target job.

TARGET JOB DESCRIPTION:
${jdText.slice(0, 2000)}

ORIGINAL CV:
${cvText.slice(0, 2500)}

ADDITIONAL CANDIDATE INFORMATION (from questionnaire):
${answersText || 'No additional information provided.'}

Instructions:
- Rewrite the CV to highlight relevant experience and skills for this specific role
- Incorporate relevant information from the questionnaire answers
- Use strong action verbs and quantify achievements where possible
- Include relevant keywords from the job description naturally
- Keep a professional tone
- Structure: Professional Summary, Work Experience, Skills, Education, Certifications (if any)
- Return the CV as clean, well-formatted HTML using <h2>, <h3>, <p>, <ul>, <li> tags only
- Do NOT include <html>, <head>, <body> tags`;

  return await callLLM(prompt);
}
