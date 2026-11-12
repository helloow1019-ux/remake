import { Router } from 'express';
import { prisma } from '../db.js';
import { IdeasQuerySchema, calculateProfitPerHour, IdeaPublic } from '@remake/shared';

const router = Router();

function formatPublicIdea(idea: any, currentUserId?: string, userSavedIds?: Set<string>, userMadeIds?: Set<string>): IdeaPublic {
  const isAi = idea.status === 'AI_DRAFT' || idea.source === 'AI';
  const profitPerHour = calculateProfitPerHour(idea.costPkr, idea.sellPricePkr, idea.timeMinutes);

  const workedPct =
    idea.makesCount > 0 ? Math.round((idea.workedCount / idea.makesCount) * 100) : 0;
  const avgRating =
    idea.ratingCount > 0 ? Number((idea.ratingSum / idea.ratingCount).toFixed(1)) : 0;
  const avgTimeFeltMin =
    idea.makesCount > 0 ? Math.round(idea.timeFeltSum / idea.makesCount) : idea.timeMinutes;

  return {
    id: idea.id,
    slug: idea.slug,
    status: idea.status,
    isAi,
    published: idea.published,
    titleEn: idea.titleEn,
    titleUr: idea.titleUr,
    summaryEn: idea.summaryEn,
    summaryUr: idea.summaryUr,
    difficulty: idea.difficulty,
    timeMinutes: idea.timeMinutes,
    costPkr: idea.costPkr,
    sellPricePkr: idea.sellPricePkr,
    profitPerHourPkr: profitPerHour,
    wasteGrams: idea.wasteGrams,
    co2SavedG: idea.co2SavedG,
    coverImage: idea.coverImage,
    safetyNoteEn: idea.safetyNoteEn,
    safetyNoteUr: idea.safetyNoteUr,
    isSampleData: idea.isSampleData,
    waste: idea.waste.map((w: any) => ({
      slug: w.wasteType?.slug || w.slug || '',
      nameEn: w.wasteType?.nameEn,
      nameUr: w.wasteType?.nameUr,
      pieces: w.pieces,
      grams: w.grams,
    })),
    materials: (idea.materials || []).map((m: any) => ({
      nameEn: m.nameEn,
      nameUr: m.nameUr,
      quantity: m.quantity,
      isWaste: m.isWaste,
    })),
    tools: (idea.tools || []).map((t: any) => ({
      nameEn: t.nameEn,
      nameUr: t.nameUr,
    })),
    steps: (idea.steps || []).map((s: any) => ({
      position: s.position,
      textEn: s.textEn,
      textUr: s.textUr,
      tipEn: s.tipEn,
      tipUr: s.tipUr,
      imageUrl: s.imageUrl,
      timerSeconds: s.timerSeconds,
    })),
    stats: {
      makes: idea.makesCount,
      workedPct,
      avgRating,
      avgTimeFeltMin,
    },
    viewerState: currentUserId
      ? {
          saved: userSavedIds ? userSavedIds.has(idea.id) : false,
          made: userMadeIds ? userMadeIds.has(idea.id) : false,
        }
      : undefined,
  };
}

// GET /ideas/trending
router.get('/ideas/trending', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const ideas = await prisma.idea.findMany({
      where: {
        published: true,
        status: { in: ['TESTED', 'UNTESTED'] },
      },
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
        makes: {
          where: { createdAt: { gte: fourteenDaysAgo } },
        },
      },
      take: 6,
    });

    // Sort by recent makes desc
    const sorted = [...ideas].sort((a, b) => b.makes.length - a.makes.length || b.makesCount - a.makesCount);

    let savedSet = new Set<string>();
    let madeSet = new Set<string>();
    if (userId) {
      const saves = await prisma.save.findMany({ where: { userId } });
      const makes = await prisma.make.findMany({ where: { userId } });
      savedSet = new Set(saves.map((s) => s.ideaId));
      madeSet = new Set(makes.map((m) => m.ideaId));
    }

    res.json(sorted.map((i) => formatPublicIdea(i, userId, savedSet, madeSet)));
  } catch (err) {
    next(err);
  }
});

// GET /ideas/quick-wins
router.get('/ideas/quick-wins', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const ideas = await prisma.idea.findMany({
      where: {
        published: true,
        status: 'TESTED',
        timeMinutes: { lte: 25 },
      },
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
      orderBy: { timeMinutes: 'asc' },
      take: 6,
    });

    let savedSet = new Set<string>();
    let madeSet = new Set<string>();
    if (userId) {
      const saves = await prisma.save.findMany({ where: { userId } });
      const makes = await prisma.make.findMany({ where: { userId } });
      savedSet = new Set(saves.map((s) => s.ideaId));
      madeSet = new Set(makes.map((m) => m.ideaId));
    }

    res.json(ideas.map((i) => formatPublicIdea(i, userId, savedSet, madeSet)));
  } catch (err) {
    next(err);
  }
});

