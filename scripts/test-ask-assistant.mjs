import { askIdeaAssistant } from '../apps/api/src/ai/handlers.js';
import { prisma } from '../apps/api/src/db.js';

const idea = await prisma.idea.findFirst({
  where: { slug: 'bottle-cap-keychain' },
  include: { materials: true, tools: true, steps: true }
});

console.log('Testing askIdeaAssistant with idea:', idea.titleEn);

const res = await askIdeaAssistant({
  idea,
  message: 'explain steps in detail',
  locale: 'en'
});

console.log('\nAI Assistant Reply:');
console.log(res.reply);
console.log('\nDisclaimer:', res.disclaimer);
process.exit(0);

