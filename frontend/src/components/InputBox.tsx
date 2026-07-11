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
    />
  );
}

export default InputBox;