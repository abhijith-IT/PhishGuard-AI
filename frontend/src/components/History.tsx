import { useEffect, useState } from "react";
import { FaShieldAlt, FaTrash } from "react-icons/fa";

type Finding = {
  text: string;
  type: string;
};

type HistoryItem = {
  id: number;
  message: string;
  risk: string;
  confidence: string;
  reason: Finding[];
  analysis_source?: string;
  analysis_version?: string;
};

type HistoryProps = {
  refreshKey: number;
  onSelect?: (item: HistoryItem) => void;
  selectedId?: number | null;
  onNewAnalysis?: () => void;
};

function History({ refreshKey, onSelect, selectedId, onNewAnalysis }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [localRefreshKey, ] = useState(0);

  const getIconForType = (type: string) => {
    const normalizedType = type?.trim().toLowerCase() || "info";
    switch (normalizedType) {
      case "critical":
        return (
          <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "safe":
        return (
          <svg className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/history`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data);
    } catch {
      console.error("Failed to fetch history");
    }
  };

  const clearHistory = async () => {
    setIsClearing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/history`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory([]);
        setShowClearConfirm(false);
      }
    } catch {
      console.error("Failed to clear history");
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshKey, localRefreshKey]);

  if (history.length === 0) {
    return (
      <div className="space-y-4 fade-in-slide mt-8">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Analyses
        </h2>
        <div className="glass-panel py-16 px-6 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
           <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 shadow-xl animate-bounce-slow">
             <FaShieldAlt className="w-8 h-8 text-blue-400" />
           </div>
           <h3 className="text-slate-200 font-bold text-lg mb-2">No Analysis History Yet</h3>
           <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
             Your completed phishing analyses will appear here. Start by analyzing an email, URL, or uploaded file to build your threat intelligence history.
           </p>
           {onNewAnalysis && (
             <button
               onClick={onNewAnalysis}
               className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
             >
               New Analysis
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-slide relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Analyses
        </h2>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs font-medium text-slate-400 hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <FaTrash className="w-3 h-3" />
          Clear History
        </button>
      </div>

      {showClearConfirm && (
        <div className="absolute top-0 right-0 mt-8 z-10 bg-slate-800 border border-red-500/30 rounded-xl p-4 shadow-2xl animate-slide-up max-w-sm">
          <h4 className="text-slate-200 font-bold text-sm mb-2">Clear Analysis History?</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            This will permanently remove all saved analyses. This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowClearConfirm(false)}
              disabled={isClearing}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={clearHistory}
              disabled={isClearing}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
            >
              {isClearing ? "Clearing..." : "Clear History"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-4">
        {history.map((item) => {
          const normalizedRisk = item.risk.trim().toLowerCase();
          let riskColor = "text-slate-400 bg-slate-500/10 border-slate-500/20 shadow-[0_0_10px_rgba(100,116,139,0.1)]";

          if (normalizedRisk === "low") {
            riskColor = "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
          } else if (normalizedRisk === "low-medium") {
            riskColor = "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
          } else if (normalizedRisk === "medium") {
            riskColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]";
          } else if (normalizedRisk === "high") {
            riskColor = "text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]";
          } else if (normalizedRisk === "critical") {
            riskColor = "text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
          }

          return (
            <div
              key={item.id}
              onClick={() => onSelect && onSelect(item)}
              className={`glass-card flex flex-col gap-3 group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                selectedId === item.id ? "ring-2 ring-blue-500 bg-slate-800/80 border-blue-500/50" : ""
              }`}
              tabIndex={0}
              role="button"
              aria-pressed={selectedId === item.id}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect && onSelect(item);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${riskColor}`}>
                  {item.risk}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <span>Score: {item.confidence}</span>
                  {item.analysis_source && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-400">{item.analysis_source}</span>
                    </>
                  )}
                  {item.analysis_version && (
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] border border-slate-700">
                      v{item.analysis_version}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-300 text-[13px] leading-relaxed font-mono line-clamp-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 selection:bg-blue-500/30">
                {item.message}
              </p>

              {item.reason && item.reason.length > 0 && (
                <ul className="space-y-1.5 mt-1">
                  {item.reason.slice(0, 2).map((r, i) => (
                    <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                      {getIconForType(r.type)}
                      <span className="line-clamp-1">{r.text}</span>
                    </li>
                  ))}
                  {item.reason.length > 2 && (
                    <li className="text-blue-400 text-xs italic ml-5 mt-1 font-medium hover:text-blue-300 cursor-default">+ {item.reason.length - 2} more reasons detected</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      
      <footer className="mt-8 pt-6 border-t border-slate-800/50 text-center text-slate-600 text-[11px] font-medium tracking-wide">
        © 2026 PhishGuard AI • IBM SkillsBuild Internship Project
      </footer>
    </div>
  );
}

export default History;