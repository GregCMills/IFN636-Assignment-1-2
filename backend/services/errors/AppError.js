/**
 * @module AppError
 * Lightweight error class hierarchy for the Express application.
 *
 * Each subclass carries a statusCode so the global error handler in server.js
 * can respond with the correct HTTP status without the controller needing to
 * call res.status(N).json(...) directly.
 *
 * This extends the Chain of Responsibility pattern: the global error handler
 * in server.js is the terminal handler that catches all thrown errors and
 * decides the HTTP response based on the error type.
 */
class AppError extends Error {
  /**
   * @param {string} message  - User-facing error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) { super(message, 400); }
}

class NotFoundError extends AppError {
  constructor(message) { super(message, 404); }
}

class AuthorisationError extends AppError {
  constructor(message) { super(message, 403); }
}

class AuthenticationError extends AppError {
  constructor(message) { super(message, 401); }
}

module.exports = { AppError, ValidationError, NotFoundError, AuthorisationError, AuthenticationError };
