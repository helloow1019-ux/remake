import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET /products
router.get('/products', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /products/:slug
router.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;
