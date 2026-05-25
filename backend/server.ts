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
 *
 * `.env` is loaded via `import 'dotenv/config'` so it runs before other imports.
 * That avoids tsx/ESM hoisting running route modules (and PhotoService) before
 * `dotenv.config()` would have executed.
 */

import 'dotenv/config';

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

app.get('/test-cpu', (req: Request, res: Response) => {
  const iterations = Math.min(Number(req.query.iterations) || 50000, 500000);
  const start = performance.now();
  let primes = 0;
  for (let n = 2; n < iterations; n++) {
    let isPrime = true;
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) { isPrime = false; break; }
    }
    if (isPrime) primes++;
  }
  const elapsedMs = Math.round(performance.now() - start);
  res.json({ primes, elapsedMs, iterations });
});

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

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
    void (async () => {
      try {
        await connectDB();
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      } catch (err) {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    })();
  }

export default app;
