const authService = require('../services/authService');
const { success } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.sendVerificationCode({ email, password });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const { email, password, code } = req.body;
    const result = await authService.verifyRegistration({ email, password, code, session: req.session });
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password, session: req.session });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.session);
    return success(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = authService.getCurrentUser(req.session);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, verify, login, logout, me };