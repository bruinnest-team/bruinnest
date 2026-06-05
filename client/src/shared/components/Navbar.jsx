import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getUnreadSummary } from "../../lib/api/messages";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadSummary"],
    queryFn: () => getUnreadSummary().then((res) => res.data.unreadCount),
    refetchInterval: 5000,
  });

  async function handleLogout() {
    await clearAuth();
    navigate("/login");
  }

  return (
    <nav className="app-navbar">
      <Link to="/browse" className="app-navbar-brand">
        BruinNest
      </Link>

      <div className="app-navbar-links">
        <Link to="/housing" className="app-navbar-link">
          Housing
        </Link>

        <Link to="/questionnaire" className="app-navbar-link">
          Questionnaire
        </Link>

        <Link to="/favorites" className="app-navbar-link">
          Favorites
        </Link>

        <Link to="/map" className="app-navbar-link">
          Map
        </Link>

        <Link to="/messages" className="app-navbar-link app-navbar-message">
          Messages
          {unreadCount > 0 && (
            <span className="app-navbar-badge">
              {unreadCount}
            </span>
          )}
        </Link>

        <NotificationBell />

        <button
          onClick={handleLogout}
          className="app-navbar-logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
