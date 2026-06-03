const favoriteService = require("../services/favoriteService");
const { success } = require("../utils/apiResponse");

function addFavorite(req, res, next) {
  try {
    const data = favoriteService.addFavorite(req.session.userId, Number(req.params.targetUserId));
    return success(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

function removeFavorite(req, res, next) {
  try {
    const data = favoriteService.removeFavorite(req.session.userId, Number(req.params.targetUserId));
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function listFavorites(req, res, next) {
  try {
    const data = favoriteService.listFavorites(req.session.userId);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
};
