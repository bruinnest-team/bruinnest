const ValidationError = require("../errors/ValidationError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (typeof email !== "string") {
    throw new ValidationError("Email is invalid");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new ValidationError("Email is invalid");
  }

  return normalizedEmail;
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  if (!/\d/.test(password)) {
    throw new ValidationError("Password must contain at least one digit");
  }
}

module.exports = { validateEmail, validatePassword };
