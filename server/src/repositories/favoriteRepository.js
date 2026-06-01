const db = require("../config/db");

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findFavoriteStatement = db.prepare(`
  SELECT
    id,
    user_id,
    target_user_id,
    created_at
  FROM favorites
  WHERE user_id = ? AND target_user_id = ?
`);

const findFavoriteByIdStatement = db.prepare(`
  SELECT
    id,
    user_id,
    target_user_id,
    created_at
  FROM favorites
  WHERE id = ?
`);

const createFavoriteStatement = db.prepare(`
  INSERT INTO favorites (
    user_id,
    target_user_id,
    created_at
  ) VALUES (
    @userId,
    @targetUserId,
    ${timestampExpression}
  )
`);

const deleteFavoriteStatement = db.prepare(`
  DELETE FROM favorites
  WHERE user_id = ? AND target_user_id = ?
`);

const listFavoritesStatement = db.prepare(`
  SELECT
    f.target_user_id AS user_id,
    p.display_name,
    p.gender,
    p.graduation_year,
    p.budget_min,
    p.budget_max,
    p.move_in_date,
    f.created_at
  FROM favorites AS f
  JOIN profiles AS p
    ON p.user_id = f.target_user_id
  WHERE f.user_id = ?
  ORDER BY f.id DESC
`);

function mapFavoriteRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    targetUserId: row.target_user_id,
    createdAt: row.created_at,
  };
}

function mapFavoriteProfileRow(row) {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    displayName: row.display_name,
    gender: row.gender,
    graduationYear: row.graduation_year,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    moveInDate: row.move_in_date,
    createdAt: row.created_at,
  };
}

function findFavorite(userId, targetUserId) {
  return mapFavoriteRow(findFavoriteStatement.get(userId, targetUserId));
}

function createFavorite({ userId, targetUserId }) {
  const result = createFavoriteStatement.run({ userId, targetUserId });

  return mapFavoriteRow(findFavoriteByIdStatement.get(result.lastInsertRowid));
}

function deleteFavorite(userId, targetUserId) {
  return deleteFavoriteStatement.run(userId, targetUserId).changes;
}

function listFavorites(userId) {
  return listFavoritesStatement.all(userId).map(mapFavoriteProfileRow);
}

module.exports = {
  findFavorite,
  createFavorite,
  deleteFavorite,
  listFavorites,
};
