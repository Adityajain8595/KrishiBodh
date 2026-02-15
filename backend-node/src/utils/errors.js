/**
 * Centralized error handling. No demo wording.
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

function validationError(message) {
  return new AppError(message, 400);
}

function notFoundError(message = 'Resource not found') {
  return new AppError(message, 404);
}

function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
}

module.exports = {
  AppError,
  validationError,
  notFoundError,
  errorHandler,
};
