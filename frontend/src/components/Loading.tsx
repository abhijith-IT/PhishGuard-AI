function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm space-y-6">
      <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/2 bg-blue-500 rounded-full animate-scan box-glow-blue" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-blue-400 font-mono text-sm uppercase tracking-widest animate-pulse">Running AI Models...</p>
        <p className="text-slate-500 text-xs">Analyzing linguistics, links, and patterns</p>
      </div>
    </div>
  );
}

export default Loading;