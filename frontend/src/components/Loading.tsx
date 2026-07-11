import { ClipLoader } from "react-spinners";

function Loading() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "20px",
      }}
    >
      <ClipLoader size={40} color="#3b82f6" />

      <p>Analyzing message...</p>
    </div>
  );
}

export default Loading;