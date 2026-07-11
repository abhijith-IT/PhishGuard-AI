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

      <p>
        <strong>Risk:</strong> {risk}
      </p>

      <p>
        <strong>Confidence:</strong> {confidence}
      </p>

      <h3>Reasons</h3>

      <ul>
        {reasons.map((reason, index) => (
          <li key={index}>{reason}</li>
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