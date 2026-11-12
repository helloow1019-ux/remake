import { Router } from 'express';
import { prisma } from '../db.js';
import {
  CreateImpactLogInputSchema,
  calculateEquivalents,
  calculateStreak,
  REUSE_DISPLACEMENT_DEFAULT,
  BOTTLE_EQUIVALENT_GRAMS,
  CAP_EQUIVALENT_GRAMS,
  PHONE_CHARGE_CO2_GRAMS,
  CAR_KM_CO2_GRAMS,
} from '@remake/shared';
import { checkAndAwardBadges } from './makes.js';

const router = Router();

// Helper to get ISO week start date string (Monday)
function getIsoWeekStart(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

// GET /me/impact
router.get('/me/impact', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [makes, logs, allBadges, userBadges, wasteTypes] = await Promise.all([
      prisma.make.findMany({
        where: { userId },
        include: {
          idea: {
            include: {
              waste: { include: { wasteType: true } },
            },
          },
        },
      }),
      prisma.impactLog.findMany({
        where: { userId },
        include: { wasteType: true },
      }),
      prisma.badge.findMany(),
      prisma.userBadge.findMany({ where: { userId } }),
      prisma.wasteType.findMany({ where: { active: true } }),
    ]);

    // Totals
    let totalWasteG = 0;
    let totalCo2G = 0;
    let totalMoneyPkr = 0;

    let plasticBottleG = 0;
    let bottleCapG = 0;

    const wasteMap: Record<string, number> = {};
    for (const wt of wasteTypes) {
      wasteMap[wt.slug] = 0;
    }

    // Weekly mapping (last 8 weeks)
    const now = new Date();
    const weeklyBuckets: Record<string, { wasteG: number; co2G: number }> = {};
    for (let i = 7; i >= 0; i--) {
      const pastDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = getIsoWeekStart(pastDate);
      weeklyBuckets[weekStart] = { wasteG: 0, co2G: 0 };
    }

    // Process Makes
    for (const m of makes) {
      totalWasteG += m.wasteGramsSnapshot;
      totalCo2G += m.co2GramsSnapshot;
      totalMoneyPkr += m.moneyPkrSnapshot;

      // Group by waste type
      for (const w of m.idea.waste) {
        const slug = w.wasteType.slug;
        wasteMap[slug] = (wasteMap[slug] || 0) + w.grams;
        if (slug === 'plastic-bottle') plasticBottleG += w.grams;
        if (slug === 'bottle-cap') bottleCapG += w.grams;
      }

      // Group by week
      const weekKey = getIsoWeekStart(m.createdAt);
      if (weeklyBuckets[weekKey]) {
        weeklyBuckets[weekKey].wasteG += m.wasteGramsSnapshot;
        weeklyBuckets[weekKey].co2G += m.co2GramsSnapshot;
      }
    }

    // Process Logs
    for (const l of logs) {
      totalWasteG += l.grams;
      totalCo2G += l.co2Grams;

      const slug = l.wasteType.slug;
      wasteMap[slug] = (wasteMap[slug] || 0) + l.grams;
      if (slug === 'plastic-bottle') plasticBottleG += l.grams;
      if (slug === 'bottle-cap') bottleCapG += l.grams;

      const weekKey = getIsoWeekStart(l.createdAt);
      if (weeklyBuckets[weekKey]) {
        weeklyBuckets[weekKey].wasteG += l.grams;
        weeklyBuckets[weekKey].co2G += l.co2Grams;
      }
    }

    // Format weekly list sorted ascending
    const weekly = Object.entries(weeklyBuckets).map(([weekStart, data]) => ({
      weekStart,
      wasteG: data.wasteG,
      co2G: data.co2G,
    }));

    // Format byWaste list
    const byWaste = wasteTypes
      .map((wt) => ({
        slug: wt.slug,
        nameEn: wt.nameEn,
        nameUr: wt.nameUr,
        wasteG: wasteMap[wt.slug] || 0,
      }))
      .filter((w) => w.wasteG > 0)
      .sort((a, b) => b.wasteG - a.wasteG);

    // Equivalents
    const equivalents = calculateEquivalents({
      totalWasteG,
      totalCo2G,
      plasticBottleG,
      bottleCapG,
    });

    // Streak
    const dates = [
      ...makes.map((m) => m.createdAt.toISOString().slice(0, 10)),
      ...logs.map((l) => l.createdAt.toISOString().slice(0, 10)),
    ];
    const streak = calculateStreak(dates);

    // Badges
    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.awardedAt]));
    const badges = allBadges.map((b) => ({
      id: b.id,
      key: b.key,
      nameEn: b.nameEn,
      nameUr: b.nameUr,
      descriptionEn: b.descriptionEn,
      descriptionUr: b.descriptionUr,
      icon: b.icon,
      earned: userBadgeMap.has(b.id),
      awardedAt: userBadgeMap.get(b.id)?.toISOString() || null,
    }));

    res.json({
      totals: {
        wasteG: totalWasteG,
        co2G: totalCo2G,
        ideasMade: makes.length,
        moneyPkr: totalMoneyPkr,
      },
      weekly,
      byWaste,
      equivalents,
      streak,
      badges,
    });
  } catch (err) {
    next(err);
  }
});

