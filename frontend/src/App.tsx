import { useState } from "react";
import Header from "./components/Header";
import InputBox from "./components/InputBox";
import AnalyzeButton from "./components/AnalyzeButton";
import ResultCard from "./components/ResultCard";
import "./App.css";

function App() {
  const [text, setText] = useState("");

  const analyzeThreat = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/");

    const data = await response.json();

    alert(data.message);
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

        <ResultCard />
      </div>
    </div>
  );
}

export default App;