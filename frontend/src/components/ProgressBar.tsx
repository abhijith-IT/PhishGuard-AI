type ProgressBarProps = {
  confidence: string;
};

function ProgressBar({ confidence }: ProgressBarProps) {
  const value = parseInt(confidence) || 0;

  return (
    <div style={{ marginBottom: "20px" }}>
      <p>
        <strong>Confidence:</strong> {confidence}
      </p>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#333",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "#3b82f6",
            borderRadius: "10px",
            transition: "0.4s",
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;