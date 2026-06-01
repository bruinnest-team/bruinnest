const db = require("../config/db");

const findByIdStatement = db.prepare(`
  SELECT
    id,
    email,
    password_hash,
    is_verified,
    created_at,
    updated_at
  FROM users
  WHERE id = ?
`);

const findByEmailStatement = db.prepare(`
  SELECT
    id,
    email,
    password_hash,
    is_verified,
    created_at,
    updated_at
  FROM users
  WHERE email = ?
`);

const createUserStatement = db.prepare(`
  INSERT INTO users (
    email,
    password_hash,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    @email,
    @passwordHash,
    @isVerified,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
`);

const markVerifiedStatement = db.prepare(`
  UPDATE users
  SET
    is_verified = 1,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = ?
`);

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    isVerified: row.is_verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function findById(userId) {
  return mapUserRow(findByIdStatement.get(userId));
}

function findByEmail(email) {
  return mapUserRow(findByEmailStatement.get(email));
}

function createUser({ email, passwordHash, isVerified = false }) {
  const result = createUserStatement.run({
    email,
    passwordHash,
    isVerified: isVerified ? 1 : 0,
  });

  return findById(result.lastInsertRowid);
}

function markVerified(userId) {
  markVerifiedStatement.run(userId);

  return findById(userId);
}

module.exports = {
  findById,
  findByEmail,
  createUser,
  markVerified,
};
