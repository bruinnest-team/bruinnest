const ValidationError = require("../errors/ValidationError");
const {
  isPlainObject,
  requirePositiveInteger,
  requireNonNegativeInteger,
} = require("./commonValidation");

function hasQueryValue(value) {
  return value !== undefined && value !== null;
}

function isEmptyOptionalQueryValue(value) {
  return typeof value === "string" && value.trim().length === 0;
}

function addOptionalStringFilter(normalizedQuery, query, fieldName) {
  if (!hasQueryValue(query[fieldName])) {
    return;
  }

  if (typeof query[fieldName] !== "string") {
    throw new ValidationError(`${fieldName} must be a string.`);
  }

  const trimmedValue = query[fieldName].trim();

  if (trimmedValue.length > 0) {
    normalizedQuery[fieldName] = trimmedValue;
  }
}

function addOptionalNonNegativeIntegerFilter(normalizedQuery, query, fieldName) {
  if (
    !hasQueryValue(query[fieldName]) ||
    isEmptyOptionalQueryValue(query[fieldName])
  ) {
    return;
  }

  normalizedQuery[fieldName] = requireNonNegativeInteger(
    query[fieldName],
    fieldName
  );
}

function normalizeHousingSearchQuery(query = {}) {
  if (!isPlainObject(query)) {
    throw new ValidationError("Housing query must be an object.");
  }

  const page =
    query.page === undefined ? 1 : requirePositiveInteger(query.page, "page");
  const pageSize =
    query.pageSize === undefined
      ? 10
      : requirePositiveInteger(query.pageSize, "pageSize");

  const normalizedQuery = {
    page,
    pageSize,
  };

  addOptionalStringFilter(normalizedQuery, query, "q");
  addOptionalStringFilter(normalizedQuery, query, "neighborhood");
  addOptionalNonNegativeIntegerFilter(normalizedQuery, query, "budgetMin");
  addOptionalNonNegativeIntegerFilter(normalizedQuery, query, "budgetMax");
  addOptionalNonNegativeIntegerFilter(normalizedQuery, query, "bedrooms");

  if (
    normalizedQuery.budgetMin !== undefined &&
    normalizedQuery.budgetMax !== undefined &&
    normalizedQuery.budgetMax < normalizedQuery.budgetMin
  ) {
    throw new ValidationError(
      "budgetMax must be greater than or equal to budgetMin."
    );
  }

  return normalizedQuery;
}

function requireHousingLinkPayload(body) {
  if (!isPlainObject(body)) {
    throw new ValidationError("Housing link payload must be an object.");
  }

  return {
    housingUnitId: requirePositiveInteger(
      body.housingUnitId,
      "housingUnitId"
    ),
  };
}

module.exports = {
  normalizeHousingSearchQuery,
  requireHousingLinkPayload,
  requirePositiveInteger,
};
