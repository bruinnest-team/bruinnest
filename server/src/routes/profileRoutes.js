const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const requireAuth = require("../middlewares/requireAuth");

router.post("/profile", requireAuth, profileController.createProfile);

module.exports = router;
