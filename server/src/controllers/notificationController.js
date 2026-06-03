const notificationService = require("../services/notificationService");
const { success } = require("../utils/apiResponse");

function listNotifications(req, res, next) {
  try {
    const data = notificationService.listNotifications(
      req.session.userId,
      req.query
    );
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function markNotificationRead(req, res, next) {
  try {
    const data = notificationService.markNotificationRead(
      req.session.userId,
      req.params.notificationId
    );
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function markAllNotificationsRead(req, res, next) {
  try {
    const data = notificationService.markAllNotificationsRead(
      req.session.userId
    );
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
