import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";
type ResultCardProps = {
  risk: string;
  confidence: string;
  recommendation: string;
  reasons: string[];
};

function ResultCard({
  risk,
  confidence,
  recommendation,
  reasons,
}: ResultCardProps) {
  return (
    <div
      style={{
        marginTop: "30px",
        textAlign: "left",
        color: "white",
      }}
    >
      <h2>Threat Analysis</h2>

      <RiskBadge risk={risk} />

      <ProgressBar confidence={confidence} />
      <h3>Reasons</h3>

      <ul style={{ paddingLeft: "20px" }}>
      {reasons.map((reason, index) => (
    <li
      key={index}
      style={{
        marginBottom: "8px",
      }}
    >
      ✅ {reason}
    </li>
  ))}
  </ul>

      <p>
        <strong>Recommendation:</strong>
      </p>

      <p>{recommendation}</p>
    </div>
  );
}

export default ResultCard;