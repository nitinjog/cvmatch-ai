import { create } from 'zustand';
import type { AppState, AnalysisResult, Question, Answer } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

const initialState = {
  sessionId: generateId(),
  step: 1,
  jdText: '',
  jdFile: null,
  cvText: '',
  cvFile: null,
  analysis: null,
  questions: [],
  answers: [],
  generatedCV: '',
  loading: false,
  error: null,
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setSessionId: (id: string) => set({ sessionId: id }),
  setStep: (step: number) => set({ step }),
  setJdText: (jdText: string) => set({ jdText }),
  setJdFile: (jdFile: File | null) => set({ jdFile }),
  setCvText: (cvText: string) => set({ cvText }),
  setCvFile: (cvFile: File | null) => set({ cvFile }),
  setAnalysis: (analysis: AnalysisResult) => set({ analysis }),
  setQuestions: (questions: Question[]) => {
    // Initialize answers for all questions
    const answers: Answer[] = questions.map((q) => ({
      question_id: q.id,
      question: q.question,
      answer: '',
    }));
    set({ questions, answers });
  },
  setAnswers: (answers: Answer[]) => set({ answers }),
  updateAnswer: (questionId: string, answer: string) => {
    const answers = get().answers.map((a) =>
      a.question_id === questionId ? { ...a, answer } : a
    );
    set({ answers });
  },
  setGeneratedCV: (generatedCV: string) => set({ generatedCV }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ ...initialState, sessionId: generateId() }),
}));
