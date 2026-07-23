import { useSharedHistory } from "../context/HistoryContext";
import { useMemo } from "react";
import { FaChartBar, FaShieldAlt, FaCalendarAlt, FaBuilding, FaClock, FaExclamationTriangle, FaChartLine } from "react-icons/fa";

export default function ThreatIntelligence() {
  const { history, isLoading } = useSharedHistory();

  const stats = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    
    let totalProcessingTime = 0;
    let processedCount = 0;
    let minSpeed = Infinity;
    let maxSpeed = 0;

    const techniqueCounts: Record<string, number> = {};
    const timelineData: Record<string, { total: number, safe: number, medium: number, high: number, critical: number }> = {};
    const brandCounts: Record<string, number> = {};
    const threatCategories: Record<string, number> = {};
    let legacyCount = 0;

    history.forEach(item => {
      const r = (item.risk || "").toLowerCase();
      if (r === "critical") critical++;
      else if (r === "high") high++;
      else if (r.includes("medium")) medium++;
      else low++;

      // Processing time estimation
      if ((item as any).processing_time) {
        const pt = (item as any).processing_time / 1000; // convert to seconds
        totalProcessingTime += pt;
        processedCount++;
        if (pt < minSpeed) minSpeed = pt;
        if (pt > maxSpeed) maxSpeed = pt;
      }

      const attackLabel = (item as any).validated_attack || (item as any).attack_type;
      if (attackLabel && attackLabel !== "No Primary Attack Detected" && attackLabel !== "Suspicious Communication" && attackLabel !== "Rule-Based Detection") {
         threatCategories[attackLabel] = (threatCategories[attackLabel] || 0) + 1;
      }

      if (item.target_brand) {
         brandCounts[item.target_brand] = (brandCounts[item.target_brand] || 0) + 1;
      }
      
      if (item.reason && Array.isArray(item.reason)) {
        item.reason.forEach(reason => {
          if (reason.type === "critical" || reason.type === "warning") {
            const tech = reason.text;
            techniqueCounts[tech] = (techniqueCounts[tech] || 0) + 1;
          }
        });
      }
      
      // Timeline data
      if (item.timestamp) {
         const d = new Date(item.timestamp);
         const dateKey = `${d.getMonth()+1}/${d.getDate()}`;
         if (!timelineData[dateKey]) timelineData[dateKey] = { total: 0, safe: 0, medium: 0, high: 0, critical: 0 };
         timelineData[dateKey].total++;
         
         if (r === "critical") {
           timelineData[dateKey].critical++;
         } else if (r === "high") {
           timelineData[dateKey].high++;
         } else if (r.includes("medium")) {
           timelineData[dateKey].medium++;
         } else {
           timelineData[dateKey].safe++;
         }
      } else {
         legacyCount++;
      }
    });

    const total = history.length;
    
    // Sort techniques by occurrence, prevent exact duplicates in name if any sneaked in
    const sortedTechniques = Object.entries(techniqueCounts)
      .sort((a, b) => b[1] - a[1]);
      
    // Deduplicate top techniques if counts are identical and names are similar? 
    // The instructions say: "Do not display identical hit counts unless they are genuinely equal."
    const topTechniques = sortedTechniques.slice(0, 5);
      
    const riskCounts = { Critical: critical, High: high, Medium: medium, Low: low };
    const mostFrequentRisk = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0];

    const maxTimelineTotal = Math.max(...Object.values(timelineData).map(d => d.total), 1);
    const timeline = Object.entries(timelineData)
      .sort((a, b) => {
        const [aMonth, aDay] = a[0].split('/').map(Number);
        const [bMonth, bDay] = b[0].split('/').map(Number);
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      })
      .slice(-10);

    const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];
    
    const topThreatCategory = Object.entries(threatCategories).sort((a, b) => b[1] - a[1])[0];

    const avgProcessingTime = processedCount > 0 ? (totalProcessingTime / processedCount).toFixed(1) : 0;
    const finalMin = minSpeed === Infinity ? 0 : minSpeed.toFixed(1);
    const finalMax = maxSpeed.toFixed(1);

    return {
      total,
      critical,
      high,
      medium,
      low,
      topTechniques,
      mostFrequentRisk,
      timeline,
      maxTimelineTotal,
      topBrand,
      topThreatCategory,
      avgProcessingTime,
      finalMin,
      finalMax,
      processedCount,
      legacyCount
    };
  }, [history]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If history is completely empty
  if (stats.total === 0) {
    return (
      <div className="space-y-4 fade-in-slide mt-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-8">Threat Intelligence</h1>
        <div className="glass-panel p-6 text-center rounded-2xl border-dashed border-slate-700">
           <p className="text-slate-400 text-sm">No timeline data available. Run analyses to generate threat intelligence.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in-slide pb-12 max-w-6xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Threat Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">Aggregated insights and threat trends from historical data.</p>
      </div>

      {/* 4 Insight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
         <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-2">
              <FaExclamationTriangle className="text-red-400 w-3 h-3" />
              <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Common Threat</h3>
            </div>
            <div>
              <p className="text-sm font-bold text-red-400 truncate">{stats.topThreatCategory?.[0] || "None"}</p>
            </div>
         </div>
         <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-2">
              <FaBuilding className="text-orange-400 w-3 h-3" />
              <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Target Brand</h3>
            </div>
            <div>
               {stats.topBrand ? (
                 <>
                   <p className="text-sm font-bold text-orange-400 truncate">{stats.topBrand[0]}</p>
                   <p className="text-xs text-slate-500">{stats.topBrand[1]} analyses</p>
                 </>
               ) : (
                 <p className="text-xs text-slate-400">No dominant target brand.</p>
               )}
            </div>
         </div>
         <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-2">
              <FaClock className="text-emerald-400 w-3 h-3" />
              <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Avg Processing Speed</h3>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">{stats.avgProcessingTime || "0"} s</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Range: {stats.finalMin}–{stats.finalMax} s</p>
              <p className="text-[10px] text-slate-500">Based on {stats.processedCount} analyses</p>
            </div>
         </div>
         <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-2">
              <FaChartLine className="text-blue-400 w-3 h-3" />
              <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Most Frequent Risk</h3>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-400">{stats.mostFrequentRisk?.[0] || "Unknown"}</p>
              <p className="text-xs text-slate-500">{stats.mostFrequentRisk?.[1]} of {stats.total} analyses</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Threat Timeline */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-5">
            <FaCalendarAlt className="text-indigo-400 w-4 h-4" />
            Analysis Timeline
          </h2>
          {stats.timeline.length === 1 ? (
            <div className="flex flex-col gap-4 mt-2 max-w-sm">
              <span className="text-2xl font-bold text-slate-200">{stats.timeline[0][0]}</span>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-indigo-500 rounded-sm"></div>
                <span className="text-sm font-bold text-slate-300 whitespace-nowrap">{stats.timeline[0][1].total} analyses</span>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-1">
                <div className="text-sm font-medium text-slate-400">Critical: <span className="font-bold text-red-400 ml-1">{stats.timeline[0][1].critical}</span></div>
                <div className="text-sm font-medium text-slate-400">High: <span className="font-bold text-orange-400 ml-1">{stats.timeline[0][1].high}</span></div>
                <div className="text-sm font-medium text-slate-400">Medium: <span className="font-bold text-yellow-400 ml-1">{stats.timeline[0][1].medium}</span></div>
                <div className="text-sm font-medium text-slate-400">Low: <span className="font-bold text-green-400 ml-1">{stats.timeline[0][1].safe}</span></div>
              </div>
            </div>
          ) : (
            <>
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
                 {stats.timeline.map(([date, data]) => {
                    const totalHeight = (data.total / stats.maxTimelineTotal) * 100;
                    const safeHeight = data.total > 0 ? (data.safe / data.total) * 100 : 0;
                    const mediumHeight = data.total > 0 ? (data.medium / data.total) * 100 : 0;
                    const threatHeight = data.total > 0 ? ((data.high + data.critical) / data.total) * 100 : 0;
                    
                    return (
                      <div key={date} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group relative">
                         <div className="w-full flex-1 relative flex justify-center">
                             <div className="w-full max-w-10 bg-slate-800/20 rounded-t-md absolute bottom-0 flex flex-col justify-end overflow-hidden transition-all duration-500 group-hover:bg-slate-700/50" style={{ height: `${totalHeight}%`, minHeight: '8px' }}>
                                
                                {/* Stacked bars */}
                                <div className="w-full bg-red-500/80 transition-all duration-1000 border-b border-slate-900/50" style={{ height: `${threatHeight}%` }}></div>
                                <div className="w-full bg-yellow-500/80 transition-all duration-1000 border-b border-slate-900/50" style={{ height: `${mediumHeight}%` }}></div>
                                <div className="w-full bg-slate-700 transition-all duration-1000" style={{ height: `${safeHeight}%` }}></div>
                             </div>
                         </div>
                         
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 text-center">
                           <span className="font-bold">{data.total} Total</span><br/>
                           <span className="text-red-400">{data.high + data.critical} High</span> | <span className="text-yellow-400">{data.medium} Med</span> | <span className="text-slate-400">{data.safe} Safe</span>
                         </div>

                         <span className="text-[10px] font-bold text-slate-500">{date}</span>
                      </div>
                    );
                 })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-800/50">
                 <div className="flex items-center gap-2 text-xs text-slate-400">
                   <span className="w-3 h-3 rounded-sm bg-slate-700 block"></span> Safe
                 </div>
                 <div className="flex items-center gap-2 text-xs text-slate-400">
                   <span className="w-3 h-3 rounded-sm bg-yellow-500/80 block"></span> Medium
                 </div>
                 <div className="flex items-center gap-2 text-xs text-slate-400">
                   <span className="w-3 h-3 rounded-sm bg-red-500/80 block"></span> High/Critical
                 </div>
              </div>
            </>
          )}
          
          {stats.legacyCount > 0 && (
            <p className="text-[10px] text-slate-500 italic mt-5 text-center bg-slate-900/30 py-2 rounded-lg border border-slate-800/50">
              {stats.legacyCount} legacy {stats.legacyCount === 1 ? 'analysis' : 'analyses'} excluded due to missing metadata.
            </p>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-5">
            <FaChartBar className="text-blue-400 w-4 h-4" />
            Risk Distribution
          </h2>
          <div className="space-y-4">
            {[
              { label: "Critical", count: stats.critical, color: "bg-red-500" },
              { label: "High", count: stats.high, color: "bg-orange-500" },
              { label: "Medium", count: stats.medium, color: "bg-yellow-500" },
              { label: "Low", count: stats.low, color: "bg-green-500" },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>{r.label}</span>
                  <span>{r.count} ({Math.round((r.count / stats.total) * 100)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${r.color} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`}
                    style={{ width: `${(r.count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Common Indicators */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-5">
            <FaShieldAlt className="text-cyan-400 w-4 h-4" />
            Most Common Indicators
          </h2>
          
          {stats.topTechniques.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {stats.topTechniques.map(([tech, count], idx) => {
                const maxCount = stats.topTechniques[0][1];
                const percentage = Math.round((count / maxCount) * 100);
                return (
                  <div key={tech} className="glass-card p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-blue-500/5 transition-all duration-1000 -z-10 border-r border-blue-500/20"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="flex items-center gap-3">
                       <span className="text-slate-500 font-bold text-sm w-4">#{idx + 1}</span>
                       <span className="text-xs font-medium text-slate-200 truncate max-w-37.5 sm:max-w-xs">{tech}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                      {count} {count === 1 ? 'hit' : 'hits'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No malicious indicators have been detected yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
