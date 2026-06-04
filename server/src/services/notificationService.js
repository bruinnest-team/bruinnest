const notificationRepository = require("../repositories/notificationRepository");
const NotFoundError = require("../errors/NotFoundError");
const { requirePositiveInteger } = require("../validations/commonValidation");
const {
  normalizeNotificationQuery,
  requireNotificationId,
  requireNotificationPayload,
} = require("../validations/notificationValidation");

function createNotification(payload) {
  const notificationPayload = requireNotificationPayload(payload);

  return notificationRepository.createNotification(notificationPayload);
}

function createReferenceNotificationOnce(payload) {
  const notificationPayload = requireNotificationPayload(payload);
  const existingNotification =
    notificationRepository.findExistingReferenceNotification(
      notificationPayload
    );

  if (existingNotification) {
    return existingNotification;
  }

  return notificationRepository.createNotification(notificationPayload);
}

function listNotifications(currentUserId, query) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const normalizedQuery = normalizeNotificationQuery(query);
  const items = notificationRepository.listNotifications({
    userId,
    ...normalizedQuery,
  });
  const total = notificationRepository.countNotifications({
    userId,
    unreadOnly: normalizedQuery.unreadOnly,
  });
  const unreadCount = notificationRepository.countUnreadNotifications(userId);

  return {
    unreadCount,
    items,
    page: normalizedQuery.page,
    pageSize: normalizedQuery.pageSize,
    total,
  };
}

function markNotificationRead(currentUserId, notificationId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const safeNotificationId = requireNotificationId(notificationId);
  const notification = notificationRepository.findByIdForUser(
    safeNotificationId,
    userId
  );

  if (!notification) {
    throw new NotFoundError("Notification not found.");
  }

  const updatedNotification = notificationRepository.markAsRead(
    safeNotificationId,
    userId
  );

  return {
    notificationId: updatedNotification.id,
    isRead: updatedNotification.isRead,
  };
}

function markAllNotificationsRead(currentUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const markedCount = notificationRepository.markAllAsRead(userId);

  return {
    markedCount,
  };
}

module.exports = {
  createNotification,
  createReferenceNotificationOnce,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
