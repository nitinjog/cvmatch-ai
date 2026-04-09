import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { analyzeCV } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';

function MatchCircle({ percent }: { percent: number }) {
  const color = percent >= 70 ? '#22c55e' : percent >= 40 ? '#f59e0b' : '#ef4444';
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="bold" fill={color}>
          {percent}%
        </text>
        <text x="70" y="90" textAnchor="middle" fontSize="11" fill="#9ca3af">match</text>
      </svg>
      <p className="text-sm font-medium mt-1" style={{ color }}>
        {percent >= 70 ? 'Strong Match' : percent >= 40 ? 'Moderate Match' : 'Low Match'}
      </p>
    </div>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { sessionId, analysis, setAnalysis, setStep, loading, setLoading, error, setError } = useStore();
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (analysis || ran) return;
    setRan(true);
    setLoading(true);
    setError(null);

    analyzeCV(sessionId)
      .then((data) => {
        setAnalysis(data.analysis);
        setStep(2);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, analysis, ran, setAnalysis, setStep, setLoading, setError]);

  const handleNext = () => {
    setStep(3);
    navigate('/questions');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-600 font-medium">Analyzing your CV against the job description...</p>
        <p className="text-sm text-gray-400">This may take 15-30 seconds</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Analysis</h1>
        <p className="text-gray-500">Here's how your CV matches the job requirements.</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {analysis && (
        <div className="space-y-6">
          {/* Match Score + Summary */}
          <div className="card flex flex-col md:flex-row items-center gap-8">
            <MatchCircle percent={analysis.match_percentage} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Assessment</h2>
              <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card border-l-4 border-green-400">
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span>✅</span> Strengths ({analysis.strengths.length})
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card border-l-4 border-red-400">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <span>⚠️</span> Gaps ({analysis.gaps.length})
              </h3>
              <ul className="space-y-2">
                {analysis.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5">•</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords */}
          {analysis.missing_keywords.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((kw, i) => (
                  <span key={i} className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={() => navigate('/upload')} className="btn-secondary">
              ← Back
            </button>
            <button onClick={handleNext} className="btn-primary px-8 py-3">
              Answer Questions →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
