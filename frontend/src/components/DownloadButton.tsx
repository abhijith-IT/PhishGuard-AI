function DownloadButton() {

    const download = () => {
        window.open(
            "http://127.0.0.1:8000/download-report",
            "_blank"
        );
    };

    return (
        <button onClick={download}>
            📄 Download Report
        </button>
    );
}

export default DownloadButton;