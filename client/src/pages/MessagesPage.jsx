import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getUnreadSummary,
} from "../lib/api/messages";
import ChatPanel from "../features/messages/ChatPanel";
import ConversationList from "../features/messages/ConversationList";
import Navbar from "../shared/components/Navbar";
import { useAuth } from "../shared/context/AuthContext";

const POLL_INTERVAL = 4000;

function MessagesPage() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(
    location.state?.conversationId || null
  );
  const [draft, setDraft] = useState("");
  const lastMarkedReadRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: convError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations().then((res) => res.data.items),
    refetchInterval: POLL_INTERVAL,
  });

  const {
    data: messages = [],
    error: msgError,
  } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () =>
      getConversationMessages(activeId).then((res) => res.data.items),
    refetchInterval: activeId ? POLL_INTERVAL : false,
    enabled: !!activeId,
  });

  const { data: unreadTotal = 0 } = useQuery({
    queryKey: ["unreadSummary"],
    queryFn: () => getUnreadSummary().then((res) => res.data.unreadCount),
    refetchInterval: POLL_INTERVAL,
  });

  const markReadMutation = useMutation({
    mutationFn: ({ conversationId, lastReadMessageId }) =>
      markConversationRead(conversationId, lastReadMessageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadSummary"] });
    },
  });

  useEffect(() => {
    if (!activeId || messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    const markKey = `${activeId}:${lastId}`;

    if (markKey !== lastMarkedReadRef.current) {
      lastMarkedReadRef.current = markKey;
      markReadMutation.mutate({
        conversationId: activeId,
        lastReadMessageId: lastId,
      });
    }
  }, [activeId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeId, messages.length]);

  useEffect(() => {
    if (location.state?.conversationId) {
      setActiveId(location.state.conversationId);
    }
  }, [location.state]);

  const sendMutation = useMutation({
    mutationFn: (body) => sendMessage(activeId, body),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    sendMutation.mutate(draft.trim());
  }

  function handleSelectConversation(conversationId) {
    setActiveId(conversationId);
    setDraft("");
  }

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.conversationId === activeId
      ) || null,
    [activeId, conversations]
  );

  const error =
    convError?.message ||
    msgError?.message ||
    sendMutation.error?.message ||
    "";

  return (
    <>
      <Navbar />
      <main className="messages-shell">
        <section className="messages-workspace">
          {error && <p className="form-error messages-error">{error}</p>}
          {unreadTotal > 0 && (
            <div className="messages-unread-summary">
              {unreadTotal} unread message{unreadTotal === 1 ? "" : "s"}
            </div>
          )}

          <div className="messages-layout">
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              isLoading={conversationsLoading}
              onSelectConversation={handleSelectConversation}
            />
            <ChatPanel
              activeConversation={activeConversation}
              messages={messages}
              currentUserId={currentUser?.id}
              draft={draft}
              setDraft={setDraft}
              onSend={handleSend}
              isSending={sendMutation.isPending}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </section>
      </main>
    </>
  );
}

export default MessagesPage;
