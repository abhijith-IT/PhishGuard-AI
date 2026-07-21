import { FaTimes, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";
import type { HistoryItem } from "../context/HistoryContext";
import RiskBadge from "./RiskBadge";

type ComparisonModalProps = {
  item1: HistoryItem;
  item2: HistoryItem;
  onClose: () => void;
};

export default function ComparisonModal({ item1, item2, onClose }: ComparisonModalProps) {
  const getCounts = (reasons: any[]) => {
    const threats = reasons.filter(r => r.type === "critical").length;
    const warnings = reasons.filter(r => r.type === "warning").length;
    return { threats, warnings };
  };

  const counts1 = getCounts(item1.reason || []);
  const counts2 = getCounts(item2.reason || []);

  const getCategories = (reasons: any[]) => {
    return Array.from(new Set(reasons.filter(r => r.type !== "safe").map(r => r.text.replace(" detected", ""))));
  };
  
  const cats1 = getCategories(item1.reason || []);
  const cats2 = getCategories(item2.reason || []);

  const renderDiffRow = (label: string, val1: any, val2: any, render: (v: any) => React.ReactNode) => {
    const isDifferent = JSON.stringify(val1) !== JSON.stringify(val2);
    return (
      <div className={`grid grid-cols-3 gap-4 p-4 border-b border-slate-700/50 items-center ${isDifferent ? 'bg-blue-500/5' : ''}`}>
        <div className="text-sm font-bold text-slate-400">{label}</div>
        <div className="text-sm text-slate-200">{render(val1)}</div>
        <div className={`text-sm ${isDifferent ? 'text-blue-300' : 'text-slate-200'}`}>{render(val2)}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md overflow-y-auto custom-scrollbar fade-in-slide flex flex-col">
      <div className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-700/50 p-4 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
           <FaExchangeAlt className="text-blue-400" />
           Analysis Comparison
        </h2>
        <button 
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full flex-1 mb-10">
        
        <div className="grid grid-cols-3 gap-4 mb-6 sticky top-20 bg-[#0B0F19] z-40 py-4 border-b border-slate-700/50">
          <div></div>
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
             <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Analysis A</div>
             <p className="text-xs text-slate-300 line-clamp-2 font-mono">{item1.message}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
             <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Analysis B</div>
             <p className="text-xs text-slate-300 line-clamp-2 font-mono">{item2.message}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-slate-700">
          {renderDiffRow("Risk Level", item1.risk, item2.risk, (v) => <RiskBadge risk={v} />)}
          {renderDiffRow("Confidence", item1.confidence, item2.confidence, (v) => <span className="font-mono text-lg font-bold">{v}%</span>)}
          {renderDiffRow("Threat Count", counts1.threats, counts2.threats, (v) => (
             <span className={`px-2 py-1 rounded text-xs font-bold ${v > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{v} Critical</span>
          ))}
          {renderDiffRow("Warning Count", counts1.warnings, counts2.warnings, (v) => (
             <span className={`px-2 py-1 rounded text-xs font-bold ${v > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>{v} Warnings</span>
          ))}
          {renderDiffRow("Detected Categories", cats1, cats2, (v) => (
             <div className="flex flex-wrap gap-1.5">
               {v.length === 0 ? <span className="text-slate-500 italic">None</span> : v.map((c: string) => (
                 <span key={c} className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                   {c}
                 </span>
               ))}
             </div>
          ))}
          {renderDiffRow("AI Recommendation", item1.recommendation || "N/A", item2.recommendation || "N/A", (v) => (
             <p className="text-xs leading-relaxed text-slate-400">{v}</p>
          ))}
          {renderDiffRow("Analysis Date", item1.timestamp || "Archived", item2.timestamp || "Archived", (v) => (
             <span className="text-xs text-slate-400">{v}</span>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
           <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30 text-sm font-medium">
              <FaShieldAlt /> AI Comparison Complete
           </div>
        </div>
      </div>
    </div>
  );
}
