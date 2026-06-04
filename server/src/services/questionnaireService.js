const questionnaireRepository = require("../repositories/questionnaireRepository");
const compatibilityScoreRepository = require("../repositories/compatibilityScoreRepository");
const profileRepository = require("../repositories/profileRepository");
const userRepository = require("../repositories/userRepository");
const notificationService = require("./notificationService");
const { calculateScore } = require("../utils/compatibility");
const NotFoundError = require("../errors/NotFoundError");
const { requirePositiveInteger } = require("../validations/commonValidation");
const { requireQuestionnairePayload } = require("../validations/questionnaireValidation");

const HIGH_MATCH_THRESHOLD = 80;

function getDisplayName(userId) {
  const profile = profileRepository.findByUserId(userId);
  const user = userRepository.findById(userId);

  return profile?.displayName ?? user?.email ?? "Someone";
}

function createHighMatchNotifications(userId, otherUserId, score) {
  if (score < HIGH_MATCH_THRESHOLD) {
    return;
  }

  const userName = getDisplayName(userId);
  const otherName = getDisplayName(otherUserId);

  notificationService.createReferenceNotificationOnce({
    userId: otherUserId,
    type: "high_match",
    title: "New high-match roommate",
    body: `${userName} is a ${score}% compatibility match.`,
    referenceType: "profile",
    referenceId: userId,
  });

  notificationService.createReferenceNotificationOnce({
    userId,
    type: "high_match",
    title: "New high-match roommate",
    body: `${otherName} is a ${score}% compatibility match.`,
    referenceType: "profile",
    referenceId: otherUserId,
  });
}

function toQuestionnaireResponse(q) {
  return {
    sleepSchedule: q.sleepSchedule,
    cleanlinessLevel: q.cleanlinessLevel,
    noiseTolerance: q.noiseTolerance,
    guestPolicy: q.guestPolicy,
    studyHabits: q.studyHabits,
    smokingPreference: q.smokingPreference,
    drinkingPreference: q.drinkingPreference,
    sharingPreference: q.sharingPreference,
    petComfort: q.petComfort,
    communicationStyle: q.communicationStyle,
  };
}

function getMyQuestionnaire(currentUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const questionnaire = questionnaireRepository.findByUserId(userId);

  if (!questionnaire) {
    throw new NotFoundError("Questionnaire not found.");
  }

  return toQuestionnaireResponse(questionnaire);
}

function upsertQuestionnaire(currentUserId, body) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const payload = requireQuestionnairePayload(body);
  const updated = questionnaireRepository.upsert(userId, payload);

  const otherUserIds = questionnaireRepository.findAllUserIds(userId);
  let recalculatedUsers = 0;

  for (const otherId of otherUserIds) {
    const otherQ = questionnaireRepository.findByUserId(otherId);
    if (!otherQ) continue;
    const score = calculateScore(updated, otherQ);
    compatibilityScoreRepository.upsertScore(userId, otherId, score);
    compatibilityScoreRepository.upsertScore(otherId, userId, score);
    createHighMatchNotifications(userId, otherId, score);
    recalculatedUsers++;
  }

  return {
    questionnaireCompleted: true,
    recalculatedUsers,
  };
}

function getCompatibility(currentUserId, targetUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const targetId = requirePositiveInteger(targetUserId, "targetUserId");

  const score = compatibilityScoreRepository.findByUserPair(userId, targetId);

  if (!score) {
    throw new NotFoundError(
      "Compatibility score not found. One or both users may not have completed the questionnaire."
    );
  }

  return {
    userId: targetId,
    compatibilityScore: score.scorePercent,
    calculatedAt: score.calculatedAt,
  };
}

module.exports = { getMyQuestionnaire, upsertQuestionnaire, getCompatibility };
