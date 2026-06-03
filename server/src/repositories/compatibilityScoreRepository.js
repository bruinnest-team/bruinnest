const db = require("../config/db");

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findByUserPairStatement = db.prepare(`
  SELECT
    user_id,
    other_user_id,
    score_percent,
    calculated_at
  FROM compatibility_scores
  WHERE user_id = ? AND other_user_id = ?
`);

const upsertScoreStatement = db.prepare(`
  INSERT INTO compatibility_scores (user_id, other_user_id, score_percent, calculated_at)
  VALUES (@userId, @otherUserId, @scorePercent, ${timestampExpression})
  ON CONFLICT(user_id, other_user_id) DO UPDATE SET
    score_percent = excluded.score_percent,
    calculated_at = ${timestampExpression}
`);

function mapScoreRow(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    otherUserId: row.other_user_id,
    scorePercent: row.score_percent,
    calculatedAt: row.calculated_at,
  };
}

function findByUserPair(userId, otherUserId) {
  return mapScoreRow(findByUserPairStatement.get(userId, otherUserId));
}

function upsertScore(userId, otherUserId, scorePercent) {
  upsertScoreStatement.run({ userId, otherUserId, scorePercent });
}

module.exports = { findByUserPair, upsertScore };
