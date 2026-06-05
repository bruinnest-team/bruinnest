import { useMutation } from "@tanstack/react-query";
import { unlinkMyHousing } from "../../../lib/api/housing";
import { afterHousingLinkChange } from "../queries/housingInvalidation";

export function useUnlinkHousing() {
  return useMutation({
    mutationFn: () => unlinkMyHousing(),
    onSuccess: () => {
      afterHousingLinkChange();
    },
  });
}
