type DownloadButtonProps = {
    message: string;
    risk: string;
    confidence: string;
    reasons: string[];
    recommendation: string;
    source: string;
};

function DownloadButton({
    message,
    risk,
    confidence,
    reasons,
    recommendation,
    source,
}: DownloadButtonProps) {

    const download = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/download-report`, {
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

        } catch {
            alert("Could not connect to backend.");
        }
    };

    return (
        <button onClick={download}>
            📄 Download Report
        </button>
    );
}

export default DownloadButton;
