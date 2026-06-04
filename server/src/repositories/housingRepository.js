const db = require("../config/db");

const findByExternalIdStatement = db.prepare(`
  SELECT
    id,
    external_id,
    source,
    name,
    address_line,
    city,
    state,
    zip,
    neighborhood,
    lat,
    lng,
    monthly_rent,
    bedrooms,
    bathrooms,
    sqft,
    property_type,
    listing_url,
    photo_urls_json,
    created_at,
    updated_at
  FROM housing_units
  WHERE external_id = ?
`);

const findByIdStatement = db.prepare(`
  SELECT
    id,
    external_id,
    source,
    name,
    address_line,
    city,
    state,
    zip,
    neighborhood,
    lat,
    lng,
    monthly_rent,
    bedrooms,
    bathrooms,
    sqft,
    property_type,
    listing_url,
    photo_urls_json,
    created_at,
    updated_at
  FROM housing_units
  WHERE id = ?
`);

const findLinkedHousingForUserStatement = db.prepare(`
  SELECT
    h.id,
    h.external_id,
    h.source,
    h.name,
    h.address_line,
    h.city,
    h.state,
    h.zip,
    h.neighborhood,
    h.lat,
    h.lng,
    h.monthly_rent,
    h.bedrooms,
    h.bathrooms,
    h.sqft,
    h.property_type,
    h.listing_url,
    h.photo_urls_json,
    h.created_at,
    h.updated_at
  FROM user_housing_links AS l
  JOIN housing_units AS h ON h.id = l.housing_unit_id
  WHERE l.user_id = ?
`);

const linkHousingToUserStatement = db.prepare(`
  INSERT INTO user_housing_links (
    user_id,
    housing_unit_id,
    linked_at,
    updated_at
  ) VALUES (
    @userId,
    @housingUnitId,
    @linkedAt,
    @updatedAt
  )
  ON CONFLICT(user_id) DO UPDATE SET
    housing_unit_id = excluded.housing_unit_id,
    linked_at = excluded.linked_at,
    updated_at = excluded.updated_at
`);

const unlinkHousingForUserStatement = db.prepare(`
  DELETE FROM user_housing_links
  WHERE user_id = ?
`);

const upsertHousingUnitStatement = db.prepare(`
  INSERT INTO housing_units (
    external_id,
    source,
    name,
    address_line,
    city,
    state,
    zip,
    neighborhood,
    lat,
    lng,
    monthly_rent,
    bedrooms,
    bathrooms,
    sqft,
    property_type,
    listing_url,
    photo_urls_json,
    created_at,
    updated_at
  ) VALUES (
    @externalId,
    @source,
    @name,
    @addressLine,
    @city,
    @state,
    @zip,
    @neighborhood,
    @lat,
    @lng,
    @monthlyRent,
    @bedrooms,
    @bathrooms,
    @sqft,
    @propertyType,
    @listingUrl,
    @photoUrlsJson,
    @createdAt,
    @updatedAt
  )
  ON CONFLICT(external_id) DO UPDATE SET
    source = excluded.source,
    name = excluded.name,
    address_line = excluded.address_line,
    city = excluded.city,
    state = excluded.state,
    zip = excluded.zip,
    neighborhood = excluded.neighborhood,
    lat = excluded.lat,
    lng = excluded.lng,
    monthly_rent = excluded.monthly_rent,
    bedrooms = excluded.bedrooms,
    bathrooms = excluded.bathrooms,
    sqft = excluded.sqft,
    property_type = excluded.property_type,
    listing_url = excluded.listing_url,
    photo_urls_json = excluded.photo_urls_json,
    updated_at = excluded.updated_at
`);

function mapHousingRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    housingUnitId: row.id,
    externalId: row.external_id,
    source: row.source,
    name: row.name,
    addressLine: row.address_line,
    city: row.city,
    state: row.state,
    zip: row.zip,
    neighborhood: row.neighborhood,
    lat: row.lat,
    lng: row.lng,
    monthlyRent: row.monthly_rent,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqft: row.sqft,
    propertyType: row.property_type,
    listingUrl: row.listing_url,
    photoUrls: JSON.parse(row.photo_urls_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function findHousingByExternalId(externalId) {
  return mapHousingRow(findByExternalIdStatement.get(externalId));
}

function findHousingById(housingUnitId) {
  return mapHousingRow(findByIdStatement.get(housingUnitId));
}

function buildHousingSearchFilters({
  q,
  neighborhood,
  budgetMin,
  budgetMax,
  bedrooms,
}) {
  const conditions = [];
  const params = {};

  if (q) {
    conditions.push(
      "(name LIKE @q OR address_line LIKE @q OR neighborhood LIKE @q OR city LIKE @q OR zip LIKE @q)"
    );
    params.q = `%${q}%`;
  }

  if (neighborhood) {
    conditions.push("neighborhood COLLATE NOCASE = @neighborhood");
    params.neighborhood = neighborhood;
  }

  if (budgetMin !== undefined && budgetMin !== null) {
    conditions.push("monthly_rent >= @budgetMin");
    params.budgetMin = budgetMin;
  }

  if (budgetMax !== undefined && budgetMax !== null) {
    conditions.push("monthly_rent <= @budgetMax");
    params.budgetMax = budgetMax;
  }

  if (bedrooms !== undefined && bedrooms !== null) {
    conditions.push("bedrooms = @bedrooms");
    params.bedrooms = bedrooms;
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

function searchHousing({
  page = 1,
  pageSize = 10,
  q,
  neighborhood,
  budgetMin,
  budgetMax,
  bedrooms,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const offset = (safePage - 1) * safePageSize;
  const { whereClause, params } = buildHousingSearchFilters({
    q,
    neighborhood,
    budgetMin,
    budgetMax,
    bedrooms,
  });

  const itemsStatement = db.prepare(`
    SELECT
      id,
      external_id,
      source,
      name,
      address_line,
      city,
      state,
      zip,
      neighborhood,
      lat,
      lng,
      monthly_rent,
      bedrooms,
      bathrooms,
      sqft,
      property_type,
      listing_url,
      photo_urls_json,
      created_at,
      updated_at
    FROM housing_units
    ${whereClause}
    ORDER BY monthly_rent ASC, id ASC
    LIMIT @limit OFFSET @offset
  `);

  const totalStatement = db.prepare(`
    SELECT COUNT(*) AS total
    FROM housing_units
    ${whereClause}
  `);

  const queryParams = {
    ...params,
    limit: safePageSize,
    offset,
  };

  return {
    items: itemsStatement.all(queryParams).map(mapHousingRow),
    page: safePage,
    pageSize: safePageSize,
    total: totalStatement.get(params).total,
  };
}

function upsertHousingUnit(payload) {
  const existingHousing = findHousingByExternalId(payload.externalId);

  upsertHousingUnitStatement.run(payload);

  return {
    housingUnit: findHousingByExternalId(payload.externalId),
    created: !existingHousing,
  };
}

const upsertHousingUnits = db.transaction((payloads) => {
  return payloads.map(upsertHousingUnit);
});

function findLinkedHousingForUser(userId) {
  return mapHousingRow(findLinkedHousingForUserStatement.get(userId));
}

function linkHousingToUser({ userId, housingUnitId, linkedAt, updatedAt }) {
  linkHousingToUserStatement.run({
    userId,
    housingUnitId,
    linkedAt,
    updatedAt,
  });

  return findLinkedHousingForUser(userId);
}

function unlinkHousingForUser(userId) {
  return unlinkHousingForUserStatement.run(userId);
}

function buildMapCandidatesFilters({
  currentUserId,
  budgetMin,
  budgetMax,
  bedrooms,
  minCompatibilityScore,
}) {
  const conditions = [
    "p.profile_completed = 1",
    "p.user_id != @currentUserId",
    "h.lat IS NOT NULL",
    "h.lng IS NOT NULL",
  ];
  const params = { currentUserId };

  if (budgetMin !== undefined && budgetMin !== null) {
    conditions.push("p.budget_min >= @budgetMin");
    params.budgetMin = budgetMin;
  }

  if (budgetMax !== undefined && budgetMax !== null) {
    conditions.push("p.budget_max <= @budgetMax");
    params.budgetMax = budgetMax;
  }

  if (bedrooms !== undefined && bedrooms !== null) {
    conditions.push("h.bedrooms = @bedrooms");
    params.bedrooms = bedrooms;
  }

  if (
    minCompatibilityScore !== undefined &&
    minCompatibilityScore !== null
  ) {
    conditions.push("cs.score_percent >= @minCompatibilityScore");
    params.minCompatibilityScore = minCompatibilityScore;
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    params,
  };
}

function mapMapCandidateRow(row) {
  if (!row) return null;

  return {
    userId: row.user_id,
    displayName: row.display_name,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    compatibilityScore: row.compatibility_score,
    housingUnitId: row.housing_unit_id,
    housingName: row.housing_name,
    housingAddressLine: row.housing_address_line,
    housingMonthlyRent: row.housing_monthly_rent,
    housingBedrooms: row.housing_bedrooms,
    housingBathrooms: row.housing_bathrooms,
    housingLat: row.housing_lat,
    housingLng: row.housing_lng,
  };
}

function listMapCandidates(currentUserId, filters = {}) {
  const { whereClause, params } = buildMapCandidatesFilters({
    currentUserId,
    ...filters,
  });

  const statement = db.prepare(`
    SELECT
      p.user_id,
      p.display_name,
      p.budget_min,
      p.budget_max,
      h.id AS housing_unit_id,
      h.name AS housing_name,
      h.address_line AS housing_address_line,
      h.monthly_rent AS housing_monthly_rent,
      h.bedrooms AS housing_bedrooms,
      h.bathrooms AS housing_bathrooms,
      h.lat AS housing_lat,
      h.lng AS housing_lng,
      cs.score_percent AS compatibility_score
    FROM profiles AS p
    INNER JOIN user_housing_links AS l ON p.user_id = l.user_id
    INNER JOIN housing_units AS h ON l.housing_unit_id = h.id
    LEFT JOIN compatibility_scores AS cs
      ON cs.user_id = @currentUserId AND cs.other_user_id = p.user_id
    ${whereClause}
    ORDER BY
      CASE WHEN cs.score_percent IS NULL THEN 1 ELSE 0 END,
      cs.score_percent DESC,
      p.user_id ASC
  `);

  return statement.all(params).map(mapMapCandidateRow).filter(Boolean);
}

module.exports = {
  searchHousing,
  findHousingById,
  findHousingByExternalId,
  upsertHousingUnit,
  upsertHousingUnits,
  findLinkedHousingForUser,
  linkHousingToUser,
  unlinkHousingForUser,
  listMapCandidates,
};
