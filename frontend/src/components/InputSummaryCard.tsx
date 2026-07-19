import { FaEdit, FaEnvelope, FaFileAlt } from "react-icons/fa";

type InputSummaryCardProps = {
  text: string;
  fileName?: string | null;
  onEdit: () => void;
  readOnly?: boolean;
};

export default function InputSummaryCard({ text, fileName, onEdit, readOnly }: InputSummaryCardProps) {
  // Extract a subject/sender like line if it exists
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const previewText = lines.slice(0, 2).join(' ').substring(0, 150) + (text.length > 150 ? '...' : '');

  return (
    <div className="glass-card mb-6 animate-slide-up flex items-center justify-between p-4 sm:p-5">
      <div className="flex items-start gap-4 overflow-hidden">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
           {fileName ? <FaFileAlt className="text-blue-400" /> : <FaEnvelope className="text-blue-400" />}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Analyzed Input</h3>
          {fileName && (
            <p className="text-xs font-mono text-blue-400 mb-1 truncate">{fileName}</p>
          )}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {previewText || "No text provided"}
          </p>
        </div>
      </div>
      {!readOnly && (
        <button
          onClick={onEdit}
          className="ml-4 shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors"
        >
          <FaEdit /> <span className="hidden sm:inline">Edit</span>
        </button>
      )}
    </div>
  );
}
