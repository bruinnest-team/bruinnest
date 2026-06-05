import { queryClient } from "../../../shared/query/queryClient";
import { housingKeys } from "../../housing/queries/queryKeys";
import { profileKeys } from "./queryKeys";

export function afterProfileSave() {
  queryClient.invalidateQueries({ queryKey: profileKeys.myProfile });
  queryClient.invalidateQueries({ queryKey: profileKeys.all });
  queryClient.invalidateQueries({ queryKey: profileKeys.details });
  queryClient.invalidateQueries({ queryKey: housingKeys.all });
  queryClient.invalidateQueries({ queryKey: ["mapMarkers"] });
}
