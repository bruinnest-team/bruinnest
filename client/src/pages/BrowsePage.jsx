import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfiles } from "../lib/api/profile";
import Navbar from "../shared/components/Navbar";

const PAGE_SIZE = 10;

function BrowsePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Reload whenever the page changes (search resets to page 1 below).
  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadProfiles() {
    setLoading(true);
    setError("");
    try {
      const parts = [];
      if (keyword) parts.push("keyword=" + encodeURIComponent(keyword));
      if (gender) parts.push("gender=" + encodeURIComponent(gender));
      if (graduationYear) parts.push("graduationYear=" + encodeURIComponent(graduationYear));
      if (budgetMin) parts.push("budgetMin=" + encodeURIComponent(budgetMin));
      if (budgetMax) parts.push("budgetMax=" + encodeURIComponent(budgetMax));
      if (moveInDate) parts.push("moveInDate=" + encodeURIComponent(moveInDate));
      if (sortBy) parts.push("sortBy=" + encodeURIComponent(sortBy));
      parts.push("page=" + page);
      parts.push("pageSize=" + PAGE_SIZE);
      const query = "?" + parts.join("&");

      const res = await getProfiles(query);
      setProfiles(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.message || "Could not load profiles. Please try again.");
    }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    // A new search should always start from page 1.
    // If already on page 1, reset state won't retrigger the effect, so load directly.
    if (page === 1) {
      loadProfiles();
    } else {
      setPage(1);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

            <div className="form-field">
              <label>Graduation Year</label>
              <input
                className="form-input"
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2027"
              />
            </div>

            <div className="form-field">
              <label>Budget Min ($/mo)</label>
              <input
                className="form-input"
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="e.g. 800"
              />
            </div>

            <div className="form-field">
              <label>Budget Max ($/mo)</label>
              <input
                className="form-input"
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g. 1500"
              />
            </div>

            <div className="form-field">
              <label>Move-in Date</label>
              <input
                className="form-input"
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Sort By</label>
              <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest Active</option>
                <option value="compatibility">Lifestyle</option>
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
              {profile.compatibilityScore !== null && profile.compatibilityScore !== undefined && (
                <p style={{ margin: "0 0 0.3rem", color: "#1e3a5f", fontWeight: "600" }}>
                  Lifestyle {profile.compatibilityScore}% matching with you
                </p>
              )}
              <p style={{ margin: 0 }}>{profile.bioPreview}</p>
            </div>
          ))}

          {!loading && !error && total > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem" }}>
              <button
                className="btn-primary"
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ color: "#666" }}>
                Page {page} of {totalPages} · {total} total
              </span>
              <button
                className="btn-primary"
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default BrowsePage;
