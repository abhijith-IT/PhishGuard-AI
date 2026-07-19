
import { FaShieldAlt } from "react-icons/fa";

type SecurityScoreCardProps = {
  confidence: string; // Threat confidence
  isReady: boolean;
};

export default function SecurityScoreCard({ confidence, isReady }: SecurityScoreCardProps) {
  const threatScore = parseInt(confidence, 10) || 0;
  // Security score is the inverse of threat score
  const securityScore = Math.max(0, 100 - threatScore);

  let label = "Excellent";
  let colorClass = "text-green-400";
  let ringClass = "stroke-green-400";
  let bgClass = "bg-green-500/10";
  
  if (securityScore < 30) {
    label = "Critical";
    colorClass = "text-red-500";
    ringClass = "stroke-red-500";
    bgClass = "bg-red-500/10";
  } else if (securityScore < 50) {
    label = "Poor";
    colorClass = "text-orange-500";
    ringClass = "stroke-orange-500";
    bgClass = "bg-orange-500/10";
  } else if (securityScore < 70) {
    label = "Moderate";
    colorClass = "text-yellow-400";
    ringClass = "stroke-yellow-400";
    bgClass = "bg-yellow-500/10";
  } else if (securityScore < 90) {
    label = "Good";
    colorClass = "text-blue-400";
    ringClass = "stroke-blue-400";
    bgClass = "bg-blue-500/10";
  }

  // Calculate SVG circle properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (securityScore / 100) * circumference;

  return (
    <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden h-full flex flex-col ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
      <div className={`absolute top-0 right-0 w-full h-1 bg-linear-to-r from-transparent to-${colorClass.replace('text-', '')} opacity-30`}></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center border border-slate-700/30`}>
          <FaShieldAlt className={`w-5 h-5 ${colorClass}`} />
        </div>
        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Security Score</h2>
      </div>

      <div className="flex-1 flex items-center justify-center py-4">
        <div className="relative flex items-center justify-center w-32 h-32">
          {/* Background Ring */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-700/50"
            />
            {/* Progress Ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className={`${ringClass} transition-all duration-1000 ease-out`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: isReady ? strokeDashoffset : circumference
              }}
            />
          </svg>
          <div className="flex flex-col items-center justify-center absolute text-center">
            <span className="text-3xl font-black text-slate-100 tracking-tighter">{securityScore}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/ 100</span>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-700/50 ${bgClass} ${colorClass}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
