const ValidationError = require("../errors/ValidationError");

const INTEGER_PATTERN = /^[+-]?\d+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseInteger(value, message) {
  if (value === null || value === undefined || typeof value === "boolean") {
    throw new ValidationError(message);
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new ValidationError(message);
    }

    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!INTEGER_PATTERN.test(trimmedValue)) {
      throw new ValidationError(message);
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isSafeInteger(parsedValue)) {
      throw new ValidationError(message);
    }

    return parsedValue;
  }

  throw new ValidationError(message);
}

function requirePositiveInteger(value, fieldName) {
  const message = `${fieldName} must be a positive integer.`;
  const parsedValue = parseInteger(value, message);

  if (parsedValue <= 0) {
    throw new ValidationError(message);
  }

  return parsedValue;
}

function requireNonEmptyString(value, message) {
  if (typeof value !== "string") {
    throw new ValidationError(message);
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    throw new ValidationError(message);
  }

  return trimmedValue;
}

function parseGraduationYear(value) {
  const message =
    "graduationYear must be an integer greater than or equal to 2000.";
  const graduationYear = parseInteger(value, message);

  if (graduationYear < 2000) {
    throw new ValidationError(message);
  }

  return graduationYear;
}

function parseBudgetMin(value) {
  const message = "budgetMin must be a non-negative integer.";
  const budgetMin = parseInteger(value, message);

  if (budgetMin < 0) {
    throw new ValidationError(message);
  }

  return budgetMin;
}

function parseBudgetMax(value, budgetMin = 0) {
  const message = "budgetMax must be greater than or equal to budgetMin.";
  const budgetMax = parseInteger(value, message);

  if (budgetMax < budgetMin) {
    throw new ValidationError(message);
  }

  return budgetMax;
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidDateString(value) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth[month - 1]
  );
}

function parseMoveInDate(value) {
  const message = "moveInDate must use YYYY-MM-DD format.";

  if (typeof value !== "string") {
    throw new ValidationError(message);
  }

  const moveInDate = value.trim();

  if (!isValidDateString(moveInDate)) {
    throw new ValidationError(message);
  }

  return moveInDate;
}

function requireProfilePayload(body) {
  if (!isPlainObject(body)) {
    throw new ValidationError("Profile payload must be an object.");
  }

  const displayName = requireNonEmptyString(
    body.displayName,
    "displayName is required."
  );
  const gender = requireNonEmptyString(body.gender, "gender is required.");
  const graduationYear = parseGraduationYear(body.graduationYear);
  const budgetMin = parseBudgetMin(body.budgetMin);
  const budgetMax = parseBudgetMax(body.budgetMax, budgetMin);
  const moveInDate = parseMoveInDate(body.moveInDate);
  const bio = requireNonEmptyString(body.bio, "bio is required.");

  return {
    displayName,
    gender,
    graduationYear,
    budgetMin,
    budgetMax,
    moveInDate,
    bio,
    profileCompleted: true,
  };
}

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

function normalizeProfileQuery(query = {}) {
  if (!isPlainObject(query)) {
    throw new ValidationError("Profile query must be an object.");
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

  addOptionalStringFilter(normalizedQuery, query, "gender");
  addOptionalStringFilter(normalizedQuery, query, "keyword");

  if (
    hasQueryValue(query.graduationYear) &&
    !isEmptyOptionalQueryValue(query.graduationYear)
  ) {
    normalizedQuery.graduationYear = parseGraduationYear(query.graduationYear);
  }

  if (
    hasQueryValue(query.budgetMin) &&
    !isEmptyOptionalQueryValue(query.budgetMin)
  ) {
    normalizedQuery.budgetMin = parseBudgetMin(query.budgetMin);
  }

  if (
    hasQueryValue(query.budgetMax) &&
    !isEmptyOptionalQueryValue(query.budgetMax)
  ) {
    normalizedQuery.budgetMax = parseBudgetMax(
      query.budgetMax,
      normalizedQuery.budgetMin
    );
  }

  if (
    hasQueryValue(query.moveInDate) &&
    !isEmptyOptionalQueryValue(query.moveInDate)
  ) {
    normalizedQuery.moveInDate = parseMoveInDate(query.moveInDate);
  }

  return normalizedQuery;
}

module.exports = {
  requireProfilePayload,
  normalizeProfileQuery,
  requirePositiveInteger,
};
