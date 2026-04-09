-- CVMatch AI Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pbasfrtrfdevzfekoxpz/sql

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  generated_cv TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Descriptions
CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

-- CVs
CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Analysis Results
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Candidate Answers
CREATE TABLE IF NOT EXISTS candidate_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT 'Not applicable',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jd_session ON job_descriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_cv_session ON cvs(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_session ON analysis_results(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON candidate_answers(session_id);

-- Storage Buckets (run via Supabase Dashboard or API)
-- Create: cv_uploads, jd_uploads, generated_cvs
-- Set to public read for file access

-- RLS Policies (service role bypasses RLS, so these are for frontend direct access if needed)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_answers ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (backend uses service role key)
CREATE POLICY "service_role_all" ON sessions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON job_descriptions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON cvs FOR ALL USING (true);
CREATE POLICY "service_role_all" ON analysis_results FOR ALL USING (true);
CREATE POLICY "service_role_all" ON candidate_answers FOR ALL USING (true);
