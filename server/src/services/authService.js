const userRepository = require('../repositories/userRepository');
const emailVerificationRepository = require('../repositories/emailVerificationRepository');
const profileRepository = require('../repositories/profileRepository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { nowISO, addSeconds, isExpired } = require('../utils/time');
const { validateEmail, validatePassword } = require('../validations/authValidation');
const AuthError = require('../errors/AuthError');
const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const bcrypt = require('bcrypt');

async function sendVerificationCode({ email, password }) {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const normalizedEmail = validateEmail(email);
  validatePassword(password);

  const existingUser = userRepository.findByEmail(normalizedEmail);
  if (existingUser && existingUser.isVerified) {
    throw new ConflictError('Email already exists');
  }

  const latest = emailVerificationRepository.findLatestActiveByEmail(normalizedEmail);
  if (latest) {
    const cooldownEnd = addSeconds(latest.sentAt, 60);
    if (!isExpired(cooldownEnd)) {
      throw new ValidationError('Please wait 60 seconds before requesting another code');
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 12);
  const now = nowISO();
  const expiresAt = addSeconds(now, 600);

  emailVerificationRepository.createVerification({
    email: normalizedEmail,
    codeHash,
    expiresAt,
    sentAt: now,
  });

  // Later we should send email here. For MVP, log to console.
  console.log(`Verification code for ${normalizedEmail}: ${code}`);

  return { message: 'Verification code sent' };
}

async function verifyRegistration({ email, password, code, session }) {

  const normalizedEmail = validateEmail(email);
  validatePassword(password);

  if (!email || !password || !code) {
    throw new ValidationError('Email, password, and code are required');
  }

  const existingUser = userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  const verification = emailVerificationRepository.findLatestActiveByEmail(normalizedEmail);
  if (!verification) {
    throw new ValidationError('No active verification code found');
  }

  if (isExpired(verification.expiresAt)) {
    throw new ValidationError('Verification code has expired');
  }

  const codeMatch = await bcrypt.compare(code, verification.codeHash);
  if (!codeMatch) {
    throw new ValidationError('Invalid verification code');
  }

  const passwordHash = await hashPassword(password);
  const user = userRepository.createUser({ email: normalizedEmail, passwordHash, isVerified: true });

  emailVerificationRepository.markConsumed(verification.id, nowISO());

  session.userId = user.id;

  return { user: { id: user.id, email: user.email }, needsProfileSetup: true };
}

async function login({ email, password, session }) {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const normalizedEmail = validateEmail(email);
  const user = userRepository.findByEmail(normalizedEmail);
  if (!user) {
    throw new AuthError('Invalid email or password');
  }

  if (!user.isVerified) {
    throw new AuthError('Account not verified');
  }

  const passwordMatch = await verifyPassword(password, user.passwordHash);
  if (!passwordMatch) {
    throw new AuthError('Invalid email or password');
  }

  session.userId = user.id;

  const profile = profileRepository.findByUserId(user.id);
  return { user: { id: user.id, email: user.email }, profileCompleted: profile?.profileCompleted ?? false };
}

function logout(session) {
  return new Promise((resolve, reject) => {
    session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getCurrentUser(session) {
  const user = userRepository.findById(session.userId);
  if (!user) {
    throw new AuthError('User not found');
  }

  const profile = profileRepository.findByUserId(user.id);
  return { user: { id: user.id, email: user.email }, profileCompleted: profile?.profileCompleted ?? false };
}

module.exports = {
  sendVerificationCode,
  verifyRegistration,
  login,
  logout,
  getCurrentUser,
};
