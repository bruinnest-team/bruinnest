import { apiRequest } from "./client";

export function getMyQuestionnaire() {
  return apiRequest("/questionnaire/me");
}

export function upsertMyQuestionnaire(data) {
  return apiRequest("/questionnaire/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getCompatibility(userId) {
  return apiRequest(`/compatibility/${userId}`);
}
