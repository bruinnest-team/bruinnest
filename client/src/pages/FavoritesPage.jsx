import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "../lib/api/favorites";
import Navbar from "../shared/components/Navbar";

function FavoritesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFavorites().then((res) => res.data.items),
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => removeFavorite(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  function handleRemove(e, userId) {
    e.stopPropagation();
    removeMutation.mutate(userId);
  }

  const errMsg =
    error?.message || removeMutation.error?.message || "";

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <p className="page-eyebrow">FAVORITES</p>
          <h1>My Favorites</h1>

          {isLoading && <p>Loading...</p>}
          {errMsg && <p className="form-error">{errMsg}</p>}
          {!isLoading && favorites.length === 0 && !errMsg && (
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
                  disabled={removeMutation.isPending && removeMutation.variables === profile.userId}
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
