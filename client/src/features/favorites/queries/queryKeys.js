export const favoritesKeys = {
  all: ["favorites"],
  list: () => ["favorites", "list"],
  profiles: {
    all: ["profiles"],
    browse: (filters, page) => ["profiles", filters, page],
  },
  profile: {
    all: ["profile"],
    detail: (userId) => ["profile", String(userId)],
  },
};
