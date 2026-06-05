import { queryClient } from "../../../shared/query/queryClient";
import { questionnaireKeys } from "./queryKeys";

export function afterUpsertQuestionnaire() {
  queryClient.invalidateQueries({ queryKey: questionnaireKeys.all });
  queryClient.invalidateQueries({ queryKey: ["profiles"] });
}
