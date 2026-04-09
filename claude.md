# CVMatch AI – Architecture & Environment Guide (Netlify + Render + Supabase)

---

## 📌 Overview

CVMatch AI is an AI-powered resume optimization platform that:

* Matches CVs to Job Descriptions
* Identifies gaps
* Improves resumes using LLMs

---

## 🧱 Architecture Overview

### 🌐 Frontend (Netlify)

* React + Vite + TypeScript
* TailwindCSS
* Hosted on Netlify CDN

---

### ⚙️ Backend (Render)

* Node.js + Express
* REST APIs
* Handles:

  * File parsing
  * LLM orchestration
  * Supabase interaction

---

### 🗄️ Database & Storage (Supabase)

#### Database Tables:

* users (optional)
* sessions
* job_descriptions
* cvs
* analysis_results
* candidate_answers

#### Storage Buckets:

* cv_uploads
* jd_uploads
* generated_cvs

---

## 🔑 Environment Variables

### Backend (.env)

GEMINI_API_KEY=
OPENROUTER_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

PORT=3000

---

### Frontend (.env)

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BACKEND_URL=

---

## 🔄 Application Flow

1. Upload JD + CV → stored in Supabase
2. Backend parses files
3. LLM analyzes match
4. Gaps identified
5. Questions generated
6. Candidate answers stored
7. LLM generates improved CV
8. User edits
9. Export and store final version

---

## 🧠 LLM Layer Design

### Provider Abstraction

Functions:

* analyzeMatch(jd, cv)
* generateQuestions(gaps)
* generateEnhancedCV(jd, cv, answers)

---

## 📊 Data Models

### Analysis

{
match_percentage: number,
strengths: string[],
gaps: string[],
missing_keywords: string[],
summary: string
}

---

### Candidate Answers

{
question_id: string,
answer: string | "Not applicable"
}

---

## 🔌 API Structure

/api/jd
/api/cv
/api/analyze
/api/questions
/api/answers
/api/generate-cv
/api/export

---

## 🚀 Deployment Setup

### Netlify

* Build command: npm run build
* Publish dir: dist
* Environment variables required

---

### Render

* Node service
* Auto deploy from GitHub
* Add environment variables
* Set PORT

---

## 🧪 Testing Strategy

* Unit:

  * parser
  * LLM service
* Integration:

  * Full workflow

---

## 🔐 Security

* Validate file types
* Sanitize inputs
* Protect API keys
* Rate limiting (important for free tier)

---

## 💸 Free Tier Optimization

* Use Gemini Flash for low-cost inference
* Minimize token usage:

  * Chunk inputs
  * Avoid redundant prompts
* Cache responses where possible

---

## 📈 Future Enhancements

* Recruiter dashboard
* Resume scoring vs peers
* Interview simulation
* LinkedIn import

---

## 🧩 Folder Structure

/frontend
/backend
/routes
/services
/utils
/models

---

## ⚠️ Important Notes

* Always ask user for API keys before build
* Never hardcode credentials
* Ensure environment-based config
* Keep LLM prompts modular

---

End of file.
