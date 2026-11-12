import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { prisma } from './db.js';

/**
 * Ensures the database schema is created and initial seed data is populated.
 * Runs automatically on application boot so fresh containers or new DATABASE_URL
 * targets never fail with missing table errors.
 */
export async function ensureDatabaseReady(): Promise<void> {
  let schemaNeedsPush = false;

  try {
    // Probe database schema by querying the User table
    await prisma.user.findFirst();
  } catch (err: any) {
    schemaNeedsPush = true;
  }

  if (schemaNeedsPush) {
    console.log('⚡ [DB] Database tables not found. Automatically applying Prisma schema...');
    
    // Locate schema.prisma across workspace structures
    const candidates = [
      resolve(process.cwd(), 'prisma/schema.prisma'),
      resolve(process.cwd(), 'apps/api/prisma/schema.prisma'),
      resolve(process.cwd(), '../api/prisma/schema.prisma'),
    ];
    const schemaFile = candidates.find((p) => existsSync(p));

    if (schemaFile) {
      try {
        execSync(`npx prisma db push --schema="${schemaFile}" --skip-generate --accept-data-loss`, {
          stdio: 'inherit',
          env: process.env,
        });
        console.log('✅ [DB] Prisma schema pushed successfully.');
      } catch (pushErr: any) {
        console.error('❌ [DB] Failed to push Prisma schema:', pushErr.message);
      }
    } else {
      console.warn('⚠️ [DB] Could not locate schema.prisma file.');
    }
  }

  // Check if waste types are present, if not seed database
  try {
    const count = await prisma.wasteType.count();
    if (count === 0) {
      console.log('🌱 [DB] Database is empty. Seeding initial ReMake data...');
      const seedCandidates = [
        resolve(process.cwd(), 'prisma/seed.ts'),
        resolve(process.cwd(), 'apps/api/prisma/seed.ts'),
        resolve(process.cwd(), '../api/prisma/seed.ts'),
      ];
      const seedFile = seedCandidates.find((p) => existsSync(p));
      if (seedFile) {
        execSync(`npx tsx "${seedFile}"`, {
          stdio: 'inherit',
          env: process.env,
        });
        console.log('✅ [DB] Database seeded successfully.');
      }
    } else {
      console.log(`✅ [DB] Database ready with ${count} waste types.`);
    }
  } catch (seedErr: any) {
    console.warn('⚠️ [DB] Automatic seed check warning:', seedErr.message);
  }
}
