-- BruinNest MVP local development seed data.
-- This file is intentionally idempotent for repeatable local setup.

BEGIN TRANSACTION;

INSERT INTO users (
  id,
  email,
  password_hash,
  is_verified,
  created_at,
  updated_at
) VALUES
  (
    1001,
    'alice@ucla.edu',
    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy',
    1,
    '2026-05-16T18:00:00.000Z',
    '2026-05-16T18:00:00.000Z'
  ),
  (
    1002,
    'bob@ucla.edu',
    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy',
    1,
    '2026-05-16T18:01:00.000Z',
    '2026-05-16T18:01:00.000Z'
  ),
  (
    1003,
    'carol@ucla.edu',
    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy',
    1,
    '2026-05-16T18:02:00.000Z',
    '2026-05-16T18:02:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  email = excluded.email,
  password_hash = excluded.password_hash,
  is_verified = excluded.is_verified,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO profiles (
  id,
  user_id,
  display_name,
  gender,
  graduation_year,
  budget_min,
  budget_max,
  move_in_date,
  bio,
  profile_completed,
  created_at,
  updated_at
) VALUES
  (
    1101,
    1001,
    'Alice Kim',
    'female',
    2027,
    900,
    1300,
    '2026-09-01',
    'Clean, quiet, and looking for housing near UCLA.',
    1,
    '2026-05-16T18:05:00.000Z',
    '2026-05-16T18:05:00.000Z'
  ),
  (
    1102,
    1002,
    'Bob Chen',
    'male',
    2026,
    1100,
    1500,
    '2026-08-20',
    'Night-owl CS student who wants a roommate who is okay with cooking.',
    1,
    '2026-05-16T18:06:00.000Z',
    '2026-05-16T18:06:00.000Z'
  ),
  (
    1103,
    1003,
    'Carol Park',
    'female',
    2028,
    800,
    1200,
    '2026-09-15',
    'Still drafting my profile while I narrow down apartment options.',
    0,
    '2026-05-16T18:07:00.000Z',
    '2026-05-16T18:07:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  display_name = excluded.display_name,
  gender = excluded.gender,
  graduation_year = excluded.graduation_year,
  budget_min = excluded.budget_min,
  budget_max = excluded.budget_max,
  move_in_date = excluded.move_in_date,
  bio = excluded.bio,
  profile_completed = excluded.profile_completed,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO conversations (
  id,
  created_at,
  updated_at
) VALUES
  (
    2001,
    '2026-05-16T18:10:00.000Z',
    '2026-05-16T18:30:00.000Z'
  ),
  (
    2002,
    '2026-05-16T18:32:00.000Z',
    '2026-05-16T18:42:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO messages (
  id,
  conversation_id,
  sender_user_id,
  body,
  created_at
) VALUES
  (
    3001,
    2001,
    1001,
    'Hey Bob, are you still looking for a roommate in Westwood?',
    '2026-05-16T18:11:00.000Z'
  ),
  (
    3002,
    2001,
    1002,
    'Yes, I am. What budget range are you considering?',
    '2026-05-16T18:12:00.000Z'
  ),
  (
    3003,
    2001,
    1002,
    'I am usually around campus on weekdays if you want to chat.',
    '2026-05-16T18:20:00.000Z'
  ),
  (
    3004,
    2001,
    1002,
    'Also, do you have a preference between Westwood and Palms?',
    '2026-05-16T18:25:00.000Z'
  ),
  (
    3005,
    2001,
    1002,
    'Let me know when you have a few minutes to compare options.',
    '2026-05-16T18:30:00.000Z'
  ),
  (
    3101,
    2002,
    1003,
    'Hi Alice! I saw your profile and we have similar move-in timing.',
    '2026-05-16T18:33:00.000Z'
  ),
  (
    3102,
    2002,
    1001,
    'Hey Carol! Yes, I am targeting early September. What is your budget?',
    '2026-05-16T18:35:00.000Z'
  ),
  (
    3103,
    2002,
    1003,
    'Around 800 to 1200. Are you open to a two-bedroom split?',
    '2026-05-16T18:40:00.000Z'
  ),
  (
    3104,
    2002,
    1003,
    'I can also send you a couple of listings I have been tracking.',
    '2026-05-16T18:42:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  conversation_id = excluded.conversation_id,
  sender_user_id = excluded.sender_user_id,
  body = excluded.body,
  created_at = excluded.created_at;

INSERT INTO conversation_participants (
  id,
  conversation_id,
  user_id,
  last_read_message_id,
  joined_at
) VALUES
  (
    4001,
    2001,
    1001,
    3002,
    '2026-05-16T18:10:00.000Z'
  ),
  (
    4002,
    2001,
    1002,
    3003,
    '2026-05-16T18:10:00.000Z'
  ),
  (
    4003,
    2002,
    1001,
    3102,
    '2026-05-16T18:32:00.000Z'
  ),
  (
    4004,
    2002,
    1003,
    3104,
    '2026-05-16T18:32:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  conversation_id = excluded.conversation_id,
  user_id = excluded.user_id,
  last_read_message_id = excluded.last_read_message_id,
  joined_at = excluded.joined_at;

COMMIT;
