import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { markConversationRead } from "../../../lib/api/messages";
import { afterMarkRead } from "../queries/messageInvalidation";

export function useMarkConversationRead(conversationId, messages) {
  const lastMarkedReadRef = useRef(null);

  const mutation = useMutation({
    mutationFn: ({ conversationId: cid, lastReadMessageId }) =>
      markConversationRead(cid, lastReadMessageId),
    onSuccess: () => {
      afterMarkRead();
    },
  });

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    const markKey = `${conversationId}:${lastId}`;

    if (markKey !== lastMarkedReadRef.current) {
      lastMarkedReadRef.current = markKey;
      mutation.mutate({
        conversationId,
        lastReadMessageId: lastId,
      });
    }
  }, [conversationId, messages]);
}
