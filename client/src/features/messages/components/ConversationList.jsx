import MessageAvatar from "./MessageAvatar";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelectConversation,
}) {
  return (
    <aside className="messages-sidebar" aria-label="Conversations">
      <div className="messages-sidebar-header">
        <div>
          <p className="page-eyebrow">Messages</p>
          <h1>Chats</h1>
        </div>
      </div>

      {isLoading && <p className="messages-empty">Loading conversations...</p>}

      {!isLoading && conversations.length === 0 && (
        <p className="messages-empty">No conversations yet.</p>
      )}

      <div className="conversation-list">
        {conversations.map((conversation) => {
          const isActive = conversation.conversationId === activeId;
          const otherUser = conversation.otherUser || {};
          const preview =
            conversation.lastMessagePreview || "No messages yet. Say hi.";

          return (
            <button
              key={conversation.conversationId}
              type="button"
              className={`conversation-item ${isActive ? "is-active" : ""}`}
              onClick={() => onSelectConversation(conversation.conversationId)}
            >
              <MessageAvatar
                name={otherUser.displayName}
                avatarUrl={otherUser.avatarUrl}
              />
              <span className="conversation-copy">
                <span className="conversation-row">
                  <strong>{otherUser.displayName || "Unknown user"}</strong>
                  <span className="conversation-time">
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                </span>
                <span className="conversation-preview">{preview}</span>
              </span>
              {conversation.unreadCount > 0 && (
                <span className="conversation-badge">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default ConversationList;
