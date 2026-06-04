const db = require("../config/db");

const NOTIFICATION_COLUMNS = `
    id,
    user_id,
    type,
    title,
    body,
    reference_type,
    reference_id,
    is_read,
    created_at,
    read_at`;

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findByIdStatement = db.prepare(`
  SELECT${NOTIFICATION_COLUMNS}
  FROM notifications
  WHERE id = ?
`);

const findByIdForUserStatement = db.prepare(`
  SELECT${NOTIFICATION_COLUMNS}
  FROM notifications
  WHERE id = ?
    AND user_id = ?
`);

const findExistingReferenceNotificationStatement = db.prepare(`
  SELECT${NOTIFICATION_COLUMNS}
  FROM notifications
  WHERE user_id = @userId
    AND type = @type
    AND (reference_type = @referenceType OR (reference_type IS NULL AND @referenceType IS NULL))
    AND (reference_id = @referenceId OR (reference_id IS NULL AND @referenceId IS NULL))
  ORDER BY created_at DESC, id DESC
  LIMIT 1
`);

const createNotificationStatement = db.prepare(`
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    reference_type,
    reference_id,
    is_read,
    created_at,
    read_at
  ) VALUES (
    @userId,
    @type,
    @title,
    @body,
    @referenceType,
    @referenceId,
    0,
    COALESCE(@createdAt, ${timestampExpression}),
    NULL
  )
`);

const listNotificationsStatement = db.prepare(`
  SELECT${NOTIFICATION_COLUMNS}
  FROM notifications
  WHERE user_id = @userId
  ORDER BY created_at DESC, id DESC
  LIMIT @pageSize OFFSET @offset
`);

const listUnreadNotificationsStatement = db.prepare(`
  SELECT${NOTIFICATION_COLUMNS}
  FROM notifications
  WHERE user_id = @userId
    AND is_read = 0
  ORDER BY created_at DESC, id DESC
  LIMIT @pageSize OFFSET @offset
`);

const countNotificationsStatement = db.prepare(`
  SELECT COUNT(*) AS count
  FROM notifications
  WHERE user_id = ?
`);

const countUnreadNotificationsStatement = db.prepare(`
  SELECT COUNT(*) AS count
  FROM notifications
  WHERE user_id = ?
    AND is_read = 0
`);

const markAsReadStatement = db.prepare(`
  UPDATE notifications
  SET
    is_read = 1,
    read_at = ${timestampExpression}
  WHERE id = @notificationId
    AND user_id = @userId
    AND is_read = 0
`);

const markAllAsReadStatement = db.prepare(`
  UPDATE notifications
  SET
    is_read = 1,
    read_at = ${timestampExpression}
  WHERE user_id = ?
    AND is_read = 0
`);

function mapNotificationRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function createNotification({
  userId,
  type,
  title,
  body,
  referenceType,
  referenceId,
  createdAt = null,
}) {
  const result = createNotificationStatement.run({
    userId,
    type,
    title,
    body,
    referenceType,
    referenceId,
    createdAt,
  });

  return mapNotificationRow(findByIdStatement.get(result.lastInsertRowid));
}

function listNotifications({ userId, page, pageSize, unreadOnly = false }) {
  const statement = unreadOnly
    ? listUnreadNotificationsStatement
    : listNotificationsStatement;
  const offset = (page - 1) * pageSize;

  return statement
    .all({
      userId,
      pageSize,
      offset,
    })
    .map(mapNotificationRow);
}

function countNotifications({ userId, unreadOnly = false }) {
  const statement = unreadOnly
    ? countUnreadNotificationsStatement
    : countNotificationsStatement;

  return statement.get(userId).count;
}

function countUnreadNotifications(userId) {
  return countUnreadNotificationsStatement.get(userId).count;
}

function findByIdForUser(notificationId, userId) {
  return mapNotificationRow(
    findByIdForUserStatement.get(notificationId, userId)
  );
}

function findExistingReferenceNotification({
  userId,
  type,
  referenceType,
  referenceId,
}) {
  return mapNotificationRow(
    findExistingReferenceNotificationStatement.get({
      userId,
      type,
      referenceType,
      referenceId,
    })
  );
}

function markAsRead(notificationId, userId) {
  markAsReadStatement.run({
    notificationId,
    userId,
  });

  return findByIdForUser(notificationId, userId);
}

function markAllAsRead(userId) {
  return markAllAsReadStatement.run(userId).changes;
}

module.exports = {
  createNotification,
  listNotifications,
  countNotifications,
  countUnreadNotifications,
  findByIdForUser,
  findExistingReferenceNotification,
  markAsRead,
  markAllAsRead,
};
