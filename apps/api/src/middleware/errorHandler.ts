import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AiError } from '../ai/handlers.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // If response headers already sent, delegate to Express default
  if (res.headersSent) {
    return next(err);
  }

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // 2. Custom AI Semantic Errors (e.g. NOT_WASTE, HAZARDOUS)
  if (err instanceof AiError) {
    const status = err.code === 'QUOTA_EXCEEDED' ? 429 : 422;
    return res.status(status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // 3. Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Uploaded file exceeds the 8 MB size limit',
        },
      });
    }
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  // 4. Default / 500 Internal error
  console.error('Unhandled Server Error:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message || 'Internal server error';

  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
    },
  });
}
