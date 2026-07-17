type AnalyzeButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

function AnalyzeButton({ onClick, disabled }: AnalyzeButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      Analyze Threat
    </button>
  );
}

export default AnalyzeButton;