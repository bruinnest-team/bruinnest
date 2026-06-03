const profileRepository = require("../repositories/profileRepository");
const userRepository = require("../repositories/userRepository");
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");
const {
  normalizeProfileQuery,
  requirePositiveInteger,
  requireProfilePayload,
} = require("../validations/profileValidation");

function toEditableProfile(profile) {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    gender: profile.gender,
    graduationYear: profile.graduationYear,
    budgetMin: profile.budgetMin,
    budgetMax: profile.budgetMax,
    moveInDate: profile.moveInDate,
    bio: profile.bio,
    profileCompleted: profile.profileCompleted,
  };
}

function toProfileSummary(profile) {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    gender: profile.gender,
    graduationYear: profile.graduationYear,
    budgetMin: profile.budgetMin,
    budgetMax: profile.budgetMax,
    moveInDate: profile.moveInDate,
    bioPreview: profile.bio.slice(0, 120),
    compatibilityScore: profile.compatibilityScore,
  };
}

function toProfileDetail(profile, currentUserId) {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    gender: profile.gender,
    graduationYear: profile.graduationYear,
    budgetMin: profile.budgetMin,
    budgetMax: profile.budgetMax,
    moveInDate: profile.moveInDate,
    bio: profile.bio,
    compatibilityScore: profile.compatibilityScore,
    canMessage: currentUserId !== profile.userId,
  };
}

function createProfile(currentUserId, body) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const payload = requireProfilePayload(body);

  const user = userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const existingProfile = profileRepository.findByUserId(userId);

  if (existingProfile) {
    throw new ConflictError("Profile already exists.");
  }

  const createdProfile = profileRepository.createProfile({
    userId,
    ...payload,
  });

  return {
    userId: createdProfile.userId,
    profileCompleted: createdProfile.profileCompleted,
  };
}

function getMyProfile(currentUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const profile = profileRepository.findByUserId(userId);

  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  return toEditableProfile(profile);
}

function updateProfile(currentUserId, body) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const payload = requireProfilePayload(body);
  const existingProfile = profileRepository.findByUserId(userId);

  if (!existingProfile) {
    throw new NotFoundError("Profile not found.");
  }

  const updatedProfile = profileRepository.updateProfile(userId, payload);

  return {
    userId: updatedProfile.userId,
    profileCompleted: updatedProfile.profileCompleted,
  };
}

function listProfiles(currentUserId, query) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const normalizedQuery = normalizeProfileQuery(query);
  const result = profileRepository.searchProfiles({
    currentUserId: userId,
    ...normalizedQuery,
  });

  return {
    items: result.items.map(toProfileSummary),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };
}

function getProfileDetail(currentUserId, targetUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const targetId = requirePositiveInteger(targetUserId, "targetUserId");
  const profile = profileRepository.findPublicProfileByUserId(targetId, userId);

  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  return toProfileDetail(profile, userId);
}

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  listProfiles,
  getProfileDetail,
};
