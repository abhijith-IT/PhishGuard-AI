import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";
import { useProgressiveReveal } from "../hooks/useProgressiveReveal";

type ResultCardProps = {
  risk: string;
  confidence: string;
  recommendation: string;
  reasons: string[];
  analysisSource: string;
};

function ResultCard({
  risk,
  confidence,
  recommendation,
  reasons,
  analysisSource
}: ResultCardProps) {
  const isReady = Boolean(risk);
  const hasReasons = reasons.length > 0;
  // Calculate total steps based on presence of reasons
  const recommendationStep = hasReasons ? 5 + reasons.length : 4;
  const totalSteps = recommendationStep;

  const currentStep = useProgressiveReveal(isReady, totalSteps, 400);

  return (
    <div
      style={{
        marginTop: "30px",
        textAlign: "left",
        color: "white",
      }}
    >
      <h2>Threat Analysis</h2>

      {currentStep >= 1 && (
        <div className={isReady ? "fade-in" : ""}>
          <RiskBadge risk={risk} />
        </div>
      )}

      {currentStep >= 2 && (
        <div className={isReady ? "fade-in" : ""}>
          <ProgressBar confidence={confidence} />
        </div>
      )}

      {currentStep >= 3 && (
        <p className={isReady ? "fade-in" : ""}>
          <strong>Source:</strong>{" "}
          {analysisSource === "Groq AI"
            ? "🤖 Groq AI"
            : "🛡️ Rule-Based Detector"}
        </p>
      )}

      {currentStep >= 4 && hasReasons && (
        <h3 className={isReady ? "fade-in" : ""}>Reasons</h3>
      )}

      {hasReasons && (
        <ul style={{ paddingLeft: "20px" }}>
          {reasons.map((reason, index) => {
            if (currentStep >= 5 + index) {
              return (
                <li
                  key={index}
                  className={isReady ? "fade-in" : ""}
                  style={{
                    marginBottom: "8px",
                  }}
                >
                  ✅ {reason}
                </li>
              );
            }
            return null;
          })}
        </ul>
      )}

      {currentStep >= recommendationStep && recommendation && (
        <div className={isReady ? "fade-in" : ""}>
          <p>
            <strong>Recommendation:</strong>
          </p>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default ResultCard;