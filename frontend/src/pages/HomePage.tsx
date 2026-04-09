import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: '📄', title: 'Upload JD & CV', desc: 'PDF, DOCX, or paste text directly' },
    { icon: '🎯', title: 'AI Match Analysis', desc: 'Get match %, strengths, and gaps instantly' },
    { icon: '❓', title: 'Smart Questions', desc: 'Answer targeted questions to fill gaps' },
    { icon: '✨', title: 'Optimized CV', desc: 'AI rewrites your CV for the specific role' },
    { icon: '✏️', title: 'Rich Text Editor', desc: 'Fine-tune your CV with a built-in editor' },
    { icon: '📥', title: 'Export PDF/DOCX', desc: 'Download in any format, ready to send' },
  ];

  return (
    <div className="text-center py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span>✨</span> Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Land Your Dream Job with
          <span className="text-blue-600"> AI-Optimized</span> CV
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Upload your CV and job description. Our AI analyzes the match, identifies gaps,
          and generates a tailored CV that gets you noticed.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          Get Started — It's Free
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        {features.map((f) => (
          <div key={f.title} className="card text-left hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Flow */}
      <div className="mt-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">How it works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {['Upload JD + CV', 'AI Analysis', 'Answer Questions', 'Get Optimized CV', 'Export'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </div>
                <span className="text-xs text-gray-500 mt-2 text-center w-20">{step}</span>
              </div>
              {i < 4 && <div className="hidden md:block w-8 h-0.5 bg-blue-200 -mt-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
