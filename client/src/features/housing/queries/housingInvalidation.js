import { queryClient } from "../../../shared/query/queryClient";
import { housingKeys } from "./queryKeys";

export function clearLinkedHousing() {
  queryClient.setQueryData(housingKeys.linkedHousing, null);
}

export function afterHousingLinkChange() {
  queryClient.invalidateQueries({ queryKey: housingKeys.linkedHousing });
  queryClient.invalidateQueries({ queryKey: housingKeys.all });
}
