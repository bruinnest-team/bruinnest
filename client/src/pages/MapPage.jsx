import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate } from "react-router-dom";
import { MAP_DEFAULTS } from "../lib/utils/map";
import { useMapMarkers } from "../features/housing/hooks/useMapMarkers";
import { useStartConversation } from "../features/messages/hooks/useStartConversation";
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

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All housing" },
  { value: "linkedOnly", label: "Linked by others" },
];

function getIcon(score) {
  if (score !== null && score !== undefined && score >= 80) {
    return HIGH_MATCH_ICON;
  }
  return DEFAULT_ICON;
}

function getLinkedUsers(marker) {
  return Array.isArray(marker.linkedUsers) ? marker.linkedUsers : [];
}

function getBestLinkedUser(marker) {
  const linkedUsers = getLinkedUsers(marker);

  return linkedUsers.reduce((bestUser, user) => {
    if (!bestUser) return user;

    const userScore = user.compatibilityScore;
    const bestScore = bestUser.compatibilityScore;
    const userHasScore = userScore !== null && userScore !== undefined;
    const bestHasScore = bestScore !== null && bestScore !== undefined;

    if (userHasScore && bestHasScore && userScore > bestScore) {
      return user;
    }

    if (userHasScore && !bestHasScore) {
      return user;
    }

    return bestUser;
  }, null);
}

function getBestCompatibilityScore(marker) {
  return getBestLinkedUser(marker)?.compatibilityScore;
}

function getLinkedSummary(marker) {
  const linkedUserCount = marker.linkedUserCount ?? getLinkedUsers(marker).length;

  if (linkedUserCount === 0) {
    return "No BruinNest users have linked this housing yet.";
  }

  return `Linked by ${linkedUserCount} other user${linkedUserCount !== 1 ? "s" : ""}.`;
}

function getLinkedUserMeta(user) {
  const parts = [];

  if (user.compatibilityScore !== null && user.compatibilityScore !== undefined) {
    parts.push(`${user.compatibilityScore}% match`);
  } else {
    parts.push("No match score");
  }

  if (user.budgetMin !== null && user.budgetMin !== undefined &&
      user.budgetMax !== null && user.budgetMax !== undefined) {
    parts.push(`Budget $${user.budgetMin}-${user.budgetMax}/mo`);
  }

  return parts.join(" | ");
}

