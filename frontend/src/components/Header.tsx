import { FaShieldAlt } from "react-icons/fa";

function Header() {
  return (
    <>
      <FaShieldAlt className="logo" />
      <h1>PhishGuard AI</h1>
      <p>AI Powered Phishing Email & URL Detection</p>
    </>
  );
}

export default Header;