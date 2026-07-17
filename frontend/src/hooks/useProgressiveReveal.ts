import { useState, useEffect } from "react";

/**
 * A custom hook for progressive rendering of UI sections.
 * 
 * @param isReady Whether the data is ready to be revealed (if false, reveals everything instantly).
 * @param totalSteps The total number of steps in the sequence.
 * @param delayMs The delay between each step in milliseconds.
 * @returns The current step number, incremented over time.
 */
export function useProgressiveReveal(
  isReady: boolean,
  totalSteps: number,
  delayMs: number = 400
) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // If there is no data to reveal, or we shouldn't reveal yet, just show everything.
    // This allows the initial "empty state" of components to render immediately.
    if (!isReady) {
      setCurrentStep(999);
      return;
    }

    setCurrentStep(1); // Start at 1 so the first element shows immediately upon load
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, delayMs);

    return () => clearInterval(interval);
  }, [isReady, totalSteps, delayMs]);

  return currentStep;
}
