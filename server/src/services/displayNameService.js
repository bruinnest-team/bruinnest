const profileRepository = require("../repositories/profileRepository");
const userRepository = require("../repositories/userRepository");

function getDisplayName(userId) {
  const profile = profileRepository.findByUserId(userId);
  const user = userRepository.findById(userId);

  return profile?.displayName ?? user?.email ?? "Someone";
}

module.exports = { getDisplayName };
