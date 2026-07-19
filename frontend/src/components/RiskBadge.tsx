type RiskBadgeProps = {
  risk: string;
};

function RiskBadge({ risk }: RiskBadgeProps) {
  let badgeClasses = "bg-slate-500/20 text-slate-400 border-slate-500/50 shadow-[0_0_15px_rgba(100,116,139,0.3)]";
  const normalizedRisk = risk.trim().toLowerCase();
  
  if (normalizedRisk === "low") {
    badgeClasses = "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
  } else if (normalizedRisk === "low-medium") {
    badgeClasses = "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
  } else if (normalizedRisk === "medium") {
    badgeClasses = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
  } else if (normalizedRisk === "high") {
    badgeClasses = "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]";
  } else if (normalizedRisk === "critical") {
    badgeClasses = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
  }

  return (
    <div className={`inline-flex items-center px-4 py-1.5 rounded-full border font-semibold text-sm sm:text-base uppercase tracking-wide backdrop-blur-md ${badgeClasses}`}>
      {risk || "No Analysis"}
    </div>
  );
}

export default RiskBadge;