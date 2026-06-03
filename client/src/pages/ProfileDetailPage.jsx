import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileById } from "../lib/api/profile";
import { createOrGetConversation } from "../lib/api/messages";
import { addFavorite, removeFavorite, listFavorites } from "../lib/api/favorite";
import Navbar from "../shared/components/Navbar";

function ProfileDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messaging, setMessaging] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    loadProfile();
    loadFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const res = await getProfileById(userId);
      setProfile(res.data);
    } catch (err) {
      setError(err.message || "Could not load this profile. It may not exist.");
    }
    setLoading(false);
  }

  async function loadFavorite() {
    try {
      const res = await listFavorites();
      const ids = res.data.items.map((item) => item.userId);
      setIsFavorite(ids.includes(Number(userId)));
    } catch (err) {
      setIsFavorite(false);
    }
  }

  async function handleSendMessage() {
    setMessaging(true);
    setError("");
    try {
      const res = await createOrGetConversation(Number(userId));
      // Navigate to the messages page; pass the conversation id so it can open directly.
      navigate("/messages", { state: { conversationId: res.data.conversationId } });
    } catch (err) {
      setError(err.message || "Could not start a conversation. Please try again.");
      setMessaging(false);
    }
  }

  async function handleToggleFavorite() {
    if (favBusy) return;
    setFavBusy(true);
    try {
      if (isFavorite) {
        await removeFavorite(Number(userId));
        setIsFavorite(false);
      } else {
        await addFavorite(Number(userId));
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.message || "Could not update favorite.");
    }
    setFavBusy(false);
  }

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <button
            className="btn-secondary"
            type="button"
            onClick={() => navigate("/browse")}
            style={{ marginBottom: "1rem" }}
          >
            ← Back to Browse
          </button>

          {loading && <p>Loading...</p>}
          {error && <p className="form-error">{error}</p>}

          {!loading && profile && (
            <>
              <p className="page-eyebrow">PROFILE</p>
              <h1>{profile.displayName}</h1>

              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #e2e8f0",
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                />
              )}

              <p style={{ color: "#666", marginTop: "0.3rem" }}>
                {profile.gender} · Class of {profile.graduationYear}
              </p>
              <p style={{ color: "#666", marginTop: "0.3rem" }}>
                Budget: ${profile.budgetMin}–${profile.budgetMax}/mo
              </p>
              <p style={{ color: "#666", marginTop: "0.3rem" }}>
                Move-in: {profile.moveInDate}
              </p>
              {profile.compatibilityScore !== null && profile.compatibilityScore !== undefined && (
                <p style={{ color: "#1e3a5f", fontWeight: "600", marginTop: "0.3rem" }}>
                  Life style {profile.compatibilityScore}% matching with you
                </p>
              )}

              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>About</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{profile.bio}</p>
              </div>

              {profile.linkedHousing && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "1.5rem", background: "#f8fafc", overflow: "hidden" }}>
                  {profile.linkedHousing.photoUrls?.[0] && (
                    <img
                      src={profile.linkedHousing.photoUrls[0]}
                      alt=""
                      style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: "1rem" }}>
                    <p className="page-eyebrow" style={{ marginBottom: "0.25rem" }}>LINKED HOUSING</p>
                    <h3 style={{ margin: "0 0 0.4rem" }}>{profile.linkedHousing.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", color: "#666" }}>
                      {profile.linkedHousing.addressLine}, {profile.linkedHousing.city}
                    </p>
                    <p style={{ margin: "0 0 0.8rem", color: "#666" }}>
                      ${profile.linkedHousing.monthlyRent}/mo · {profile.linkedHousing.bedrooms} bed · {profile.linkedHousing.bathrooms} bath
                    </p>
                    <a
                      className="btn-secondary"
                      href={profile.linkedHousing.listingUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none", display: "inline-block" }}
                    >
                      View Listing
                    </a>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.5rem" }}>
                {profile.canMessage && (
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={handleSendMessage}
                    disabled={messaging}
                  >
                    {messaging ? "Starting..." : "Send Message"}
                  </button>
                )}
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={favBusy}
                >
                  {isFavorite ? "♥ Favorited" : "♡ Add to Favorites"}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default ProfileDetailPage;
