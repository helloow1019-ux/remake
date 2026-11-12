import { generateIdeaDrafts } from '../apps/api/src/ai/handlers.js';
import { prisma } from '../apps/api/src/db.js';

const user = await prisma.user.findFirst();

console.log('Testing generateIdeaDrafts with plastic-bag items...');

const ideas = await generateIdeaDrafts({
  items: [{ wasteTypeSlug: 'plastic-bag', pieces: 4 }],
  userId: user?.id,
  locale: 'en'
});

console.log('\nGenerated Ideas Count:', ideas.length);
for (const idea of ideas) {
  console.log(`- ${idea.titleEn} (${idea.status}) - ${idea.wasteGrams}g waste`);
}
process.exit(0);
