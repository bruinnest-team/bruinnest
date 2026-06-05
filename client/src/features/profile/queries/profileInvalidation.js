import { queryClient } from "../../../shared/query/queryClient";
import { profileKeys } from "./queryKeys";

export function afterProfileSave() {
  queryClient.invalidateQueries({ queryKey: profileKeys.myProfile });
  queryClient.invalidateQueries({ queryKey: profileKeys.all });
}
