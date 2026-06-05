import { queryClient } from "../../../shared/query/queryClient";
import { messagesKeys } from "./queryKeys";

export function afterSendMessage(conversationId) {
  queryClient.invalidateQueries({ queryKey: messagesKeys.messages(conversationId) });
  queryClient.invalidateQueries({ queryKey: messagesKeys.conversations });
}

export function afterMarkRead() {
  queryClient.invalidateQueries({ queryKey: messagesKeys.conversations });
  queryClient.invalidateQueries({ queryKey: messagesKeys.unreadSummary });
}
