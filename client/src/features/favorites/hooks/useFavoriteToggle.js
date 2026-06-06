import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite } from "../../../lib/api/favorites";
import { patchFavoriteState, invalidateFavoriteCaches } from "../queries/favoriteInvalidation";

export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFavorited }) =>
      isFavorited ? removeFavorite(userId) : addFavorite(userId),

    onMutate: async ({ userId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const next = !isFavorited;
      patchFavoriteState(userId, next);
      return { userId, previous: isFavorited };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx) {
        patchFavoriteState(ctx.userId, ctx.previous);
      }
    },

    onSettled: (_data, _err, { userId }) => {
      invalidateFavoriteCaches(userId);
    },
  });
}
