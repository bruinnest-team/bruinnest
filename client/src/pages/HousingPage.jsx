import { useEffect, useState } from "react";
import {
  getMyLinkedHousing,
  linkMyHousing,
  searchHousing,
  unlinkMyHousing,
} from "../lib/api/housing";
import Navbar from "../shared/components/Navbar";

const PAGE_SIZE = 10;

function getPhotoUrl(housing) {
  return housing.photoUrls && housing.photoUrls.length > 0
    ? housing.photoUrls[0]
    : null;
}

function HousingPage() {
  const [items, setItems] = useState([]);
  const [linkedHousing, setLinkedHousing] = useState(null);
  const [q, setQ] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadHousing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    loadLinkedHousing();
  }, []);

  async function loadHousing() {
    setLoading(true);
    setError("");
    try {
      const parts = [];
      if (q) parts.push("q=" + encodeURIComponent(q));
      if (neighborhood) parts.push("neighborhood=" + encodeURIComponent(neighborhood));
      if (budgetMin) parts.push("budgetMin=" + encodeURIComponent(budgetMin));
      if (budgetMax) parts.push("budgetMax=" + encodeURIComponent(budgetMax));
      if (bedrooms) parts.push("bedrooms=" + encodeURIComponent(bedrooms));
      parts.push("page=" + page);
      parts.push("pageSize=" + PAGE_SIZE);

      const res = await searchHousing("?" + parts.join("&"));
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.message || "Could not load housing listings.");
    }
    setLoading(false);
  }

  async function loadLinkedHousing() {
    try {
      const res = await getMyLinkedHousing();
      setLinkedHousing(res.data);
    } catch (err) {
      setLinkedHousing(null);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setNotice("");

    if (page === 1) {
      loadHousing();
    } else {
      setPage(1);
    }
  }

  async function handleLink(housingUnitId) {
    setLinkingId(housingUnitId);
    setError("");
    setNotice("");
    try {
      await linkMyHousing(housingUnitId);
      await loadLinkedHousing();
      setNotice("Housing link updated.");
    } catch (err) {
      setError(err.message || "Could not link this housing unit.");
    }
    setLinkingId(null);
  }

  async function handleUnlink() {
    setLinkingId("unlink");
    setError("");
    setNotice("");
    try {
      await unlinkMyHousing();
      setLinkedHousing(null);
      setNotice("Housing link removed.");
    } catch (err) {
      setError(err.message || "Could not remove housing link.");
    }
    setLinkingId(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card" style={{ width: "min(100%, 56rem)" }}>
          <p className="page-eyebrow">HOUSING</p>
          <h1>Link Housing</h1>
          <p style={{ color: "#666", marginTop: 0 }}>
            Search local Westwood listings and link one unit to your profile.
          </p>

          {linkedHousing && (
            <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "1rem", marginTop: "1.2rem", background: "#f8fafc" }}>
              <p className="page-eyebrow" style={{ marginBottom: "0.25rem" }}>CURRENT LINK</p>
              <strong>{linkedHousing.name}</strong>
              <p style={{ margin: "0.25rem 0", color: "#666" }}>
                {linkedHousing.addressLine} · ${linkedHousing.monthlyRent}/mo · {linkedHousing.bedrooms} bed
              </p>
              <button
                className="btn-secondary"
                type="button"
                onClick={handleUnlink}
                disabled={linkingId === "unlink"}
                style={{ marginTop: "0.7rem" }}
              >
                {linkingId === "unlink" ? "Removing..." : "Unlink"}
              </button>
            </div>
          )}

          <form onSubmit={handleSearch} style={{ marginTop: "1.5rem" }}>
            <div className="form-field">
              <label>Search</label>
              <input
                className="form-input"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Address, building, or zip..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
              <div className="form-field">
                <label>Neighborhood</label>
                <input
                  className="form-input"
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Westwood"
                />
              </div>

              <div className="form-field">
                <label>Min Rent</label>
                <input
                  className="form-input"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="1500"
                />
              </div>

              <div className="form-field">
                <label>Max Rent</label>
                <input
                  className="form-input"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="3500"
                />
              </div>

              <div className="form-field">
                <label>Bedrooms</label>
                <input
                  className="form-input"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>

            <button className="btn-primary" type="submit">Search Housing</button>
          </form>

          {error && <p className="form-error">{error}</p>}
          {notice && <p style={{ color: "#047857", fontSize: "0.9rem" }}>{notice}</p>}
          {loading && <p>Loading...</p>}
          {!loading && items.length === 0 && !error && <p>No housing listings found.</p>}

          <div style={{ display: "grid", gap: "1rem", marginTop: "1.2rem" }}>
            {items.map((housing) => {
              const photoUrl = getPhotoUrl(housing);
              const isLinked = linkedHousing?.housingUnitId === housing.housingUnitId;

              return (
                <div
                  key={housing.housingUnitId}
                  style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "white" }}
                >
                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt=""
                      style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.4rem" }}>{housing.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", color: "#666" }}>
                      {housing.addressLine}, {housing.city}
                    </p>
                    <p style={{ margin: "0 0 0.8rem", color: "#666" }}>
                      ${housing.monthlyRent}/mo · {housing.bedrooms} bed · {housing.bathrooms} bath
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      <button
                        className={isLinked ? "btn-secondary" : "btn-primary"}
                        type="button"
                        onClick={() => handleLink(housing.housingUnitId)}
                        disabled={isLinked || linkingId === housing.housingUnitId}
                        style={{ width: "auto", marginTop: 0 }}
                      >
                        {isLinked ? "Linked" : linkedHousing ? "Replace Link" : "Link to Profile"}
                      </button>
                      <a
                        className="btn-secondary"
                        href={housing.listingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        View Listing
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && !error && total > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem" }}>
              <button
                className="btn-primary"
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ width: "auto" }}
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
                style={{ width: "auto" }}
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

export default HousingPage;
