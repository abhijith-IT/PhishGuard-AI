import { FaShieldAlt, FaHistory, FaSearch, FaChartBar, FaFilePdf, FaInfoCircle, FaHome } from "react-icons/fa";
import { useSharedHistory } from "../context/HistoryContext";
import { useEffect, useState } from "react";

type SidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
  closeSidebar?: () => void;
};

export default function Sidebar({ activeView, setActiveView, closeSidebar }: SidebarProps) {
  const { history } = useSharedHistory();
  const [securityTip, setSecurityTip] = useState("Always verify the sender's actual email address, not just their display name.");

  useEffect(() => {
    // Dynamic Security Tip based on latest high-risk finding
    if (history.length > 0) {
      const highRiskItem = history.find(item => item.risk.includes("High") || item.risk.includes("Critical"));
      if (highRiskItem && highRiskItem.reason.length > 0) {
        const topReason = highRiskItem.reason.find(r => r.type === "critical" || r.type === "warning");
        if (topReason) {
          if (topReason.text.includes("URL") || topReason.text.includes("link")) {
            setSecurityTip("Recent threat detected: Never click suspicious links. Hover over them to inspect the true destination.");
          } else if (topReason.text.includes("credential") || topReason.text.includes("login")) {
            setSecurityTip("Recent threat detected: Legitimate organizations will never ask for your password via email.");
          } else {
            setSecurityTip(`Based on recent analysis: ${topReason.text}`);
          }
        }
      }
    }
  }, [history]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome className="w-4 h-4" /> },
    { id: "analyze", label: "New Analysis", icon: <FaSearch className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <FaHistory className="w-4 h-4" /> },
    { id: "threat_intelligence", label: "Threat Intelligence", icon: <FaChartBar className="w-4 h-4" /> },
    { id: "reports", label: "Reports", icon: <FaFilePdf className="w-4 h-4" /> },
    { id: "about", label: "About", icon: <FaInfoCircle className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    if (closeSidebar) closeSidebar();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 text-slate-300 w-64 pt-6 px-4 pb-6 transition-transform z-20">
      <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => handleNavClick("dashboard")}>
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <FaShieldAlt className="w-5 h-5 text-blue-400" />
        </div>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight whitespace-nowrap">
          PhishGuard <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">AI</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
              activeView === item.id
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-linear-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
             <FaShieldAlt className="w-3.5 h-3.5 text-blue-400" />
             Security Tip
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-4">
            {securityTip}
          </p>
        </div>
      </div>
    </div>
  );
}
