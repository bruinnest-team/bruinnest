import { apiRequest } from "./client";

export function getUnreadSummary() {
  return apiRequest("/messages/unread-summary");
}

export function createOrGetConversation(targetUserId) {
  return apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export function getConversations() {
  return apiRequest("/conversations");
}

export function getConversationMessages(conversationId, afterMessageId) {
  let path = `/conversations/${conversationId}/messages`;
  if (afterMessageId) {
    path += `?afterMessageId=${afterMessageId}`;
  }
  return apiRequest(path);
}

export function sendMessage(conversationId, body) {
  return apiRequest("/messages", {
    method: "POST",
    body: JSON.stringify({ conversationId, body }),
  });
}

export function markConversationRead(conversationId, lastReadMessageId) {
  return apiRequest(`/conversations/${conversationId}/read`, {
    method: "POST",
    body: JSON.stringify({ lastReadMessageId }),
  });
}
