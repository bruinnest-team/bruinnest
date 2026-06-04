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

const TRUTHY_UNREAD_ONLY_VALUES = new Set([true, "true", "1", 1]);
const FALSY_UNREAD_ONLY_VALUES = new Set([false, "false", "0", 0]);

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

  if (TRUTHY_UNREAD_ONLY_VALUES.has(normalizedValue)) {
    return true;
  }

  if (FALSY_UNREAD_ONLY_VALUES.has(normalizedValue)) {
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
