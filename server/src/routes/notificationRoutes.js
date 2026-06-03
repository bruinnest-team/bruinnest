const express = require("express");
const notificationController = require("../controllers/notificationController");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.get(
  "/notifications",
  requireAuth,
  notificationController.listNotifications
);
router.post(
  "/notifications/read-all",
  requireAuth,
  notificationController.markAllNotificationsRead
);
router.post(
  "/notifications/:notificationId/read",
  requireAuth,
  notificationController.markNotificationRead
);

module.exports = router;
