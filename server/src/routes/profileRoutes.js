const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const requireAuth = require("../middlewares/requireAuth");
const upload = require("../utils/upload");

router.post("/profile", requireAuth, profileController.createProfile);
router.get("/profile/me", requireAuth, profileController.getMyProfile);
router.put("/profile/me", requireAuth, profileController.updateProfile);
router.put(
  "/profile/me/avatar",
  requireAuth,
  upload.single("avatar"),
  profileController.uploadMyAvatar
);
router.get("/profiles", requireAuth, profileController.listProfiles);
router.get("/profiles/:userId", requireAuth, profileController.getProfileDetail);

module.exports = router;
