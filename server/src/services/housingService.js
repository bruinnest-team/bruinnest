const housingRepository = require("../repositories/housingRepository");
const NotFoundError = require("../errors/NotFoundError");
const { nowISO } = require("../utils/time");
const {
  normalizeHousingSearchQuery,
  requireHousingLinkPayload,
  requirePositiveInteger,
} = require("../validations/housingValidation");

function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function requireNumber(value, fieldName) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a number.`);
  }

  return value;
}

function requireInteger(value, fieldName) {
  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer.`);
  }

  return value;
}

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalInteger(value, fieldName) {
  if (value === null || value === undefined) {
    return null;
  }

  return requireInteger(value, fieldName);
}

function normalizePhotoUrls(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((photoUrl) => typeof photoUrl === "string" && photoUrl.trim().length > 0);
}

function normalizeListing(listing, sourceFallback, timestamp) {
  return {
    externalId: requireText(listing.external_id, "external_id"),
    source: requireText(listing.source || sourceFallback, "source"),
    name: requireText(listing.name, "name"),
    addressLine: requireText(listing.address_line, "address_line"),
    city: requireText(listing.city, "city"),
    state: requireText(listing.state, "state"),
    zip: requireText(listing.zip, "zip"),
    neighborhood: normalizeOptionalText(listing.neighborhood),
    lat: requireNumber(listing.lat, "lat"),
    lng: requireNumber(listing.lng, "lng"),
    monthlyRent: requireInteger(listing.monthly_rent, "monthly_rent"),
    bedrooms: requireInteger(listing.bedrooms, "bedrooms"),
    bathrooms: requireNumber(listing.bathrooms, "bathrooms"),
    sqft: normalizeOptionalInteger(listing.sqft, "sqft"),
    propertyType: requireText(listing.property_type, "property_type"),
    listingUrl: requireText(listing.listing_url, "listing_url"),
    photoUrlsJson: JSON.stringify(normalizePhotoUrls(listing.photos)),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function importHousingCatalog(listings, options = {}) {
  if (!Array.isArray(listings)) {
    throw new Error("Housing import data must include a listings array.");
  }

  const timestamp = nowISO();
  const payloads = listings.map((listing) =>
    normalizeListing(listing, options.source, timestamp)
  );
  const results = housingRepository.upsertHousingUnits(payloads);
  const createdCount = results.filter((result) => result.created).length;

  return {
    total: results.length,
    created: createdCount,
    updated: results.length - createdCount,
  };
}

function toHousingCard(housingUnit) {
  return {
    housingUnitId: housingUnit.housingUnitId,
    externalId: housingUnit.externalId,
    name: housingUnit.name,
    addressLine: housingUnit.addressLine,
    city: housingUnit.city,
    state: housingUnit.state,
    zip: housingUnit.zip,
    neighborhood: housingUnit.neighborhood,
    monthlyRent: housingUnit.monthlyRent,
    bedrooms: housingUnit.bedrooms,
    bathrooms: housingUnit.bathrooms,
    lat: housingUnit.lat,
    lng: housingUnit.lng,
    photoUrls: housingUnit.photoUrls,
    listingUrl: housingUnit.listingUrl,
  };
}

function searchHousing(query) {
  const normalizedQuery = normalizeHousingSearchQuery(query);
  const result = housingRepository.searchHousing(normalizedQuery);

  return {
    items: result.items.map(toHousingCard),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };
}

function getMyLinkedHousing(currentUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const linkedHousing = housingRepository.findLinkedHousingForUser(userId);

  if (!linkedHousing) {
    throw new NotFoundError("Linked housing not found.");
  }

  return toHousingCard(linkedHousing);
}

function getLinkedHousingForUser(targetUserId) {
  const userId = requirePositiveInteger(targetUserId, "targetUserId");
  const linkedHousing = housingRepository.findLinkedHousingForUser(userId);

  return linkedHousing ? toHousingCard(linkedHousing) : null;
}

function linkMyHousing(currentUserId, body) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");
  const { housingUnitId } = requireHousingLinkPayload(body);
  const housingUnit = housingRepository.findHousingById(housingUnitId);

  if (!housingUnit) {
    throw new NotFoundError("Housing unit not found.");
  }

  const timestamp = nowISO();
  housingRepository.linkHousingToUser({
    userId,
    housingUnitId,
    linkedAt: timestamp,
    updatedAt: timestamp,
  });

  return {
    housingUnitId,
    linked: true,
  };
}

function unlinkMyHousing(currentUserId) {
  const userId = requirePositiveInteger(currentUserId, "currentUserId");

  housingRepository.unlinkHousingForUser(userId);

  return {
    linked: false,
  };
}

module.exports = {
  importHousingCatalog,
  searchHousing,
  getMyLinkedHousing,
  getLinkedHousingForUser,
  linkMyHousing,
  unlinkMyHousing,
};
