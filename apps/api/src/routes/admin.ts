import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload, saveUploadedImage } from '../middleware/upload.js';
import {
  CreateIdeaInputSchema,
  UpdateIdeaInputSchema,
  CreateWasteTypeInputSchema,
  UpdateWasteTypeInputSchema,
  CreateProductInputSchema,
  UpdateProductInputSchema,
  ModerateMakeInputSchema,
  BulkModerateInputSchema,
  UpdateSuggestionInputSchema,
  AdminSettingsSchema,
  REUSE_DISPLACEMENT_DEFAULT,
} from '@remake/shared';

const router = Router();
router.use(requireAdmin);

// GET /admin/dashboard
router.get('/admin/dashboard', async (_req, res, next) => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [usersCount, scansCount, makesCount, pendingModeration, ideasCount, topIdeas, recentMakes] =
      await Promise.all([
        prisma.user.count(),
        prisma.scan.count(),
        prisma.make.count(),
        prisma.make.count({ where: { status: 'PENDING' } }),
        prisma.idea.count(),
        prisma.idea.findMany({
          orderBy: { makesCount: 'desc' },
          take: 5,
          select: { id: true, slug: true, titleEn: true, makesCount: true, status: true },
        }),
        prisma.make.findMany({
          where: { createdAt: { gte: fourteenDaysAgo } },
          select: { createdAt: true },
        }),
      ]);

    // Build 14-day activity chart
    const dailyMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const m of recentMakes) {
      const day = m.createdAt.toISOString().slice(0, 10);
      if (dailyMap[day] !== undefined) {
        dailyMap[day]++;
      }
    }
    const activityChart = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    res.json({
      totals: {
        users: usersCount,
        scans: scansCount,
        makes: makesCount,
        pendingModeration,
        ideas: ideasCount,
      },
      activityChart,
      topIdeas,
    });
  } catch (err) {
    next(err);
  }
});

// POST /admin/uploads
router.post('/admin/uploads', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'No file provided' } });
    }
    const saved = await saveUploadedImage(req.file.buffer);
    res.json({ url: saved.url });
  } catch (err) {
    next(err);
  }
});

// GET /admin/ideas
router.get('/admin/ideas', async (_req, res, next) => {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        waste: { include: { wasteType: true } },
        _count: { select: { makes: true, steps: true } },
      },
    });

    res.json({ ideas });
  } catch (err) {
    next(err);
  }
});

// POST /admin/ideas
router.post('/admin/ideas', async (req, res, next) => {
  try {
    const input = CreateIdeaInputSchema.parse(req.body);

    // Business validation: cannot set status to TESTED without >= 3 steps and cover image
    if (input.status === 'TESTED') {
      if (!input.coverImage) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Tested ideas must include a cover image' },
        });
      }
      if (input.steps.length < 3) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Tested ideas must have at least 3 steps' },
        });
      }
    }

    // Calculate wasteGrams & co2SavedG
    const wasteTypes = await prisma.wasteType.findMany();
    const wtMap = new Map(wasteTypes.map((w) => [w.id, w]));

    let wasteGrams = 0;
    let co2Grams = 0;

    for (const w of input.waste) {
      const wt = wtMap.get(w.wasteTypeId);
      if (wt) {
        const itemGrams = w.grams ?? w.pieces * wt.gramsPerPiece;
        wasteGrams += itemGrams;
        co2Grams += Math.round((itemGrams / 1000) * wt.co2PerKg * 1000 * REUSE_DISPLACEMENT_DEFAULT);
      }
    }

    const created = await prisma.idea.create({
      data: {
        slug: input.slug,
        status: input.status,
        published: input.published,
        titleEn: input.titleEn,
        titleUr: input.titleUr,
        summaryEn: input.summaryEn,
        summaryUr: input.summaryUr,
        difficulty: input.difficulty,
        timeMinutes: input.timeMinutes,
        costPkr: input.costPkr,
        sellPricePkr: input.sellPricePkr,
        safetyNoteEn: input.safetyNoteEn,
        safetyNoteUr: input.safetyNoteUr,
        coverImage: input.coverImage,
        wasteGrams,
        co2SavedG: co2Grams,
        isSampleData: input.isSampleData,
        source: 'ADMIN',
        waste: {
          create: input.waste.map((w) => ({
            wasteTypeId: w.wasteTypeId,
            pieces: w.pieces,
            grams: w.grams ?? (wtMap.get(w.wasteTypeId)?.gramsPerPiece || 20) * w.pieces,
          })),
        },
        materials: {
          create: input.materials.map((m, idx) => ({ ...m, sortOrder: idx })),
        },
        tools: {
          create: input.tools.map((t, idx) => ({ ...t, sortOrder: idx })),
        },
        steps: {
          create: input.steps.map((s) => ({
            position: s.position,
            textEn: s.textEn,
            textUr: s.textUr,
            tipEn: s.tipEn,
            tipUr: s.tipUr,
            imageUrl: s.imageUrl,
            timerSeconds: s.timerSeconds,
          })),
        },
      },
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
    });

    res.status(201).json({ idea: created });
  } catch (err) {
    next(err);
  }
});

