import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { env } from './env.js';
import { sessionMiddleware } from './middleware/auth.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import wasteTypesRoutes from './routes/wasteTypes.js';
import ideasRoutes from './routes/ideas.js';
import scansRoutes from './routes/scans.js';
import makesRoutes from './routes/makes.js';
import impactRoutes from './routes/impact.js';
import productsRoutes from './routes/products.js';
import miscRoutes from './routes/misc.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", env.WEB_ORIGIN, 'https://api.groq.com'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads with nosniff
  const uploadsPath = resolve(process.cwd(), env.UPLOAD_DIR);
  app.use(
    '/uploads',
    (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      next();
    },
    express.static(uploadsPath)
  );

  // Session middleware
  app.use('/api', sessionMiddleware);
  app.use('/api', globalRateLimiter);

  // Mount API routes
  app.use('/api', healthRoutes);
  app.use('/api', authRoutes);
  app.use('/api', wasteTypesRoutes);
  app.use('/api', ideasRoutes);
  app.use('/api', scansRoutes);
  app.use('/api', makesRoutes);
  app.use('/api', impactRoutes);
  app.use('/api', productsRoutes);
  app.use('/api', miscRoutes);
  app.use('/api', adminRoutes);

  // In production, serve Vite client build
  const distPath = resolve(process.cwd(), '../web/dist');
  const altDistPath = resolve(process.cwd(), 'apps/web/dist');
  const webDist = existsSync(distPath) ? distPath : existsSync(altDistPath) ? altDistPath : null;

  if (webDist) {
    app.use(express.static(webDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(resolve(webDist, 'index.html'));
    });
  }

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
