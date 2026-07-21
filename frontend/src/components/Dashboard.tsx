import { useSharedHistory } from "../context/HistoryContext";
import { FaShieldAlt, FaChartLine, FaExclamationTriangle, FaClock, FaServer, FaBrain, FaDatabase, FaFilePdf, FaHistory, FaSearch } from "react-icons/fa";

type DashboardProps = {
  onNavigate: (view: string) => void;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { history, isLoading } = useSharedHistory();

  const totalAnalyses = history.length;
  const highRiskCount = history.filter(h => h.risk?.includes("High")).length;
  const criticalCount = history.filter(h => h.risk?.includes("Critical")).length;
  const totalThreats = highRiskCount + criticalCount;
  
  const detectionRate = totalAnalyses > 0 ? Math.round((totalThreats / totalAnalyses) * 100) : 0;

  const recentActivity = history.slice(0, 5);
  
  const getLastAnalysisTime = () => {
    if (history.length === 0 || !history[0].timestamp) return "Never";
    const d = new Date(history[0].timestamp);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const systemStatus = [
    { label: "AI Engine", icon: <FaBrain className="w-3 h-3" />, status: "operational" },
    { label: "Backend", icon: <FaServer className="w-3 h-3" />, status: "operational" },
    { label: "Database", icon: <FaDatabase className="w-3 h-3" />, status: "operational" },
    { label: "History", icon: <FaHistory className="w-3 h-3" />, status: totalAnalyses > 0 ? "operational" : "idle" },
    { label: "PDF Gen", icon: <FaFilePdf className="w-3 h-3" />, status: "operational" },
    { label: "Groq API", icon: <FaBrain className="w-3 h-3" />, status: "operational" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in-slide pb-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time threat detection metrics.</p>
        </div>
        <button
          onClick={() => onNavigate("analyze")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2"
        >
          <FaShieldAlt /> New Analysis
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-4 rounded-xl hover:-translate-y-0.5 transition-transform group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Total Analyses</h3>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform"><FaChartLine className="w-3 h-3" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{totalAnalyses}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl hover:-translate-y-0.5 transition-transform group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Detection Rate</h3>
            <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform"><FaSearch className="w-3 h-3" /></div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-red-400">{detectionRate}%</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl hover:-translate-y-0.5 transition-transform group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Last Analysis</h3>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform"><FaClock className="w-3 h-3" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{getLastAnalysisTime()}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl hover:-translate-y-0.5 transition-transform group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">High / Critical</h3>
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform"><FaExclamationTriangle className="w-3 h-3" /></div>
          </div>
          <p className="text-2xl font-bold text-orange-400">{highRiskCount} / {criticalCount}</p>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">System Status</span>
          <div className="flex items-center gap-4 flex-wrap">
            {systemStatus.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'operational' ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]'}`}></div>
                <span className="text-slate-400 text-[10px] flex items-center gap-1">{s.icon} {s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Latest Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                 <FaClock className="w-4 h-4 text-blue-400" />
               </div>
               Recent Activity
             </h2>
             <button onClick={() => onNavigate("history")} className="text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">View All &rarr;</button>
           </div>
           
           {recentActivity.length > 0 ? (
             <div className="space-y-3">
               {recentActivity.map(item => (
                 <div key={item.id} onClick={() => onNavigate("history")} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-slate-800/80 cursor-pointer">
                   <div className="flex items-center gap-3 overflow-hidden">
                     <div className={`shrink-0 w-1.5 h-8 rounded-full ${item.risk?.includes('High') || item.risk?.includes('Critical') ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : item.risk?.includes('Medium') ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                     <div className="truncate">
                       <p className="text-sm text-slate-300 font-medium truncate">{item.message}</p>
                       <p className="text-[10px] text-slate-500 mt-0.5">{item.timestamp || "Archived"} • {item.confidence}%</p>
                     </div>
                   </div>
                   <span className="shrink-0 ml-3 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border border-slate-700 bg-slate-800 text-slate-300">
                     {item.risk}
                   </span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="glass-panel p-6 text-center rounded-2xl border-dashed border-slate-700">
                <p className="text-slate-400 text-sm">No recent activity detected.</p>
             </div>
           )}
        </div>
        
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                 <FaShieldAlt className="w-4 h-4 text-cyan-400" />
               </div>
               Latest Threat
             </h2>
           </div>
           {history.length > 0 ? (
             <div className="glass-panel p-6 rounded-2xl flex flex-col h-[calc(100%-48px)]">
                <span className={`inline-block w-max px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 border ${history[0].risk?.includes('High') || history[0].risk?.includes('Critical') ? 'bg-red-500/10 text-red-400 border-red-500/30' : history[0].risk?.includes('Medium') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                  {history[0].risk}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-1 italic border-l-2 border-slate-700 pl-3 line-clamp-5">
                  "{history[0].message}"
                </p>
                <div className="pt-3 border-t border-slate-800/50 space-y-1">
                  <p className="text-[11px] text-slate-400"><strong>Engine:</strong> {history[0].analysis_source || "AI"}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2"><strong>Action:</strong> <span className="text-slate-300">{history[0].recommendation}</span></p>
                </div>
             </div>
           ) : (
             <div className="glass-panel p-6 text-center rounded-2xl flex items-center justify-center h-[calc(100%-48px)]">
                <p className="text-slate-500 text-sm italic">Run an analysis to see insights.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
