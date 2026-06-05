export const profileKeys = {
  myProfile: ["myProfile"],
  details: ["profile"],
  detail: (userId) => ["profile", String(userId)],
  all: ["profiles"],
};
