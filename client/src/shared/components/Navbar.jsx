import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnreadSummary } from "../../lib/api/messages";

function Navbar() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnread();
    const timer = setInterval(loadUnread, 5000);
    return () => clearInterval(timer);
  }, []);

  async function loadUnread() {
    try {
      const res = await getUnreadSummary();
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      setUnreadCount(0);
    }
  }

  async function handleLogout() {
    await clearAuth();
    navigate("/login");
  }

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "56px",
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      zIndex: 100,
    }}>
      <Link to="/browse" style={{ fontWeight: "700", fontSize: "1.1rem", color: "#1e3a5f", textDecoration: "none" }}>
        BruinNest
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link
          to="/housing"
          style={{ color: "#1e3a5f", textDecoration: "none", fontSize: "0.95rem" }}
        >
          Housing
        </Link>

        <Link
          to="/questionnaire"
          style={{ color: "#1e3a5f", textDecoration: "none", fontSize: "0.95rem" }}
        >
          Questionnaire
        </Link>

        <Link
          to="/favorites"
          style={{ color: "#1e3a5f", textDecoration: "none", fontSize: "0.95rem" }}
        >
          Favorites
        </Link>

        <Link
          to="/messages"
          style={{ color: "#1e3a5f", textDecoration: "none", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          Messages
          {unreadCount > 0 && (
            <span style={{ background: "#ef4444", color: "white", borderRadius: "999px", padding: "0 0.5rem", fontSize: "0.75rem" }}>
              {unreadCount}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid #1e3a5f",
            color: "#1e3a5f",
            padding: "0.4rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
