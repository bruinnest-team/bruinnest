import { useQuery } from "@tanstack/react-query";
import { getUnreadSummary } from "../../../lib/api/messages";
import { messagesKeys } from "../queries/queryKeys";

const POLL_INTERVAL = 4000;

export function useUnreadSummary() {
  return useQuery({
    queryKey: messagesKeys.unreadSummary,
    queryFn: () => getUnreadSummary().then((res) => res.data.unreadCount),
    refetchInterval: POLL_INTERVAL,
  });
}
