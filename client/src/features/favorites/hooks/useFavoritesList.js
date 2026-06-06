import { useQuery } from "@tanstack/react-query";
import { listFavorites } from "../../../lib/api/favorites";
import { favoritesKeys } from "../queries/queryKeys";

export function useFavoritesList() {
  return useQuery({
    queryKey: favoritesKeys.list(),
    queryFn: () => listFavorites().then((res) => res.data.items),
  });
}
