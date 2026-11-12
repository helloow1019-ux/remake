import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db.js';
import { env } from '../env.js';
import {
  RegisterInputSchema,
  LoginInputSchema,
  UpdateMeInputSchema,
  DeleteMeInputSchema,
} from '@remake/shared';
import { signUserToken, setTokenCookie, COOKIE_NAME } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// GET /session
router.get('/session', async (req, res, next) => {
  try {
    const user = req.user!;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const scansToday = await prisma.scan.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneDayAgo },
      },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        role: user.role,
        locale: user.locale,
        theme: user.theme,
      },
      quota: {
        scansToday,
        scansLimit: env.SCAN_DAILY_LIMIT,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/register - Upgrades current guest user
router.post('/auth/register', authRateLimiter, async (req, res, next) => {
  try {
    const input = RegisterInputSchema.parse(req.body);
    const currentUser = req.user!;

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Upgrade guest in-place to preserve all saves, makes, and scans
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        isGuest: false,
      },
    });

    const token = signUserToken(updated);
    setTokenCookie(res, token);

    res.status(201).json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isGuest: false,
        role: updated.role,
        locale: updated.locale,
        theme: updated.theme,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login - Merges guest data into target account
router.post('/auth/login', authRateLimiter, async (req, res, next) => {
  try {
    const input = LoginInputSchema.parse(req.body);
    const guestUser = req.user!;

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // If logging into an existing account from an ephemeral guest session, merge data
    if (guestUser && guestUser.isGuest && guestUser.id !== user.id) {
      await prisma.$transaction(async (tx) => {
        // Move makes
        await tx.make.updateMany({
          where: { userId: guestUser.id },
          data: { userId: user.id },
        });

        // Move scans
        await tx.scan.updateMany({
          where: { userId: guestUser.id },
          data: { userId: user.id },
        });

        // Move impact logs
        await tx.impactLog.updateMany({
          where: { userId: guestUser.id },
          data: { userId: user.id },
        });

        // Move saves (ignore unique constraint collisions)
        const guestSaves = await tx.save.findMany({ where: { userId: guestUser.id } });
        for (const s of guestSaves) {
          const exists = await tx.save.findUnique({
            where: { userId_ideaId: { userId: user.id, ideaId: s.ideaId } },
          });
          if (!exists) {
            await tx.save.create({
              data: { userId: user.id, ideaId: s.ideaId },
            });
          }
        }
        await tx.save.deleteMany({ where: { userId: guestUser.id } });

        // Delete guest row
        await tx.user.delete({ where: { id: guestUser.id } });
      });
    }

    const token = signUserToken(user);
    setTokenCookie(res, token);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: false,
        role: user.role,
        locale: user.locale,
        theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/auth/logout', async (_req, res, next) => {
  try {
    // Clear cookie
    res.clearCookie(COOKIE_NAME, { path: '/' });

    // Create fresh guest
    const freshGuest = await prisma.user.create({
      data: {
        isGuest: true,
        role: 'USER',
        name: 'Maker',
        locale: 'en',
        theme: 'system',
      },
    });

    const token = signUserToken(freshGuest);
    setTokenCookie(res, token);

    res.json({
      ok: true,
      guestId: freshGuest.id,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /me
router.patch('/me', async (req, res, next) => {
  try {
    const input = UpdateMeInputSchema.parse(req.body);
    const userId = req.user!.id;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
    });

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isGuest: updated.isGuest,
        role: updated.role,
        locale: updated.locale,
        theme: updated.theme,
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /me
router.delete('/me', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const isGuest = req.user!.isGuest;

    if (!isGuest) {
      const input = DeleteMeInputSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.passwordHash) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'User not found' } });
      }

      if (!input.password) {
        return res.status(400).json({
          error: { code: 'PASSWORD_REQUIRED', message: 'Password confirmation required to delete account' },
        });
      }

      const match = await bcrypt.compare(input.password, user.passwordHash);
      if (!match) {
        return res.status(403).json({
          error: { code: 'INCORRECT_PASSWORD', message: 'Incorrect password' },
        });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    res.clearCookie(COOKIE_NAME, { path: '/' });

    res.json({ ok: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
