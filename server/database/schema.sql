-- BruinNest MVP schema for auth, profiles, and messaging.
-- Timestamp fields use ISO 8601 UTC strings, for example:
-- 2026-05-14T17:00:00.000Z

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(trim(email)) > 0),
  password_hash TEXT NOT NULL CHECK (length(password_hash) > 0),
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);



CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(email)) > 0),
  code_hash TEXT NOT NULL CHECK (length(code_hash) > 0),
  expires_at TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  consumed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email_sent_at
  ON email_verifications (email, sent_at);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email_consumed_at_expires_at
  ON email_verifications (email, consumed_at, expires_at);



CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON conversations (updated_at);



CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  gender TEXT NOT NULL CHECK (length(trim(gender)) > 0),
  graduation_year INTEGER NOT NULL CHECK (graduation_year >= 2000),
  budget_min INTEGER NOT NULL CHECK (budget_min >= 0),
  budget_max INTEGER NOT NULL CHECK (budget_max >= budget_min),
  move_in_date TEXT NOT NULL CHECK (length(trim(move_in_date)) > 0),
  bio TEXT NOT NULL CHECK (length(trim(bio)) > 0),
  profile_completed INTEGER NOT NULL DEFAULT 0 CHECK (profile_completed IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed
  ON profiles (profile_completed);

CREATE INDEX IF NOT EXISTS idx_profiles_gender
  ON profiles (gender);

CREATE INDEX IF NOT EXISTS idx_profiles_graduation_year
  ON profiles (graduation_year);

CREATE INDEX IF NOT EXISTS idx_profiles_move_in_date
  ON profiles (move_in_date);



CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  sender_user_id INTEGER NOT NULL,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  created_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_id
  ON messages (conversation_id, id);



CREATE TABLE IF NOT EXISTS conversation_participants (
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  last_read_message_id INTEGER,
  joined_at TEXT NOT NULL,
  UNIQUE (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id
  ON conversation_participants (user_id);