// POST /me/impact-logs (Manual "Log my reuse")
router.post('/me/impact-logs', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const input = CreateImpactLogInputSchema.parse(req.body);

    const wasteType = await prisma.wasteType.findUnique({
      where: { slug: input.wasteTypeSlug },
    });
    if (!wasteType) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Waste type not found' } });
    }

    const pieces = input.pieces ?? 1;
    const grams = input.grams ?? pieces * wasteType.gramsPerPiece;
    const co2G = Math.round((grams / 1000) * wasteType.co2PerKg * 1000 * REUSE_DISPLACEMENT_DEFAULT);

    const log = await prisma.impactLog.create({
      data: {
        userId,
        wasteTypeId: wasteType.id,
        pieces,
        grams,
        co2Grams: co2G,
        note: input.note,
      },
      include: { wasteType: true },
    });

    const newBadges = await checkAndAwardBadges(userId);

    res.status(201).json({
      log,
      newBadges,
    });
  } catch (err) {
    next(err);
  }
});

// GET /impact/method
router.get('/impact/method', async (_req, res, next) => {
  try {
    const wasteTypes = await prisma.wasteType.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    const displacementSetting = await prisma.setting.findUnique({
      where: { key: 'reuse_displacement' },
    });
    const reuseDisplacement = displacementSetting ? parseFloat(displacementSetting.value) : REUSE_DISPLACEMENT_DEFAULT;

    res.json({
      wasteTypes: wasteTypes.map((w) => ({
        slug: w.slug,
        nameEn: w.nameEn,
        nameUr: w.nameUr,
        gramsPerPiece: w.gramsPerPiece,
        co2PerKg: w.co2PerKg,
        factorSource: w.factorSource,
      })),
      constants: {
        reuseDisplacement,
        bottleEquivalentGrams: BOTTLE_EQUIVALENT_GRAMS,
        capEquivalentGrams: CAP_EQUIVALENT_GRAMS,
        phoneChargeCo2Grams: PHONE_CHARGE_CO2_GRAMS,
        carKmCo2Grams: CAR_KM_CO2_GRAMS,
      },
      formulaExplanation: {
        wasteFormula: 'wasteGrams = sum(pieces * gramsPerPiece) or measured grams',
        co2Formula: 'co2SavedG = round(grams / 1000 * co2PerKg * 1000 * reuseDisplacement)',
        moneyFormula: 'moneyPkr = max(0, sellPricePkr - costPkr)',
        profitPerHourFormula: 'profitPerHour = max(0, sell - cost) / (timeMinutes / 60)',
        honestyNotice:
          'All impact calculations are server-side estimates based on conservative default life-cycle factors. Reused items displace virgin production only partially, hence the default 0.5 displacement factor.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
