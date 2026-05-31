import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
  getUnreadSummary,
} from "../lib/api/messages";
import Navbar from "../shared/components/Navbar";

const POLL_INTERVAL = 4000;

function MessagesPage() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(location.state?.conversationId || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(() => loadMessages(activeId), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [activeId]);

  useEffect(() => {
    loadUnread();
    const timer = setInterval(loadUnread, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  async function loadConversations() {
    try {
      const res = await getConversations();
      setConversations(res.data.items);
    } catch (err) {
      setError("Could not load conversations.");
    }
  }

  async function loadMessages(conversationId) {
    try {
      const res = await getMessages(conversationId);
      const items = res.data.items;
      setMessages(items);
      if (items.length > 0) {
        await markRead(conversationId, items[items.length - 1].id);
        loadConversations();
      }
    } catch (err) {
      setError("Could not load messages.");
    }
  }

  async function loadUnread() {
    try {
      const res = await getUnreadSummary();
      setUnreadTotal(res.data.unreadCount);
    } catch (err) {
      setError("");
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    try {
      await sendMessage(activeId, draft.trim());
      setDraft("");
      loadMessages(activeId);
    } catch (err) {
      setError("Could not send message.");
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <p className="page-eyebrow">MESSAGES</p>
          <h1>Messages{unreadTotal > 0 ? ` (${unreadTotal} unread)` : ""}</h1>
          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
            <div style={{ width: "260px", flexShrink: 0 }}>
              {conversations.length === 0 && <p style={{ color: "#666" }}>No conversations yet.</p>}
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
                    background: c.conversationId === activeId ? "#f1f5f9" : "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{c.otherUser.displayName}</strong>
                    {c.unreadCount > 0 && (
                      <span style={{ background: "#ef4444", color: "white", borderRadius: "999px", padding: "0 0.5rem", fontSize: "0.8rem" }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0.3rem 0 0", color: "#666", fontSize: "0.9rem" }}>
                    {c.lastMessagePreview}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ flexGrow: 1 }}>
              {!activeId && <p style={{ color: "#666" }}>Select a conversation to view messages.</p>}
              {activeId && (
                <>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1rem", height: "400px", overflowY: "auto", marginBottom: "1rem" }}>
                    {messages.length === 0 && <p style={{ color: "#666" }}>No messages yet. Say hi!</p>}
                    {messages.map((m) => (
                      <div key={m.id} style={{ marginBottom: "0.8rem" }}>
                        <p style={{ margin: 0 }}>{m.body}</p>
                        <small style={{ color: "#999" }}>{new Date(m.createdAt).toLocaleString()}</small>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="form-input"
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message..."
                      style={{ flexGrow: 1 }}
                    />
                    <button className="btn-primary" type="submit">Send</button>
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
