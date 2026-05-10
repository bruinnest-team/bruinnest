import { apiRequest } from "./client";

export function getProfiles(params = "") {
  return apiRequest(`/profiles${params}`);
}
