-- BruinNest demo seed data for local development.
-- Login: alice@ucla.edu / Password123!
-- Run via: npm run db:reset  (requires housing import before seed)

BEGIN TRANSACTION;

-- Shared demo password hash for Password123!
-- $2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy

INSERT INTO users (id, email, password_hash, is_verified, created_at, updated_at) VALUES
  (1001, 'alice@ucla.edu',   '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:00:00.000Z', '2026-05-16T18:00:00.000Z'),
  (1002, 'bob@ucla.edu',     '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:01:00.000Z', '2026-05-16T18:01:00.000Z'),
  (1003, 'carol@ucla.edu',   '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:02:00.000Z', '2026-05-16T18:02:00.000Z'),
  (1004, 'daniel@ucla.edu',  '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:03:00.000Z', '2026-05-16T18:03:00.000Z'),
  (1005, 'eva@ucla.edu',     '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:04:00.000Z', '2026-05-16T18:04:00.000Z'),
  (1006, 'frank@ucla.edu',   '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:05:00.000Z', '2026-05-16T18:05:00.000Z'),
  (1007, 'grace@ucla.edu',   '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:06:00.000Z', '2026-05-16T18:06:00.000Z'),
  (1008, 'henry@ucla.edu',   '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:07:00.000Z', '2026-05-16T18:07:00.000Z'),
  (1009, 'iris@ucla.edu',    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:08:00.000Z', '2026-05-16T18:08:00.000Z'),
  (1010, 'jake@ucla.edu',    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:09:00.000Z', '2026-05-16T18:09:00.000Z'),
  (1011, 'kate@ucla.edu',    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:10:00.000Z', '2026-05-16T18:10:00.000Z'),
  (1012, 'liam@ucla.edu',    '$2b$10$xNQKeVRQzHsaO/Y93I7FyusEmcK0yWtk800q2b.B3pXWUNEjqpuDy', 1, '2026-05-16T18:11:00.000Z', '2026-05-16T18:11:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  email = excluded.email,
  password_hash = excluded.password_hash,
  is_verified = excluded.is_verified,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO profiles (
  id, user_id, display_name, gender, graduation_year,
  budget_min, budget_max, move_in_date, bio, avatar_url,
  profile_completed, created_at, updated_at
) VALUES
  (1101, 1001, 'Alice Kim',    'female', 2027,  900, 1300, '2026-09-01', 'Clean, quiet UCLA junior looking for a compatible roommate near campus.', '/uploads/avatars/1001.svg', 1, '2026-05-16T18:15:00.000Z', '2026-05-16T18:15:00.000Z'),
  (1102, 1002, 'Bob Chen',     'male',   2026, 1100, 1500, '2026-08-20', 'Night-owl CS senior who cooks often and wants a laid-back roommate.', '/uploads/avatars/1002.svg', 1, '2026-05-16T18:16:00.000Z', '2026-05-16T18:16:00.000Z'),
  (1103, 1003, 'Carol Park',   'female', 2028,  800, 1200, '2026-09-15', 'Still finishing my profile while comparing Westwood apartments.', NULL, 0, '2026-05-16T18:17:00.000Z', '2026-05-16T18:17:00.000Z'),
  (1104, 1004, 'Daniel Lee',   'male',   2027,  950, 1350, '2026-09-01', 'Pre-med student, early riser, prefers a tidy and quiet home environment.', '/uploads/avatars/1004.svg', 1, '2026-05-16T18:18:00.000Z', '2026-05-16T18:18:00.000Z'),
  (1105, 1005, 'Eva Martinez', 'female', 2027,  900, 1300, '2026-09-01', 'Psych major who values calm weeknights and occasional movie nights in.', '/uploads/avatars/1005.svg', 1, '2026-05-16T18:19:00.000Z', '2026-05-16T18:19:00.000Z'),
  (1106, 1006, 'Frank Wu',     'male',   2028,  850, 1150, '2026-09-15', 'Engineering freshman, usually studies at Powell but keeps common areas neat.', '/uploads/avatars/1006.svg', 1, '2026-05-16T18:20:00.000Z', '2026-05-16T18:20:00.000Z'),
  (1107, 1007, 'Grace Nguyen', 'female', 2026, 1200, 1600, '2026-08-15', 'Grad student with a flexible schedule and a preference for organized shared spaces.', '/uploads/avatars/1007.svg', 1, '2026-05-16T18:21:00.000Z', '2026-05-16T18:21:00.000Z'),
  (1108, 1008, 'Henry Adams',  'male',   2025, 1400, 2000, '2026-07-01', 'MBA candidate targeting a larger place with room for guests on weekends.', '/uploads/avatars/1008.svg', 1, '2026-05-16T18:22:00.000Z', '2026-05-16T18:22:00.000Z'),
  (1109, 1009, 'Iris Patel',   'female', 2028,  700, 1000, '2026-10-01', 'Budget-conscious freshman open to a fun but respectful roommate dynamic.', '/uploads/avatars/1009.svg', 1, '2026-05-16T18:23:00.000Z', '2026-05-16T18:23:00.000Z'),
  (1110, 1010, 'Jake Morrison','male',   2027, 1000, 1400, '2026-09-01', 'Film student with a flexible sleep schedule and a love for late-night editing.', '/uploads/avatars/1010.svg', 1, '2026-05-16T18:24:00.000Z', '2026-05-16T18:24:00.000Z'),
  (1111, 1011, 'Kate Sullivan','female', 2026, 1100, 1500, '2026-08-20', 'Bio major looking for a two-bedroom split near campus with a responsible roommate.', '/uploads/avatars/1011.svg', 1, '2026-05-16T18:25:00.000Z', '2026-05-16T18:25:00.000Z'),
  (1112, 1012, 'Liam Ortiz',   'male',   2027,  850, 1250, '2026-09-10', 'Transfer student still exploring neighborhoods between Westwood and Sawtelle.', NULL, 1, '2026-05-16T18:26:00.000Z', '2026-05-16T18:26:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  display_name = excluded.display_name,
  gender = excluded.gender,
  graduation_year = excluded.graduation_year,
  budget_min = excluded.budget_min,
  budget_max = excluded.budget_max,
  move_in_date = excluded.move_in_date,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url,
  profile_completed = excluded.profile_completed,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO questionnaires (
  id, user_id,
  sleep_schedule, cleanliness_level, noise_tolerance, guest_policy,
  study_habits, smoking_preference, drinking_preference, sharing_preference,
  pet_comfort, communication_style,
  created_at, updated_at
) VALUES
  (5001, 1001, 'early_bird', 'very_clean', 'low', 'occasionally_ok', 'quiet_at_home', 'non_smoker_only', 'social_only', 'keep_separate', 'no_pets', 'direct_and_frequent', '2026-05-16T19:00:00.000Z', '2026-05-16T19:00:00.000Z'),
  (5002, 1002, 'flexible', 'clean', 'medium', 'occasionally_ok', 'flexible', 'non_smoker_only', 'social_only', 'flexible', 'okay_with_cats', 'casual', '2026-05-16T19:01:00.000Z', '2026-05-16T19:01:00.000Z'),
  (5004, 1004, 'early_bird', 'very_clean', 'low', 'occasionally_ok', 'quiet_at_home', 'non_smoker_only', 'social_only', 'keep_separate', 'no_pets', 'direct_and_frequent', '2026-05-16T19:02:00.000Z', '2026-05-16T19:02:00.000Z'),
  (5005, 1005, 'early_bird', 'very_clean', 'low', 'occasionally_ok', 'quiet_at_home', 'non_smoker_only', 'social_only', 'keep_separate', 'no_pets', 'casual', '2026-05-16T19:03:00.000Z', '2026-05-16T19:03:00.000Z'),
  (5006, 1006, 'flexible', 'moderate', 'medium', 'occasionally_ok', 'library_preferred', 'non_smoker_only', 'abstain', 'keep_separate', 'no_pets', 'minimal', '2026-05-16T19:04:00.000Z', '2026-05-16T19:04:00.000Z'),
  (5007, 1007, 'early_bird', 'very_clean', 'medium', 'often_ok', 'quiet_at_home', 'non_smoker_only', 'social_only', 'keep_separate', 'okay_with_cats', 'casual', '2026-05-16T19:05:00.000Z', '2026-05-16T19:05:00.000Z'),
  (5008, 1008, 'night_owl', 'moderate', 'high', 'often_ok', 'flexible', 'outside_ok', 'okay', 'shared_supplies_ok', 'okay_with_dogs', 'minimal', '2026-05-16T19:06:00.000Z', '2026-05-16T19:06:00.000Z'),
  (5009, 1009, 'night_owl', 'relaxed', 'high', 'often_ok', 'library_preferred', 'okay', 'okay', 'shared_supplies_ok', 'okay_all', 'minimal', '2026-05-16T19:07:00.000Z', '2026-05-16T19:07:00.000Z'),
  (5010, 1010, 'night_owl', 'relaxed', 'high', 'often_ok', 'flexible', 'outside_ok', 'social_only', 'flexible', 'okay_with_dogs', 'minimal', '2026-05-16T19:08:00.000Z', '2026-05-16T19:08:00.000Z'),
  (5011, 1011, 'early_bird', 'clean', 'low', 'occasionally_ok', 'quiet_at_home', 'non_smoker_only', 'social_only', 'flexible', 'no_pets', 'casual', '2026-05-16T19:09:00.000Z', '2026-05-16T19:09:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  sleep_schedule = excluded.sleep_schedule,
  cleanliness_level = excluded.cleanliness_level,
  noise_tolerance = excluded.noise_tolerance,
  guest_policy = excluded.guest_policy,
  study_habits = excluded.study_habits,
  smoking_preference = excluded.smoking_preference,
  drinking_preference = excluded.drinking_preference,
  sharing_preference = excluded.sharing_preference,
  pet_comfort = excluded.pet_comfort,
  communication_style = excluded.communication_style,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO compatibility_scores (id, user_id, other_user_id, score_percent, calculated_at) VALUES
  (8001, 1001, 1002, 55, '2026-05-16T19:30:00.000Z'),
  (8002, 1002, 1001, 55, '2026-05-16T19:30:00.000Z'),
  (8003, 1001, 1004, 100, '2026-05-16T19:30:00.000Z'),
  (8004, 1004, 1001, 100, '2026-05-16T19:30:00.000Z'),
  (8005, 1001, 1005, 95, '2026-05-16T19:30:00.000Z'),
  (8006, 1005, 1001, 95, '2026-05-16T19:30:00.000Z'),
  (8007, 1001, 1006, 65, '2026-05-16T19:30:00.000Z'),
  (8008, 1006, 1001, 65, '2026-05-16T19:30:00.000Z'),
  (8009, 1001, 1007, 70, '2026-05-16T19:30:00.000Z'),
  (8010, 1007, 1001, 70, '2026-05-16T19:30:00.000Z'),
  (8011, 1001, 1008, 30, '2026-05-16T19:30:00.000Z'),
  (8012, 1008, 1001, 30, '2026-05-16T19:30:00.000Z'),
  (8013, 1001, 1009, 30, '2026-05-16T19:30:00.000Z'),
  (8014, 1009, 1001, 30, '2026-05-16T19:30:00.000Z'),
  (8015, 1001, 1010, 35, '2026-05-16T19:30:00.000Z'),
  (8016, 1010, 1001, 35, '2026-05-16T19:30:00.000Z'),
  (8017, 1001, 1011, 85, '2026-05-16T19:30:00.000Z'),
  (8018, 1011, 1001, 85, '2026-05-16T19:30:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  other_user_id = excluded.other_user_id,
  score_percent = excluded.score_percent,
  calculated_at = excluded.calculated_at;

INSERT INTO user_housing_links (id, user_id, housing_unit_id, linked_at, updated_at) VALUES
  (9001, 1002, (SELECT id FROM housing_units WHERE external_id = '5XryM8-2bd'), '2026-05-16T20:00:00.000Z', '2026-05-16T20:00:00.000Z'),
  (9002, 1004, (SELECT id FROM housing_units WHERE external_id = '945-gayley-1bd'), '2026-05-16T20:01:00.000Z', '2026-05-16T20:01:00.000Z'),
  (9003, 1005, (SELECT id FROM housing_units WHERE external_id = 'westwood-riviera-studio'), '2026-05-16T20:02:00.000Z', '2026-05-16T20:02:00.000Z'),
  (9004, 1006, (SELECT id FROM housing_units WHERE external_id = 'kelton-307'), '2026-05-16T20:03:00.000Z', '2026-05-16T20:03:00.000Z'),
  (9005, 1007, (SELECT id FROM housing_units WHERE external_id = '10798-lindbrook'), '2026-05-16T20:04:00.000Z', '2026-05-16T20:04:00.000Z'),
  (9006, 1008, (SELECT id FROM housing_units WHERE external_id = '1260-veteran-317'), '2026-05-16T20:05:00.000Z', '2026-05-16T20:05:00.000Z'),
  -- Kate intentionally shares Bob's housing link so the map demo shows multiple users on one marker.
  (9007, 1011, (SELECT id FROM housing_units WHERE external_id = '5XryM8-2bd'), '2026-05-16T20:06:00.000Z', '2026-05-16T20:06:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  housing_unit_id = excluded.housing_unit_id,
  linked_at = excluded.linked_at,
  updated_at = excluded.updated_at;

INSERT INTO favorites (id, user_id, target_user_id, created_at) VALUES
  (6001, 1001, 1004, '2026-05-16T21:00:00.000Z'),
  (6002, 1001, 1005, '2026-05-16T21:01:00.000Z'),
  (6003, 1001, 1011, '2026-05-16T21:02:00.000Z'),
  (6004, 1004, 1001, '2026-05-16T21:03:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  target_user_id = excluded.target_user_id,
  created_at = excluded.created_at;

INSERT INTO notifications (
  id, user_id, type, title, body,
  reference_type, reference_id, is_read, created_at, read_at
) VALUES
  (
    7001, 1001, 'new_message', 'New message from Bob Chen',
    'Let me know when you have a few minutes to compare options.',
    'conversation', 2001, 0, '2026-05-16T18:30:00.000Z', NULL
  ),
  (
    7002, 1001, 'high_match', 'New high-match roommate',
    'Daniel Lee is a 100% compatibility match.',
    'profile', 1004, 0, '2026-05-16T19:31:00.000Z', NULL
  ),
  (
    7003, 1001, 'favorite_added', 'Someone saved your profile',
    'Daniel Lee added you to their favorites.',
    'profile', 1004, 1, '2026-05-16T21:03:00.000Z', '2026-05-16T21:10:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  type = excluded.type,
  title = excluded.title,
  body = excluded.body,
  reference_type = excluded.reference_type,
  reference_id = excluded.reference_id,
  is_read = excluded.is_read,
  created_at = excluded.created_at,
  read_at = excluded.read_at;

INSERT INTO conversations (id, created_at, updated_at) VALUES
  (2001, '2026-05-16T18:10:00.000Z', '2026-05-16T18:30:00.000Z'),
  (2002, '2026-05-16T18:32:00.000Z', '2026-05-16T18:42:00.000Z'),
  (2003, '2026-05-16T19:40:00.000Z', '2026-05-16T19:45:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

INSERT INTO messages (id, conversation_id, sender_user_id, body, created_at) VALUES
  (3001, 2001, 1001, 'Hey Bob, are you still looking for a roommate in Westwood?', '2026-05-16T18:11:00.000Z'),
  (3002, 2001, 1002, 'Yes, I am. What budget range are you considering?', '2026-05-16T18:12:00.000Z'),
  (3003, 2001, 1002, 'I am usually around campus on weekdays if you want to chat.', '2026-05-16T18:20:00.000Z'),
  (3004, 2001, 1002, 'Also, do you have a preference between Westwood and Palms?', '2026-05-16T18:25:00.000Z'),
  (3005, 2001, 1002, 'Let me know when you have a few minutes to compare options.', '2026-05-16T18:30:00.000Z'),
  (3101, 2002, 1003, 'Hi Alice! I saw your profile and we have similar move-in timing.', '2026-05-16T18:33:00.000Z'),
  (3102, 2002, 1001, 'Hey Carol! Yes, I am targeting early September. What is your budget?', '2026-05-16T18:35:00.000Z'),
  (3103, 2002, 1003, 'Around 800 to 1200. Are you open to a two-bedroom split?', '2026-05-16T18:40:00.000Z'),
  (3104, 2002, 1003, 'I can also send you a couple of listings I have been tracking.', '2026-05-16T18:42:00.000Z'),
  (3201, 2003, 1004, 'Hi Alice! We are a 100% lifestyle match — want to compare the Gayley listing?', '2026-05-16T19:41:00.000Z'),
  (3202, 2003, 1001, 'Hey Daniel! Yes, that place looks great. Are you free to tour this week?', '2026-05-16T19:43:00.000Z'),
  (3203, 2003, 1004, 'Thursday afternoon works for me. I can send the listing link too.', '2026-05-16T19:45:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  conversation_id = excluded.conversation_id,
  sender_user_id = excluded.sender_user_id,
  body = excluded.body,
  created_at = excluded.created_at;

INSERT INTO conversation_participants (
  id, conversation_id, user_id, last_read_message_id, joined_at
) VALUES
  (4001, 2001, 1001, 3002, '2026-05-16T18:10:00.000Z'),
  (4002, 2001, 1002, 3005, '2026-05-16T18:10:00.000Z'),
  (4003, 2002, 1001, 3104, '2026-05-16T18:32:00.000Z'),
  (4004, 2002, 1003, 3104, '2026-05-16T18:32:00.000Z'),
  (4005, 2003, 1001, 3203, '2026-05-16T19:40:00.000Z'),
  (4006, 2003, 1004, 3203, '2026-05-16T19:40:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  conversation_id = excluded.conversation_id,
  user_id = excluded.user_id,
  last_read_message_id = excluded.last_read_message_id,
  joined_at = excluded.joined_at;

COMMIT;
