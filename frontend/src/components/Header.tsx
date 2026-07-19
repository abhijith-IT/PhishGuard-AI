import { FaShieldAlt } from "react-icons/fa";

function Header() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 box-glow-blue">
          <FaShieldAlt className="text-xl text-blue-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">PhishGuard <span className="text-blue-500">AI</span></h1>
      </div>
      <p className="text-slate-400 text-sm sm:text-base font-medium">AI-Powered Phishing Email & URL Detection</p>
    </div>
  );
}

export default Header;