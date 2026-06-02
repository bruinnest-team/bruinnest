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

module.exports = {
  findHousingByExternalId,
  upsertHousingUnit,
  upsertHousingUnits,
};
