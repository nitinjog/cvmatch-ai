import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onFile: (file: File) => void;
  accept?: Record<string, string[]>;
  label?: string;
  file?: File | null;
}

export default function FileDropzone({
  onFile,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
  },
  label = 'Drop file here or click to browse',
  file,
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : file
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div>
          <div className="text-green-600 text-3xl mb-2">✓</div>
          <p className="font-medium text-green-700">{file.name}</p>
          <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB — click to replace</p>
        </div>
      ) : (
        <div>
          <div className="text-gray-400 text-3xl mb-2">📁</div>
          <p className="text-gray-600 font-medium">{isDragActive ? 'Drop it here!' : label}</p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, TXT — max 5 MB</p>
        </div>
      )}
    </div>
  );
}
