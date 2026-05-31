import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
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
    </nav>
  );
}

export default Navbar;
