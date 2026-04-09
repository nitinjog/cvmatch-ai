import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { submitJD, submitCV } from '../services/api';
import FileDropzone from '../components/FileDropzone';
import ErrorBanner from '../components/ErrorBanner';

export default function UploadPage() {
  const navigate = useNavigate();
  const {
    sessionId, jdText, jdFile, cvText, cvFile,
    setJdText, setJdFile, setCvText, setCvFile,
    setStep, loading, setLoading, error, setError,
  } = useStore();

  const [jdMode, setJdMode] = useState<'file' | 'text'>('file');
  const [cvMode, setCvMode] = useState<'file' | 'text'>('file');

  const handleSubmit = async () => {
    setError(null);

    const hasJD = jdMode === 'file' ? !!jdFile : jdText.trim().length > 10;
    const hasCV = cvMode === 'file' ? !!cvFile : cvText.trim().length > 10;

    if (!hasJD) return setError('Please provide a Job Description (file or text).');
    if (!hasCV) return setError('Please provide your CV (file or text).');

    setLoading(true);
    try {
      await submitJD(sessionId, jdMode === 'text' ? jdText : undefined, jdMode === 'file' ? jdFile! : undefined);
      await submitCV(sessionId, cvMode === 'text' ? cvText : undefined, cvMode === 'file' ? cvFile! : undefined);
      setStep(2);
      navigate('/analysis');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Documents</h1>
        <p className="text-gray-500">Provide the job description and your CV to get started.</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Description */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setJdMode('file')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${jdMode === 'file' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                File
              </button>
              <button
                onClick={() => setJdMode('text')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${jdMode === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                Paste
              </button>
            </div>
          </div>

          {jdMode === 'file' ? (
            <FileDropzone file={jdFile} onFile={setJdFile} label="Drop JD file here" />
          ) : (
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* CV Upload */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your CV / Resume</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCvMode('file')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${cvMode === 'file' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                File
              </button>
              <button
                onClick={() => setCvMode('text')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${cvMode === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                Paste
              </button>
            </div>
          </div>

          {cvMode === 'file' ? (
            <FileDropzone file={cvFile} onFile={setCvFile} label="Drop CV file here" />
          ) : (
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV content here..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary text-lg px-10 py-3 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </>
          ) : (
            'Analyze Match →'
          )}
        </button>
      </div>
    </div>
  );
}
