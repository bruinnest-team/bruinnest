import { useMutation } from "@tanstack/react-query";
import { createOrGetConversation } from "../../../lib/api/messages";

export function useStartConversation() {
  return useMutation({
    mutationFn: (targetUserId) => createOrGetConversation(targetUserId),
  });
}
