import { useState, useEffect } from "react";

type ProgressBarProps = {
  confidence: string;
};

function ProgressBar({ confidence }: ProgressBarProps) {
  const value = parseInt(confidence) || 0;
  const [currentWidth, setCurrentWidth] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Fill the progress bar
    const timer = setTimeout(() => setCurrentWidth(value), 100);
    
    // Animate the text numbers smoothly over ~800ms
    let startTimestamp: number | null = null;
    const duration = 800; // ms
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOut function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    
    const animTimer = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(animTimer);
    };
  }, [value]);

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-slate-400">Confidence Score</span>
        <span className="text-blue-400 font-mono">{displayValue}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${currentWidth}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;