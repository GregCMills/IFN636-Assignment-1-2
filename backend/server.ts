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

import dotenv from 'dotenv';
dotenv.config(); // must be first so env vars are available to all modules

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { UPLOADS_ROOT } from './config/paths';
import auth from './services/auth/ClerkAuthAdapter';
import { AppError } from './services/errors/AppError';

import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import typeRoutes from './routes/typeRoutes';
import assetRoutes from './routes/assetRoutes';

const app = express();

app.use(auth.contextMiddleware());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_ROOT));  // serve uploaded photos
app.use('/api/auth',   authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/types',  typeRoutes);
app.use('/api/assets', assetRoutes);

// Express 5 automatically catches rejected promises from async route handlers
// and passes them to next(err).  This 4-parameter middleware handles all such
// errors.  AppError subclasses carry their own statusCode; unknown errors
// default to 500 and their message is hidden to prevent information leakage.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ message });
});

if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
