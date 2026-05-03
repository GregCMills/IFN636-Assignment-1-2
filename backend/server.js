/**
 * @module server
 * Express application entry point.
 *
 * Middleware pipeline (in order):
 *   1. auth.contextMiddleware() — attaches auth context to every request
 *   2. cors                     — allows cross-origin requests (configured for dev; tighten in production)
 *   3. express.json             — parses JSON request bodies
 *   4. Route handlers           — /api/auth, /api/groups, /api/types, /api/assets
 *   5. Error-handling middleware — catches rejected async promises (Express 5); returns { message: string }
 *
 * The `require.main === module` guard means the server only starts listening
 * when run directly (e.g. `node server.js`), not when imported by tests.
 */

require('dotenv').config(); // must be first so env vars are available to all modules

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auth = require('./services/auth/ClerkAuthAdapter');

const { AppError } = require('./services/errors/AppError');

const app = express();

app.use(auth.contextMiddleware());
app.use(cors());
app.use(express.json());
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/types',  require('./routes/typeRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));

// Express 5 automatically catches rejected promises from async route handlers
// and passes them to next(err).  This 4-parameter middleware handles all such
// errors.  AppError subclasses carry their own statusCode; unknown errors
// default to 500 and their message is hidden to prevent information leakage.
app.use((err, req, res, next) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ message });
});

if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
