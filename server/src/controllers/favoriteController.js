const favoriteService = require("../services/favoriteService");

function addFavorite(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;
    const result = favoriteService.addFavorite(currentUserId, targetUserId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

function removeFavorite(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const targetUserId = Number(req.params.targetUserId);
    const result = favoriteService.removeFavorite(currentUserId, targetUserId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

function listFavorites(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const result = favoriteService.listFavorites(currentUserId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
};
