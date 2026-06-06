import { useQuery } from "@tanstack/react-query";
import { getConversationMessages } from "../../../lib/api/messages";
import { messagesKeys } from "../queries/queryKeys";

const POLL_INTERVAL = 4000;

export function useConversationMessages(conversationId) {
  return useQuery({
    queryKey: messagesKeys.messages(conversationId),
    queryFn: () =>
      getConversationMessages(conversationId).then((res) => res.data.items),
    refetchInterval: conversationId ? POLL_INTERVAL : false,
    enabled: !!conversationId,
  });
}
