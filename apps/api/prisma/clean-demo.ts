import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDemo() {
  console.log('🧹 Cleaning demo data...');
  const demoUser = await prisma.user.findUnique({
    where: { email: 'maker.ayesha@example.com' },
  });

  if (demoUser) {
    await prisma.make.deleteMany({ where: { userId: demoUser.id } });
    await prisma.user.delete({ where: { id: demoUser.id } });
    console.log('✅ Demo user and makes removed');
  } else {
    console.log('ℹ️ No demo user found');
  }
}

cleanDemo()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
