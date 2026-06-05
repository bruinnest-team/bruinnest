import { Link } from "react-router-dom";
import MessageAvatar from "./MessageAvatar";

function formatMessageTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ChatPanel({
  activeConversation,
  messages,
  currentUserId,
  draft,
  setDraft,
  onSend,
  isSending,
  messagesEndRef,
}) {
  if (!activeConversation) {
    return (
      <section className="chat-panel chat-panel-empty">
        <div>
          <p className="page-eyebrow">Select A Chat</p>
          <h2>Choose a conversation</h2>
          <p>
            Pick a roommate conversation from the left to read messages or send
            a reply.
          </p>
        </div>
      </section>
    );
  }

  const otherUser = activeConversation.otherUser || {};

  return (
    <section className="chat-panel" aria-label="Active conversation">
      <header className="chat-header">
        <MessageAvatar
          name={otherUser.displayName}
          avatarUrl={otherUser.avatarUrl}
          size="lg"
        />
        <div className="chat-header-copy">
          <h2>{otherUser.displayName || "Unknown user"}</h2>
          {otherUser.userId && (
            <Link to={`/profiles/${otherUser.userId}`}>View profile</Link>
          )}
        </div>
      </header>

      <div className="message-history" aria-live="polite">
        {messages.length === 0 && (
          <p className="messages-empty">No messages yet. Say hi.</p>
        )}

        {messages.map((message) => {
          const isMine = message.senderUserId === currentUserId;
          return (
            <div
              key={message.id}
              className={`message-row ${isMine ? "is-mine" : "is-theirs"}`}
            >
              {!isMine && (
                <MessageAvatar
                  name={otherUser.displayName}
                  avatarUrl={otherUser.avatarUrl}
                  size="sm"
                />
              )}
              <div className="message-stack">
                <div className="message-bubble">{message.body}</div>
                <span className="message-time">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-composer" onSubmit={onSend}>
        <input
          className="form-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
        />
        <button
          className="btn-primary"
          type="submit"
          disabled={isSending || draft.trim().length === 0}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default ChatPanel;
