import { queryClient } from "../../../shared/query/queryClient";
import { notificationsKeys } from "./queryKeys";

export function invalidateNotifications() {
  queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
}
