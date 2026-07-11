type AnalyzeButtonProps = {
  onClick: () => void;
};

function AnalyzeButton({ onClick }: AnalyzeButtonProps) {
  return (
    <button onClick={onClick}>
      Analyze Threat
    </button>
  );
}

export default AnalyzeButton;