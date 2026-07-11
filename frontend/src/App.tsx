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
 const analyzeThreat = async () => {
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
    console.log(data);

    setRisk(data.risk);
    setConfidence(data.confidence);
    setReasons(data.reason);
    setRecommendation(data.recommendation);

  } catch (error) {
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

       <ResultCard
  risk={risk}
  confidence={confidence}
  recommendation={recommendation}
  reasons={reasons}
/>
      </div>
    </div>
  );
}

export default App;