import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { env } from '../env.js';

export interface JwtPayload {
  userId: string;
  role: string;
  isGuest: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email?: string | null;
        role: string;
        isGuest: boolean;
        locale: string;
        theme: string;
      };
    }
  }
}

export const COOKIE_NAME = 'remake_token';

export function signUserToken(user: { id: string; role: string; isGuest: boolean }): string {
  return jwt.sign(
    { userId: user.id, role: user.role, isGuest: user.isGuest } satisfies JwtPayload,
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setTokenCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Middleware that loads user from token or automatically provisions a new guest user.
 */
export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        userId = decoded.userId;
      } catch {
        // Token invalid or expired
      }
    }

    let user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
        })
      : null;

    // If no valid user found, auto-create guest unless logging in
    if (!user) {
      if (req.path === '/auth/login') {
        return next();
      }

      user = await prisma.user.create({
        data: {
          isGuest: true,
          role: 'USER',
          name: 'Maker',
          locale: 'en',
          theme: 'system',
        },
      });

      const newToken = signUserToken(user);
      setTokenCookie(res, newToken);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isGuest: user.isGuest,
      locale: user.locale,
      theme: user.theme,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }
  next();
}

export function requireRegisteredUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.isGuest) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please create an account or sign in to perform this action',
      },
    });
  }
  next();
}
