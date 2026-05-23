const ValidationError = require("../errors/ValidationError");

const MAX_BODY_LENGTH = 5000;

function requirePositiveInteger(value, fieldName) {
  const numberValue = Number(value);

  if (
    typeof value === "boolean" ||
    !Number.isInteger(numberValue) ||
    numberValue <= 0
  ) {
    throw new ValidationError(`${fieldName} must be a positive integer.`);
  }

  return numberValue;
}

function optionalNonNegativeInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative integer.`);
  }

  return numberValue;
}

function requireMessageBody(value) {
  if (typeof value !== "string") {
    throw new ValidationError("Message body is required.");
  }

  const body = value.trim();

  if (!body) {
    throw new ValidationError("Message body cannot be empty.");
  }

  if (body.length > MAX_BODY_LENGTH) {
    throw new ValidationError(
      `Message body must be ${MAX_BODY_LENGTH} characters or less.`
    );
  }

  return body;
}

module.exports = {
  requirePositiveInteger,
  optionalNonNegativeInteger,
  requireMessageBody,
};
