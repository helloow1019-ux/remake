import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeWasteImages } from '../src/ai/handlers.js';
import { prisma } from '../src/db.js';
import { verifyGroqModels } from '../src/ai/client.js';

async function runSmokeTest() {
  const imageArg = process.argv[2];
  console.log('🔍 ReMake AI Smoke Test');
  console.log('-----------------------');

  const health = await verifyGroqModels();
  console.log('AI System Health:', health);

  const user = await prisma.user.findFirst();
  const userId = user ? user.id : 'smoke-test-user';

  if (!imageArg) {
    console.log('\nℹ️ No photo path provided. Testing with sample synthetic buffer in mock mode...');
    // Create tiny 100x100 dummy JPEG
    const sharp = (await import('sharp')).default;
    const dummyBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 50, g: 150, b: 80 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await analyzeWasteImages({
      imageBuffers: [dummyBuffer],
      userId,
      imagePaths: ['/uploads/smoke-sample.jpg'],
    });

    console.log('\n✅ Test detection succeeded:');
    console.dir(result, { depth: null });
    process.exit(0);
  }

  const resolvedPath = resolve(process.cwd(), imageArg);
  if (!existsSync(resolvedPath)) {
    console.error(`❌ File not found at: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`📸 Reading photo: ${resolvedPath}`);
  const imageBuffer = readFileSync(resolvedPath);

  try {
    const result = await analyzeWasteImages({
      imageBuffers: [imageBuffer],
      userId,
      imagePaths: [imageArg],
    });

    console.log('\n✅ Live AI Detection Result:');
    console.dir(result, { depth: null });
  } catch (err: any) {
    console.error('\n❌ AI detection failed:', err.message, err.code ? `(Code: ${err.code})` : '');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSmokeTest();
