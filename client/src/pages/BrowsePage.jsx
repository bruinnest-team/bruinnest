import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfiles } from "../lib/api/profile";
import Navbar from "../shared/components/Navbar";

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
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <p className="page-eyebrow">BROWSE</p>
          <h1>Browse Profiles</h1>

          <form onSubmit={handleSearch}>
            <div className="form-field">
              <label>Search</label>
              <input
                className="form-input"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Name or bio..."
              />
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">Search</button>
          </form>

          {loading && <p>Loading...</p>}
          {error && <p className="form-error">{error}</p>}
          {!loading && profiles.length === 0 && !error && <p>No profiles found.</p>}

          {profiles.map((profile) => (
            <div
              key={profile.userId}
              onClick={() => navigate("/profiles/" + profile.userId)}
              style={{ border: "1px solid #e2e8f0", padding: "1.2rem", marginTop: "1rem", borderRadius: "8px", cursor: "pointer" }}
            >
              <h3 style={{ margin: "0 0 0.5rem" }}>{profile.displayName}</h3>
              <p style={{ margin: "0 0 0.3rem", color: "#666" }}>{profile.gender} · Class of {profile.graduationYear}</p>
              <p style={{ margin: "0 0 0.3rem", color: "#666" }}>Budget: ${profile.budgetMin}–${profile.budgetMax}/mo · Move-in: {profile.moveInDate}</p>
              <p style={{ margin: 0 }}>{profile.bioPreview}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export default BrowsePage;
