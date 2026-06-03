export const MAP_DEFAULTS = {
  center: [34.0689, -118.4452],
  zoom: 14,
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const MARKER_COLORS = {
  highMatch: "#1e3a5f",
  default: "#64748b",
};

export function mapQueryFromState({ minScore, budgetMin, budgetMax, bedrooms }) {
  const parts = [];
  if (minScore) parts.push("minCompatibilityScore=" + encodeURIComponent(minScore));
  if (budgetMin) parts.push("budgetMin=" + encodeURIComponent(budgetMin));
  if (budgetMax) parts.push("budgetMax=" + encodeURIComponent(budgetMax));
  if (bedrooms) parts.push("bedrooms=" + encodeURIComponent(bedrooms));
  return parts.length > 0 ? "?" + parts.join("&") : "";
}
