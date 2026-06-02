const questionnaireRepository = require("../repositories/questionnaireRepository");
const compatibilityScoreRepository = require("../repositories/compatibilityScoreRepository");
const { calculateScore } = require("../utils/compatibility");
const NotFoundError = require("../errors/NotFoundError");
const { requirePositiveInteger } = require("../validations/commonValidation");
const { requireQuestionnairePayload } = require("../validations/questionnaireValidation");

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
