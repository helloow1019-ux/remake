import { createApp } from './app.js';
import { env } from './env.js';
import { verifyGroqModels } from './ai/client.js';

const app = createApp();

app.listen(env.PORT, async () => {
  console.log(`\n========================================`);
  console.log(`🌿 ReMake API Server running on port ${env.PORT}`);
  console.log(`   Mode: ${env.NODE_ENV} | Web Origin: ${env.WEB_ORIGIN}`);
  console.log(`   AI Mode: ${env.AI_MODE}`);
  console.log(`========================================\n`);

  // Verify models in background
  try {
    const health = await verifyGroqModels();
    console.log('🤖 AI Integration Health:');
    console.log(`   - Vision model: ${health.visionModel}`);
    console.log(`   - Text model:   ${health.textModel}`);
    console.log(`   - Reachable:    ${health.reachable} (Mode: ${health.mode})`);
  } catch (err: any) {
    console.warn('⚠️ AI health check warning:', err.message);
  }
});
