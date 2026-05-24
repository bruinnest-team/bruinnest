const AuthError = require('../errors/AuthError');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next(new AuthError());
  }
  next();
}

module.exports = requireAuth;