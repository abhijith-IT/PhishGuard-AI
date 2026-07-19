
import { FaCheckCircle, FaStream } from "react-icons/fa";

type AnalysisTimelineCardProps = {
  isReady: boolean;
};

export default function AnalysisTimelineCard({ isReady }: AnalysisTimelineCardProps) {
  const steps = [
    "Input Received",
    "Indicators Extracted",
    "AI Analysis",
    "Risk Scoring",
    "Report Generated"
  ];

  return (
    <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-center h-full ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <FaStream className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Analysis Timeline</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center px-2 py-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 relative group">
            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div className="absolute left-2.5 top-6 bottom-[-10px] w-[2px] bg-blue-500/30 z-0"></div>
            )}
            
            {/* Step Icon */}
            <div className="relative z-10 w-5 h-5 rounded-full bg-slate-900 border border-blue-500 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              <FaCheckCircle className="w-3 h-3 text-blue-400" />
            </div>
            
            {/* Step Content */}
            <div className="pb-4">
              <p className="text-sm font-medium text-slate-300">{step}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Completed</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
