import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('🚀 Running ReMake Setup...');

// 1. Ensure .env exists
const envPath = resolve(rootDir, '.env');
const envExamplePath = resolve(rootDir, '.env.example');
if (!existsSync(envPath)) {
  if (existsSync(envExamplePath)) {
    console.log('📄 Copying .env.example to .env...');
    copyFileSync(envExamplePath, envPath);
  } else {
    console.warn('⚠️ .env.example not found. Please create .env manually.');
  }
} else {
  console.log('✅ .env already exists.');
}

// 2. Ensure uploads directory exists
const uploadsDir = resolve(rootDir, 'apps/api/uploads');
if (!existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory at apps/api/uploads...');
  mkdirSync(uploadsDir, { recursive: true });
}

// 3. Generate Prisma client
console.log('📦 Generating Prisma Client...');
try {
  execSync('npm run -w apps/api db:generate', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
  console.error('Failed to generate Prisma client:', e.message);
  process.exit(1);
}

// 4. Push database schema
console.log('🗄️ Setting up database schema with Prisma db push...');
try {
  execSync('npm run -w apps/api db:push', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
  console.error('Failed to push database schema:', e.message);
  process.exit(1);
}

// 5. Seed database
console.log('🌱 Seeding database...');
try {
  execSync('npm run seed', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
  console.error('Failed to seed database:', e.message);
  process.exit(1);
}

console.log('✨ ReMake setup completed successfully!');
