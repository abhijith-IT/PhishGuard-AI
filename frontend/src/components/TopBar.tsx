import { FaPlus } from "react-icons/fa";
import DownloadButton from "./DownloadButton";

type TopBarProps = {
  title: string;
  onNewAnalysis?: () => void;
  showDownload?: boolean;
  downloadProps?: any;
};

export default function TopBar({ title, onNewAnalysis, showDownload, downloadProps }: TopBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{title}</h2>
      
      <div className="flex items-center gap-3">
        {showDownload && downloadProps && (
          <DownloadButton {...downloadProps} />
        )}
        
        {onNewAnalysis && (
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-500/50"
          >
            <FaPlus className="w-3.5 h-3.5" />
            New Analysis
          </button>
        )}
      </div>
    </div>
  );
}
