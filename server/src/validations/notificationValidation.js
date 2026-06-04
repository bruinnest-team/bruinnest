const ValidationError = require("../errors/ValidationError");
const {
  isPlainObject,
  requireNonEmptyString,
  requirePositiveInteger,
} = require("./commonValidation");

const ALLOWED_TYPES = new Set([
  "new_message",
  "high_match",
  "favorite_added",
]);

const ALLOWED_REFERENCE_TYPES = new Set(["conversation", "profile"]);

function optionalPositiveInteger(value, fieldName, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return requirePositiveInteger(value, fieldName);
}

function normalizeUnreadOnly(value) {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  const normalizedValue = typeof value === "string" ? value.trim() : value;

  if (
    normalizedValue === true ||
    normalizedValue === "true" ||
    normalizedValue === "1" ||
    normalizedValue === 1
  ) {
    return true;
  }

  if (
    normalizedValue === false ||
    normalizedValue === "false" ||
    normalizedValue === "0" ||
    normalizedValue === 0
  ) {
    return false;
  }

  throw new ValidationError("unreadOnly must be true or false.");
}

function normalizeNotificationQuery(query = {}) {
  if (!isPlainObject(query)) {
    throw new ValidationError("Notification query must be an object.");
  }

  return {
    page: optionalPositiveInteger(query.page, "page", 1),
    pageSize: optionalPositiveInteger(query.pageSize, "pageSize", 10),
    unreadOnly: normalizeUnreadOnly(query.unreadOnly),
  };
}

function requireNotificationId(value) {
  return requirePositiveInteger(value, "notificationId");
}

function requireNotificationPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new ValidationError("Notification payload is required.");
  }

  const userId = requirePositiveInteger(payload.userId, "userId");
  const type = requireNonEmptyString(payload.type, "Notification type is invalid.");
  const title = requireNonEmptyString(payload.title, "title is required.");
  const body = requireNonEmptyString(payload.body, "body is required.");

  const referenceType =
    payload.referenceType === undefined || payload.referenceType === null
      ? null
      : requireNonEmptyString(payload.referenceType, "Notification reference type is invalid.");

  const referenceId =
    payload.referenceId === undefined || payload.referenceId === null
      ? null
      : requirePositiveInteger(payload.referenceId, "referenceId");

  if (!ALLOWED_TYPES.has(type)) {
    throw new ValidationError("Notification type is invalid.");
  }

  if (referenceType !== null && !ALLOWED_REFERENCE_TYPES.has(referenceType)) {
    throw new ValidationError("Notification reference type is invalid.");
  }

  return {
    userId,
    type,
    title,
    body,
    referenceType,
    referenceId,
  };
}

module.exports = {
  normalizeNotificationQuery,
  requireNotificationId,
  requireNotificationPayload,
};
