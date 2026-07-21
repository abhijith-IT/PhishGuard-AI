import { useState, useEffect } from "react";
import { FaFilePdf, FaTrash } from "react-icons/fa";
import DownloadButton from "./DownloadButton";

type ReportItem = {
  id: number;
  message: string;
  risk: string;
  confidence: string;
  reasons: string[];
  recommendation: string;
  source: string;
  timestamp: string;
};

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const saved = localStorage.getItem("phishguard_reports");
    if (saved) {
      setReports(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: number) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem("phishguard_reports", JSON.stringify(updated));
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    return a.id - b.id;
  });

  const getRiskClasses = (risk: string) => {
    if (risk.includes('High') || risk.includes('Critical')) return 'bg-red-500/10 text-red-400 border-red-500/30';
    if (risk.includes('Medium')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/10 text-green-400 border-green-500/30';
  };

  if (reports.length === 0) {
    return (
      <div className="space-y-4 fade-in-slide mt-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-8">Generated Reports</h1>
        <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-slate-700 flex flex-col items-center">
           <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-6 shadow-xl">
             <FaFilePdf className="w-8 h-8" />
           </div>
           <h3 className="text-slate-200 font-bold text-lg mb-2">No Reports Generated</h3>
           <p className="text-slate-400 text-sm max-w-md">
             When you download a PDF report from an analysis, it will be logged here for easy access and re-downloading.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in-slide pb-12 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Generated Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and re-download your analysis PDFs.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="appearance-none bg-slate-900/80 border border-slate-700 text-slate-300 text-sm rounded-lg pl-4 pr-8 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
           </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="hidden md:block">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/60">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-300 font-mono">{new Date(report.timestamp).toLocaleDateString()}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(report.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getRiskClasses(report.risk)}`}>
                        {report.risk}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-slate-200">{report.confidence}%</span>
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <p className="text-xs text-slate-400 truncate">{report.message}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="scale-90 origin-right">
                          <DownloadButton 
                            message={report.message}
                            risk={report.risk}
                            confidence={report.confidence}
                            reasons={report.reasons}
                            recommendation={report.recommendation}
                            source={report.source}
                          />
                        </div>
                        <button 
                          onClick={() => handleDelete(report.id)} 
                          className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/30 shrink-0"
                          title="Delete record"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Fallback */}
        <div className="md:hidden space-y-3">
          {sortedReports.map((report) => (
            <div key={report.id} className="glass-card p-4 rounded-xl group flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getRiskClasses(report.risk)}`}>
                    {report.risk}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">{new Date(report.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-xs font-bold text-slate-200">{report.confidence}%</span>
              </div>
              <p className="text-xs text-slate-500 truncate font-mono bg-slate-900/50 px-2 py-1 rounded">
                "{report.message.substring(0, 80)}{report.message.length > 80 ? '...' : ''}"
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <DownloadButton 
                    message={report.message}
                    risk={report.risk}
                    confidence={report.confidence}
                    reasons={report.reasons}
                    recommendation={report.recommendation}
                    source={report.source}
                  />
                </div>
                <button 
                  onClick={() => handleDelete(report.id)} 
                  className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/30 shrink-0"
                  title="Delete record"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
