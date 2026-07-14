/**
 * Wraps an async Express route/controller so thrown errors and rejected
 * promises are forwarded to the centralized error handler middleware.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
