const db = require("../config/db");

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findByUserIdStatement = db.prepare(`
  SELECT
    user_id,
    sleep_schedule,
    cleanliness_level,
    noise_tolerance,
    guest_policy,
    study_habits,
    smoking_preference,
    drinking_preference,
    sharing_preference,
    pet_comfort,
    communication_style,
    created_at,
    updated_at
  FROM questionnaires
  WHERE user_id = ?
`);

const upsertStatement = db.prepare(`
  INSERT INTO questionnaires (
    user_id,
    sleep_schedule,
    cleanliness_level,
    noise_tolerance,
    guest_policy,
    study_habits,
    smoking_preference,
    drinking_preference,
    sharing_preference,
    pet_comfort,
    communication_style,
    created_at,
    updated_at
  ) VALUES (
    @userId,
    @sleepSchedule,
    @cleanlinessLevel,
    @noiseTolerance,
    @guestPolicy,
    @studyHabits,
    @smokingPreference,
    @drinkingPreference,
    @sharingPreference,
    @petComfort,
    @communicationStyle,
    ${timestampExpression},
    ${timestampExpression}
  )
  ON CONFLICT(user_id) DO UPDATE SET
    sleep_schedule = excluded.sleep_schedule,
    cleanliness_level = excluded.cleanliness_level,
    noise_tolerance = excluded.noise_tolerance,
    guest_policy = excluded.guest_policy,
    study_habits = excluded.study_habits,
    smoking_preference = excluded.smoking_preference,
    drinking_preference = excluded.drinking_preference,
    sharing_preference = excluded.sharing_preference,
    pet_comfort = excluded.pet_comfort,
    communication_style = excluded.communication_style,
    updated_at = ${timestampExpression}
`);

const findAllUserIdsStatement = db.prepare(`
  SELECT user_id FROM questionnaires WHERE user_id != ?
`);

function mapQuestionnaireRow(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    sleepSchedule: row.sleep_schedule,
    cleanlinessLevel: row.cleanliness_level,
    noiseTolerance: row.noise_tolerance,
    guestPolicy: row.guest_policy,
    studyHabits: row.study_habits,
    smokingPreference: row.smoking_preference,
    drinkingPreference: row.drinking_preference,
    sharingPreference: row.sharing_preference,
    petComfort: row.pet_comfort,
    communicationStyle: row.communication_style,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function findByUserId(userId) {
  return mapQuestionnaireRow(findByUserIdStatement.get(userId));
}

function upsert(userId, answers) {
  upsertStatement.run({ userId, ...answers });
  return findByUserId(userId);
}

function findAllUserIds(excludeUserId) {
  return findAllUserIdsStatement.all(excludeUserId).map((r) => r.user_id);
}

module.exports = { findByUserId, upsert, findAllUserIds };
