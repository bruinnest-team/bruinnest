import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../../../lib/api/messages";
import { messagesKeys } from "../queries/queryKeys";

const POLL_INTERVAL = 4000;

export function useConversations() {
  return useQuery({
    queryKey: messagesKeys.conversations,
    queryFn: () => getConversations().then((res) => res.data.items),
    refetchInterval: POLL_INTERVAL,
  });
}
