type RiskBadgeProps = {
  risk: string;
};

function RiskBadge({ risk }: RiskBadgeProps) {
  let background = "#16a34a";

  if (risk.includes("Medium")) {
    background = "#f59e0b";
  }

  if (risk.includes("High")) {
    background = "#dc2626";
  }

  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 20px",
        borderRadius: "10px",
        background,
        color: "white",
        fontWeight: "bold",
        fontSize: "18px",
        marginBottom: "20px",
      }}
    >
      {risk || "No Analysis"}
    </div>
  );
}

export default RiskBadge;