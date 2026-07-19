import { FaLightbulb, FaCheck, FaExclamationTriangle } from "react-icons/fa";

type RecommendationCardProps = {
  recommendation: string;
  isReady: boolean;
};

export default function RecommendationCard({ recommendation, isReady }: RecommendationCardProps) {
  if (!recommendation) return null;

  return (
    <div className={`mt-6 ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6">
          <div className="w-14 h-14 shrink-0 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mt-1">
            <FaLightbulb className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="flex-1 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                Action Plan
              </h3>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  "Do not click suspicious links",
                  "Verify sender identity out-of-band",
                  "Report phishing to IT Security",
                  "Delete suspicious email"
                ].map((action, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                    <FaCheck className="text-green-400 w-3.5 h-3.5" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 flex gap-3 items-start">
              <FaExclamationTriangle className="text-blue-400 w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="font-semibold text-slate-200">AI Assessment: </span>
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
