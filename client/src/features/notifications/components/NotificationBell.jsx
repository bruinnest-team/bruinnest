import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../hooks/useMarkAllNotificationsRead";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useNotifications();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markOneMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  function handleNotificationClick(item) {
    if (!item.isRead) {
      markOneMutation.mutate(item.id);
    }
    setOpen(false);
    if (item.referenceType === "conversation") {
      navigate("/messages", { state: { conversationId: item.referenceId } });
    } else if (item.referenceType === "profile") {
      navigate(`/profiles/${item.referenceId}`);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.2rem",
          lineHeight: 1,
          color: "#1e3a5f",
          padding: "0.2rem",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-4px",
            right: "-6px",
            background: "#ef4444",
            color: "white",
            borderRadius: "999px",
            padding: "0 0.4rem",
            fontSize: "0.7rem",
            lineHeight: "1.1rem",
            minWidth: "1.1rem",
            textAlign: "center",
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 0.5rem)",
          right: 0,
          minWidth: "280px",
          maxWidth: "360px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          zIndex: 200,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.6rem 0.9rem",
            borderBottom: "1px solid #e2e8f0",
          }}>
            <span style={{ fontWeight: "700", color: "#1e3a5f", fontSize: "0.95rem" }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {isLoading ? (
              <p style={{ padding: "0.9rem", margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                Loading…
              </p>
            ) : isError ? (
              <p style={{ padding: "0.9rem", margin: 0, color: "#ef4444", fontSize: "0.85rem" }}>
                Could not load notifications.
              </p>
            ) : items.length === 0 ? (
              <p style={{ padding: "0.9rem", margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                No notifications yet.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: "0.7rem 0.9rem",
                    borderBottom: "1px solid #f1f5f9",
                    background: item.isRead ? "#ffffff" : "#eff6ff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}>
                    <span style={{
                      fontWeight: item.isRead ? "500" : "700",
                      color: "#1e3a5f",
                      fontSize: "0.85rem",
                    }}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markOneMutation.mutate(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p style={{
                    margin: "0.25rem 0 0",
                    color: "#475569",
                    fontSize: "0.8rem",
                    wordBreak: "break-word",
                  }}>
                    {item.body}
                  </p>
                  <small style={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
