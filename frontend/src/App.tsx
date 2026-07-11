import Loading from "./components/Loading";
import { useState } from "react";
import Header from "./components/Header";
import InputBox from "./components/InputBox";
import AnalyzeButton from "./components/AnalyzeButton";
import ResultCard from "./components/ResultCard";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [risk, setRisk] = useState("");
const [confidence, setConfidence] = useState("");
const [recommendation, setRecommendation] = useState("");
const [reasons, setReasons] = useState<string[]>([]);
const [loading, setLoading] = useState(false);
 const analyzeThreat = async () => {
  setLoading(true);
  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    const data = await response.json();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data);

    setRisk(data.risk);
    setConfidence(data.confidence);
    setReasons(data.reason);
    setRecommendation(data.recommendation);
    setLoading(false);

  } catch (error) {
    setLoading(false);
    console.error(error);
    alert("Backend not reachable");
  }
};

  return (
    <div className="container">
      <div className="card">
        <Header />

        <InputBox
          value={text}
          onChange={setText}
        />

        <AnalyzeButton
          onClick={analyzeThreat}
        />

      {loading ? (
    <Loading />
) : (
    <ResultCard
        risk={risk}
        confidence={confidence}
        recommendation={recommendation}
        reasons={reasons}
    />
)}
      </div>
    </div>
  );
}

export default App;