import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getHousingMapData } from "../lib/api/housing";
import { MAP_DEFAULTS, mapQueryFromState } from "../lib/utils/map";
import Navbar from "../shared/components/Navbar";

function makeMarkerIcon(color) {
  return L.divIcon({
    className: "map-marker",
    html: `<div style="
      width: 14px;
      height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

const HIGH_MATCH_ICON = makeMarkerIcon("#1e3a5f");
const DEFAULT_ICON = makeMarkerIcon("#64748b");

function getIcon(score) {
  if (score !== null && score !== undefined && score >= 80) {
    return HIGH_MATCH_ICON;
  }
  return DEFAULT_ICON;
}

function MapPage() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minScore, setMinScore] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const mapRef = useRef(null);

  const loadMarkers = useCallback(async (params) => {
    setLoading(true);
    setError("");
    try {
      const query = mapQueryFromState(params);
      const res = await getHousingMapData(query);
      setMarkers(res.data.items);
    } catch (err) {
      setError(err.message || "Could not load map data.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMarkers({ minScore, budgetMin, budgetMax, bedrooms });
  }, [loadMarkers, minScore, budgetMin, budgetMax, bedrooms]);

  function handleFilter(e) {
    e.preventDefault();
    loadMarkers({ minScore, budgetMin, budgetMax, bedrooms });
  }

  const bounds = markers.length > 0
    ? markers.map((m) => [m.housing.lat, m.housing.lng])
    : undefined;

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card" style={{ width: "min(100%, 56rem)" }}>
          <p className="page-eyebrow">MAP</p>
          <h1>Map Discovery</h1>
          <p style={{ color: "#666", marginTop: 0 }}>
            Explore compatible roommates with linked housing near UCLA.
          </p>

          <form onSubmit={handleFilter}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <div className="form-field">
                <label>Min Lifestyle %</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  placeholder="e.g. 70"
                />
              </div>
              <div className="form-field">
                <label>Budget Min</label>
                <input
                  className="form-input"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="e.g. 900"
                />
              </div>
              <div className="form-field">
                <label>Budget Max</label>
                <input
                  className="form-input"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="e.g. 2000"
                />
              </div>
              <div className="form-field">
                <label>Bedrooms</label>
                <input
                  className="form-input"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
            </div>
            <button className="btn-primary" type="submit" style={{ width: "auto" }}>
              Apply Filters
            </button>
          </form>

          {error && <p className="form-error">{error}</p>}

          <div className="map-container">
            {loading && <p>Loading map data...</p>}
            {!loading && markers.length === 0 && !error && (
              <p>No compatible linked housing found matching your criteria.</p>
            )}
            {!loading && markers.length > 0 && (
              <MapContainer
                ref={mapRef}
                center={MAP_DEFAULTS.center}
                zoom={MAP_DEFAULTS.zoom}
                className="map-leaflet"
                bounds={bounds}
                scrollWheelZoom
              >
                <TileLayer
                  attribution={MAP_DEFAULTS.attribution}
                  url={MAP_DEFAULTS.tileUrl}
                />
                {markers.map((marker) => (
                  <Marker
                    key={marker.userId}
                    position={[marker.housing.lat, marker.housing.lng]}
                    icon={getIcon(marker.compatibilityScore)}
                  >
                    <Popup>
                      <div className="map-popup">
                        <h3 className="map-popup-name">{marker.displayName}</h3>
                        {marker.compatibilityScore !== null && marker.compatibilityScore !== undefined && (
                          <p className="map-popup-score">
                            Lifestyle {marker.compatibilityScore}% matching
                          </p>
                        )}
                        <p className="map-popup-budget">
                          Budget: ${marker.budgetMin}–${marker.budgetMax}/mo
                        </p>
                        <hr className="map-popup-divider" />
                        <p className="map-popup-housing-name">
                          <strong>{marker.housing.name}</strong>
                        </p>
                        <p className="map-popup-address">
                          {marker.housing.addressLine}
                        </p>
                        <p className="map-popup-rent">
                          ${marker.housing.monthlyRent}/mo · {marker.housing.bedrooms} bed · {marker.housing.bathrooms} bath
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default MapPage;
