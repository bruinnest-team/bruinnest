const db = require("../config/db");

const timestampExpression = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

const findByUserIdStatement = db.prepare(`
  SELECT
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
  FROM profiles
  WHERE user_id = ?
`);

const createProfileStatement = db.prepare(`
  INSERT INTO profiles (
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
  ) VALUES (
    @userId,
    @displayName,
    @gender,
    @graduationYear,
    @budgetMin,
    @budgetMax,
    @moveInDate,
    @bio,
    @profileCompleted,
    ${timestampExpression},
    ${timestampExpression}
  )
`);

const findPublicProfileByUserIdStatement = db.prepare(`
  SELECT
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
  FROM profiles
  WHERE user_id = ?
    AND profile_completed = 1
`);

function mapProfileRow(row) {
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
    bio: row.bio,
    profileCompleted: row.profile_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildSearchFilters({
  currentUserId,
  gender,
  graduationYear,
  budgetMin,
  budgetMax,
  moveInDate,
  keyword,
}) {
  const conditions = ["profile_completed = 1"];
  const params = {};

  if (currentUserId !== undefined && currentUserId !== null) {
    conditions.push("user_id != @currentUserId");
    params.currentUserId = currentUserId;
  }

  if (gender) {
    conditions.push("gender = @gender");
    params.gender = gender;
  }

  if (graduationYear !== undefined && graduationYear !== null) {
    conditions.push("graduation_year = @graduationYear");
    params.graduationYear = graduationYear;
  }

  if (budgetMin !== undefined && budgetMin !== null) {
    conditions.push("budget_min >= @budgetMin");
    params.budgetMin = budgetMin;
  }

  if (budgetMax !== undefined && budgetMax !== null) {
    conditions.push("budget_max <= @budgetMax");
    params.budgetMax = budgetMax;
  }

  if (moveInDate) {
    conditions.push("move_in_date = @moveInDate");
    params.moveInDate = moveInDate;
  }

  if (keyword) {
    conditions.push("(display_name LIKE @keyword OR bio LIKE @keyword)");
    params.keyword = `%${keyword}%`;
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    params,
  };
}

function findByUserId(userId) {
  return mapProfileRow(findByUserIdStatement.get(userId));
}

function createProfile({
  userId,
  displayName,
  gender,
  graduationYear,
  budgetMin,
  budgetMax,
  moveInDate,
  bio,
  profileCompleted = false,
}) {
  createProfileStatement.run({
    userId,
    displayName,
    gender,
    graduationYear,
    budgetMin,
    budgetMax,
    moveInDate,
    bio,
    profileCompleted: profileCompleted ? 1 : 0,
  });

  return findByUserId(userId);
}

function updateProfile(
  userId,
  {
    displayName,
    gender,
    graduationYear,
    budgetMin,
    budgetMax,
    moveInDate,
    bio,
    profileCompleted = false,
  }
) {
  const statement = db.prepare(`
    UPDATE profiles
    SET
      display_name = @displayName,
      gender = @gender,
      graduation_year = @graduationYear,
      budget_min = @budgetMin,
      budget_max = @budgetMax,
      move_in_date = @moveInDate,
      bio = @bio,
      profile_completed = @profileCompleted,
      updated_at = ${timestampExpression}
    WHERE user_id = @userId
  `);

  statement.run({
    userId,
    displayName,
    gender,
    graduationYear,
    budgetMin,
    budgetMax,
    moveInDate,
    bio,
    profileCompleted: profileCompleted ? 1 : 0,
  });

  return findByUserId(userId);
}

function searchProfiles({
  currentUserId,
  page = 1,
  pageSize = 10,
  gender,
  graduationYear,
  budgetMin,
  budgetMax,
  moveInDate,
  keyword,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const offset = (safePage - 1) * safePageSize;

  const { whereClause, params } = buildSearchFilters({
    currentUserId,
    gender,
    graduationYear,
    budgetMin,
    budgetMax,
    moveInDate,
    keyword,
  });

  const itemsStatement = db.prepare(`
    SELECT
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
    FROM profiles
    ${whereClause}
    ORDER BY updated_at DESC, user_id ASC
    LIMIT @limit OFFSET @offset
  `);

  const totalStatement = db.prepare(`
    SELECT COUNT(*) AS total
    FROM profiles
    ${whereClause}
  `);

  const queryParams = {
    ...params,
    limit: safePageSize,
    offset,
  };

  const items = itemsStatement.all(queryParams).map(mapProfileRow);
  const total = totalStatement.get(params).total;

  return {
    items,
    page: safePage,
    pageSize: safePageSize,
    total,
  };
}

function findPublicProfileByUserId(userId) {
  return mapProfileRow(findPublicProfileByUserIdStatement.get(userId));
}

module.exports = {
  findByUserId,
  createProfile,
  updateProfile,
  searchProfiles,
  findPublicProfileByUserId,
};
