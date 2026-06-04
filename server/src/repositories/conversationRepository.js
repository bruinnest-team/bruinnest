const db = require("../config/db");

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findConversationByIdStatement = db.prepare(`
  SELECT
    id,
    created_at,
    updated_at
  FROM conversations
  WHERE id = ?
`);

const findDirectConversationStatement = db.prepare(`
  SELECT
    c.id,
    c.created_at,
    c.updated_at
  FROM conversations AS c
  JOIN conversation_participants AS cp
    ON cp.conversation_id = c.id
  WHERE cp.user_id IN (@userAId, @userBId)
  GROUP BY c.id
  HAVING COUNT(*) = 2
    AND COUNT(DISTINCT cp.user_id) = 2
    AND (
      SELECT COUNT(*)
      FROM conversation_participants AS all_cp
      WHERE all_cp.conversation_id = c.id
    ) = 2
  LIMIT 1
`);

const createConversationStatement = db.prepare(`
  INSERT INTO conversations (
    created_at,
    updated_at
  ) VALUES (
    COALESCE(@createdAt, ${timestampExpression}),
    COALESCE(@updatedAt, ${timestampExpression})
  )
`);

const addParticipantStatement = db.prepare(`
  INSERT INTO conversation_participants (
    conversation_id,
    user_id,
    last_read_message_id,
    joined_at
  ) VALUES (
    @conversationId,
    @userId,
    NULL,
    COALESCE(@joinedAt, ${timestampExpression})
  )
`);

const listConversationsForUserStatement = db.prepare(`
  SELECT
    c.id AS conversation_id,
    c.created_at,
    c.updated_at,
    other_cp.user_id AS other_user_id,
    other_profile.display_name AS other_user_display_name,
    latest_message.body AS last_message_preview,
    latest_message.created_at AS last_message_at,
    (
      SELECT COUNT(*)
      FROM messages AS unread_message
      WHERE unread_message.conversation_id = c.id
        AND unread_message.sender_user_id != @userId
        AND unread_message.id > COALESCE(self_cp.last_read_message_id, 0)
    ) AS unread_count
  FROM conversation_participants AS self_cp
  JOIN conversations AS c
    ON c.id = self_cp.conversation_id
  JOIN conversation_participants AS other_cp
    ON other_cp.conversation_id = c.id
   AND other_cp.user_id != @userId
  LEFT JOIN profiles AS other_profile
    ON other_profile.user_id = other_cp.user_id
  LEFT JOIN messages AS latest_message
    ON latest_message.id = (
      SELECT id
      FROM messages
      WHERE conversation_id = c.id
      ORDER BY id DESC
      LIMIT 1
    )
  WHERE self_cp.user_id = @userId
  ORDER BY c.updated_at DESC, c.id DESC
`);

const findParticipantStatement = db.prepare(`
  SELECT
    conversation_id,
    user_id,
    last_read_message_id,
    joined_at
  FROM conversation_participants
  WHERE conversation_id = ?
    AND user_id = ?
`);

const listParticipantsStatement = db.prepare(`
  SELECT
    conversation_id,
    user_id,
    last_read_message_id,
    joined_at
  FROM conversation_participants
  WHERE conversation_id = ?
`);

const updateLastReadMessageStatement = db.prepare(`
  UPDATE conversation_participants
  SET last_read_message_id = @lastReadMessageId
  WHERE conversation_id = @conversationId
    AND user_id = @userId
`);

const touchConversationStatement = db.prepare(`
  UPDATE conversations
  SET updated_at = COALESCE(@updatedAt, ${timestampExpression})
  WHERE id = @conversationId
`);

function mapConversationRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapParticipantRow(row) {
  if (!row) {
    return null;
  }

  return {
    conversationId: row.conversation_id,
    userId: row.user_id,
    lastReadMessageId: row.last_read_message_id,
    joinedAt: row.joined_at,
  };
}

function mapConversationListRow(row) {
  return {
    conversationId: row.conversation_id,
    otherUser: {
      userId: row.other_user_id,
      displayName: row.other_user_display_name,
    },
    lastMessagePreview: row.last_message_preview,
    lastMessageAt: row.last_message_at,
    unreadCount: row.unread_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function findDirectConversation(userAId, userBId) {
  return mapConversationRow(
    findDirectConversationStatement.get({
      userAId,
      userBId,
    })
  );
}

function createConversation({ createdAt = null, updatedAt = null } = {}) {
  const result = createConversationStatement.run({
    createdAt,
    updatedAt,
  });

  return mapConversationRow(findConversationByIdStatement.get(result.lastInsertRowid));
}

function addParticipant({ conversationId, userId, joinedAt = null }) {
  addParticipantStatement.run({
    conversationId,
    userId,
    joinedAt,
  });

  return findParticipant(conversationId, userId);
}

function listConversationsForUser(userId) {
  return listConversationsForUserStatement
    .all({ userId })
    .map(mapConversationListRow);
}

function findParticipant(conversationId, userId) {
  return mapParticipantRow(findParticipantStatement.get(conversationId, userId));
}

function listParticipants(conversationId) {
  return listParticipantsStatement.all(conversationId).map(mapParticipantRow);
}

function updateLastReadMessage({ conversationId, userId, lastReadMessageId }) {
  updateLastReadMessageStatement.run({
    conversationId,
    userId,
    lastReadMessageId,
  });

  return findParticipant(conversationId, userId);
}

function touchConversation(conversationId, updatedAt = null) {
  touchConversationStatement.run({
    conversationId,
    updatedAt,
  });

  return mapConversationRow(findConversationByIdStatement.get(conversationId));
}

module.exports = {
  findDirectConversation,
  createConversation,
  addParticipant,
  listConversationsForUser,
  findParticipant,
  listParticipants,
  updateLastReadMessage,
  touchConversation,
};
