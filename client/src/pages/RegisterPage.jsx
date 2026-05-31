import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, verify } from "../lib/api/auth";
import { useAuth } from "../shared/context/AuthContext";

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
      setError(err.message);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="page-eyebrow">Welcome</p>
        <h1>Register</h1>

        {step === 1 && (
          <form onSubmit={handleRegister}>
            <div className="form-field">
              <label>Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>A verification code has been sent to {email}</p>
            <div className="form-field">
              <label>Verification Code</label>
              <input className="form-input" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
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
