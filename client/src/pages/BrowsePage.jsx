import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfiles } from "../lib/api/profile";

function BrowsePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    setError("");
    try {
      let query = "";
      if (keyword || gender) {
        const parts = [];
        if (keyword) parts.push("keyword=" + keyword);
        if (gender) parts.push("gender=" + gender);
        query = "?" + parts.join("&");
      }
      const res = await getProfiles(query);
      setProfiles(res.data.items);
    } catch (err) {
      setError("Could not load profiles. Please try again.");
    }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    loadProfiles();
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="page-eyebrow">BROWSE</p>
        <h1>Browse Profiles</h1>

        <form onSubmit={handleSearch}>
          <div>
            <label>Search</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Name or bio..."
            />
          </div>
          <div>
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit">Search</button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && profiles.length === 0 && !error && (
          <p>No profiles found.</p>
        )}

        {profiles.map((profile) => (
          <div
            key={profile.userId}
            onClick={() => navigate("/profiles/" + profile.userId)}
            style={{ border: "1px solid #ddd", padding: "1rem", marginTop: "1rem", borderRadius: "6px", cursor: "pointer" }}
          >
            <h3>{profile.displayName}</h3>
            <p>{profile.gender} · Class of {profile.graduationYear}</p>
            <p>Budget: ${profile.budgetMin}–${profile.budgetMax}/mo · Move-in: {profile.moveInDate}</p>
            <p>{profile.bioPreview}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

export default BrowsePage;