// GET /admin/ideas/:id
router.get('/admin/ideas/:id', async (req, res, next) => {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: req.params.id },
      include: {
        waste: { include: { wasteType: true } },
        materials: { orderBy: { sortOrder: 'asc' } },
        tools: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { position: 'asc' } },
      },
    });
    if (!idea) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }
    res.json({ idea });
  } catch (err) {
    next(err);
  }
});

// PUT /admin/ideas/:id
router.put('/admin/ideas/:id', async (req, res, next) => {
  try {
    const ideaId = req.params.id;
    const input = UpdateIdeaInputSchema.parse(req.body);

    const existing = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }

    const updated = await prisma.idea.update({
      where: { id: ideaId },
      data: {
        slug: input.slug,
        status: input.status,
        published: input.published,
        titleEn: input.titleEn,
        titleUr: input.titleUr,
        summaryEn: input.summaryEn,
        summaryUr: input.summaryUr,
        difficulty: input.difficulty,
        timeMinutes: input.timeMinutes,
        costPkr: input.costPkr,
        sellPricePkr: input.sellPricePkr,
        safetyNoteEn: input.safetyNoteEn,
        safetyNoteUr: input.safetyNoteUr,
        coverImage: input.coverImage,
        isSampleData: input.isSampleData,
      },
    });

    res.json({ idea: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/ideas/:id
router.delete('/admin/ideas/:id', async (req, res, next) => {
  try {
    await prisma.idea.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /admin/ideas/:id/promote (AI_DRAFT -> UNTESTED)
router.post('/admin/ideas/:id/promote', async (req, res, next) => {
  try {
    const idea = await prisma.idea.findUnique({ where: { id: req.params.id } });
    if (!idea) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } });
    }

    const updated = await prisma.idea.update({
      where: { id: req.params.id },
      data: {
        status: 'UNTESTED',
        source: 'ADMIN',
      },
    });

    res.json({ idea: updated });
  } catch (err) {
    next(err);
  }
});

// Moderation
// GET /admin/makes
router.get('/admin/makes', async (req, res, next) => {
  try {
    const status = (req.query.status as string) || 'PENDING';
    const makes = await prisma.make.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        idea: { select: { id: true, slug: true, titleEn: true } },
      },
    });
    res.json({ makes });
  } catch (err) {
    next(err);
  }
});

// POST /admin/makes/:id/approve
router.post('/admin/makes/:id/approve', async (req, res, next) => {
  try {
    const make = await prisma.make.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', rejectReason: null },
    });

    // Check sharing-is-caring badge if photo present
    if (make.photoUrl) {
      const badge = await prisma.badge.findUnique({ where: { key: 'sharing-is-caring' } });
      if (badge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: make.userId, badgeId: badge.id } },
          create: { userId: make.userId, badgeId: badge.id },
          update: {},
        });
      }
    }

    res.json({ make });
  } catch (err) {
    next(err);
  }
});

// POST /admin/makes/:id/reject
router.post('/admin/makes/:id/reject', async (req, res, next) => {
  try {
    const input = ModerateMakeInputSchema.parse(req.body);
    const make = await prisma.make.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectReason: input.reason || 'Rejected by moderator' },
    });
    res.json({ make });
  } catch (err) {
    next(err);
  }
});

// POST /admin/makes/bulk
router.post('/admin/makes/bulk', async (req, res, next) => {
  try {
    const input = BulkModerateInputSchema.parse(req.body);
    const newStatus = input.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await prisma.make.updateMany({
      where: { id: { in: input.ids } },
      data: {
        status: newStatus,
        rejectReason: input.action === 'REJECT' ? input.reason || 'Rejected by moderator' : null,
      },
    });

    res.json({ ok: true, count: input.ids.length });
  } catch (err) {
    next(err);
  }
});

// Waste Types CRUD
// GET /admin/waste-types
router.get('/admin/waste-types', async (_req, res, next) => {
  try {
    const wasteTypes = await prisma.wasteType.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(wasteTypes);
  } catch (err) {
    next(err);
  }
});

