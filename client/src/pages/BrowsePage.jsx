import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBrowseProfiles } from "../features/browse/hooks/useBrowseProfiles";
import { useFavoriteToggle } from "../features/favorites/hooks/useFavoriteToggle";
import Navbar from "../shared/components/Navbar";

const PAGE_SIZE = 10;

function BrowsePage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    gender: "",
    graduationYear: "",
    budgetMin: "",
    budgetMax: "",
    moveInDate: "",
    sortBy: "latest",
  });
  const [page, setPage] = useState(1);

  const {
    data: profileData,
    isLoading,
    error,
  } = useBrowseProfiles(searchFilters, page);

  const profiles = profileData?.items ?? [];
  const total = profileData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const favToggle = useFavoriteToggle();

  function toggleFavorite(e, profile) {
    e.stopPropagation();
    favToggle.mutate({ userId: profile.userId, isFavorited: profile.isFavorited });
  }

  function handleSearch(e) {
    e.preventDefault();
    const filters = { keyword, gender, graduationYear, budgetMin, budgetMax, moveInDate, sortBy };
    setSearchFilters(filters);
    setPage(1);
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

          {isLoading && <p>Loading...</p>}
          {error && <p className="form-error">{error.message || "Could not load profiles."}</p>}
          {!isLoading && profiles.length === 0 && !error && <p>No profiles found.</p>}

          {profiles.map((profile) => (
            <div
              key={profile.userId}
              onClick={() => navigate("/profiles/" + profile.userId)}
              style={{ border: "1px solid #e2e8f0", padding: "1.2rem", marginTop: "1rem", borderRadius: "8px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="avatar-thumb"
                  />
                ) : (
                  <div className="avatar-missing">{profile.displayName?.charAt(0).toUpperCase()}</div>
                )}
                <h3 style={{ margin: 0, flex: 1 }}>{profile.displayName}</h3>
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(e, profile)}
                  disabled={favToggle.isPending && favToggle.variables?.userId === profile.userId}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1, color: profile.isFavorited ? "#e0245e" : "#ccc" }}
                  aria-label="Toggle favorite"
                >
                  {profile.isFavorited ? "♥" : "♡"}
                </button>
              </div>
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

          {!isLoading && !error && total > 0 && (
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
