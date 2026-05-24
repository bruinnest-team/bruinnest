import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, verify } from "../lib/api/auth";
import { useAuth } from "../shared/context/AuthContext";

const inputStyle = { padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1rem" };
const fieldStyle = { display: "flex", flexDirection: "column", gap: "0.4rem" };

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register(email, password);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.error.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verify(email, password, code);
      if (res.success) {
        refreshUser(res.data.user, false);
        navigate("/profile/setup");
      } else {
        setError(res.error.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <p style={{ color: "#1e3a5f", fontWeight: "600", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Welcome</p>
        <h1 style={{ marginBottom: "1.5rem" }}>Register</h1>

        {step === 1 && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={fieldStyle}>
              <label style={{ fontWeight: "500" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={{ fontWeight: "500" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            {error && <p style={{ color: "#e53e3e", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ marginTop: "0.5rem", padding: "0.7rem", borderRadius: "6px", border: "none", background: "#1e3a5f", color: "white", fontSize: "1rem", cursor: "pointer" }}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <p style={{ color: "#666", margin: 0 }}>A verification code has been sent to {email}</p>
            <div style={fieldStyle}>
              <label style={{ fontWeight: "500" }}>Verification Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required style={inputStyle} />
            </div>
            {error && <p style={{ color: "#e53e3e", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ marginTop: "0.5rem", padding: "0.7rem", borderRadius: "6px", border: "none", background: "#1e3a5f", color: "white", fontSize: "1rem", cursor: "pointer" }}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "1.2rem", color: "#666" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
