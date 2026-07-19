import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";
import { FaCheck, FaTimes } from "react-icons/fa";

type Finding = {
  text: string;
  type: string;
};

type ThreatAnalysisCardProps = {
  risk: string;
  confidence: string;
  reasons: Finding[];
  isReady: boolean;
};

export default function ThreatAnalysisCard({
  risk,
  confidence,
  reasons,
  isReady
}: ThreatAnalysisCardProps) {
  
  const getOverallStatus = () => {
    const normalizedRisk = risk.trim().toLowerCase();
    if (normalizedRisk === "critical") return "Immediate Action Required";
    if (normalizedRisk === "high") return "Likely Phishing";
    if (normalizedRisk === "medium" || normalizedRisk === "low-medium") return "Requires Verification";
    return "No Immediate Threat";
  };

  const getThreatSummary = () => {
    const normalizedRisk = risk.trim().toLowerCase();
    if (normalizedRisk === "critical") return "Multiple critical threat indicators were detected in this message, suggesting a high probability of a phishing or scam attempt.";
    if (normalizedRisk === "high") return "Strong evidence of a threat was detected. Exercise extreme caution and do not interact with the message.";
    if (normalizedRisk === "medium") return "Several suspicious elements were identified that warrant caution before proceeding or clicking any links.";
    if (normalizedRisk === "low-medium") return "Minor suspicious elements were detected. Verify the sender's identity if you are unsure.";
    return "No significant phishing indicators were detected, but always verify the sender before sharing sensitive information.";
  };

  const criticalAndHigh = reasons.filter(r => r.type === "critical" || r.type === "warning").slice(0, 3);
  const positiveChecks = reasons.filter(r => r.type === "safe").slice(0, 2);

  return (
    <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col ${isReady ? "fade-in-slide" : ""}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Threat Analysis</h2>
      </div>

      <div className="space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk Level</span>
              <RiskBadge risk={risk} />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Overall Status</span>
              <span className="text-sm font-medium text-slate-300">{getOverallStatus()}</span>
            </div>
          </div>
          
          <div className="w-full sm:w-1/2 space-y-3">
             <ProgressBar confidence={confidence} />
             
             {reasons.length > 0 && (
               <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                 <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Why this confidence?</span>
                 <ul className="space-y-1.5">
                   {criticalAndHigh.map((r, i) => (
                     <li key={`neg-${i}`} className="flex items-start gap-2 text-xs text-slate-300">
                       <FaTimes className="text-red-400 mt-0.5 shrink-0 w-3 h-3" />
                       <span className="line-clamp-1">{r.text}</span>
                     </li>
                   ))}
                   {positiveChecks.map((r, i) => (
                     <li key={`pos-${i}`} className="flex items-start gap-2 text-xs text-slate-300">
                       <FaCheck className="text-green-400 mt-0.5 shrink-0 w-3 h-3" />
                       <span className="line-clamp-1">{r.text}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        </div>

        <p className="text-[13px] text-slate-400 leading-relaxed border-t border-slate-700/50 pt-4">{getThreatSummary()}</p>
      </div>
    </div>
  );
}
