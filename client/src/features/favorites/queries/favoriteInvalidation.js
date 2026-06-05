import { queryClient } from "../../../shared/query/queryClient";
import { favoritesKeys } from "./queryKeys";

export function invalidateFavoriteCaches(userId) {
  queryClient.invalidateQueries({ queryKey: favoritesKeys.all });
  queryClient.invalidateQueries({ queryKey: favoritesKeys.profiles.all });
  if (userId != null) {
    queryClient.invalidateQueries({
      queryKey: favoritesKeys.profile.detail(userId),
    });
  }
}

export function patchFavoriteState(userId, isFavorited) {
  const id = String(userId);

  queryClient.setQueryData(favoritesKeys.profile.detail(id), (old) =>
    old ? { ...old, isFavorited } : old
  );

  queryClient.setQueriesData(
    { queryKey: favoritesKeys.profiles.all },
    (old) =>
      old?.items
        ? {
            ...old,
            items: old.items.map((p) =>
              String(p.userId) === id ? { ...p, isFavorited } : p
            ),
          }
        : old
  );

  if (!isFavorited) {
    queryClient.setQueryData(favoritesKeys.list(), (old = []) =>
      old.filter((p) => String(p.userId) !== id)
    );
  }
}
