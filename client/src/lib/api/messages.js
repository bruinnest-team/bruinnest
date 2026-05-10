import { apiRequest } from "./client";

export function getUnreadSummary() {
  return apiRequest("/messages/unread-summary");
}
