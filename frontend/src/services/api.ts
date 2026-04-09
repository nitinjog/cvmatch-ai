import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — LLM calls can be slow on free tier
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Submit Job Description (text or file)
export async function submitJD(sessionId: string, text?: string, file?: File) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  if (file) formData.append('file', file);
  else if (text) formData.append('text', text);

  const { data } = await api.post('/api/jd', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Submit CV (text or file)
export async function submitCV(sessionId: string, text?: string, file?: File) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  if (file) formData.append('file', file);
  else if (text) formData.append('text', text);

  const { data } = await api.post('/api/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Run CV vs JD analysis
export async function analyzeCV(sessionId: string) {
  const { data } = await api.post('/api/analyze', { session_id: sessionId });
  return data;
}

// Generate improvement questions
export async function getQuestions(sessionId: string) {
  const { data } = await api.post('/api/questions', { session_id: sessionId });
  return data;
}

// Save candidate answers
export async function saveAnswers(
  sessionId: string,
  answers: Array<{ question_id: string; question: string; answer: string }>
) {
  const { data } = await api.post('/api/answers', { session_id: sessionId, answers });
  return data;
}

// Generate enhanced CV
export async function generateCV(sessionId: string) {
  const { data } = await api.post('/api/generate-cv', { session_id: sessionId });
  return data;
}

// Export CV as PDF or DOCX
export async function exportCV(sessionId: string, cvHtml: string, format: 'pdf' | 'docx') {
  const response = await api.post(
    '/api/export',
    { session_id: sessionId, cv_html: cvHtml, format },
    { responseType: 'blob' }
  );

  const blob = new Blob([response.data], {
    type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `optimized-cv.${format}`;
  link.click();
  window.URL.revokeObjectURL(url);
}
