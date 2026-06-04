import { apiRequest } from "./client";

export function getNotifications(params = {}) {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", params.page);
  }
  if (params.pageSize !== undefined) {
    query.set("pageSize", params.pageSize);
  }
  if (params.unreadOnly !== undefined) {
    query.set("unreadOnly", params.unreadOnly);
  }

  const queryString = query.toString();
  return apiRequest(`/notifications${queryString ? `?${queryString}` : ""}`);
}

export function markNotificationRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", {
    method: "POST",
  });
}
