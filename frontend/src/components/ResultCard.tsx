function ResultCard() {
  return (
    <div
      style={{
        marginTop: "30px",
        textAlign: "left",
        color: "white",
      }}
    >
      <h2>Threat Analysis</h2>

      <p><strong>Risk:</strong> 🔴 High</p>

      <p><strong>Confidence:</strong> 96%</p>

      <p>
        Suspicious sender, urgent language,
        possible phishing attempt.
      </p>
    </div>
  );
}

export default ResultCard;