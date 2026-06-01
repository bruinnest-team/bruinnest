import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileById } from "../lib/api/profile";
import { createOrGetConversation } from "../lib/api/messages";
import Navbar from "../shared/components/Navbar";

function ProfileDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    loadProfile();
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
              <p style={{ color: "#666", marginTop: "0.3rem" }}>
                {profile.gender} · Class of {profile.graduationYear}
              </p>
              <p style={{ color: "#666", marginTop: "0.3rem" }}>
                Budget: ${profile.budgetMin}–${profile.budgetMax}/mo
              </p>
              <p style={{ color: "#666", marginTop: "0.3rem" }}>
                Move-in: {profile.moveInDate}
              </p>

              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>About</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{profile.bio}</p>
              </div>

              {profile.canMessage && (
                <button
                  className="btn-primary"
                  type="button"
                  onClick={handleSendMessage}
                  disabled={messaging}
                  style={{ marginTop: "1.5rem" }}
                >
                  {messaging ? "Starting..." : "Send Message"}
                </button>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default ProfileDetailPage;
