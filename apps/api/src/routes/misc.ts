import { Router } from 'express';
import { prisma } from '../db.js';
import { CreateSuggestionInputSchema } from '@remake/shared';

const router = Router();

// Cache for /stats/today (10 seconds)
let statsCache: { data: any; expiresAt: number } | null = null;

// GET /settings/public
router.get('/settings/public', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const map = new Map(settings.map((s) => [s.key, s.value]));

    res.json({
      whatsappNumber: map.get('whatsapp_number') || '923000000000',
      instagramUrl: map.get('instagram_url') || 'https://instagram.com/remake_pk',
      siteName: map.get('site_name') || 'ReMake',
      kioskLock: map.get('kiosk_lock') === 'true',
    });
  } catch (err) {
    next(err);
  }
});

// POST /suggestions
router.post('/suggestions', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const input = CreateSuggestionInputSchema.parse(req.body);

    const suggestion = await prisma.suggestion.create({
      data: {
        userId,
        kind: input.kind,
        text: input.text,
        status: 'NEW',
      },
    });

    res.status(201).json({ suggestion });
  } catch (err) {
    next(err);
  }
});

// GET /stats/today (Exhibition live counters)
router.get('/stats/today', async (_req, res, next) => {
  try {
    const now = Date.now();
    if (statsCache && now < statsCache.expiresAt) {
      return res.json(statsCache.data);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [makesToday, makesWasteToday, logsWasteToday, scansToday, visitorsToday] =
      await Promise.all([
        prisma.make.count({
          where: { createdAt: { gte: todayStart } },
        }),
        prisma.make.aggregate({
          where: { createdAt: { gte: todayStart } },
          _sum: { wasteGramsSnapshot: true },
        }),
        prisma.impactLog.aggregate({
          where: { createdAt: { gte: todayStart } },
          _sum: { grams: true },
        }),
        prisma.scan.count({
          where: { createdAt: { gte: todayStart } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: todayStart } },
        }),
      ]);

    const totalWasteG =
      (makesWasteToday._sum.wasteGramsSnapshot || 0) + (logsWasteToday._sum.grams || 0);

    const data = {
      makesToday,
      wasteGToday: totalWasteG,
      scansToday,
      visitorsToday: Math.max(visitorsToday, 1),
    };

    statsCache = {
      data,
      expiresAt: now + 10 * 1000, // 10s TTL
    };

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
