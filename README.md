# CVMatch AI

AI-powered CV optimization platform. Upload a Job Description and your CV — get a match analysis, targeted improvement questions, and an AI-generated optimized CV ready to export.

## Live URLs

| Service | URL |
|---|---|
| **Frontend** | https://cvmatch-ai.netlify.app |
| **Backend** | https://cvmatch-ai-backend.onrender.com |
| **GitHub** | https://github.com/nitinjog/cvmatch-ai |

---

## ⚠️ One Manual Step Required: Run the Database Schema

Open the Supabase SQL Editor and run the schema:
👉 https://supabase.com/dashboard/project/pbasfrtrfdevzfekoxpz/sql/new

Copy and paste the contents of `supabase/schema.sql` and click **Run**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| State | Zustand |
| Editor | TipTap |
| Backend | Node.js + Express + TypeScript |
| AI | Gemini 2.5 Flash (+ OpenRouter fallback) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Frontend Deploy | Netlify |
| Backend Deploy | Render |

---

## Application Flow

```
1. Upload JD + CV  →  stored in Supabase
2. AI analyzes match  →  returns score, strengths, gaps, keywords
3. AI generates questions  →  based on gaps
4. User answers questions  →  saved to Supabase
5. AI generates optimized CV  →  using JD + original CV + answers
6. User edits in rich text editor
7. Export as PDF or DOCX
```

---

## Project Structure

```
/
├── frontend/                  # React + Vite app (Netlify)
│   ├── src/
│   │   ├── pages/             # UploadPage, AnalysisPage, QuestionsPage, EditorPage
│   │   ├── components/        # FileDropzone, CVEditor, Layout, ErrorBanner
│   │   ├── services/api.ts    # Axios API calls to backend
│   │   ├── store/useStore.ts  # Zustand global state
│   │   └── types/index.ts     # TypeScript interfaces
│   ├── netlify.toml
│   └── .env.example
│
├── backend/                   # Node.js + Express (Render)
│   ├── src/
│   │   ├── routes/            # jd, cv, analyze, questions, answers, generate-cv, export
│   │   ├── services/
│   │   │   ├── llm.service.ts      # Gemini + OpenRouter abstraction
│   │   │   ├── supabase.service.ts # DB + Storage operations
│   │   │   ├── parser.service.ts   # PDF/DOCX/TXT parsing
│   │   │   └── export.service.ts   # PDF + DOCX generation
│   │   ├── middleware/        # Multer file upload
│   │   └── utils/validation.ts
│   ├── render.yaml
│   └── .env.example
│
└── supabase/
    └── schema.sql             # Run this in Supabase SQL Editor
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jd` | Submit job description (file or text) |
| POST | `/api/cv` | Submit CV (file or text) |
| POST | `/api/analyze` | Run AI match analysis |
| POST | `/api/questions` | Generate improvement questions |
| POST | `/api/answers` | Save candidate answers |
| POST | `/api/generate-cv` | Generate optimized CV |
| POST | `/api/export` | Export as PDF or DOCX |
| GET | `/health` | Health check |

---

## Environment Variables

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=
OPENROUTER_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FRONTEND_URL=
PORT=3000
NODE_ENV=production
```

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BACKEND_URL=
```

---

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev     # runs on :3000

# Frontend
cd frontend
npm install
npm run dev     # runs on :5173
```

---

## Deployment

### Frontend → Netlify
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist --auth=YOUR_TOKEN
```

### Backend → Render
Push to `main` branch on GitHub — Render auto-deploys.
