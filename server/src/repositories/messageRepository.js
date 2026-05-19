const db = require("../config/db");

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findMessageByIdStatement = db.prepare(`
  SELECT
    id,
    conversation_id,
    sender_user_id,
    body,
    created_at
  FROM messages
  WHERE id = ?
`);

const createMessageStatement = db.prepare(`
  INSERT INTO messages (
    conversation_id,
    sender_user_id,
    body,
    created_at
  ) VALUES (
    @conversationId,
    @senderUserId,
    @body,
    COALESCE(@createdAt, ${timestampExpression})
  )
`);

const listMessagesStatement = db.prepare(`
  SELECT
    id,
    conversation_id,
    sender_user_id,
    body,
    created_at
  FROM messages
  WHERE conversation_id = ?
  ORDER BY id ASC
`);

const listMessagesAfterStatement = db.prepare(`
  SELECT
    id,
    conversation_id,
    sender_user_id,
    body,
    created_at
  FROM messages
  WHERE conversation_id = ?
    AND id > ?
  ORDER BY id ASC
`);

const findLatestMessageStatement = db.prepare(`
  SELECT
    id,
    conversation_id,
    sender_user_id,
    body,
    created_at
  FROM messages
  WHERE conversation_id = ?
  ORDER BY id DESC
  LIMIT 1
`);

const countUnreadMessagesStatement = db.prepare(`
  SELECT COUNT(*) AS unread_count
  FROM messages
  WHERE conversation_id = @conversationId
    AND sender_user_id != @userId
    AND id > COALESCE(@lastReadMessageId, 0)
`);

const countAllUnreadMessagesForUserStatement = db.prepare(`
  SELECT COUNT(*) AS unread_count
  FROM conversation_participants AS cp
  JOIN messages AS m
    ON m.conversation_id = cp.conversation_id
  WHERE cp.user_id = ?
    AND m.sender_user_id != cp.user_id
    AND m.id > COALESCE(cp.last_read_message_id, 0)
`);

function mapMessageRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function createMessage({
  conversationId,
  senderUserId,
  body,
  createdAt = null,
}) {
  const result = createMessageStatement.run({
    conversationId,
    senderUserId,
    body,
    createdAt,
  });

  return mapMessageRow(findMessageByIdStatement.get(result.lastInsertRowid));
}

function listMessages(conversationId) {
  return listMessagesStatement.all(conversationId).map(mapMessageRow);
}

function listMessagesAfter(conversationId, afterMessageId) {
  return listMessagesAfterStatement
    .all(conversationId, afterMessageId)
    .map(mapMessageRow);
}

function findLatestMessage(conversationId) {
  return mapMessageRow(findLatestMessageStatement.get(conversationId));
}

function countUnreadMessages(conversationId, userId, lastReadMessageId = null) {
  return countUnreadMessagesStatement.get({
    conversationId,
    userId,
    lastReadMessageId,
  }).unread_count;
}

function countAllUnreadMessagesForUser(userId) {
  return countAllUnreadMessagesForUserStatement.get(userId).unread_count;
}

module.exports = {
  createMessage,
  listMessages,
  listMessagesAfter,
  findLatestMessage,
  countUnreadMessages,
  countAllUnreadMessagesForUser,
};
