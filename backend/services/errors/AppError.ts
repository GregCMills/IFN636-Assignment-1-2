/**
 * @module AppError
 * Lightweight error class hierarchy for the Express application.
 *
 * Each subclass carries a statusCode so the global error handler in server.ts
 * can respond with the correct HTTP status without the controller needing to
 * call res.status(N).json(...) directly.
 *
 * This extends the Chain of Responsibility pattern: the global error handler
 * in server.ts is the terminal handler that catches all thrown errors and
 * decides the HTTP response based on the error type.
 */
export class AppError extends Error {
  public statusCode: number;

  /**
   * @param {string} message  - User-facing error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400); }
}

export class NotFoundError extends AppError {
  constructor(message: string) { super(message, 404); }
}

export class AuthorisationError extends AppError {
  constructor(message: string) { super(message, 403); }
}

export class AuthenticationError extends AppError {
  constructor(message: string) { super(message, 401); }
}
