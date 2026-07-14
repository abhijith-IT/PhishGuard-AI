import { useEffect, useState } from "react";

type HistoryItem = {
  id: number;
  message: string;
  risk: string;
  confidence: string;
  reason: string[];
  analysis_source?: string;
};

type HistoryProps = {
  refreshKey: number;
};

function History({ refreshKey }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    const res = await fetch("http://127.0.0.1:8000/history");
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

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

          {item.analysis_source && (
            <p>
              <strong>Source:</strong> {item.analysis_source}
            </p>
          )}

          {item.reason && item.reason.length > 0 && (
            <ul style={{ paddingLeft: "20px", textAlign: "left" }}>
              {item.reason.map((r, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default History;