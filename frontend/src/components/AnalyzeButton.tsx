type AnalyzeButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

function AnalyzeButton({ onClick, disabled, loading }: AnalyzeButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-base transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        disabled && !loading
          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50" 
          : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
      }`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          Analyzing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Analyze Threat
        </>
      )}
    </button>
  );
}

export default AnalyzeButton;