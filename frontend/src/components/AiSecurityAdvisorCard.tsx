import { FaRobot, FaCheck, FaBan, FaPaperclip, FaExclamationTriangle, FaSearch, FaUserShield, FaLink } from "react-icons/fa";
import type { Finding } from "../context/HistoryContext";

type AiSecurityAdvisorCardProps = {
  reasons: Finding[];
  isReady: boolean;
};

export default function AiSecurityAdvisorCard({ reasons, isReady }: AiSecurityAdvisorCardProps) {
  
  const generateActionPlan = () => {
    const threats = reasons.filter(r => r.type.toLowerCase() === "critical" || r.type.toLowerCase() === "warning");
    const actions = [];
    
    // Check for specific threat signatures to give tailored advice
    const hasUrls = threats.some(t => t.text.toLowerCase().includes('url') || t.text.toLowerCase().includes('link'));
    const hasAttachments = threats.some(t => t.text.toLowerCase().includes('attach'));
    const hasImpersonation = threats.some(t => t.text.toLowerCase().includes('brand') || t.text.toLowerCase().includes('impersonat'));
    const hasUrgency = threats.some(t => t.text.toLowerCase().includes('urgent') || t.text.toLowerCase().includes('threat'));
    const hasCredentials = threats.some(t => t.text.toLowerCase().includes('credential') || t.text.toLowerCase().includes('login') || t.text.toLowerCase().includes('password'));

    if (threats.length === 0) {
      return [
        { icon: <FaCheck className="text-green-400 w-4 h-4" />, text: "Proceed with normal business operations.", color: "bg-green-500/10 border-green-500/20" },
        { icon: <FaSearch className="text-blue-400 w-4 h-4" />, text: "Continue to monitor incoming communications.", color: "bg-blue-500/10 border-blue-500/20" }
      ];
    }

    if (hasUrls) {
      actions.push({ icon: <FaLink className="text-red-400 w-4 h-4" />, text: "Do not click any embedded links or buttons.", color: "bg-red-500/10 border-red-500/20" });
    }
    
    if (hasAttachments) {
      actions.push({ icon: <FaPaperclip className="text-red-400 w-4 h-4" />, text: "Do not download or open attached files.", color: "bg-red-500/10 border-red-500/20" });
    }

    if (hasCredentials) {
      actions.push({ icon: <FaBan className="text-red-400 w-4 h-4" />, text: "Never provide your passwords or login credentials.", color: "bg-red-500/10 border-red-500/20" });
    }

    if (hasImpersonation || hasUrgency) {
      actions.push({ icon: <FaUserShield className="text-orange-400 w-4 h-4" />, text: "Verify the sender's identity via known official channels.", color: "bg-orange-500/10 border-orange-500/20" });
    }

    if (threats.length > 0) {
      actions.push({ icon: <FaExclamationTriangle className="text-yellow-400 w-4 h-4" />, text: "Report this message to your IT administrator immediately.", color: "bg-yellow-500/10 border-yellow-500/20" });
    }

    // Ensure we return max 4 actions to keep it scannable
    return actions.slice(0, 4);
  };

  const actionPlan = generateActionPlan();

  return (
    <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col h-full ${isReady ? "fade-in-slide" : ""}`} style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-5 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <FaRobot className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Security Advisor</h2>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2 space-y-3">
         {actionPlan.map((action, idx) => (
           <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border ${action.color}`}>
             <div className="w-8 h-8 rounded-full bg-slate-900/50 flex items-center justify-center shrink-0 border border-slate-700/50">
                {action.icon}
             </div>
             <span className="text-sm font-medium text-slate-200">{action.text}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
