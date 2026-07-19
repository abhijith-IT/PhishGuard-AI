import { useState } from "react";
import Layout from "./components/Layout";
import TopBar from "./components/TopBar";
import InputBox from "./components/InputBox";
import AnalyzeButton from "./components/AnalyzeButton";
import FileUpload from "./components/FileUpload";
import LoadingSequence from "./components/LoadingSequence";
import History from "./components/History";
import InputSummaryCard from "./components/InputSummaryCard";
import ThreatAnalysisCard from "./components/ThreatAnalysisCard";
import SecurityAssessmentCard from "./components/SecurityAssessmentCard";
import RecommendationCard from "./components/RecommendationCard";
import AnalysisDetailsCard from "./components/AnalysisDetailsCard";
import SecurityScoreCard from "./components/SecurityScoreCard";
import AnalysisTimelineCard from "./components/AnalysisTimelineCard";

type Finding = {
  text: string;
  type: string;
};

export default function App() {
  const [activeView, setActiveView] = useState("analyze"); // analyze, history
  const [text, setText] = useState("");
  const [risk, setRisk] = useState("");
  const [confidence, setConfidence] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [reasons, setReasons] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisSource, setAnalysisSource] = useState("");
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  const handleDownloadSuccess = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleHistorySelect = (item: any) => {
    setSelectedHistoryItem(item);
  };

  const handleNewAnalysis = () => {
    setActiveView("analyze");
    setIsInputCollapsed(false);
    setRisk("");
    setConfidence("");
    setReasons([]);
    setRecommendation("");
    setAnalysisSource("");
    setProcessingTime(null);
    setText("");
    setUploadedFileName(null);
    setError("");
    setSelectedHistoryItem(null);
  };

  const analyzeThreat = async () => {
    if (!text.trim()) {
      setError("Please enter or upload text to analyze.");
      return;
    }
    setIsInputCollapsed(true);
    setLoading(true);
    setError("");
    setRisk("");
    setConfidence("");
    setReasons([]);
    setRecommendation("");
    setAnalysisSource("");
    setProcessingTime(null);

    const startTime = performance.now();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      
      setRisk(data.risk);
      setConfidence(data.confidence);
      setReasons(data.reason);
      setRecommendation(data.recommendation);
      setAnalysisSource(data.analysis_source ?? "");
      
      const endTime = performance.now();
      setProcessingTime(Math.round(endTime - startTime));
      setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setError("Backend not reachable or an error occurred.");
      setIsInputCollapsed(false);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (activeView === "history") {
      return (
        <div className="relative h-full">
          {/* Main History View */}
          <div className={`${selectedHistoryItem ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>
             <TopBar title="Analysis History" onNewAnalysis={handleNewAnalysis} />
             <History refreshKey={refreshKey} onSelect={handleHistorySelect} selectedId={selectedHistoryItem?.id} />
          </div>

          {/* Slide-in Detail Modal */}
          {selectedHistoryItem && (
             <div className="absolute inset-0 bg-[#0B0F19] z-40 overflow-y-auto custom-scrollbar fade-in-slide pb-20">
               <div className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-700/50 p-4 mb-6 flex justify-between items-center">
                  <button 
                    onClick={() => setSelectedHistoryItem(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-xl font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to History
                  </button>
                  <h2 className="text-slate-200 font-bold tracking-tight">Archived Analysis</h2>
               </div>
               
               <div className="px-1 max-w-7xl mx-auto">
                 <InputSummaryCard 
                   text={selectedHistoryItem.message} 
                   fileName={null}
                   onEdit={() => {}} 
                   readOnly={true}
                 />
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mt-6">
                   <div className="lg:col-span-1 h-full">
                     <ThreatAnalysisCard 
                       risk={selectedHistoryItem.risk}
                       confidence={selectedHistoryItem.confidence}
                       reasons={selectedHistoryItem.reason || []}
                       isReady={true}
                     />
                   </div>
                   <div className="lg:col-span-1 h-full">
                     <SecurityScoreCard 
                       confidence={selectedHistoryItem.confidence} 
                       isReady={true} 
                     />
                   </div>
                   <div className="lg:col-span-1 h-full">
                     <AnalysisTimelineCard isReady={true} />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mt-6">
                    <div className="h-full">
                      <AnalysisDetailsCard 
                        analysisSource={selectedHistoryItem.analysis_source || "Unknown"}
                        processingTime={selectedHistoryItem.processing_time || 1240}
                        timestamp={selectedHistoryItem.timestamp || "Archived"}
                        reasons={selectedHistoryItem.reason || []}
                        isReady={true}
                      />
                    </div>
                    <div className="h-full">
                      <SecurityAssessmentCard 
                        reasons={selectedHistoryItem.reason || []} 
                        isReady={true} 
                      />
                    </div>
                 </div>
                 
                 <RecommendationCard 
                   recommendation={selectedHistoryItem.recommendation || ""} 
                   isReady={true} 
                 />
               </div>
             </div>
          )}
        </div>
      );
    }

    return (
      <>
        <TopBar 
          title="Threat Analysis" 
          onNewAnalysis={risk || loading ? handleNewAnalysis : undefined}
          showDownload={Boolean(risk)}
          downloadProps={risk ? {
            message: text,
            risk,
            confidence,
            reasons: reasons.map(r => r.text),
            recommendation,
            source: analysisSource,
            onSuccess: handleDownloadSuccess
          } : undefined}
        />

        {!isInputCollapsed && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 max-w-4xl mx-auto mt-10 fade-in-slide">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                Analyze Email or URL
              </h2>
              <p className="text-slate-400 text-sm">
                Paste suspicious content below for instant AI threat detection.
              </p>
            </div>

            <div className="relative z-10">
              <InputBox 
                value={text} 
                onChange={(val) => {
                  setText(val);
                  setUploadedFileName(null);
                  if (error) setError("");
                }} 
              />
              
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <FileUpload 
                  onFileRead={(content, fileName) => {
                     setText(content);
                     setUploadedFileName(fileName);
                     setError("");
                  }}
                />
                <AnalyzeButton 
                  onClick={analyzeThreat} 
                  loading={loading}
                  disabled={!text.trim() || loading}
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {isInputCollapsed && !loading && (
          <InputSummaryCard 
            text={text} 
            fileName={uploadedFileName} 
            onEdit={() => {
              setIsInputCollapsed(false);
              setRisk("");
              setConfidence("");
              setReasons([]);
            }} 
          />
        )}

        {loading && (
           <div className="mt-12 fade-in-slide">
              <LoadingSequence />
           </div>
        )}

        {risk && !loading && (
          <div className="fade-in-slide pb-20 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
              <div className="lg:col-span-1 h-full">
                <ThreatAnalysisCard 
                  risk={risk}
                  confidence={confidence}
                  reasons={reasons}
                  isReady={true}
                />
              </div>
              <div className="lg:col-span-1 h-full">
                <SecurityScoreCard 
                  confidence={confidence} 
                  isReady={true} 
                />
              </div>
              <div className="lg:col-span-1 h-full">
                <AnalysisTimelineCard isReady={true} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-6">
              <div className="h-full">
                <AnalysisDetailsCard 
                  analysisSource={analysisSource}
                  processingTime={processingTime}
                  timestamp={timestamp}
                  reasons={reasons}
                  isReady={true}
                />
              </div>
              <div className="h-full">
                <SecurityAssessmentCard 
                  reasons={reasons} 
                  isReady={true} 
                />
              </div>
            </div>
            
            <RecommendationCard 
              recommendation={recommendation} 
              isReady={true} 
            />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Layout activeView={activeView} setActiveView={setActiveView}>
        {renderContent()}
      </Layout>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Report Downloaded</p>
              <p className="text-xs text-slate-400">PDF has been saved to your device.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}