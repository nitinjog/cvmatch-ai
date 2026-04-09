import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getQuestions, saveAnswers, generateCV } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';

export default function QuestionsPage() {
  const navigate = useNavigate();
  const {
    sessionId, questions, answers,
    setQuestions, updateAnswer, setGeneratedCV,
    setStep, loading, setLoading, error, setError,
  } = useStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (questions.length > 0 || loaded) return;
    setLoaded(true);
    setLoading(true);
    setError(null);

    getQuestions(sessionId)
      .then((data) => setQuestions(data.questions))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, questions.length, loaded, setQuestions, setLoading, setError]);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      // Save answers first
      await saveAnswers(sessionId, answers);
      // Generate enhanced CV
      const data = await generateCV(sessionId);
      setGeneratedCV(data.generated_cv);
      setStep(4);
      navigate('/editor');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor: Record<string, string> = {
    Skills: 'bg-blue-100 text-blue-700',
    Experience: 'bg-purple-100 text-purple-700',
    Education: 'bg-green-100 text-green-700',
    Certification: 'bg-amber-100 text-amber-700',
    Other: 'bg-gray-100 text-gray-600',
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-600 font-medium">Generating targeted questions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Answer These Questions</h1>
        <p className="text-gray-500">
          Your answers help the AI fill the gaps in your CV. Select "Not applicable" if it doesn't apply.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-6">
        {questions.map((q, index) => {
          const answer = answers.find((a) => a.question_id === q.id);
          const colorClass = categoryColor[q.category] || categoryColor.Other;

          return (
            <div key={q.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <span className="step-badge shrink-0">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{q.question}</p>
                    <p className="text-xs text-gray-400 mt-1">{q.context}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${colorClass}`}>
                  {q.category}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <textarea
                  value={answer?.answer === 'Not applicable' ? '' : answer?.answer || ''}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => updateAnswer(q.id, 'Not applicable')}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    answer?.answer === 'Not applicable'
                      ? 'bg-gray-200 text-gray-700 border-gray-300'
                      : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                  }`}
                >
                  Not applicable
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/analysis')} className="btn-secondary" disabled={loading}>
          ← Back
        </button>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary px-8 py-3 flex items-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating CV...
            </>
          ) : (
            'Generate Optimized CV →'
          )}
        </button>
      </div>
    </div>
  );
}
