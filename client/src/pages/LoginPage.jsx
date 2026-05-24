import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../lib/api/auth";
import { useAuth } from "../shared/context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        refreshUser(res.data.user, res.data.profileCompleted);
        if (res.data.profileCompleted) {
          navigate("/browse");
        } else {
          navigate("/profile/setup");
        }
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
        <h1 style={{ marginBottom: "1.5rem" }}>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontWeight: "500" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1rem" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontWeight: "500" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1rem" }}
            />
          </div>
          {error && <p style={{ color: "#e53e3e", margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "0.5rem", padding: "0.7rem", borderRadius: "6px", border: "none", background: "#1e3a5f", color: "white", fontSize: "1rem", cursor: "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ marginTop: "1.2rem", color: "#666" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
