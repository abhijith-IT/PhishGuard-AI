import { useState } from "react";

type DownloadButtonProps = {
    message: string;
    risk: string;
    confidence: string;
    reasons: string[];
    recommendation: string;
    source: string;
    onSuccess?: () => void;
};

function DownloadButton({
    message,
    risk,
    confidence,
    reasons,
    recommendation,
    source,
    onSuccess,
}: DownloadButtonProps) {
    const [downloading, setDownloading] = useState(false);

    const download = async () => {
        setDownloading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/download-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    risk,
                    confidence,
                    reasons,
                    recommendation,
                    source,
                }),
            });

            if (!response.ok) {
                alert("Failed to generate report.");
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "PhishGuard_Report.pdf";
            a.click();
            URL.revokeObjectURL(url);
            
            if (onSuccess) {
                onSuccess();
            }

        } catch {
            alert("Could not connect to backend.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button 
            onClick={download}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-600/50 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
            {downloading ? (
                <span className="animate-pulse">Generating...</span>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF Report
                </>
            )}
        </button>
    );
}

export default DownloadButton;
