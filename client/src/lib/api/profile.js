import { apiRequest, apiUpload } from "./client";

export function getMyProfile() {
  return apiRequest("/profile/me");
}

export function createProfile(data) {
  return apiRequest("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMyProfile(data) {
  return apiRequest("/profile/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function uploadMyAvatar(formData) {
  return apiUpload("/profile/me/avatar", formData);
}

export function getProfiles(params = "") {
  return apiRequest(`/profiles${params}`);
}

export function getProfileById(userId) {
  return apiRequest(`/profiles/${userId}`);
}
