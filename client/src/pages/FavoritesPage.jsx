import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listFavorites, removeFavorite } from "../lib/api/favorite";
import Navbar from "../shared/components/Navbar";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    setError("");
    try {
      const res = await listFavorites();
      setFavorites(res.data.items);
    } catch (err) {
      setError(err.message || "Could not load favorites. Please try again.");
    }
    setLoading(false);
  }

  async function handleRemove(e, userId) {
    e.stopPropagation();
    if (busy) return;
    setBusy(userId);
    try {
      await removeFavorite(userId);
      setFavorites((items) => items.filter((item) => item.userId !== userId));
    } catch (err) {
      alert(err.message || "Could not remove favorite.");
    }
    setBusy(null);
  }

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <p className="page-eyebrow">FAVORITES</p>
          <h1>My Favorites</h1>

          {loading && <p>Loading...</p>}
          {error && <p className="form-error">{error}</p>}
          {!loading && favorites.length === 0 && !error && (
            <p>You haven't favorited anyone yet. Browse profiles and tap the heart to save them here.</p>
          )}

          {favorites.map((profile) => (
            <div
              key={profile.userId}
              onClick={() => navigate("/profiles/" + profile.userId)}
              style={{ border: "1px solid #e2e8f0", padding: "1.2rem", marginTop: "1rem", borderRadius: "8px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ margin: "0 0 0.5rem" }}>{profile.displayName}</h3>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, profile.userId)}
                  disabled={busy === profile.userId}
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, padding: "0.35rem 0.9rem", borderRadius: "999px" }}
                  aria-label="Remove favorite"
                >
                  {"Remove"}
                </button>
              </div>
              <p style={{ margin: "0 0 0.3rem", color: "#666" }}>{profile.gender} | Class of {profile.graduationYear}</p>
              <p style={{ margin: 0, color: "#666" }}>Budget: ${profile.budgetMin}-${profile.budgetMax}/mo | Move-in: {profile.moveInDate}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export default FavoritesPage;
