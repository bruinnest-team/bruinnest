import { queryClient } from "../../../shared/query/queryClient";
import { housingKeys } from "./queryKeys";

export function afterHousingLinkChange() {
  queryClient.invalidateQueries({ queryKey: housingKeys.linkedHousing });
  queryClient.invalidateQueries({ queryKey: housingKeys.all });
}
