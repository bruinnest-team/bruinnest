const ValidationError = require("../errors/ValidationError");

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  if (!/\d/.test(password)) {
    throw new ValidationError("Password must contain at least one digit");
  }
}

module.exports = { validatePassword };
