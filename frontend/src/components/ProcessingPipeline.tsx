import { FaEnvelope, FaFileCode, FaBrain, FaSearch, FaCalculator, FaPercentage, FaLightbulb, FaFilePdf, FaArrowRight } from "react-icons/fa";

export default function ProcessingPipeline() {
  const steps = [
    { icon: <FaEnvelope />, label: "Data Submitted", desc: "Text, URL, or EML provided" },
    { icon: <FaFileCode />, label: "Extraction", desc: "Metadata & bodies parsed" },
    { icon: <FaBrain />, label: "Groq AI Analysis", desc: "Llama 3 NLP processing" },
    { icon: <FaSearch />, label: "Indicator Extraction", desc: "Identify 18 threat vectors" },
    { icon: <FaCalculator />, label: "Risk Scoring", desc: "Deterministic weight logic" },
    { icon: <FaPercentage />, label: "Confidence Calc", desc: "Synergy & negative weights" },
    { icon: <FaLightbulb />, label: "Advisor Generated", desc: "Personalized action plan" },
    { icon: <FaFilePdf />, label: "Report Generated", desc: "Downloadable PDF created" }
  ];

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden mt-8">
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">AI Processing Pipeline</h2>
        <p className="text-slate-400 text-sm mt-1">How PhishGuard AI calculates threat intelligence in milliseconds.</p>
      </div>

      <div className="relative z-10">
        <div className="hidden md:flex items-center justify-between gap-2 max-w-5xl mx-auto flex-wrap">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center group">
                 <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-300 shadow-lg relative z-10">
                   {step.icon}
                 </div>
                 <div className="mt-3 text-center w-20">
                   <span className="block text-[10px] font-bold text-slate-200 leading-tight">{step.label}</span>
                 </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 w-6 mx-1 flex justify-center -mt-7.5">
                  <FaArrowRight className="text-slate-700 w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4">
          {steps.map((step, idx) => (
             <div key={idx} className="flex items-start gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                  {step.icon}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-slate-200">{step.label}</h4>
                   <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
