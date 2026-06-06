import { useQuery } from "@tanstack/react-query";
import { getHousingMapData } from "../../../lib/api/housing";
import { mapQueryFromState } from "../../../lib/utils/map";
import { housingKeys } from "../queries/queryKeys";

export function useMapMarkers(filters = { visibility: "all" }) {
  return useQuery({
    queryKey: housingKeys.mapMarkers(filters),
    queryFn: () => {
      const query = mapQueryFromState(filters);
      return getHousingMapData(query).then((res) => res.data.items);
    },
  });
}
