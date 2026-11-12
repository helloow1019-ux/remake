import { Router } from 'express';
import { prisma } from '../db.js';
import { upload, saveUploadedImage } from '../middleware/upload.js';
import {
  CreateMakeInputSchema,
  UpdateMakeInputSchema,
  evaluateBadges,
  calculateStreak,
  BadgeKey,
} from '@remake/shared';

const router = Router();

// Helper to evaluate and award badges for a user
export async function checkAndAwardBadges(userId: string): Promise<any[]> {
  // Aggregate user statistics
  const [makes, logs, approvedPhotos, scans] = await Promise.all([
    prisma.make.findMany({ where: { userId } }),
    prisma.impactLog.findMany({
      where: { userId },
      include: { wasteType: true },
    }),
    prisma.make.count({
      where: { userId, status: 'APPROVED', photoUrl: { not: null } },
    }),
    prisma.scan.count({ where: { userId } }),
  ]);

  let totalWasteG = 0;
  let plasticBottleG = 0;
  let oldClothG = 0;

  for (const m of makes) {
    totalWasteG += m.wasteGramsSnapshot;
  }
  for (const l of logs) {
    totalWasteG += l.grams;
    if (l.wasteType.slug === 'plastic-bottle') plasticBottleG += l.grams;
    if (l.wasteType.slug === 'old-cloth') oldClothG += l.grams;
  }

  // Calculate streak
  const dates: string[] = [
    ...makes.map((m) => m.createdAt.toISOString().slice(0, 10)),
    ...logs.map((l) => l.createdAt.toISOString().slice(0, 10)),
  ];
  const streak = calculateStreak(dates);

  const eligibleKeys = evaluateBadges({
    makesCount: makes.length,
    scansCount: scans,
    approvedMakesWithPhotoCount: approvedPhotos,
    totalWasteG,
    plasticBottleG,
    oldClothG,
    bestStreak: streak.best,
  });

  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });
  const existingKeys = new Set(existingBadges.map((b) => b.badge.key));

  const newlyAwarded: any[] = [];

  for (const key of eligibleKeys) {
    if (!existingKeys.has(key)) {
      const badgeRecord = await prisma.badge.findUnique({ where: { key } });
      if (badgeRecord) {
        const ub = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badgeRecord.id,
          },
          include: { badge: true },
        });
        newlyAwarded.push(ub.badge);
      }
    }
  }

  return newlyAwarded;
}

// POST /ideas/:id/makes (multipart: outcome, rating, timeTakenMin, etc. + optional photo)
router.post('/ideas/:id/makes', upload.single('photo'), async (req, res, next) => {
  try {
    const ideaId = req.params.id!;
    const userId = req.user!.id;
    const input = CreateMakeInputSchema.parse(req.body);

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }

    let photoUrl: string | null = null;
    if (req.file) {
      const saved = await saveUploadedImage(req.file.buffer);
      photoUrl = saved.url;
    }

    const moneySnapshot = Math.max(0, (idea.sellPricePkr ?? 0) - idea.costPkr);

    // Run in transaction: create make + update idea aggregates
    const make = await prisma.$transaction(async (tx) => {
      const createdMake = await tx.make.create({
        data: {
          userId,
          ideaId,
          outcome: input.outcome,
          timeTakenMin: input.timeTakenMin,
          difficultyFelt: input.difficultyFelt,
          rating: input.rating,
          notes: input.notes,
          photoUrl,
          status: 'PENDING',
          wasteGramsSnapshot: idea.wasteGrams,
          co2GramsSnapshot: idea.co2SavedG,
          moneyPkrSnapshot: moneySnapshot,
        },
      });

      // Update idea aggregates
      await tx.idea.update({
        where: { id: ideaId },
        data: {
          makesCount: { increment: 1 },
          workedCount: input.outcome === 'WORKED' ? { increment: 1 } : undefined,
          ratingSum: input.rating ? { increment: input.rating } : undefined,
          ratingCount: input.rating ? { increment: 1 } : undefined,
          timeFeltSum: input.timeTakenMin ? { increment: input.timeTakenMin } : undefined,
        },
      });

      return createdMake;
    });

    // Check & award badges
    const newBadges = await checkAndAwardBadges(userId);

    // Get updated user streak
    const [userMakes, userLogs] = await Promise.all([
      prisma.make.findMany({ where: { userId }, select: { createdAt: true } }),
      prisma.impactLog.findMany({ where: { userId }, select: { createdAt: true } }),
    ]);
    const dates = [
      ...userMakes.map((m) => m.createdAt.toISOString().slice(0, 10)),
      ...userLogs.map((l) => l.createdAt.toISOString().slice(0, 10)),
    ];
    const streak = calculateStreak(dates);

    res.status(201).json({
      make,
      impactAdded: {
        wasteG: idea.wasteGrams,
        co2G: idea.co2SavedG,
        moneyPkr: moneySnapshot,
      },
      newBadges,
      streak,
    });
  } catch (err) {
    next(err);
  }
});

