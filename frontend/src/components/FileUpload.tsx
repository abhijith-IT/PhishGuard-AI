type FileUploadProps = {
  onFileRead: (content: string) => void;
};

function FileUpload({ onFileRead }: FileUploadProps) {
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileRead(text);
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="file"
        accept=".txt,.eml"
        onChange={handleFile}
      />
    </div>
  );
}

export default FileUpload;