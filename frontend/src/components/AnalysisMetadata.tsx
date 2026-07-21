import { useState } from "react";
import { FaCogs, FaChevronDown, FaServer, FaMicrochip, FaClock, FaHistory } from "react-icons/fa";

type AnalysisMetadataProps = {
  analysisId?: string;
  analysisSource: string;
  processingTime?: number | null;
  timestamp?: string;
  archivedTime?: string;
};

export default function AnalysisMetadata({
  analysisId,
  analysisSource,
  processingTime,
  timestamp,
  archivedTime
}: AnalysisMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 mb-4 max-w-4xl mx-auto">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors py-2 uppercase tracking-wider"
      >
        <FaCogs />
        Advanced Technical Metadata
        <FaChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
        <div className="glass-panel p-5 rounded-2xl border-dashed border-slate-700 bg-slate-900/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analysis ID</span>
              <span className="text-xs text-slate-300 font-mono">{analysisId || `PG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><FaMicrochip /> Engine</span>
              <span className="text-xs text-blue-400 font-medium">{analysisSource || "Groq Llama 3 8B"}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><FaServer /> Processing Time</span>
              <span className="text-xs text-emerald-400 font-mono">{processingTime || 0} ms</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Model Version</span>
              <span className="text-xs text-slate-300 font-mono">v2.1.0-prod</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><FaClock /> Generated At</span>
              <span className="text-xs text-slate-300 font-mono">{timestamp || new Date().toLocaleTimeString()}</span>
            </div>
            
            {archivedTime && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><FaHistory /> Archived At</span>
                <span className="text-xs text-slate-400 font-mono">{archivedTime}</span>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
