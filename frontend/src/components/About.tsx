import { FaShieldAlt, FaCode, FaServer, FaBrain, FaExternalLinkAlt, FaGithub, FaReact, FaDatabase, FaFilePdf, FaArrowRight, FaCogs, FaHistory, FaCheckCircle } from "react-icons/fa";
import ProcessingPipeline from "./ProcessingPipeline";

export default function About() {
  const architectureLayers = [
    { icon: <FaReact className="w-5 h-5" />, label: "React Frontend", desc: "TypeScript + Tailwind CSS v4", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
    { icon: <FaServer className="w-5 h-5" />, label: "FastAPI Backend", desc: "Python 3.12 REST API", color: "text-teal-400", border: "border-teal-500/30", bg: "bg-teal-500/10" },
    { icon: <FaBrain className="w-5 h-5" />, label: "Groq AI Engine", desc: "Llama 3 8B LPU Inference", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
    { icon: <FaCogs className="w-5 h-5" />, label: "Scoring Engine", desc: "Deterministic Weight-based Logic", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
    { icon: <FaDatabase className="w-5 h-5" />, label: "SQLite Database", desc: "Analysis History & Reports", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
    { icon: <FaFilePdf className="w-5 h-5" />, label: "PDF Generator", desc: "Downloadable Report Engine", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  ];

  const highlights = [
    { icon: <FaBrain className="text-purple-400 w-4 h-4" />, text: "Explainable AI" },
    { icon: <FaShieldAlt className="text-indigo-400 w-4 h-4" />, text: "Threat Intelligence" },
    { icon: <FaFilePdf className="text-red-400 w-4 h-4" />, text: "PDF Reporting" },
    { icon: <FaHistory className="text-blue-400 w-4 h-4" />, text: "History Tracking" },
    { icon: <FaCogs className="text-orange-400 w-4 h-4" />, text: "Deterministic Scoring" },
    { icon: <FaServer className="text-teal-400 w-4 h-4" />, text: "Docker Deployment" },
  ];

  return (
    <div className="space-y-6 fade-in-slide pb-12 max-w-5xl mx-auto">
      <div className="text-center mb-8 pt-4">
        <div className="w-20 h-20 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30 mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-bounce-slow">
           <FaShieldAlt className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">PhishGuard <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">AI</span></h1>
        <p className="text-slate-400 mt-2">Intelligent Cybersecurity Analysis Platform</p>
        <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 rounded-full mt-4">v2.0.0</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hackathon Context */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Project Context
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            PhishGuard AI was developed as a flagship project for the <strong>IBM SkillsBuild Internship</strong>. It demonstrates the integration of modern web technologies with advanced artificial intelligence to solve real-world cybersecurity challenges. The platform is designed to instantly analyze emails, URLs, and SMS messages to detect sophisticated phishing attempts.
          </p>
          <div className="flex gap-4">
             <a href="#" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
               <FaGithub /> GitHub Repository
             </a>
             <a href="#" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
               <FaExternalLinkAlt className="w-3 h-3" /> IBM SkillsBuild
             </a>
          </div>
        </div>

        {/* Project Highlights */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 relative overflow-hidden group">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5 flex items-center gap-2">
             <FaCheckCircle className="text-green-400 w-5 h-5" />
             Project Highlights
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {highlights.map((highlight, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl flex items-center gap-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
                   <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0 border border-slate-700">
                      {highlight.icon}
                   </div>
                   <span className="text-sm font-medium text-slate-200">{highlight.text}</span>
                </div>
             ))}
          </div>
        </div>

        {/* AI Engine */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaBrain className="text-cyan-400" />
            Analysis Engine
          </h2>
          <ul className="space-y-4">
            <li>
              <h4 className="text-slate-200 font-medium text-sm">Groq AI Inference</h4>
              <p className="text-slate-400 text-xs mt-1">Utilizes Llama 3 8B through Groq's LPU infrastructure for blazing-fast natural language processing and threat detection.</p>
            </li>
            <li>
              <h4 className="text-slate-200 font-medium text-sm">Fallback Heuristics</h4>
              <p className="text-slate-400 text-xs mt-1">Deterministic regex and pattern matching engine to ensure 100% uptime even if AI services are unavailable.</p>
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaCode className="text-green-400" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-slate-300 font-medium text-xs mb-2 flex items-center gap-1"><FaCode className="text-slate-500" /> Frontend</h4>
              <ul className="space-y-1">
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full"></span> React 19</li>
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full"></span> TypeScript</li>
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-cyan-400 rounded-full"></span> Tailwind CSS v4</li>
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-purple-400 rounded-full"></span> Vite</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-300 font-medium text-xs mb-2 flex items-center gap-1"><FaServer className="text-slate-500" /> Backend</h4>
              <ul className="space-y-1">
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-teal-400 rounded-full"></span> FastAPI</li>
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-yellow-400 rounded-full"></span> Python 3.12</li>
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-orange-400 rounded-full"></span> SQLite</li>
                <li className="text-slate-400 text-xs flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Docker</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
      
      {/* System Architecture Diagram */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Architecture</h2>
          <p className="text-slate-400 text-sm mt-1">End-to-end data flow through the PhishGuard AI platform.</p>
        </div>
        
        {/* Wrapping container for responsive design */}
        <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 lg:gap-6">
          {architectureLayers.map((layer, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${layer.border} ${layer.bg} transition-all hover:scale-[1.02] w-64 md:w-44 h-32 text-center`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${layer.color} mb-3 shadow-[0_0_15px_currentColor] opacity-80`}>
                  {layer.icon}
                </div>
                <h4 className="text-sm font-bold text-slate-200">{layer.label}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{layer.desc}</p>
              </div>
              
              {/* Arrow logic: hide arrow on mobile, show on md and above unless it's the last item */}
              {idx < architectureLayers.length - 1 && (
                <div className="hidden md:flex ml-6 h-full items-center">
                  <FaArrowRight className="text-slate-700 w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ProcessingPipeline />
      
      <div className="text-center mt-8 pt-6 border-t border-slate-800/50">
         <p className="text-slate-500 text-xs">Developed with passion for securing the web.</p>
      </div>
    </div>
  );
}
