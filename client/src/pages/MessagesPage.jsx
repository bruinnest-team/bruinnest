import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useConversations } from "../features/messages/hooks/useConversations";
import { useConversationMessages } from "../features/messages/hooks/useConversationMessages";
import { useUnreadSummary } from "../features/messages/hooks/useUnreadSummary";
import { useSendMessage } from "../features/messages/hooks/useSendMessage";
import { useMarkConversationRead } from "../features/messages/hooks/useMarkConversationRead";
import ChatPanel from "../features/messages/components/ChatPanel";
import ConversationList from "../features/messages/components/ConversationList";
import Navbar from "../shared/components/Navbar";
import { useAuth } from "../shared/context/AuthContext";

function MessagesPage() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [activeId, setActiveId] = useState(
    location.state?.conversationId || null
  );
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: convError,
  } = useConversations();

  const {
    data: messages = [],
    error: msgError,
  } = useConversationMessages(activeId);

  const { data: unreadTotal = 0 } = useUnreadSummary();

  useMarkConversationRead(activeId, messages);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeId, messages.length]);

  useEffect(() => {
    if (location.state?.conversationId) {
      setActiveId(location.state.conversationId);
    }
  }, [location.state]);

  const sendMutation = useSendMessage(activeId);

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    sendMutation.mutate(draft.trim(), {
      onSuccess: () => setDraft(""),
    });
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
