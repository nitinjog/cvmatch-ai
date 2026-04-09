import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Upload file to Supabase Storage
export async function uploadFileToStorage(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Save job description
export async function saveJobDescription(sessionId: string, text: string, fileUrl?: string) {
  const { data, error } = await supabase
    .from('job_descriptions')
    .upsert({ session_id: sessionId, text, file_url: fileUrl, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`Failed to save JD: ${error.message}`);
  return data;
}

// Save CV record
export async function saveCV(sessionId: string, text: string, fileUrl?: string, fileName?: string) {
  const { data, error } = await supabase
    .from('cvs')
    .upsert({ session_id: sessionId, text, file_url: fileUrl, file_name: fileName, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`Failed to save CV: ${error.message}`);
  return data;
}

// Save analysis result
export async function saveAnalysis(sessionId: string, analysis: object) {
  const { data, error } = await supabase
    .from('analysis_results')
    .upsert({ session_id: sessionId, result: analysis, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`Failed to save analysis: ${error.message}`);
  return data;
}

// Save candidate answers
export async function saveAnswers(sessionId: string, answers: object[]) {
  // Delete existing answers for session
  await supabase.from('candidate_answers').delete().eq('session_id', sessionId);

  const rows = answers.map((a) => ({ session_id: sessionId, ...a }));
  const { data, error } = await supabase.from('candidate_answers').insert(rows).select();

  if (error) throw new Error(`Failed to save answers: ${error.message}`);
  return data;
}

// Save generated CV
export async function saveGeneratedCV(sessionId: string, content: string) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ generated_cv: content, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to save generated CV: ${error.message}`);
  return data;
}

// Get session data
export async function getSessionData(sessionId: string) {
  const [jd, cv, analysis, answers] = await Promise.all([
    supabase.from('job_descriptions').select('*').eq('session_id', sessionId).maybeSingle(),
    supabase.from('cvs').select('*').eq('session_id', sessionId).maybeSingle(),
    supabase.from('analysis_results').select('*').eq('session_id', sessionId).maybeSingle(),
    supabase.from('candidate_answers').select('*').eq('session_id', sessionId),
  ]);

  return {
    jd: jd.data,
    cv: cv.data,
    analysis: analysis.data,
    answers: answers.data || [],
  };
}

// Ensure session exists
export async function ensureSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .upsert({ id: sessionId, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`Failed to ensure session: ${error.message}`);
  return data;
}
