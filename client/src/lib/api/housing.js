import { apiRequest } from "./client";

export function searchHousing(params = "") {
  return apiRequest(`/housing/search${params}`);
}

export function getMyLinkedHousing() {
  return apiRequest("/housing/me/link");
}

export function linkMyHousing(housingUnitId) {
  return apiRequest("/housing/me/link", {
    method: "PUT",
    body: JSON.stringify({ housingUnitId }),
  });
}

export function unlinkMyHousing() {
  return apiRequest("/housing/me/link", {
    method: "DELETE",
  });
}