// GET /me/makes
router.get('/me/makes', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const makes = await prisma.make.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        idea: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleUr: true,
            coverImage: true,
          },
        },
      },
    });

    res.json({ makes });
  } catch (err) {
    next(err);
  }
});

// PATCH /makes/:id
router.patch('/makes/:id', async (req, res, next) => {
  try {
    const makeId = req.params.id;
    const userId = req.user!.id;
    const input = UpdateMakeInputSchema.parse(req.body);

    const make = await prisma.make.findUnique({ where: { id: makeId } });
    if (!make || (make.userId !== userId && req.user?.role !== 'ADMIN')) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Make not found' } });
    }

    const updated = await prisma.make.update({
      where: { id: makeId },
      data: input,
    });

    res.json({ make: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /makes/:id
router.delete('/makes/:id', async (req, res, next) => {
  try {
    const makeId = req.params.id;
    const userId = req.user!.id;

    const make = await prisma.make.findUnique({ where: { id: makeId } });
    if (!make || (make.userId !== userId && req.user?.role !== 'ADMIN')) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Make not found' } });
    }

    await prisma.$transaction(async (tx) => {
      await tx.make.delete({ where: { id: makeId } });

      // Adjust idea aggregates
      await tx.idea.update({
        where: { id: make.ideaId },
        data: {
          makesCount: { decrement: 1 },
          workedCount: make.outcome === 'WORKED' ? { decrement: 1 } : undefined,
          ratingSum: make.rating ? { decrement: make.rating } : undefined,
          ratingCount: make.rating ? { decrement: 1 } : undefined,
          timeFeltSum: make.timeTakenMin ? { decrement: make.timeTakenMin } : undefined,
        },
      });
    });

    res.json({ ok: true, message: 'Make deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /community (approved makes)
router.get('/community', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const wasteSlug = req.query.waste as string | undefined;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;

    const where: any = {
      status: 'APPROVED',
    };

    if (wasteSlug) {
      where.idea = {
        waste: {
          some: {
            wasteType: { slug: wasteSlug },
          },
        },
      };
    }

    const [total, makes] = await Promise.all([
      prisma.make.count({ where }),
      prisma.make.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true } },
          idea: { select: { id: true, slug: true, titleEn: true, titleUr: true } },
          likes: true,
        },
      }),
    ]);

    const formatted = makes.map((m) => ({
      id: m.id,
      ideaId: m.ideaId,
      ideaSlug: m.idea.slug,
      ideaTitleEn: m.idea.titleEn,
      ideaTitleUr: m.idea.titleUr,
      outcome: m.outcome,
      timeTakenMin: m.timeTakenMin,
      difficultyFelt: m.difficultyFelt,
      rating: m.rating,
      notes: m.notes,
      photoUrl: m.photoUrl,
      createdAt: m.createdAt.toISOString(),
      userName: m.user.name,
      likesCount: m.likes.length,
      hasLiked: userId ? m.likes.some((l) => l.userId === userId) : false,
    }));

    res.json({
      items: formatted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// POST /makes/:id/like
router.post('/makes/:id/like', async (req, res, next) => {
  try {
    const makeId = req.params.id;
    const userId = req.user!.id;

    await prisma.like.upsert({
      where: { userId_makeId: { userId, makeId } },
      create: { userId, makeId },
      update: {},
    });

    const count = await prisma.like.count({ where: { makeId } });
    res.json({ liked: true, likesCount: count });
  } catch (err) {
    next(err);
  }
});

// DELETE /makes/:id/like
router.delete('/makes/:id/like', async (req, res, next) => {
  try {
    const makeId = req.params.id;
    const userId = req.user!.id;

    await prisma.like.deleteMany({
      where: { userId, makeId },
    });

    const count = await prisma.like.count({ where: { makeId } });
    res.json({ liked: false, likesCount: count });
  } catch (err) {
    next(err);
  }
});

export default router;
