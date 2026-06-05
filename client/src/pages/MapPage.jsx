import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
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

function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map((m) => [m.housing.lat, m.housing.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, markers]);
  return null;
}

function MapPage() {
  const [minScore, setMinScore] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    minScore: "",
    budgetMin: "",
    budgetMax: "",
    bedrooms: "",
  });

  const { data: markers = [], isLoading, error } = useQuery({
    queryKey: ["mapMarkers", appliedFilters],
    queryFn: () => {
      const query = mapQueryFromState(appliedFilters);
      return getHousingMapData(query).then((res) => res.data.items);
    },
  });

  function handleFilter(e) {
    e.preventDefault();
    setAppliedFilters({ minScore, budgetMin, budgetMax, bedrooms });
  }

  function handleClear() {
    setMinScore("");
    setBudgetMin("");
    setBudgetMax("");
    setBedrooms("");
    setAppliedFilters({ minScore: "", budgetMin: "", budgetMax: "", bedrooms: "" });
  }

  return (
    <>
      <Navbar />
      <div className="map-discovery-layout">
        <aside className="map-sidebar">
          <div className="map-sidebar-header">
            <p className="page-eyebrow">DISCOVER</p>
            <h2>Map Discovery</h2>
            <p className="map-sidebar-subtitle">
              Find compatible roommates with linked housing near UCLA.
            </p>
          </div>

          <form onSubmit={handleFilter} className="map-filters">
            <div className="map-filter-grid">
              <label className="map-filter-field">
                <span>Min Match %</span>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  placeholder="e.g. 70"
                />
              </label>
              <label className="map-filter-field">
                <span>Budget Min</span>
                <input
                  className="form-input"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="e.g. 900"
                />
              </label>
              <label className="map-filter-field">
                <span>Budget Max</span>
                <input
                  className="form-input"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="e.g. 2000"
                />
              </label>
              <label className="map-filter-field">
                <span>Bedrooms</span>
                <input
                  className="form-input"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="e.g. 1"
                />
              </label>
            </div>
            <div className="map-filter-actions">
              <button className="btn-primary" type="submit">Apply</button>
              <button className="btn-secondary" type="button" onClick={handleClear}>Clear</button>
            </div>
          </form>

          <div className="map-listing-list">
            {isLoading && (
              <div className="map-status">
                <div className="map-spinner" />
                <p>Loading map data...</p>
              </div>
            )}

            {error && (
              <div className="map-status map-status-error">
                <p>{error.message || "Could not load map data."}</p>
              </div>
            )}

            {!isLoading && !error && markers.length === 0 && (
              <div className="map-status">
                <p>No compatible linked housing found.</p>
                <p className="map-status-hint">Try adjusting your filters or check back later.</p>
              </div>
            )}

            {!isLoading && markers.length > 0 && (
              <p className="map-result-count">
                {markers.length} result{markers.length !== 1 ? "s" : ""}
              </p>
            )}

            {markers.map((marker) => (
              <div key={marker.userId} className="map-listing-card">
                <div className="map-listing-card-header">
                  <div className="map-listing-avatar">
                    {marker.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="map-listing-name">{marker.displayName}</h3>
                    {marker.compatibilityScore !== null &&
                      marker.compatibilityScore !== undefined && (
                        <span
                          className={
                            "map-listing-score" +
                            (marker.compatibilityScore >= 80
                              ? " map-listing-score-high"
                              : "")
                          }
                        >
                          {marker.compatibilityScore}% match
                        </span>
                      )}
                  </div>
                </div>
                <div className="map-listing-housing">
                  <p className="map-listing-housing-name">
                    {marker.housing.name}
                  </p>
                  <p className="map-listing-housing-detail">
                    {marker.housing.addressLine}
                  </p>
                  <p className="map-listing-housing-detail">
                    ${marker.housing.monthlyRent}/mo &middot;{" "}
                    {marker.housing.bedrooms} bed &middot;{" "}
                    {marker.housing.bathrooms} bath
                  </p>
                </div>
                <div className="map-listing-actions">
                  <Link
                    to={"/profiles/" + marker.userId}
                    className="btn-primary map-listing-btn"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/messages"
                    className="btn-secondary map-listing-btn"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="map-panel">
          <MapContainer
            center={MAP_DEFAULTS.center}
            zoom={MAP_DEFAULTS.zoom}
            className="map-leaflet"
            scrollWheelZoom
          >
            <TileLayer
              attribution={MAP_DEFAULTS.attribution}
              url={MAP_DEFAULTS.tileUrl}
            />
            {markers.length > 0 && <FitBounds markers={markers} />}
            <MarkerClusterGroup chunkedLoading>
              {markers.map((marker) => (
                <Marker
                  key={marker.userId}
                  position={[marker.housing.lat, marker.housing.lng]}
                  icon={getIcon(marker.compatibilityScore)}
                >
                  <Popup>
                    <div className="map-popup">
                      <h3 className="map-popup-name">
                        {marker.displayName}
                      </h3>
                      {marker.compatibilityScore !== null &&
                        marker.compatibilityScore !== undefined && (
                          <p className="map-popup-score">
                            {marker.compatibilityScore}% lifestyle match
                          </p>
                        )}
                      <p className="map-popup-budget">
                        Budget: ${marker.budgetMin}&ndash;$
                        {marker.budgetMax}/mo
                      </p>
                      <hr className="map-popup-divider" />
                      <p className="map-popup-housing-name">
                        <strong>{marker.housing.name}</strong>
                      </p>
                      <p className="map-popup-address">
                        {marker.housing.addressLine}
                      </p>
                      <p className="map-popup-rent">
                        ${marker.housing.monthlyRent}/mo &middot;{" "}
                        {marker.housing.bedrooms} bed &middot;{" "}
                        {marker.housing.bathrooms} bath
                      </p>
                      <div className="map-popup-actions">
                        <Link
                          to={"/profiles/" + marker.userId}
                          className="btn-primary map-popup-btn"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </section>
      </div>
    </>
  );
}

export default MapPage;
