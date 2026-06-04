import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getUnreadSummary,
} from "../lib/api/messages";
import Navbar from "../shared/components/Navbar";

const POLL_INTERVAL = 4000;

function MessagesPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(
    location.state?.conversationId || null
  );
  const [draft, setDraft] = useState("");
  const prevMessageCountRef = useRef(0);

  const {
    data: conversations = [],
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
    },
  });

  useEffect(() => {
    if (!activeId || messages.length === 0) return;
    if (messages.length !== prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length;
      const lastId = messages[messages.length - 1].id;
      markReadMutation.mutate({
        conversationId: activeId,
        lastReadMessageId: lastId,
      });
    }
  }, [activeId, messages, markReadMutation]);

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

  const error =
    convError?.message ||
    msgError?.message ||
    sendMutation.error?.message ||
    "";

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <p className="page-eyebrow">MESSAGES</p>
          <h1>
            Messages
            {unreadTotal > 0 ? ` (${unreadTotal} unread)` : ""}
          </h1>
          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
            <div style={{ width: "260px", flexShrink: 0 }}>
              {conversations.length === 0 && (
                <p style={{ color: "#666" }}>No conversations yet.</p>
              )}
              {conversations.map((c) => (
                <div
                  key={c.conversationId}
                  onClick={() => setActiveId(c.conversationId)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.8rem",
                    marginBottom: "0.6rem",
                    cursor: "pointer",
                    background:
                      c.conversationId === activeId ? "#f1f5f9" : "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong>{c.otherUser.displayName}</strong>
                    {c.unreadCount > 0 && (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "white",
                          borderRadius: "999px",
                          padding: "0 0.5rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: "0.3rem 0 0",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    {c.lastMessagePreview}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ flexGrow: 1 }}>
              {!activeId && (
                <p style={{ color: "#666" }}>
                  Select a conversation to view messages.
                </p>
              )}
              {activeId && (
                <>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "1rem",
                      height: "400px",
                      overflowY: "auto",
                      marginBottom: "1rem",
                    }}
                  >
                    {messages.length === 0 && (
                      <p style={{ color: "#666" }}>
                        No messages yet. Say hi!
                      </p>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} style={{ marginBottom: "0.8rem" }}>
                        <p style={{ margin: 0 }}>{m.body}</p>
                        <small style={{ color: "#999" }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSend}
                    style={{ display: "flex", gap: "0.5rem" }}
                  >
                    <input
                      className="form-input"
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message..."
                      style={{ flexGrow: 1 }}
                    />
                    <button
                      className="btn-primary"
                      type="submit"
                      disabled={sendMutation.isPending}
                    >
                      {sendMutation.isPending ? "Sending..." : "Send"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default MessagesPage;
