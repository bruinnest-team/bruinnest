import { useQuery } from "@tanstack/react-query";
import { getMyQuestionnaire } from "../../../lib/api/questionnaire";
import { questionnaireKeys } from "../queries/queryKeys";

export function useMyQuestionnaire() {
  return useQuery({
    queryKey: questionnaireKeys.all,
    queryFn: () => getMyQuestionnaire().then((res) => res.data),
    placeholderData: (prev) => prev,
    retry: false,
  });
}
