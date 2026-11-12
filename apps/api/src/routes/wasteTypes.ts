import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET /waste-types
router.get('/waste-types', async (_req, res, next) => {
  try {
    const wasteTypes = await prisma.wasteType.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            ideas: {
              where: {
                idea: {
                  published: true,
                  status: { in: ['TESTED', 'UNTESTED'] },
                },
              },
            },
          },
        },
      },
    });

    const formatted = wasteTypes.map((w) => ({
      id: w.id,
      slug: w.slug,
      nameEn: w.nameEn,
      nameUr: w.nameUr,
      icon: w.icon,
      gramsPerPiece: w.gramsPerPiece,
      co2PerKg: w.co2PerKg,
      factorSource: w.factorSource,
      sortOrder: w.sortOrder,
      active: w.active,
      ideaCount: w._count.ideas,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

export default router;
