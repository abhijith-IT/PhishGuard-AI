import { useState, useMemo, useRef } from "react";
import { FaShieldAlt, FaTrash, FaSearch, FaFilter, FaCalendarAlt, FaThumbtack, FaExchangeAlt } from "react-icons/fa";
import { useSharedHistory, type HistoryItem } from "../context/HistoryContext";
import ComparisonModal from "./ComparisonModal";

type HistoryProps = {
  onSelect?: (item: HistoryItem) => void;
  selectedId?: number | null;
  onNewAnalysis?: () => void;
};

function History({ onSelect, selectedId, onNewAnalysis }: HistoryProps) {
  const { history, pinnedIds, togglePin, deleteAnalysis, clearAllHistory } = useSharedHistory();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  
  const [compareMode, setCompareMode] = useState(false);
  const [selectedToCompare, setSelectedToCompare] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const getIconForType = (type: string) => {
    const normalizedType = type?.trim().toLowerCase() || "info";
    switch (normalizedType) {
      case "critical":
        return (
          <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "safe":
        return (
          <svg className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const filteredHistory = useMemo(() => {
    let filtered = history.filter(item => {
      const matchesSearch = item.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === "All" || item.risk.toLowerCase().includes(riskFilter.toLowerCase());
      
      let matchesDate = true;
      if (dateFilter !== "All" && item.timestamp) {
        const itemDate = new Date(item.timestamp);
        const today = new Date();
        if (dateFilter === "Today") {
          matchesDate = itemDate.toDateString() === today.toDateString();
        } else if (dateFilter === "Past Week") {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = itemDate >= weekAgo;
        }
      }
      return matchesSearch && matchesRisk && matchesDate;
    });

    // Sort: Pinned first, then by ID (assuming ID reflects time)
    return filtered.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return b.id - a.id;
    });
  }, [history, searchTerm, riskFilter, dateFilter, pinnedIds]);

  if (history.length === 0) {
    return (
      <div className="space-y-4 fade-in-slide mt-8">
        <div className="glass-panel py-16 px-6 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
           <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 shadow-xl animate-bounce-slow">
             <FaShieldAlt className="w-8 h-8 text-blue-400" />
           </div>
           <h3 className="text-slate-200 font-bold text-lg mb-2">No Analysis History Yet</h3>
           <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
             Your completed phishing analyses will appear here. Start by analyzing an email, URL, or uploaded file to build your threat intelligence history.
           </p>
           {onNewAnalysis && (
             <button
               onClick={onNewAnalysis}
               className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
             >
               New Analysis
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-slide relative h-full flex flex-col">
      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3" />
            <select 
              value={riskFilter} 
              onChange={(e) => setRiskFilter(e.target.value)}
              className="appearance-none bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg pl-8 pr-8 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Risks</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="relative group">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3" />
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg pl-8 pr-8 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Past Week">Past Week</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedToCompare([]);
            }}
            className={`p-2.5 rounded-lg border transition-all flex items-center gap-2 ${compareMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-500'}`}
            title="Compare Mode"
          >
            <FaExchangeAlt className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Compare</span>
          </button>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-900/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all"
            title="Clear History"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-4 shadow-2xl animate-slide-up flex flex-col sm:flex-row items-center justify-between shrink-0">
          <div>
            <h4 className="text-slate-200 font-bold text-sm mb-1">Clear All History?</h4>
            <p className="text-slate-400 text-xs">This will permanently remove all saved analyses.</p>
          </div>
          <div className="flex gap-3 mt-3 sm:mt-0">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearAllHistory();
                setShowClearConfirm(false);
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
            >
              Confirm Clear
            </button>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No analysis matches your filters.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const normalizedRisk = item.risk.trim().toLowerCase();
            let riskColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";
            if (normalizedRisk === "low") riskColor = "text-green-400 bg-green-500/10 border-green-500/20";
            else if (normalizedRisk.includes("medium")) riskColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            else if (normalizedRisk === "high") riskColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
            else if (normalizedRisk === "critical") riskColor = "text-red-400 bg-red-500/10 border-red-500/20";

            const isPinned = pinnedIds.includes(item.id);
            const isSelectedForCompare = selectedToCompare.includes(item.id);

            return (
              <div
                key={item.id}
                className={`glass-card p-5 group flex flex-col gap-3 relative transition-all duration-300 cursor-pointer ${
                  compareMode 
                    ? isSelectedForCompare 
                      ? "ring-2 ring-blue-500 bg-slate-800/80 border-blue-500/50" 
                      : "opacity-60 hover:opacity-100"
                    : selectedId === item.id 
                      ? "ring-2 ring-blue-500 bg-slate-800/80 border-blue-500/50" 
                      : ""
                }`}
                onClick={() => {
                  if (compareMode) {
                    if (isSelectedForCompare) {
                      setSelectedToCompare(prev => prev.filter(id => id !== item.id));
                    } else if (selectedToCompare.length < 2) {
                      setSelectedToCompare(prev => [...prev, item.id]);
                    }
                  } else {
                    onSelect && onSelect(item);
                  }
                }}
              >
                {/* Actions overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePin(item.id); }} 
                    className={`p-2 rounded-md transition-colors ${isPinned ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'}`}
                    title={isPinned ? "Unpin" : "Pin to top"}
                  >
                    <FaThumbtack className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteAnalysis(item.id); }} 
                    className="p-2 rounded-md bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 pr-20">
                  <div className="flex items-center gap-3">
                    {isPinned && <FaThumbtack className="text-blue-500 w-3 h-3 transform rotate-45 shrink-0" />}
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${riskColor}`}>
                      {item.risk}
                    </span>
                    <span className="text-slate-500 text-[11px] font-medium">{item.timestamp || "Archived"}</span>
                  </div>

                  <p className="text-slate-300 text-[13px] leading-relaxed font-mono line-clamp-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50">
                    {item.message}
                  </p>

                  {item.reason && item.reason.length > 0 && (
                    <ul className="space-y-1.5 mt-1">
                      {item.reason.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                          {getIconForType(r.type)}
                          <span className="line-clamp-1">{r.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {compareMode && selectedToCompare.length === 2 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
           <button onClick={() => setShowComparison(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
             Compare 2 Analyses
           </button>
        </div>
      )}

      {showComparison && selectedToCompare.length === 2 && (
        <ComparisonModal 
          item1={history.find(h => h.id === selectedToCompare[0])!}
          item2={history.find(h => h.id === selectedToCompare[1])!}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default History;