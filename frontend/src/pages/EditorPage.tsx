import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { exportCV } from '../services/api';
import CVEditor from '../components/CVEditor';
import ErrorBanner from '../components/ErrorBanner';

export default function EditorPage() {
  const navigate = useNavigate();
  const { sessionId, generatedCV, setGeneratedCV, error, setError } = useStore();
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [editorContent, setEditorContent] = useState(generatedCV);

  const handleExport = async (format: 'pdf' | 'docx') => {
    setError(null);
    setExporting(format);
    try {
      await exportCV(sessionId, editorContent, format);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(null);
    }
  };

  const handleSave = () => {
    setGeneratedCV(editorContent);
  };

  if (!generatedCV) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">No CV generated yet.</p>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">CV Editor</h1>
          <p className="text-gray-500">Your optimized CV is ready. Edit, then export.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="btn-secondary text-sm"
          >
            💾 Save
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={!!exporting}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            {exporting === 'docx' ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : '📝'}
            Export DOCX
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="btn-primary text-sm flex items-center gap-1"
          >
            {exporting === 'pdf' ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : '📥'}
            Export PDF
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
        <span className="text-green-600 text-xl">✨</span>
        <div>
          <p className="text-green-800 font-medium text-sm">Your optimized CV is ready!</p>
          <p className="text-green-600 text-xs">AI has tailored your CV to match the job description. Edit as needed, then export.</p>
        </div>
      </div>

      <CVEditor content={editorContent} onChange={setEditorContent} />

      <div className="flex justify-between mt-6">
        <button onClick={() => navigate('/questions')} className="btn-secondary">
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('docx')}
            disabled={!!exporting}
            className="btn-secondary flex items-center gap-2"
          >
            Export DOCX
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="btn-primary flex items-center gap-2"
          >
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
