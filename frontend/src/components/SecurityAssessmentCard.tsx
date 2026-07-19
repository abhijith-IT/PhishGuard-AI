import React, { useState } from "react";
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaExclamationCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

type Finding = {
  text: string;
  type: string;
};

type SecurityAssessmentCardProps = {
  reasons: Finding[];
  isReady: boolean;
};

export default function SecurityAssessmentCard({ reasons, isReady }: SecurityAssessmentCardProps) {
  const [expanded, setExpanded] = useState({
    threats: false,
    warnings: false,
    passed: false
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const threats = reasons.filter(r => r.type.toLowerCase() === "critical");
  const warnings = reasons.filter(r => r.type.toLowerCase() === "warning");
  const passedChecks = reasons.filter(r => {
    const t = r.type.toLowerCase();
    return t === "safe" || t === "info";
  });

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "critical") return <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />;
    if (t === "warning") return <FaExclamationCircle className="text-orange-400 mt-0.5 shrink-0" />;
    if (t === "safe") return <FaCheckCircle className="text-green-400 mt-0.5 shrink-0" />;
    return <FaInfoCircle className="text-blue-400 mt-0.5 shrink-0" />;
  };

  const renderSection = (
    key: keyof typeof expanded,
    title: string, 
    icon: JSX.Element, 
    items: Finding[],
    emptyMessage: string,
    emptyIcon: JSX.Element,
    emptyBg: string,
    itemBg: string
  ) => {
    const isExpanded = expanded[key];
    
    return (
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300">
        <button 
          onClick={() => toggleSection(key)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-semibold text-slate-300">{title}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 font-medium">
              {items.length}
            </span>
          </div>
          <div className="text-slate-500">
            {isExpanded ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-4 pt-0 border-t border-slate-700/30">
            {items.length > 0 ? (
              <ul className="space-y-2 mt-3">
                {items.map((finding, idx) => (
                  <li key={`${key}-${idx}`} className={`flex items-start gap-3 p-3 rounded-xl border ${itemBg}`}>
                    {getIcon(finding.type)}
                    <span className="text-slate-300 text-sm leading-relaxed">{finding.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`p-3 mt-3 rounded-xl flex items-center gap-2 ${emptyBg}`}>
                {emptyIcon}
                <span className="text-sm opacity-90">{emptyMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden h-full flex flex-col min-h-[420px] ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700">
          <FaShieldAlt className="w-5 h-5 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Security Assessment</h2>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {renderSection(
          "threats",
          "Threats Detected",
          <FaExclamationTriangle className="text-red-500 w-4 h-4" />,
          threats,
          "No critical threats detected.",
          <FaCheckCircle className="text-green-400 w-4 h-4" />,
          "bg-green-500/5 border border-green-500/10 text-green-400",
          "bg-red-500/5 border border-red-500/20"
        )}

        {renderSection(
          "warnings",
          "Warnings",
          <FaExclamationCircle className="text-orange-400 w-4 h-4" />,
          warnings,
          "No warnings to display.",
          <FaCheckCircle className="text-green-400 w-4 h-4" />,
          "bg-green-500/5 border border-green-500/10 text-green-400",
          "bg-orange-500/5 border border-orange-500/20"
        )}

        {renderSection(
          "passed",
          "Passed Security Checks",
          <FaCheckCircle className="text-green-400 w-4 h-4" />,
          passedChecks,
          "No positive security indicators verified.",
          <FaInfoCircle className="text-slate-500 w-4 h-4" />,
          "bg-slate-800/30 border border-slate-700/30 text-slate-400",
          "bg-slate-800/30 border border-slate-700/30"
        )}
      </div>
    </div>
  );
}
