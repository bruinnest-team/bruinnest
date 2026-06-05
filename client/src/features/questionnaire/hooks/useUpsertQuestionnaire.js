import { useMutation } from "@tanstack/react-query";
import { upsertMyQuestionnaire } from "../../../lib/api/questionnaire";
import { afterUpsertQuestionnaire } from "../queries/questionnaireInvalidation";

export function useUpsertQuestionnaire() {
  return useMutation({
    mutationFn: (payload) => upsertMyQuestionnaire(payload),
    onSuccess: () => {
      afterUpsertQuestionnaire();
    },
  });
}
