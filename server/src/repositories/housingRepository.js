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

module.exports = {
  searchHousing,
  findHousingById,
  findHousingByExternalId,
  upsertHousingUnit,
  upsertHousingUnits,
  findLinkedHousingForUser,
  linkHousingToUser,
  unlinkHousingForUser,
};
