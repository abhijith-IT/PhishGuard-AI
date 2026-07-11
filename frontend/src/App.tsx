import Header from "./components/Header";
import InputBox from "./components/InputBox";
import AnalyzeButton from "./components/AnalyzeButton";
import ResultCard from "./components/ResultCard";
import "./App.css";
function App() {
  return (
    <div className="container">
      <div className="card">
        <Header />
        <InputBox />
        <AnalyzeButton />
        <ResultCard />
      </div>
    </div>
  );
}export default App;