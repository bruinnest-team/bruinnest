import { apiRequest } from "./client";

export function getUnreadSummary() {
  return apiRequest("/messages/unread-summary");
}

export function createConversation(targetUserId) {
  return apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}
