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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/history`);
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
            padding: "22px",
            borderRadius: "14px",
            marginBottom: "15px",
            boxShadow: "0 6px 18px rgba(0,0,0,.25)",
            transition: "2s",

          }}
        >
          <h3>{item.risk}</h3>

          <p>
            {item.message.length > 160
              ? item.message.substring(0, 160) + "..."
              : item.message}
          </p>

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
      <footer
        style={{
          marginTop: "40px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "14px",
        }}
      >
        © 2026 PhishGuard AI • IBM SkillsBuild Internship Project
      </footer>
    </div>
  );
}

export default History;