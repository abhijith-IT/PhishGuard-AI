type InputBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

function InputBox({ value, onChange }: InputBoxProps) {
  return (
    <textarea
      placeholder="Paste suspicious email or URL here..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-h-[250px] p-5 bg-slate-900/50 text-slate-200 text-sm font-mono leading-relaxed border border-slate-700/50 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 placeholder:font-sans custom-scrollbar"
    />
  );
}

export default InputBox;