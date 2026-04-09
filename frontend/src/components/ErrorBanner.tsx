interface Props {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-2">
        <span className="text-red-500 mt-0.5">⚠</span>
        <p className="text-sm">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none">
        ×
      </button>
    </div>
  );
}
