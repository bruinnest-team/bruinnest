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



CREATE TABLE IF NOT EXISTS housing_units (
  id INTEGER PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE CHECK (length(trim(external_id)) > 0),
  source TEXT NOT NULL CHECK (length(trim(source)) > 0),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  address_line TEXT NOT NULL CHECK (length(trim(address_line)) > 0),
  city TEXT NOT NULL CHECK (length(trim(city)) > 0),
  state TEXT NOT NULL CHECK (length(trim(state)) > 0),
  zip TEXT NOT NULL CHECK (length(trim(zip)) > 0),
  neighborhood TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  monthly_rent INTEGER NOT NULL CHECK (monthly_rent >= 0),
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms REAL NOT NULL CHECK (bathrooms >= 0),
  sqft INTEGER CHECK (sqft IS NULL OR sqft > 0),
  property_type TEXT NOT NULL CHECK (length(trim(property_type)) > 0),
  listing_url TEXT NOT NULL CHECK (length(trim(listing_url)) > 0),
  photo_urls_json TEXT NOT NULL CHECK (length(trim(photo_urls_json)) > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_housing_units_zip_neighborhood_rent
  ON housing_units (zip, neighborhood, monthly_rent);

CREATE INDEX IF NOT EXISTS idx_housing_units_bedrooms
  ON housing_units (bedrooms);



CREATE TABLE IF NOT EXISTS user_housing_links (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  housing_unit_id INTEGER NOT NULL,
  linked_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (housing_unit_id) REFERENCES housing_units(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_housing_links_housing_unit_id
  ON user_housing_links (housing_unit_id);



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


CREATE TABLE IF NOT EXISTS questionnaires (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  sleep_schedule TEXT NOT NULL CHECK (length(trim(sleep_schedule)) > 0),
  cleanliness_level TEXT NOT NULL CHECK (length(trim(cleanliness_level)) > 0),
  noise_tolerance TEXT NOT NULL CHECK (length(trim(noise_tolerance)) > 0),
  guest_policy TEXT NOT NULL CHECK (length(trim(guest_policy)) > 0),
  study_habits TEXT NOT NULL CHECK (length(trim(study_habits)) > 0),
  smoking_preference TEXT NOT NULL CHECK (length(trim(smoking_preference)) > 0),
  drinking_preference TEXT NOT NULL CHECK (length(trim(drinking_preference)) > 0),
  sharing_preference TEXT NOT NULL CHECK (length(trim(sharing_preference)) > 0),
  pet_comfort TEXT NOT NULL CHECK (length(trim(pet_comfort)) > 0),
  communication_style TEXT NOT NULL CHECK (length(trim(communication_style)) > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS compatibility_scores (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  other_user_id INTEGER NOT NULL,
  score_percent INTEGER NOT NULL CHECK (score_percent >= 0 AND score_percent <= 100),
  calculated_at TEXT NOT NULL,
  UNIQUE (user_id, other_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (other_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_compatibility_scores_user_id_score
  ON compatibility_scores (user_id, score_percent);


CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  target_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, target_user_id),
  CHECK (user_id != target_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id
  ON favorites (user_id);



CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (length(trim(type)) > 0),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  reference_type TEXT NOT NULL CHECK (length(trim(reference_type)) > 0),
  reference_id INTEGER NOT NULL CHECK (reference_id > 0),
  is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
  created_at TEXT NOT NULL,
  read_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
  ON notifications (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read
  ON notifications (user_id, is_read);