// POST /admin/waste-types
router.post('/admin/waste-types', async (req, res, next) => {
  try {
    const input = CreateWasteTypeInputSchema.parse(req.body);
    const created = await prisma.wasteType.create({ data: input });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /admin/waste-types/:id (Recomputes affected ideas when factor changes)
router.put('/admin/waste-types/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const input = UpdateWasteTypeInputSchema.parse(req.body);

    const existing = await prisma.wasteType.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Waste type not found' } });
    }

    const updated = await prisma.wasteType.update({
      where: { id },
      data: input,
    });

    let recomputedIdeasCount = 0;
    // If co2PerKg changed, recompute all ideas using this waste type
    if (input.co2PerKg !== undefined && input.co2PerKg !== existing.co2PerKg) {
      const affectedIdeaWastes = await prisma.ideaWaste.findMany({
        where: { wasteTypeId: id },
        select: { ideaId: true },
      });
      const ideaIds = Array.from(new Set(affectedIdeaWastes.map((w) => w.ideaId)));

      const allWasteTypes = await prisma.wasteType.findMany();
      const wtMap = new Map(allWasteTypes.map((w) => [w.id, w]));

      for (const ideaId of ideaIds) {
        const ideaWastes = await prisma.ideaWaste.findMany({ where: { ideaId } });
        let co2SavedG = 0;
        for (const iw of ideaWastes) {
          const wt = wtMap.get(iw.wasteTypeId);
          if (wt) {
            co2SavedG += Math.round((iw.grams / 1000) * wt.co2PerKg * 1000 * REUSE_DISPLACEMENT_DEFAULT);
          }
        }
        await prisma.idea.update({
          where: { id: ideaId },
          data: { co2SavedG },
        });
        recomputedIdeasCount++;
      }
    }

    res.json({ wasteType: updated, recomputedIdeasCount });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/waste-types/:id
router.delete('/admin/waste-types/:id', async (req, res, next) => {
  try {
    await prisma.wasteType.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Products CRUD
// GET /admin/products
router.get('/admin/products', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /admin/products
router.post('/admin/products', async (req, res, next) => {
  try {
    const input = CreateProductInputSchema.parse(req.body);
    const created = await prisma.product.create({ data: input });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /admin/products/:id
router.put('/admin/products/:id', async (req, res, next) => {
  try {
    const input = UpdateProductInputSchema.parse(req.body);
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: input,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/products/:id
router.delete('/admin/products/:id', async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Suggestions
// GET /admin/suggestions
router.get('/admin/suggestions', async (_req, res, next) => {
  try {
    const suggestions = await prisma.suggestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/suggestions/:id
router.patch('/admin/suggestions/:id', async (req, res, next) => {
  try {
    const input = UpdateSuggestionInputSchema.parse(req.body);
    const updated = await prisma.suggestion.update({
      where: { id: req.params.id },
      data: { status: input.status },
    });
    res.json({ suggestion: updated });
  } catch (err) {
    next(err);
  }
});

// Settings
// GET /admin/settings
router.get('/admin/settings', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    res.json(map);
  } catch (err) {
    next(err);
  }
});

// PUT /admin/settings
router.put('/admin/settings', async (req, res, next) => {
  try {
    const input = AdminSettingsSchema.parse(req.body);
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        await prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Export CSVs
// GET /admin/export/makes.csv
router.get('/admin/export/makes.csv', async (_req, res, next) => {
  try {
    const makes = await prisma.make.findMany({
      include: {
        user: { select: { name: true, email: true } },
        idea: { select: { titleEn: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'Make ID,Created At,User Name,User Email,Idea Title,Idea Slug,Outcome,Time Min,Difficulty,Rating,Status,Waste g,CO2 g,Money PKR\n';
    for (const m of makes) {
      csv += `"${m.id}","${m.createdAt.toISOString()}","${m.user.name}","${m.user.email || ''}","${m.idea.titleEn}","${m.idea.slug}","${m.outcome}",${m.timeTakenMin || ''},${m.difficultyFelt || ''},${m.rating || ''},"${m.status}",${m.wasteGramsSnapshot},${m.co2GramsSnapshot},${m.moneyPkrSnapshot}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="remake-makes.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// GET /admin/export/impact.csv
router.get('/admin/export/impact.csv', async (_req, res, next) => {
  try {
    const logs = await prisma.impactLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
        wasteType: { select: { slug: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'Log ID,Created At,User Name,User Email,Waste Type,Pieces,Grams,CO2 g,Note\n';
    for (const l of logs) {
      csv += `"${l.id}","${l.createdAt.toISOString()}","${l.user.name}","${l.user.email || ''}","${l.wasteType.nameEn}",${l.pieces},${l.grams},${l.co2Grams},"${(l.note || '').replace(/"/g, '""')}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="remake-impact-logs.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;
