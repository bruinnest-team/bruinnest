import { apiRequest } from "./client";

export function addFavorite(targetUserId) {
  return apiRequest(`/favorites/${targetUserId}`, {
    method: "POST",
  });
}

export function listFavorites() {
  return apiRequest("/favorites", {
    method: "GET",
  });
}

export function removeFavorite(targetUserId) {
  return apiRequest(`/favorites/${targetUserId}`, {
    method: "DELETE",
  });
}
