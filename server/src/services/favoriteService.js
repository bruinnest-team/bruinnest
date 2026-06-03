const favoriteRepository = require("../repositories/favoriteRepository");
const userRepository = require("../repositories/userRepository");
const NotFoundError = require("../errors/NotFoundError");
const ValidationError = require("../errors/ValidationError");
const ConflictError = require("../errors/ConflictError");
const { requirePositiveInteger } = require("../validations/commonValidation");

function addFavorite(currentUserId, targetUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const otherUserId = requirePositiveInteger(targetUserId, "targetUserId");

  if (userId === otherUserId) {
    throw new ValidationError("Cannot favorite yourself.");
  }

  const targetUser = userRepository.findById(otherUserId);

  if (!targetUser) {
    throw new NotFoundError("Target user not found.");
  }

  const favorite = favoriteRepository.createFavorite({
    userId,
    targetUserId: otherUserId,
  });

  if (!favorite) {
    throw new ConflictError("Profile is already in your favorites.");
  }

  return {
    favoriteId: favorite.id,
  };
}

function removeFavorite(currentUserId, targetUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const otherUserId = requirePositiveInteger(targetUserId, "targetUserId");

  const changes = favoriteRepository.deleteFavorite(userId, otherUserId);

  if (changes === 0) {
    throw new NotFoundError("Favorite not found.");
  }

  return {
    removed: true,
  };
}

function listFavorites(currentUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");

  return {
    items: favoriteRepository.listFavorites(userId),
  };
}

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
};
