import { useQuery } from "@tanstack/react-query";
import { getMyLinkedHousing } from "../../../lib/api/housing";
import { housingKeys } from "../queries/queryKeys";

export function useLinkedHousing() {
  return useQuery({
    queryKey: housingKeys.linkedHousing,
    queryFn: () => getMyLinkedHousing().then((res) => res.data),
    retry: false,
  });
}
