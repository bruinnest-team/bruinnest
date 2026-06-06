const AppError = require('./AppError');

class MailDeliveryError extends AppError {
  constructor(message = 'Failed to send verification code. Try 60s later.') {
    super(message, 503, 'MAIL_DELIVERY_ERROR');
  }
}

module.exports = MailDeliveryError;
