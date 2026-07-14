const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokenUtils');
const userModel = require('../models/userModel');

/**
 * Verifies the Bearer access token and attaches the authenticated
 * user (minus password_hash) to req.user.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token missing. Please log in.');
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please refresh your token.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User attached to this token no longer exists.');
  }
  if (!user.is_active) {
    throw ApiError.forbidden('This account has been deactivated.');
  }

  delete user.password_hash;
  delete user.refresh_token;
  req.user = user;
  next();
});

/**
 * Restricts a route to one or more roles, e.g. authorize('admin'), authorize('admin','buyer')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required.'));
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action.'));
  }
  return next();
};

module.exports = { authenticate, authorize };
