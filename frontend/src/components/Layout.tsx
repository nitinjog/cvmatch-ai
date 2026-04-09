import { Outlet, useLocation, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const STEPS = [
  { path: '/upload', label: 'Upload', step: 1 },
  { path: '/analysis', label: 'Analysis', step: 2 },
  { path: '/questions', label: 'Questions', step: 3 },
  { path: '/editor', label: 'CV Editor', step: 4 },
];

export default function Layout() {
  const location = useLocation();
  const { step } = useStore();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CVMatch <span className="text-blue-600">AI</span></span>
          </Link>
          {!isHome && (
            <button
              onClick={() => useStore.getState().reset()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Step Progress */}
      {!isHome && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-1">
              {STEPS.map((s, idx) => (
                <div key={s.step} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    step >= s.step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">
                      {s.step}
                    </span>
                    {s.label}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${step > s.step ? 'bg-blue-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        CVMatch AI — Powered by Gemini 2.5 Flash
      </footer>
    </div>
  );
}
