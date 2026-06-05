import { Link, useParams, useNavigate } from "react-router-dom";
import { useStartConversation } from "../features/messages/hooks/useStartConversation";
import { useProfileDetail } from "../features/profile/hooks/useProfileDetail";
import { useFavoriteToggle } from "../features/favorites/hooks/useFavoriteToggle";
import Navbar from "../shared/components/Navbar";
import { useAuth } from "../shared/context/AuthContext";

function ProfileDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useProfileDetail(userId);

  const messageMutation = useStartConversation();

  const favToggle = useFavoriteToggle();

  const errMsg =
    error?.message ||
    messageMutation.error?.message ||
    favToggle.error?.message ||
    "";
  const isOwnProfile = profile
    ? String(currentUser?.id) === String(profile.userId)
    : false;

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

          {isLoading && <p>Loading...</p>}
          {errMsg && <p className="form-error">{errMsg}</p>}

          {!isLoading && profile && (
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
              {profile.compatibilityScore !== null &&
                profile.compatibilityScore !== undefined && (
                  <p
                    style={{
                      color: "#1e3a5f",
                      fontWeight: "600",
                      marginTop: "0.3rem",
                    }}
                  >
                    Life style {profile.compatibilityScore}% matching with you
                  </p>
                )}

              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>About</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{profile.bio}</p>
              </div>

              {profile.linkedHousing && (
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    marginTop: "1.5rem",
                    background: "#f8fafc",
                    overflow: "hidden",
                  }}
                >
                  {profile.linkedHousing.photoUrls?.[0] && (
                    <img
                      src={profile.linkedHousing.photoUrls[0]}
                      alt=""
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}
                  <div style={{ padding: "1rem" }}>
                    <p
                      className="page-eyebrow"
                      style={{ marginBottom: "0.25rem" }}
                    >
                      LINKED HOUSING
                    </p>
                    <h3 style={{ margin: "0 0 0.4rem" }}>
                      {profile.linkedHousing.name}
                    </h3>
                    <p style={{ margin: "0 0 0.3rem", color: "#666" }}>
                      {profile.linkedHousing.addressLine},{" "}
                      {profile.linkedHousing.city}
                    </p>
                    <p style={{ margin: "0 0 0.8rem", color: "#666" }}>
                      ${profile.linkedHousing.monthlyRent}/mo ·{" "}
                      {profile.linkedHousing.bedrooms} bed ·{" "}
                      {profile.linkedHousing.bathrooms} bath
                    </p>
                    <a
                      className="btn-secondary"
                      href={profile.linkedHousing.listingUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      View Listing
                    </a>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "0.8rem",
                  marginTop: "1.5rem",
                }}
              >
                {isOwnProfile ? (
                  <Link
                    className="btn-primary"
                    to="/profile/edit"
                    style={{ textDecoration: "none" }}
                  >
                    Edit Profile
                  </Link>
                ) : (
                  profile.canMessage && (
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={() =>
                        messageMutation.mutate(Number(userId), {
                          onSuccess: (res) => {
                            navigate("/messages", {
                              state: { conversationId: res.data.conversationId },
                            });
                          },
                        })
                      }
                      disabled={messageMutation.isPending}
                    >
                      {messageMutation.isPending ? "Starting..." : "Send Message"}
                    </button>
                  )
                )}
                {!isOwnProfile && (
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => favToggle.mutate({ userId: Number(userId), isFavorited: profile.isFavorited })}
                    disabled={favToggle.isPending}
                  >
                    {profile.isFavorited ? "♥ Favorited" : "♡ Add to Favorites"}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default ProfileDetailPage;
