import RiskBadge from "./RiskBadge";
import { FaShieldAlt, FaTag, FaCrosshairs } from "react-icons/fa";

type ThreatAnalysisCardProps = {
  risk: string;
  executiveSummary: string | null;
  detectedCategories: string[];
  isReady: boolean;
};

export default function ThreatAnalysisCard({
  risk,
  executiveSummary,
  detectedCategories,
  isReady
}: ThreatAnalysisCardProps) {
  
  const getOverallStatus = () => {
    const r = risk.trim().toLowerCase();
    if (r === "critical") return "Immediate Action Required";
    if (r === "high") return "Investigation Recommended";
    if (r === "medium") return "Verify Before Proceeding";
    return "No Immediate Threat";
  };

  const getRiskColor = () => {
     const r = risk.trim().toLowerCase();
     if (r === "critical") return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
     if (r === "high") return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
     if (r === "medium") return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
     return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };
  
  const getRiskWidth = () => {
     const r = risk.trim().toLowerCase();
     if (r === "critical") return "100%";
     if (r === "high") return "75%";
     if (r === "medium") return "50%";
     return "25%";
  };

  // All content is provided by the backend. The frontend is a pure rendering layer.
  const categories = detectedCategories.length > 0 ? detectedCategories : ["Text Analysis"];

  return (
    <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col h-full ${isReady ? "fade-in-slide" : ""}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <FaShieldAlt className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Threat Analysis</h2>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2 space-y-4">
        
        {/* Risk & Status */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-center items-center text-center">
             <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk Score</span>
             <RiskBadge risk={risk} />
           </div>
           <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-center items-center text-center">
             <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Overall Status</span>
             <span className={`text-xs font-bold text-center px-2 ${risk.toLowerCase().includes('critical') ? 'text-red-400' : risk.toLowerCase().includes('high') ? 'text-orange-400' : risk.toLowerCase().includes('medium') ? 'text-yellow-400' : 'text-green-400'}`}>{getOverallStatus()}</span>
           </div>
        </div>

        {/* Severity Meter */}
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
           <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
             <span>Severity Meter</span>
             <span className={risk.toLowerCase() === 'critical' ? 'text-red-400' : ''}>{risk.toUpperCase()}</span>
           </div>
           <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
             <div className={`h-1.5 rounded-full ${getRiskColor()} transition-all duration-1000`} style={{ width: getRiskWidth() }}></div>
           </div>
        </div>

        {/* Executive Summary Paragraph */}
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 space-y-2">
           <span className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
             <FaCrosshairs className="text-indigo-400 w-3 h-3" /> Executive Summary
           </span>
           <p className="text-[12px] text-slate-300 leading-relaxed">
             {executiveSummary || "No executive summary provided."}
           </p>
        </div>
        
        {/* Detected Categories */}
        <div className="space-y-2 pb-2">
           <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Detected Categories</span>
           <div className="flex flex-wrap gap-2">
             {categories.map((cat, idx) => (
               <div key={idx} className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-md">
                 <FaTag className="text-slate-500 w-2 h-2" />
                 <span className="text-[10px] font-medium text-slate-300">{cat}</span>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
