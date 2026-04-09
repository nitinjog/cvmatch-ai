import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  generated_cv TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT 'Not applicable',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_jd_session ON job_descriptions(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cv_session ON cvs(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_analysis_session ON analysis_results(session_id);
`;

export async function runMigration(): Promise<void> {
  // Parse the Supabase URL to get connection details for direct pg connection
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn('Migration skipped: missing Supabase env vars');
    return;
  }

  // Extract project ref from URL: https://pbasfrtrfdevzfekoxpz.supabase.co
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!password) {
    console.warn('Migration skipped: SUPABASE_DB_PASSWORD not set. Run schema.sql manually in Supabase SQL Editor.');
    return;
  }

  const client = new Client({
    host: `aws-1-ap-northeast-1.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    await client.query(MIGRATION_SQL);
    console.log('Database migration completed successfully');
  } catch (err) {
    console.warn('Migration failed (non-fatal):', (err as Error).message);
    console.warn('→ Run supabase/schema.sql manually in Supabase SQL Editor');
  } finally {
    await client.end().catch(() => {/* ignore */});
  }
}
