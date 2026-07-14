const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const userModel = require('../models/userModel');
const { generateAuthTokens, verifyRefreshToken, generateAccessToken } = require('../utils/tokenUtils');
const env = require('../config/env');

const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(env.google.clientId);

const sanitizeUser = (user) => {
  const clean = { ...user };
  delete clean.password_hash;
  delete clean.refresh_token;
  delete clean.reset_password_token;
  delete clean.reset_password_expires;
  return clean;
};

/** POST /api/auth/register */
const register = catchAsync(async (req, res) => {
  const { fullName, email, phone, password, role, state, district } = req.body;

  const existingEmail = await userModel.findByEmail(email);
  if (existingEmail) throw ApiError.conflict('An account with this email already exists.');

  if (phone) {
    const existingPhone = await userModel.findByPhone(phone);
    if (existingPhone) throw ApiError.conflict('An account with this phone number already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({
    fullName, email, phone, passwordHash, role: role || 'farmer', state, district,
  });

  const tokens = generateAuthTokens(user);
  await userModel.updateRefreshToken(user.id, tokens.refreshToken);
  await userModel.updateLastLogin(user.id);

  return new ApiResponse(201, { user: sanitizeUser(user), ...tokens }, 'Account created successfully.').send(res);
});

/** POST /api/auth/login */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user || !user.password_hash) {
    throw ApiError.unauthorized('Invalid email or password.');
  }
  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated.');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password.');

  const tokens = generateAuthTokens(user);
  await userModel.updateRefreshToken(user.id, tokens.refreshToken);
  await userModel.updateLastLogin(user.id);

  return new ApiResponse(200, { user: sanitizeUser(user), ...tokens }, 'Login successful.').send(res);
});

/** POST /api/auth/google
 *  Verifies a Google Sign-In idToken and logs in / auto-registers the user.
 *  Requires GOOGLE_CLIENT_ID to be configured in .env; otherwise returns 501.
 */
const googleLogin = catchAsync(async (req, res) => {
  if (!env.google.clientId) {
    throw new ApiError(501, 'Google login is not configured on this server yet.');
  }

  const { idToken } = req.body;
  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.google.clientId });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw ApiError.unauthorized('Invalid Google token.');
  }

  let user = await userModel.findByGoogleId(payload.sub);
  if (!user) {
    user = await userModel.findByEmail(payload.email);
    if (user && !user.google_id) {
      throw ApiError.conflict('An account with this email already exists. Please log in with your password.');
    }
  }
  if (!user) {
    user = await userModel.create({
      fullName: payload.name || payload.email.split('@')[0],
      email: payload.email,
      phone: null,
      passwordHash: null,
      googleId: payload.sub,
      role: 'farmer',
    });
  }

  const tokens = generateAuthTokens(user);
  await userModel.updateRefreshToken(user.id, tokens.refreshToken);
  await userModel.updateLastLogin(user.id);

  return new ApiResponse(200, { user: sanitizeUser(user), ...tokens }, 'Google login successful.').send(res);
});

/** POST /api/auth/refresh */
const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  const user = await userModel.findById(decoded.id);
  if (!user || user.refresh_token !== refreshToken) {
    throw ApiError.unauthorized('Refresh token does not match. Please log in again.');
  }

  const accessToken = generateAccessToken({ id: user.id, uuid: user.uuid, role: user.role, email: user.email });
  return new ApiResponse(200, { accessToken }, 'Token refreshed.').send(res);
});

/** POST /api/auth/logout */
const logout = catchAsync(async (req, res) => {
  await userModel.updateRefreshToken(req.user.id, null);
  return new ApiResponse(200, null, 'Logged out successfully.').send(res);
});

/** GET /api/auth/me */
const getProfile = catchAsync(async (req, res) => {
  return new ApiResponse(200, sanitizeUser(req.user), 'Profile fetched.').send(res);
});

/** PATCH /api/auth/me */
const updateProfile = catchAsync(async (req, res) => {
  const updated = await userModel.updateById(req.user.id, req.body);
  return new ApiResponse(200, sanitizeUser(updated), 'Profile updated.').send(res);
});

/** POST /api/auth/change-password */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await userModel.findById(req.user.id);

  if (!user.password_hash) {
    throw ApiError.badRequest('This account uses Google Sign-In and has no password to change.');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) throw ApiError.unauthorized('Current password is incorrect.');

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userModel.updatePassword(user.id, newHash);
  return new ApiResponse(200, null, 'Password changed successfully.').send(res);
});

/** POST /api/auth/forgot-password */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findByEmail(email);

  // Always respond 200 to avoid leaking which emails are registered.
  if (!user) {
    return new ApiResponse(200, null, 'If that email exists, a reset link has been sent.').send(res);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await userModel.setResetToken(user.id, token, expires);

  // NOTE: Wire up nodemailer in services/emailService.js to actually send this.
  // For now the token is returned in non-production environments to ease local testing.
  const payload = env.nodeEnv !== 'production' ? { resetToken: token } : null;

  return new ApiResponse(200, payload, 'If that email exists, a reset link has been sent.').send(res);
});

/** POST /api/auth/reset-password */
const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  const user = await userModel.findByResetToken(token);
  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired.');

  const newHash = await bcrypt.hash(password, SALT_ROUNDS);
  await userModel.updatePassword(user.id, newHash);
  await userModel.clearResetToken(user.id);

  return new ApiResponse(200, null, 'Password reset successfully. You can now log in.').send(res);
});

module.exports = {
  register, login, googleLogin, refresh, logout,
  getProfile, updateProfile, changePassword, forgotPassword, resetPassword,
};
