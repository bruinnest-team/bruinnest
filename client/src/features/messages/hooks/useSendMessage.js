import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "../../../lib/api/messages";
import { afterSendMessage } from "../queries/messageInvalidation";

export function useSendMessage(conversationId) {
  return useMutation({
    mutationFn: (body) => sendMessage(conversationId, body),
    onSuccess: () => {
      afterSendMessage(conversationId);
    },
  });
}
