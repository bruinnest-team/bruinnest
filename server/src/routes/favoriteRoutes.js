const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favoriteController");
const requireAuth = require("../middlewares/requireAuth");

router.post("/favorites/:targetUserId", requireAuth, favoriteController.addFavorite);
router.get("/favorites", requireAuth, favoriteController.listFavorites);
router.delete("/favorites/:targetUserId", requireAuth, favoriteController.removeFavorite);

module.exports = router;
