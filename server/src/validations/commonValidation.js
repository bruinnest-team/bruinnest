const ValidationError = require("../errors/ValidationError");

const INTEGER_PATTERN = /^[+-]?\d+$/;

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

function requireNonNegativeInteger(value, fieldName) {
  const message = `${fieldName} must be a non-negative integer.`;
  const parsedValue = parseInteger(value, message);

  if (parsedValue < 0) {
    throw new ValidationError(message);
  }

  return parsedValue;
}

function optionalNonNegativeInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requireNonNegativeInteger(value, fieldName);
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

module.exports = {
  isPlainObject,
  parseInteger,
  requirePositiveInteger,
  requireNonNegativeInteger,
  optionalNonNegativeInteger,
  requireNonEmptyString,
};
