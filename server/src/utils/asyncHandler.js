/**
 * Async Handler Wrapper for Express Controllers
 * Catches unhandled promise rejections and forwards to error middleware
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
