import { useMutation } from "@tanstack/react-query";
import { linkMyHousing } from "../../../lib/api/housing";
import { afterHousingLinkChange } from "../queries/housingInvalidation";

export function useLinkHousing() {
  return useMutation({
    mutationFn: (housingUnitId) => linkMyHousing(housingUnitId),
    onSuccess: () => {
      afterHousingLinkChange();
    },
  });
}
