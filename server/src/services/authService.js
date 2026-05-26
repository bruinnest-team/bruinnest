const userRepository = require('../repositories/userRepository');
const emailVerificationRepository = require('../repositories/emailVerificationRepository');
const profileRepository = require('../repositories/profileRepository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { nowISO, addSeconds, isExpired } = require('../utils/time');
const AuthError = require('../errors/AuthError');
const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
  if (!/\d/.test(password)) {
    throw new ValidationError('Password must contain at least one digit');
  }
}

async function sendVerificationCode({ email, password }) {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  validatePassword(password);

  const existingUser = userRepository.findByEmail(email);
  if (existingUser && existingUser.isVerified) {
    throw new ConflictError('Email already exists');
  }

  const latest = emailVerificationRepository.findLatestActiveByEmail(email);
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
    email,
    codeHash,
    expiresAt,
    sentAt: now,
  });

  // Later we should send email here. For MVP, log to console.
  console.log(`Verification code for ${email}: ${code}`);

  return { message: 'Verification code sent' };
}

async function verifyRegistration({ email, password, code, session }) {

  validatePassword(password);

  if (!email || !password || !code) {
    throw new ValidationError('Email, password, and code are required');
  }

  const verification = emailVerificationRepository.findLatestActiveByEmail(email);
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
  const user = userRepository.createUser({ email, passwordHash, isVerified: true });

  emailVerificationRepository.markConsumed(verification.id, nowISO());

  session.userId = user.id;

  return { user: { id: user.id, email: user.email }, needsProfileSetup: true };
}

async function login({ email, password, session }) {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = userRepository.findByEmail(email);
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
  if (!session || !session.userId) {
    throw new AuthError('Not authenticated');
  }

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