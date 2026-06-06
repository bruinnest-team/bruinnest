import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../../../lib/api/notifications";
import { notificationsKeys } from "../queries/queryKeys";

const POLL_INTERVAL = 5000;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsKeys.all,
    queryFn: () =>
      getNotifications({ page: 1, pageSize: 10 }).then((res) => res.data),
    refetchInterval: POLL_INTERVAL,
  });
}
