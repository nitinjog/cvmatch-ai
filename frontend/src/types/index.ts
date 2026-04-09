export interface AnalysisResult {
  match_percentage: number;
  strengths: string[];
  gaps: string[];
  missing_keywords: string[];
  summary: string;
}

export interface Question {
  id: string;
  question: string;
  category: string;
  context: string;
}

export interface Answer {
  question_id: string;
  question: string;
  answer: string;
}

export interface AppState {
  sessionId: string;
  step: number;

  // Step 1: JD
  jdText: string;
  jdFile: File | null;

  // Step 2: CV
  cvText: string;
  cvFile: File | null;

  // Step 3: Analysis
  analysis: AnalysisResult | null;

  // Step 4: Questions
  questions: Question[];
  answers: Answer[];

  // Step 5: Generated CV
  generatedCV: string;

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  setSessionId: (id: string) => void;
  setStep: (step: number) => void;
  setJdText: (text: string) => void;
  setJdFile: (file: File | null) => void;
  setCvText: (text: string) => void;
  setCvFile: (file: File | null) => void;
  setAnalysis: (analysis: AnalysisResult) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswers: (answers: Answer[]) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  setGeneratedCV: (cv: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
