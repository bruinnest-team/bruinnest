import { useMutation } from "@tanstack/react-query";
import { markAllNotificationsRead } from "../../../lib/api/notifications";
import { invalidateNotifications } from "../queries/notificationInvalidation";

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      invalidateNotifications();
    },
  });
}
