const ValidationError = require("../errors/ValidationError");
const {
  requirePositiveInteger,
  optionalNonNegativeInteger,
} = require("./commonValidation");

const MAX_BODY_LENGTH = 5000;

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
