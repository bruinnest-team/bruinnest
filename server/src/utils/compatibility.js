const SLEEP_SCHEDULES = ["early_bird", "flexible", "night_owl"];
const CLEANLINESS_LEVELS = ["very_clean", "clean", "moderate", "relaxed"];
const NOISE_TOLERANCES = ["low", "medium", "high"];
const GUEST_POLICIES = ["no_guests", "occasionally_ok", "often_ok"];
const STUDY_HABITS = ["quiet_at_home", "flexible", "library_preferred"];
const SMOKING_PREFERENCES = ["non_smoker_only", "outside_ok", "okay"];
const DRINKING_PREFERENCES = ["abstain", "social_only", "okay"];
const SHARING_PREFERENCES = ["keep_separate", "flexible", "shared_supplies_ok"];
const PET_COMFORTS = ["no_pets", "okay_with_cats", "okay_with_dogs", "okay_all"];
const COMMUNICATION_STYLES = ["minimal", "casual", "direct_and_frequent"];

function scoreField(ordinalArray, valA, valB) {
  const idxA = ordinalArray.indexOf(valA);
  const idxB = ordinalArray.indexOf(valB);
  if (idxA === -1 || idxB === -1) return 0;
  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return 10;
  if (diff === 1) return 5;
  return 0;
}

function calculateScore(a, b) {
  let total = 0;
  total += scoreField(SLEEP_SCHEDULES, a.sleepSchedule, b.sleepSchedule);
  total += scoreField(CLEANLINESS_LEVELS, a.cleanlinessLevel, b.cleanlinessLevel);
  total += scoreField(NOISE_TOLERANCES, a.noiseTolerance, b.noiseTolerance);
  total += scoreField(GUEST_POLICIES, a.guestPolicy, b.guestPolicy);
  total += scoreField(STUDY_HABITS, a.studyHabits, b.studyHabits);
  total += scoreField(SMOKING_PREFERENCES, a.smokingPreference, b.smokingPreference);
  total += scoreField(DRINKING_PREFERENCES, a.drinkingPreference, b.drinkingPreference);
  total += scoreField(SHARING_PREFERENCES, a.sharingPreference, b.sharingPreference);
  total += scoreField(PET_COMFORTS, a.petComfort, b.petComfort);
  total += scoreField(COMMUNICATION_STYLES, a.communicationStyle, b.communicationStyle);
  return total;
}

module.exports = { calculateScore };
