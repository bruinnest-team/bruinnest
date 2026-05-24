const NotFoundError = require('../errors/NotFoundError');

function notFoundHandler(req, res, next) {
  next(new NotFoundError('Route not found'));
}

module.exports = notFoundHandler;