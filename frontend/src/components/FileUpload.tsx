type FileUploadProps = {
  onFileRead: (content: string, fileName: string) => void;
};

function FileUpload({ onFileRead }: FileUploadProps) {
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileRead(text, file.name);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        accept=".txt,.eml"
        onChange={handleFile}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Upload .txt or .eml file"
      />
      <label htmlFor="file-upload" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs font-medium rounded-lg border border-slate-600/50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/50">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload File
      </label>
    </div>
  );
}

export default FileUpload;