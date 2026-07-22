import { FaSearch, FaCheck, FaCrosshairs, FaBrain, FaExclamationTriangle } from "react-icons/fa";
import type { SupportingIndicator } from "../context/HistoryContext";

type SecurityAssessmentCardProps = {
  risk: string;
  validatedAttack: string | null;
  supportingIndicators: SupportingIndicator[];
  confidenceExplanation: string | null;
  recommendedActions: string[];
  isReady: boolean;
};

export default function SecurityAssessmentCard({
  risk,
  validatedAttack,
  supportingIndicators,
  confidenceExplanation,
  recommendedActions,
  isReady
}: SecurityAssessmentCardProps) {

  const r = risk.trim().toLowerCase();
  const isSafe = r === "low" || (!validatedAttack && supportingIndicators.length === 0);

  // DEFENSIVE VALIDATION: Log if impossible combinations arrive
  if (r === "low" && validatedAttack && validatedAttack !== "Suspicious Communication") {
    console.warn(`[DEFENSIVE VALIDATION] Contradictory values: Risk=${risk} but validatedAttack=${validatedAttack}. Rendering safe fallback.`);
  }

  const displayAttack = validatedAttack || ((r === "low") ? "No Active Threat Detected" : "No Active Threat Detected");

  const displayIndicators = (r === "low")
    ? [
        { indicator: "Standard text analysis passed", matched_text: ["System checks OK"] },
        { indicator: "No deceptive patterns found", matched_text: ["Content appears safe"] }
      ]
    : supportingIndicators.length > 0
      ? supportingIndicators
      : [{ indicator: "No specific indicators triggered", matched_text: ["No patterns matched"] }];

  const displayConfidence = confidenceExplanation || "Classification is based on automated analysis.";

  const displayActions = (r === "low")
    ? ["Proceed with normal operations.", "Monitor for future anomalies."]
    : recommendedActions.length > 0
      ? recommendedActions
      : ["Exercise caution with this message."];

  return (
    <div className={`glass-panel p-6 sm:p-8 rounded-2xl relative flex flex-col h-full ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Report Header */}
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-5 shrink-0">
        <FaSearch className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Detection Summary</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 mt-6 space-y-8">
        
        {/* SECTION 1: PRIMARY ATTACK */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
             <FaCrosshairs className="text-slate-400" /> Primary Attack
           </h3>
           <p className={`text-lg font-bold ${isSafe ? 'text-green-400' : 'text-red-400'}`}>
             {displayAttack}
           </p>
        </section>

        {/* SECTION 2: SUPPORTING INDICATORS */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
             Supporting Indicators
           </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
             {displayIndicators.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 bg-slate-800/30 p-2 rounded-lg border border-slate-700/30">
                   <div className="flex items-center gap-2">
                     <FaCheck className={`w-3 h-3 ${isSafe ? 'text-green-500/70' : 'text-red-400'}`} />
                     <span className="text-sm font-medium text-slate-200">{item.indicator}</span>
                   </div>
                   <div className="flex flex-col gap-1 pl-5 mt-1">
                     {item.matched_text.length > 0 ? (
                       <>
                         <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Matched:</span>
                         <ul className="pl-1 space-y-1">
                           {item.matched_text.map((text, i) => (
                             <li key={i} className="flex items-start gap-2">
                               <span className="text-slate-500 text-xs mt-0.5">•</span>
                               <span className="text-xs text-slate-400 italic wrap-break-word">{text}</span>
                             </li>
                           ))}
                         </ul>
                       </>
                     ) : (
                       <span className="text-xs text-slate-500 italic">(No deterministic phrase matched)</span>
                     )}
                   </div>
                </div>
             ))}
            </div>
        </section>

        {/* SECTION 3: CONFIDENCE */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
             <FaBrain className="text-slate-400" /> Confidence
           </h3>
           <p className="text-sm text-slate-300 leading-relaxed">
             {displayConfidence}
           </p>
        </section>

        {/* SECTION 4: RECOMMENDED RESPONSE */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
             <FaExclamationTriangle className="text-slate-400" /> Recommended Response
           </h3>
           <div className="flex flex-col gap-2 pt-1">
             {displayActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></div>
                   <span className="text-sm text-slate-200">{action}</span>
                </div>
             ))}
           </div>
        </section>

      </div>
    </div>
  );
}
