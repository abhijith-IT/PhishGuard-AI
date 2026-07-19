import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";
import { useProgressiveReveal } from "../hooks/useProgressiveReveal";

type Finding = {
  text: string;
  type: string;
};

type ResultCardProps = {
  risk: string;
  confidence: string;
  recommendation: string;
  reasons: Finding[];
  analysisSource: string;
  processingTime?: number | null;
  timestamp?: string;
};

function ResultCard({
  risk,
  confidence,
  recommendation,
  reasons,
  analysisSource,
  processingTime,
  timestamp
}: ResultCardProps) {
  const isReady = Boolean(risk);
  const hasReasons = reasons.length > 0;
  // Calculate total steps based on presence of reasons
  const recommendationStep = hasReasons ? 5 + reasons.length : 4;
  const totalSteps = recommendationStep;

  const currentStep = useProgressiveReveal(isReady, totalSteps, 400);

  const getThreatSummary = () => {
    const normalizedRisk = risk.trim().toLowerCase();
    if (normalizedRisk === "critical") return "Multiple critical threat indicators were detected in this message, suggesting a high probability of a phishing or scam attempt.";
    if (normalizedRisk === "high") return "Strong evidence of a threat was detected. Exercise extreme caution and do not interact with the message.";
    if (normalizedRisk === "medium") return "Several suspicious elements were identified that warrant caution before proceeding or clicking any links.";
    if (normalizedRisk === "low-medium") return "Minor suspicious elements were detected. Verify the sender's identity if you are unsure.";
    return "No significant phishing indicators were detected, but always verify the sender before sharing sensitive information.";
  };

  const getIconForType = (type: string) => {
    const normalizedType = type?.trim().toLowerCase() || "info";
    switch (normalizedType) {
      case "critical":
        return (
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "safe":
        return (
          <svg className="w-5 h-5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };


  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-200 tracking-tight">Threat Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {currentStep >= 1 && (
          <div className={`space-y-4 ${isReady ? "fade-in-slide" : ""}`}>
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Level</span>
              <RiskBadge risk={risk} />
            </div>
            
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mt-4 text-[13px]">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Analysis Details</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">🕒 Time:</span>
                  <span className="font-mono">{timestamp || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">🤖 AI Engine:</span>
                  <span>{analysisSource || "Unknown"}</span>
                </div>
                {processingTime !== undefined && processingTime !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">⚡ Processing Time:</span>
                    <span className="font-mono">{processingTime} ms</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">📊 Indicators Found:</span>
                  <span className="font-mono text-blue-400 font-bold">{reasons.length}</span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-slate-400 leading-relaxed mt-2">{getThreatSummary()}</p>
          </div>
        )}

        {currentStep >= 2 && (
          <div className={isReady ? "fade-in-slide" : ""}>
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 hidden md:block">&nbsp;</span>
            <ProgressBar confidence={confidence} />
          </div>
        )}
      </div>

      {currentStep >= 3 && (
        <div className={`flex items-center gap-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 w-fit ${isReady ? "fade-in-slide" : ""}`}>
          <span className="text-sm font-medium text-slate-400">Analysis Engine:</span>
          <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
            {analysisSource === "Groq AI" ? "🤖 Groq AI" : "🛡️ Detector"}
          </span>
        </div>
      )}

      {currentStep >= 4 && hasReasons && (
        <div className={`space-y-3 pt-4 border-t border-slate-700/50 ${isReady ? "fade-in-slide" : ""}`}>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Findings
          </h3>
          <ul className="space-y-2">
            {reasons.map((reason, index) => {
              if (currentStep >= 5 + index) {
                return (
                  <li
                    key={index}
                    className={`flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors ${isReady ? "fade-in-slide" : ""}`}
                  >
                    {getIconForType(reason.type)}
                    <span className="text-slate-300 text-sm leading-relaxed">{reason.text}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}

      {currentStep >= recommendationStep && recommendation && (
        <div className={`pt-4 border-t border-slate-700/50 ${isReady ? "fade-in-slide" : ""}`}>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 md:p-5 space-y-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommendation
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed relative z-10">{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultCard;