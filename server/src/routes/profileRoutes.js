const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const requireAuth = require("../middlewares/requireAuth");

router.post("/profile", requireAuth, profileController.createProfile);
router.get("/profile/me", requireAuth, profileController.getMyProfile);
router.put("/profile/me", requireAuth, profileController.updateProfile);
router.get("/profiles", requireAuth, profileController.listProfiles);
router.get("/profiles/:userId", requireAuth, profileController.getProfileDetail);

module.exports = router;
