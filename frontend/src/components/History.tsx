import { useEffect, useState } from "react";

type HistoryItem = {
  id: number;
  message: string;
  risk: string;
  confidence: string;
};

function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/history")
      .then((res) => res.json())
      .then((data) => setHistory(data));
  }, []);

  return (
    <div style={{ marginTop: "40px" }}>
      <h2> Analysis History</h2>

      {history.map((item) => (
        <div
          key={item.id}
          style={{
            background: "#1e293b",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "15px",
          }}
        >
          <h3>{item.risk}</h3>

          <p>{item.message}</p>

          <p>
            <strong>Confidence:</strong> {item.confidence}
          </p>
        </div>
      ))}
    </div>
  );
}

export default History;