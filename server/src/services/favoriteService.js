const favoriteRepository = require("../repositories/favoriteRepository");
const userRepository = require("../repositories/userRepository");
const notificationService = require("./notificationService");
const { getDisplayName } = require("./displayNameService");
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

  notificationService.createReferenceNotificationOnce({
    userId: otherUserId,
    type: "favorite_added",
    title: "Someone saved your profile",
    body: `${getDisplayName(userId)} added you to their favorites.`,
    referenceType: "profile",
    referenceId: userId,
  });

  return {
    favoriteId: favorite.id,
    targetUserId: otherUserId,
    isFavorited: true,
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
    targetUserId: otherUserId,
    isFavorited: false,
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
