import { FaBrain, FaRobot } from "react-icons/fa";

type AiDecisionExplanationCardProps = {
  confidenceExplanation: string | null;
  isReady: boolean;
};

export default function AiDecisionExplanationCard({ confidenceExplanation, isReady }: AiDecisionExplanationCardProps) {

  return (
    <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col h-full ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 to-blue-500 opacity-50"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
          <FaBrain className="w-5 h-5 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">AI Decision Explanation</h2>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2 space-y-4">
         <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 flex gap-4 items-start">
            <div className="mt-1 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-xl">
               <FaRobot className="text-cyan-400 w-4 h-4" />
            </div>
            <div className="space-y-3">
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Why was this classified this way?</p>
               <p className="text-sm text-slate-300 leading-relaxed">
                  {confidenceExplanation || "No explanation available."}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
