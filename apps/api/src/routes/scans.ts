import { Router } from 'express';
import { prisma } from '../db.js';
import { upload, saveUploadedImage } from '../middleware/upload.js';
import { checkUserScanQuota } from '../ai/quota.js';
import {
  analyzeWasteImages,
  generateIdeaDrafts,
  askIdeaAssistant,
  adaptIdeaMaterials,
  AiError,
} from '../ai/handlers.js';
import {
  PatchScanItemsInputSchema,
  AssistantInputSchema,
  AdaptMaterialsInputSchema,
  calculateProfitPerHour,
} from '@remake/shared';
import { aiAssistantRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

function formatMatchedIdea(idea: any, userSavedIds?: Set<string>): any {
  const isAi = idea.status === 'AI_DRAFT' || idea.source === 'AI';
  const profitPerHour = calculateProfitPerHour(idea.costPkr, idea.sellPricePkr, idea.timeMinutes);

  return {
    id: idea.id,
    slug: idea.slug,
    status: idea.status,
    isAi,
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
      slug: w.wasteType?.slug || w.slug,
      nameEn: w.wasteType?.nameEn,
      nameUr: w.wasteType?.nameUr,
      pieces: w.pieces,
      grams: w.grams,
    })),
    stats: {
      makes: idea.makesCount,
      workedPct: idea.makesCount > 0 ? Math.round((idea.workedCount / idea.makesCount) * 100) : 0,
      avgRating: idea.ratingCount > 0 ? Number((idea.ratingSum / idea.ratingCount).toFixed(1)) : 0,
      avgTimeFeltMin: idea.makesCount > 0 ? Math.round(idea.timeFeltSum / idea.makesCount) : idea.timeMinutes,
    },
    viewerState: userSavedIds ? { saved: userSavedIds.has(idea.id), made: false } : undefined,
  };
}

