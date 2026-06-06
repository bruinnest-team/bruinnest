const db = require("../config/db");

const findLatestActiveByEmailStatement = db.prepare(`
  SELECT
    id,
    email,
    code_hash,
    expires_at,
    sent_at,
    consumed_at
  FROM email_verifications
  WHERE email = ?
    AND consumed_at IS NULL
  ORDER BY sent_at DESC, id DESC
  LIMIT 1
`);

const createVerificationStatement = db.prepare(`
  INSERT INTO email_verifications (
    email,
    code_hash,
    expires_at,
    sent_at,
    consumed_at
  ) VALUES (
    @email,
    @codeHash,
    @expiresAt,
    @sentAt,
    NULL
  )
`);

const markConsumedStatement = db.prepare(`
  UPDATE email_verifications
  SET consumed_at = @consumedAt
  WHERE id = @verificationId
    AND consumed_at IS NULL
`);

const deleteExpiredStatement = db.prepare(`
  DELETE FROM email_verifications
  WHERE consumed_at IS NULL
    AND expires_at < ?
`);

const deleteByIdStatement = db.prepare(`
  DELETE FROM email_verifications
  WHERE id = ?
`);

const findByIdStatement = db.prepare(`
  SELECT
    id,
    email,
    code_hash,
    expires_at,
    sent_at,
    consumed_at
  FROM email_verifications
  WHERE id = ?
`);

function mapVerificationRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    codeHash: row.code_hash,
    expiresAt: row.expires_at,
    sentAt: row.sent_at,
    consumedAt: row.consumed_at,
  };
}

function findLatestActiveByEmail(email) {
  return mapVerificationRow(findLatestActiveByEmailStatement.get(email));
}

function createVerification({ email, codeHash, expiresAt, sentAt }) {
  const result = createVerificationStatement.run({
    email,
    codeHash,
    expiresAt,
    sentAt,
  });

  return mapVerificationRow(findByIdStatement.get(result.lastInsertRowid));
}

function markConsumed(verificationId, consumedAt) {
  markConsumedStatement.run({
    verificationId,
    consumedAt,
  });

  return mapVerificationRow(findByIdStatement.get(verificationId));
}

function deleteExpired(now) {
  const result = deleteExpiredStatement.run(now);

  return result.changes;
}

function deleteById(verificationId) {
  const result = deleteByIdStatement.run(verificationId);

  return result.changes;
}

module.exports = {
  findLatestActiveByEmail,
  createVerification,
  markConsumed,
  deleteExpired,
  deleteById,
};
