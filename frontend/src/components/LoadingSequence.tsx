import { useState, useEffect } from "react";
import { FaServer, FaLink, FaUserSecret, FaBrain, FaFileAlt } from "react-icons/fa";

const steps = [
  { text: "Scanning Input...", icon: <FaServer /> },
  { text: "Checking Links...", icon: <FaLink /> },
  { text: "Detecting Social Engineering...", icon: <FaUserSecret /> },
  { text: "Running Groq AI Analysis...", icon: <FaBrain /> },
  { text: "Preparing Security Report...", icon: <FaFileAlt /> },
];

export default function LoadingSequence() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // We want the sequence to run over roughly 2.5 seconds
    // 2500ms / 5 steps = 500ms per step
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-3xl py-16 px-8 flex flex-col items-center justify-center w-full min-h-75">
      <div className="w-16 h-16 relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="text-2xl text-blue-400">
          {steps[currentStep].icon}
        </div>
      </div>
      
      <div className="h-8 relative w-full max-w-sm flex justify-center items-center overflow-hidden">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`absolute flex items-center gap-3 transition-all duration-500 ease-out ${
              index === currentStep 
                ? 'opacity-100 translate-y-0 scale-100' 
                : index < currentStep 
                  ? 'opacity-0 -translate-y-4 scale-95' 
                  : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <span className="text-slate-300 font-medium tracking-wide">{step.text}</span>
          </div>
        ))}
      </div>
      
      <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
