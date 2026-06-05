function getInitial(name) {
  const trimmedName = typeof name === "string" ? name.trim() : "";
  return trimmedName.length > 0 ? trimmedName.charAt(0).toUpperCase() : "?";
}

function MessageAvatar({ name, avatarUrl, size = "md" }) {
  const className = `message-avatar message-avatar-${size}`;

  if (avatarUrl) {
    return <img className={className} src={avatarUrl} alt={name || "User"} />;
  }

  return (
    <div className={className} aria-label={name || "User"}>
      {getInitial(name)}
    </div>
  );
}

export default MessageAvatar;