// POST /scans (multipart images 1-3)
router.post('/scans', upload.array('images', 3), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length === 0) {
      return res.status(400).json({
        error: { code: 'NO_IMAGE', message: 'At least one photo is required to scan waste' },
      });
    }

    // 1. Quota Check
    const quota = await checkUserScanQuota(userId);
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'You have reached your scan limit for this period. Please try again later or pick waste manually.',
          resetAt: quota.resetAt,
        },
      });
    }

    // 2. Save uploaded files to disk
    const savedImages = await Promise.all(files.map((f) => saveUploadedImage(f.buffer)));
    const imageUrls = savedImages.map((s) => s.url);
    const imageBuffers = savedImages.map((s) => s.buffer);

    // 3. Call AI Vision
    const scanResult = await analyzeWasteImages({
      imageBuffers,
      userId,
      imagePaths: imageUrls,
    });

    // 4. Award Scanner badge if first scan
    const scannerBadge = await prisma.badge.findUnique({ where: { key: 'scanner' } });
    if (scannerBadge) {
      const existingUserBadge = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: scannerBadge.id } },
      });
      if (!existingUserBadge) {
        await prisma.userBadge.create({
          data: { userId, badgeId: scannerBadge.id },
        });
      }
    }

    // 5. Match existing TESTED & UNTESTED ideas in DB based on detected slugs
    const detectedSlugs = scanResult.result.items.map((it) => it.wasteTypeSlug);
    const matchedIdeas = await prisma.idea.findMany({
      where: {
        published: true,
        status: { in: ['TESTED', 'UNTESTED'] },
        waste: {
          some: {
            wasteType: {
              slug: { in: detectedSlugs },
            },
          },
        },
      },
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
      take: 6,
    });

    const userSaves = await prisma.save.findMany({ where: { userId } });
    const savedSet = new Set(userSaves.map((s) => s.ideaId));

    res.status(201).json({
      scan: {
        id: scanResult.scanId,
        mode: scanResult.mode,
        model: scanResult.model,
        latencyMs: scanResult.latencyMs,
        items: scanResult.result.items,
        overallConfidence: scanResult.result.overallConfidence,
        warnings: scanResult.result.warnings,
      },
      imageUrls,
      matchedIdeas: matchedIdeas.map((i) => formatMatchedIdea(i, savedSet)),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /scans/:id/items - User edits detected chips (removes/adds items)
router.patch('/scans/:id/items', async (req, res, next) => {
  try {
    const scanId = req.params.id;
    const userId = req.user!.id;
    const input = PatchScanItemsInputSchema.parse(req.body);

    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan || scan.userId !== userId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Scan not found' } });
    }

    // Update stored detection result items
    const parsedResult = JSON.parse(scan.resultJson);
    parsedResult.items = input.items.map((it) => ({
      label: it.wasteTypeSlug,
      wasteTypeSlug: it.wasteTypeSlug,
      material: 'user-confirmed',
      estimatedPieces: it.pieces,
      condition: 'unknown',
      hazardous: false,
      confidence: 1.0,
    }));

    await prisma.scan.update({
      where: { id: scanId },
      data: { resultJson: JSON.stringify(parsedResult) },
    });

    // Re-match ideas without an AI call
    const slugs = input.items.map((i) => i.wasteTypeSlug);
    const matchedIdeas = await prisma.idea.findMany({
      where: {
        published: true,
        status: { in: ['TESTED', 'UNTESTED'] },
        waste: {
          some: {
            wasteType: {
              slug: { in: slugs },
            },
          },
        },
      },
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
      take: 6,
    });

    const userSaves = await prisma.save.findMany({ where: { userId } });
    const savedSet = new Set(userSaves.map((s) => s.ideaId));

    res.json({
      scan: {
        id: scan.id,
        items: parsedResult.items,
      },
      matchedIdeas: matchedIdeas.map((i) => formatMatchedIdea(i, savedSet)),
    });
  } catch (err) {
    next(err);
  }
});

// POST /scans/:id/suggest - Generates AI draft ideas
router.post('/scans/:id/suggest', async (req, res, next) => {
  try {
    const scanId = req.params.id;
    const userId = req.user!.id;

    // Check scan quota
    const quota = await checkUserScanQuota(userId);
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Scan generation limit reached for this period.',
          resetAt: quota.resetAt,
        },
      });
    }

    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan || scan.userId !== userId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Scan not found' } });
    }

    const detection = JSON.parse(scan.resultJson);
    const items = detection.items.map((it: any) => ({
      wasteTypeSlug: it.wasteTypeSlug,
      pieces: it.estimatedPieces || 1,
    }));

    const createdDrafts = await generateIdeaDrafts({
      scanId,
      items,
      userId,
      locale: req.user?.locale,
    });

    res.json({
      ideas: createdDrafts.map((i) => formatMatchedIdea(i)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /scans/:id
router.get('/scans/:id', async (req, res, next) => {
  try {
    const scanId = req.params.id;
    const userId = req.user!.id;

    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        ideas: {
          include: {
            waste: { include: { wasteType: true } },
            materials: true,
            tools: true,
            steps: { orderBy: { position: 'asc' } },
          },
        },
      },
    });

    if (!scan || (scan.userId !== userId && req.user?.role !== 'ADMIN')) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Scan not found' } });
    }

    const detection = JSON.parse(scan.resultJson);
    const imageUrls = JSON.parse(scan.imagePaths);

    res.json({
      scan: {
        id: scan.id,
        mode: scan.mode,
        model: scan.model,
        latencyMs: scan.latencyMs,
        items: detection.items,
        overallConfidence: detection.overallConfidence,
        warnings: detection.warnings,
        createdAt: scan.createdAt,
      },
      imageUrls,
      ideas: scan.ideas.map((i) => formatMatchedIdea(i)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /me/scans
router.get('/me/scans', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const scans = await prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formatted = scans.map((s) => ({
      id: s.id,
      mode: s.mode,
      model: s.model,
      imageUrls: JSON.parse(s.imagePaths),
      items: JSON.parse(s.resultJson).items,
      createdAt: s.createdAt,
    }));

    res.json({ scans: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /ideas/:id/assistant (Ask ReMake)
router.post('/ideas/:id/assistant', aiAssistantRateLimiter, async (req, res, next) => {
  try {
    const ideaId = req.params.id;
    const input = AssistantInputSchema.parse(req.body);

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
    });

    if (!idea) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }

    const result = await askIdeaAssistant({
      idea,
      message: input.message,
      history: input.history,
      locale: req.user?.locale || 'en',
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /ideas/:id/adapt
router.post('/ideas/:id/adapt', async (req, res, next) => {
  try {
    const ideaId = req.params.id;
    const input = AdaptMaterialsInputSchema.parse(req.body);

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        materials: true,
        tools: true,
      },
    });

    if (!idea) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }

    const result = await adaptIdeaMaterials({
      idea,
      userHas: input.have,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