// GET /ideas
router.get('/ideas', async (req, res, next) => {
  try {
    const query = IdeasQuerySchema.parse(req.query);
    const userId = req.user?.id;

    const where: any = {
      published: true,
    };

    // Filter by status or draft ownership
    if (query.status) {
      where.status = query.status;
    } else {
      if (query.includeMine && userId) {
        where.OR = [
          { status: { in: ['TESTED', 'UNTESTED'] } },
          { status: 'AI_DRAFT', ownerUserId: userId },
        ];
      } else {
        where.status = { in: ['TESTED', 'UNTESTED'] };
      }
    }

    // Text search
    if (query.q && query.q.trim().length > 0) {
      const term = query.q.trim().toLowerCase();
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { titleEn: { contains: term } },
          { titleUr: { contains: term } },
          { summaryEn: { contains: term } },
          { summaryUr: { contains: term } },
        ],
      });
    }

    // Filter by difficulty
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    // Filter by max time
    if (query.maxTime) {
      where.timeMinutes = { lte: query.maxTime };
    }

    // Filter by max cost
    if (query.maxCost !== undefined) {
      where.costPkr = { lte: query.maxCost };
    }

    // Filter by canSell
    if (query.canSell) {
      where.sellPricePkr = { not: null, gt: 0 };
    }

    // Waste types filtering
    const wasteSlugs = query.waste
      ? query.waste
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (wasteSlugs.length > 0) {
      if (query.matchAll) {
        // Must use ALL selected waste types
        for (const slug of wasteSlugs) {
          where.AND = where.AND || [];
          where.AND.push({
            waste: {
              some: {
                wasteType: { slug },
              },
            },
          });
        }
      } else {
        // Must use ANY of the selected waste types
        where.waste = {
          some: {
            wasteType: {
              slug: { in: wasteSlugs },
            },
          },
        };
      }
    }

    const allMatching = await prisma.idea.findMany({
      where,
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
    });

    // Custom sorting
    let sorted = allMatching;
    const sortMode = query.sort || 'match';

    if (sortMode === 'match') {
      sorted.sort((a, b) => {
        // 1. Matched waste types count
        const aMatches = a.waste.filter((w) => wasteSlugs.includes(w.wasteType.slug)).length;
        const bMatches = b.waste.filter((w) => wasteSlugs.includes(w.wasteType.slug)).length;
        if (bMatches !== aMatches) return bMatches - aMatches;

        // 2. TESTED ideas first
        if (a.status === 'TESTED' && b.status !== 'TESTED') return -1;
        if (b.status === 'TESTED' && a.status !== 'TESTED') return 1;

        // 3. Shorter time
        return a.timeMinutes - b.timeMinutes;
      });
    } else if (sortMode === 'time') {
      sorted.sort((a, b) => a.timeMinutes - b.timeMinutes);
    } else if (sortMode === 'cost') {
      sorted.sort((a, b) => a.costPkr - b.costPkr);
    } else if (sortMode === 'profit') {
      sorted.sort((a, b) => {
        const profitA = calculateProfitPerHour(a.costPkr, a.sellPricePkr, a.timeMinutes);
        const profitB = calculateProfitPerHour(b.costPkr, b.sellPricePkr, b.timeMinutes);
        return profitB - profitA;
      });
    } else if (sortMode === 'impact') {
      sorted.sort((a, b) => b.wasteGrams - a.wasteGrams);
    }

    const total = sorted.length;
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

    let savedSet = new Set<string>();
    let madeSet = new Set<string>();
    if (userId) {
      const saves = await prisma.save.findMany({ where: { userId } });
      const makes = await prisma.make.findMany({ where: { userId } });
      savedSet = new Set(saves.map((s) => s.ideaId));
      madeSet = new Set(makes.map((m) => m.ideaId));
    }

    const items = paginated.map((i) => formatPublicIdea(i, userId, savedSet, madeSet));

    res.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// GET /ideas/:slug
router.get('/ideas/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const userId = req.user?.id;

    const idea = await prisma.idea.findUnique({
      where: { slug },
      include: {
        waste: { include: { wasteType: true } },
        materials: { orderBy: { sortOrder: 'asc' } },
        tools: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { position: 'asc' } },
      },
    });

    if (!idea) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Idea not found' },
      });
    }

    // If AI_DRAFT, only owner or admin can view
    if (idea.status === 'AI_DRAFT') {
      const isOwner = userId && idea.ownerUserId === userId;
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Idea not found' },
        });
      }
    }

    let saved = false;
    let made = false;
    if (userId) {
      const [saveRecord, makeRecord] = await Promise.all([
        prisma.save.findUnique({
          where: { userId_ideaId: { userId, ideaId: idea.id } },
        }),
        prisma.make.findFirst({
          where: { userId, ideaId: idea.id },
        }),
      ]);
      saved = !!saveRecord;
      made = !!makeRecord;
    }

    const formatted = formatPublicIdea(
      idea,
      userId,
      saved ? new Set([idea.id]) : undefined,
      made ? new Set([idea.id]) : undefined
    );

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// POST /ideas/:id/save
router.post('/ideas/:id/save', async (req, res, next) => {
  try {
    const ideaId = req.params.id;
    const userId = req.user!.id;

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }

    await prisma.save.upsert({
      where: { userId_ideaId: { userId, ideaId } },
      create: { userId, ideaId },
      update: {},
    });

    res.json({ saved: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /ideas/:id/save
router.delete('/ideas/:id/save', async (req, res, next) => {
  try {
    const ideaId = req.params.id;
    const userId = req.user!.id;

    await prisma.save.deleteMany({
      where: { userId, ideaId },
    });

    res.json({ saved: false });
  } catch (err) {
    next(err);
  }
});

// GET /me/saved
router.get('/me/saved', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const saves = await prisma.save.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        idea: {
          include: {
            waste: { include: { wasteType: true } },
            materials: true,
            tools: true,
            steps: { orderBy: { position: 'asc' } },
          },
        },
      },
    });

    const savedSet = new Set(saves.map((s) => s.ideaId));
    const items = saves.map((s) => formatPublicIdea(s.idea, userId, savedSet, undefined));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
