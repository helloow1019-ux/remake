import { Router } from 'express';
import { verifyGroqModels } from '../ai/client.js';

const router = Router();
const startTime = Date.now();

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

router.get('/health/ai', async (_req, res) => {
  try {
    const health = await verifyGroqModels();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

export default router;
