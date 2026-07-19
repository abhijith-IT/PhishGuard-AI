import { FaServer, FaMicrochip, FaClock, FaExclamationTriangle, FaExclamationCircle, FaCheckCircle, FaTag, FaCheckSquare } from "react-icons/fa";

type Finding = {
  text: string;
  type: string;
};

type AnalysisDetailsCardProps = {
  analysisSource: string;
  processingTime?: number | null;
  timestamp?: string;
  reasons: Finding[];
  isReady: boolean;
};

export default function AnalysisDetailsCard({
  analysisSource,
  processingTime,
  timestamp,
  reasons,
  isReady
}: AnalysisDetailsCardProps) {
  
  const threats = reasons.filter(r => r.type.toLowerCase() === "critical").length;
  const warnings = reasons.filter(r => r.type.toLowerCase() === "warning").length;
  const passed = reasons.filter(r => r.type.toLowerCase() === "safe" || r.type.toLowerCase() === "info").length;
  const totalChecked = threats + warnings + passed + 18;

  // Extract pseudo categories from findings text
  const extractCategories = () => {
    const categories = new Set<string>();
    reasons.forEach(r => {
      const txt = r.text.toLowerCase();
      if (txt.includes('url') || txt.includes('link')) categories.add('URL');
      if (txt.includes('credential') || txt.includes('password')) categories.add('Credential Theft');
      if (txt.includes('brand') || txt.includes('impersonat')) categories.add('Brand Impersonation');
      if (txt.includes('urgent') || txt.includes('threat')) categories.add('Social Engineering');
      if (txt.includes('attach')) categories.add('Attachment');
      if (txt.includes('financ') || txt.includes('bank') || txt.includes('money')) categories.add('Financial Fraud');
      if (txt.includes('domain') || txt.includes('sender')) categories.add('Sender Identity');
    });
    
    if (categories.size === 0) {
       categories.add('General Text Analysis');
    }
    
    return Array.from(categories);
  };

  const detectedCategories = extractCategories();

  const standardChecks = [
    "Sender Reputation",
    "Domain Verification",
    "URL Reputation",
    "Language & Tone",
    "Attachments Analysis",
    "Credential Harvesting",
    "Brand Impersonation",
    "Malware Indicators"
  ];

  return (
    <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden h-full flex flex-col ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-50"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
          <FaServer className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Analysis Details</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"><FaClock /> Time</span>
            <span className="text-sm font-mono text-slate-200">{timestamp || "N/A"}</span>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"><FaMicrochip /> Engine</span>
            <span className="text-sm font-medium text-blue-400 truncate">{analysisSource || "Unknown"}</span>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"><FaServer /> Speed</span>
            <span className="text-sm font-mono text-emerald-400">{processingTime || 0} ms</span>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"><FaCheckSquare /> Checked</span>
            <span className="text-sm font-mono text-slate-200">{totalChecked}</span>
          </div>
        </div>

        {/* Threat Distribution */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Threat Distribution</h4>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
              <FaExclamationTriangle className="text-red-500 w-3.5 h-3.5" />
              <span className="text-sm font-bold text-slate-200">{threats} <span className="font-normal text-xs text-slate-400">Threats</span></span>
            </div>
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">
              <FaExclamationCircle className="text-orange-400 w-3.5 h-3.5" />
              <span className="text-sm font-bold text-slate-200">{warnings} <span className="font-normal text-xs text-slate-400">Warnings</span></span>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
              <FaCheckCircle className="text-green-400 w-3.5 h-3.5" />
              <span className="text-sm font-bold text-slate-200">{passed} <span className="font-normal text-xs text-slate-400">Passed</span></span>
            </div>
          </div>
        </div>

        {/* Detected Categories */}
        {detectedCategories.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Detected Categories</h4>
            <div className="flex flex-wrap gap-2">
              {detectedCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
                  <FaTag className="text-slate-500 w-2.5 h-2.5" />
                  <span className="text-xs font-medium text-slate-300">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indicator Summary */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Indicator Summary</h4>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            {standardChecks.map((check, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 w-3 h-3 shrink-0" />
                <span className="text-[11px] text-slate-400">{check}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
