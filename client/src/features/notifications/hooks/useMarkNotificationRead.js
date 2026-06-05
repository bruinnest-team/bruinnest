import { useMutation } from "@tanstack/react-query";
import { markNotificationRead } from "../../../lib/api/notifications";
import { invalidateNotifications } from "../queries/notificationInvalidation";

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    onSuccess: () => {
      invalidateNotifications();
    },
  });
}
