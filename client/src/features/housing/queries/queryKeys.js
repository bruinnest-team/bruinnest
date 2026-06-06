export const housingKeys = {
  all: ["housing"],
  filtered: (filters, page) => ["housing", filters, page],
  linkedHousing: ["linkedHousing"],
  mapMarkers: (filters) => ["housing", "mapMarkers", filters],
};