function LinkedUserList({
  linkedUsers,
  onMessage,
  messagingUserId,
  isMessaging,
  variant = "card",
}) {
  if (linkedUsers.length === 0) {
    return null;
  }

  return (
    <div className={`map-linked-users map-linked-users-${variant}`}>
      {linkedUsers.map((user) => {
        const isThisUserMessaging = isMessaging && messagingUserId === user.userId;

        return (
          <div className="map-linked-user" key={user.userId}>
            <div className="map-linked-user-copy">
              <span className="map-linked-user-name">
                {user.displayName}
              </span>
              <span className="map-linked-user-meta">
                {getLinkedUserMeta(user)}
              </span>
            </div>
            <div className="map-linked-user-actions">
              <Link
                to={"/profiles/" + user.userId}
                className="btn-secondary map-linked-user-btn"
              >
                Profile
              </Link>
              <button
                type="button"
                className="btn-primary map-linked-user-btn"
                onClick={() => onMessage(user.userId)}
                disabled={isMessaging}
              >
                {isThisUserMessaging ? "Opening..." : "Message"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
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
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState("all");
  const [minScore, setMinScore] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [messagingUserId, setMessagingUserId] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({
    visibility: "all",
    minScore: "",
    budgetMin: "",
    budgetMax: "",
    bedrooms: "",
  });

  const { data: markers = [], isLoading, error } = useMapMarkers(appliedFilters);
  const startConversation = useStartConversation();

  function handleMessageUser(userId) {
    setMessagingUserId(userId);
    startConversation.mutate(Number(userId), {
      onSuccess: (res) => {
        navigate("/messages", {
          state: { conversationId: res.data.conversationId },
        });
      },
      onSettled: () => setMessagingUserId(null),
    });
  }

  function handleFilter(e) {
    e.preventDefault();
    setAppliedFilters({
      visibility,
      minScore: visibility === "linkedOnly" ? minScore : "",
      budgetMin,
      budgetMax,
      bedrooms,
    });
  }

  function handleVisibilityChange(nextVisibility) {
    setVisibility(nextVisibility);

    const nextMinScore = nextVisibility === "linkedOnly" ? minScore : "";

    if (nextVisibility === "all") {
      setMinScore("");
    }

    setAppliedFilters({
      visibility: nextVisibility,
      minScore: nextMinScore,
      budgetMin,
      budgetMax,
      bedrooms,
    });
  }

  function handleClear() {
    setMinScore("");
    setBudgetMin("");
    setBudgetMax("");
    setBedrooms("");
    setAppliedFilters({
      visibility,
      minScore: "",
      budgetMin: "",
      budgetMax: "",
      bedrooms: "",
    });
  }

  const emptyMessage =
    appliedFilters.visibility === "linkedOnly"
      ? "No housing linked by other users matches these filters."
      : "No housing locations match these filters.";
  const isMatchFilterDisabled = visibility === "all";
  const messageError = startConversation.error?.message || "";

  return (
    <>
      <Navbar />
      <div className="map-discovery-layout">
        <aside className="map-sidebar">
          <div className="map-sidebar-header">
            <p className="page-eyebrow">DISCOVER</p>
            <h2>Map Discovery</h2>
            <p className="map-sidebar-subtitle">
              Explore housing locations near UCLA and see where other users have linked homes.
            </p>
            <div
              className="map-visibility-toggle"
              role="group"
              aria-label="Housing visibility"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    "map-visibility-option" +
                    (visibility === option.value ? " map-visibility-option-active" : "")
                  }
                  aria-pressed={visibility === option.value}
                  onClick={() => handleVisibilityChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
                  disabled={isMatchFilterDisabled}
                  onChange={(e) => setMinScore(e.target.value)}
                  placeholder={isMatchFilterDisabled ? "Linked only" : "e.g. 70"}
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

            {messageError && (
              <div className="map-status map-status-error">
                <p>{messageError}</p>
              </div>
            )}

            {!isLoading && !error && markers.length === 0 && (
              <div className="map-status">
                <p>{emptyMessage}</p>
                <p className="map-status-hint">Try adjusting your filters or check back later.</p>
              </div>
            )}

            {!isLoading && markers.length > 0 && (
              <p className="map-result-count">
                {markers.length} result{markers.length !== 1 ? "s" : ""}
              </p>
            )}

            {markers.map((marker) => {
              const linkedUsers = getLinkedUsers(marker);
              const markerKey =
                marker.markerId ?? `housing:${marker.housing.housingUnitId}`;

              return (
                <div key={markerKey} className="map-listing-card">
                  <div className="map-listing-card-header">
                    <div className="map-listing-avatar">
                      {marker.housing.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="map-listing-name">{marker.housing.name}</h3>
                      <span className="map-listing-linked">
                        {getLinkedSummary(marker)}
                      </span>
                    </div>
                  </div>
                  <div className="map-listing-housing">
                    <p className="map-listing-housing-detail">
                      {marker.housing.addressLine}
                      {marker.housing.city ? `, ${marker.housing.city}` : ""}
                    </p>
                    <p className="map-listing-housing-detail">
                      ${marker.housing.monthlyRent}/mo &middot;{" "}
                      {marker.housing.bedrooms} bed &middot;{" "}
                      {marker.housing.bathrooms} bath
                    </p>
                  </div>
                  {linkedUsers.length > 0 ? (
                    <LinkedUserList
                      linkedUsers={linkedUsers}
                      onMessage={handleMessageUser}
                      messagingUserId={messagingUserId}
                      isMessaging={startConversation.isPending}
                    />
                  ) : (
                    <p className="map-listing-unlinked">
                      No BruinNest users have linked this housing yet.
                    </p>
                  )}
                  <div className="map-listing-actions">
                    {marker.housing.listingUrl && (
                      <a
                        href={marker.housing.listingUrl}
                        className="btn-secondary map-listing-btn"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Listing
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
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
              {markers.map((marker) => {
                const linkedUsers = getLinkedUsers(marker);
                const bestCompatibilityScore = getBestCompatibilityScore(marker);
                const markerKey =
                  marker.markerId ?? `housing:${marker.housing.housingUnitId}`;

                return (
                  <Marker
                    key={markerKey}
                    position={[marker.housing.lat, marker.housing.lng]}
                    icon={getIcon(bestCompatibilityScore)}
                  >
                    <Popup>
                      <div className="map-popup">
                        <p className="map-popup-housing-name">
                          <strong>{marker.housing.name}</strong>
                        </p>
                        <p className="map-popup-address">
                          {marker.housing.addressLine}
                          {marker.housing.city ? `, ${marker.housing.city}` : ""}
                        </p>
                        <p className="map-popup-rent">
                          ${marker.housing.monthlyRent}/mo &middot;{" "}
                          {marker.housing.bedrooms} bed &middot;{" "}
                          {marker.housing.bathrooms} bath
                        </p>
                        <hr className="map-popup-divider" />
                        {linkedUsers.length > 0 ? (
                          <>
                            <p className="map-popup-linked">
                              {getLinkedSummary(marker)}
                            </p>
                            <LinkedUserList
                              linkedUsers={linkedUsers}
                              onMessage={handleMessageUser}
                              messagingUserId={messagingUserId}
                              isMessaging={startConversation.isPending}
                              variant="popup"
                            />
                          </>
                        ) : (
                          <p className="map-popup-unlinked">
                            No BruinNest users have linked this housing yet.
                          </p>
                        )}
                        <div className="map-popup-actions">
                          {marker.housing.listingUrl && (
                            <a
                              href={marker.housing.listingUrl}
                              className="btn-secondary map-popup-btn"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Listing
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </section>
      </div>
    </>
  );
}

export default MapPage;
