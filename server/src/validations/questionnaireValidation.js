const ValidationError = require("../errors/ValidationError");
const { isPlainObject, requireNonEmptyString } = require("./commonValidation");

const VALID_VALUES = {
  sleepSchedule: ["early_bird", "flexible", "night_owl"],
  cleanlinessLevel: ["very_clean", "clean", "moderate", "relaxed"],
  noiseTolerance: ["low", "medium", "high"],
  guestPolicy: ["no_guests", "occasionally_ok", "often_ok"],
  studyHabits: ["quiet_at_home", "flexible", "library_preferred"],
  smokingPreference: ["non_smoker_only", "outside_ok", "okay"],
  drinkingPreference: ["abstain", "social_only", "okay"],
  sharingPreference: ["keep_separate", "flexible", "shared_supplies_ok"],
  petComfort: ["no_pets", "okay_with_cats", "okay_with_dogs", "okay_all"],
  communicationStyle: ["minimal", "casual", "direct_and_frequent"],
};

function requireEnumField(value, fieldName, validValues) {
  const str = requireNonEmptyString(value, `${fieldName} is required.`);
  if (!validValues.includes(str)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${validValues.join(", ")}.`
    );
  }
  return str;
}

function requireQuestionnairePayload(body) {
  if (!isPlainObject(body)) {
    throw new ValidationError("Questionnaire payload must be an object.");
  }

  return {
    sleepSchedule: requireEnumField(body.sleepSchedule, "sleepSchedule", VALID_VALUES.sleepSchedule),
    cleanlinessLevel: requireEnumField(body.cleanlinessLevel, "cleanlinessLevel", VALID_VALUES.cleanlinessLevel),
    noiseTolerance: requireEnumField(body.noiseTolerance, "noiseTolerance", VALID_VALUES.noiseTolerance),
    guestPolicy: requireEnumField(body.guestPolicy, "guestPolicy", VALID_VALUES.guestPolicy),
    studyHabits: requireEnumField(body.studyHabits, "studyHabits", VALID_VALUES.studyHabits),
    smokingPreference: requireEnumField(body.smokingPreference, "smokingPreference", VALID_VALUES.smokingPreference),
    drinkingPreference: requireEnumField(body.drinkingPreference, "drinkingPreference", VALID_VALUES.drinkingPreference),
    sharingPreference: requireEnumField(body.sharingPreference, "sharingPreference", VALID_VALUES.sharingPreference),
    petComfort: requireEnumField(body.petComfort, "petComfort", VALID_VALUES.petComfort),
    communicationStyle: requireEnumField(body.communicationStyle, "communicationStyle", VALID_VALUES.communicationStyle),
  };
}

module.exports = { requireQuestionnairePayload, VALID_VALUES };
