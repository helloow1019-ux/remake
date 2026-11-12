import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const SCREENSHOT_DIR = resolve(process.cwd(), 'docs/screenshots');
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting ReMake App for Screenshot Capture...');
  
  // Start server on port 4000 in development mode for evaluation
  const server = spawn('node', ['apps/api/dist/index.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '4000', NODE_ENV: 'development' },
    stdio: 'inherit',
  });

  // Give server 3 seconds to spin up
  await wait(3000);

  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const targets = [
    {
      name: 'home-desktop-light',
      path: '/',
      viewport: { width: 1280, height: 800 },
      colorScheme: 'light',
    },
    {
      name: 'home-desktop-dark',
      path: '/',
      viewport: { width: 1280, height: 800 },
      colorScheme: 'dark',
      script: () => document.documentElement.classList.add('dark'),
    },
    {
      name: 'home-mobile-light',
      path: '/',
      viewport: { width: 390, height: 844 },
      colorScheme: 'light',
    },
    {
      name: 'home-mobile-dark',
      path: '/',
      viewport: { width: 390, height: 844 },
      colorScheme: 'dark',
      script: () => document.documentElement.classList.add('dark'),
    },
    {
      name: 'home-urdu-desktop',
      path: '/',
      viewport: { width: 1280, height: 800 },
      script: () => {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ur';
        localStorage.setItem('i18nextLng', 'ur');
      },
      reload: true,
    },
    {
      name: 'home-urdu-mobile',
      path: '/',
      viewport: { width: 390, height: 844 },
      script: () => {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ur';
        localStorage.setItem('i18nextLng', 'ur');
      },
      reload: true,
    },
    {
      name: 'explore-desktop',
      path: '/explore',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'scan-desktop',
      path: '/scan',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'scan-mobile',
      path: '/scan',
      viewport: { width: 390, height: 844 },
    },
    {
      name: 'idea-detail-desktop',
      path: '/ideas/plastic-bottle-self-watering-planter',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'make-mode-mobile',
      path: '/ideas/plastic-bottle-self-watering-planter/make',
      viewport: { width: 390, height: 844 },
    },
    {
      name: 'impact-dashboard-desktop',
      path: '/impact',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'exhibit-kiosk-desktop',
      path: '/exhibit',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'shop-desktop',
      path: '/shop',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'community-desktop',
      path: '/community',
      viewport: { width: 1280, height: 800 },
    },
    {
      name: 'about-desktop',
      path: '/about',
      viewport: { width: 1280, height: 800 },
    },
  ];

  console.log(`📸 Capturing ${targets.length} high-resolution screenshots...`);

  for (const item of targets) {
    try {
      const context = await browser.newContext({
        viewport: item.viewport,
        colorScheme: item.colorScheme || 'light',
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:4000${item.path}`, { waitUntil: 'networkidle' });

      if (item.script) {
        await page.evaluate(item.script);
        if (item.reload) {
          await page.reload({ waitUntil: 'networkidle' });
        }
      }

      await wait(600); // allow animations to settle

      const filePath = resolve(SCREENSHOT_DIR, `${item.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`  ✓ Saved: ${item.name}.png`);
      await context.close();
    } catch (err) {
      console.error(`  ✗ Failed: ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  server.kill();
  console.log('🎉 Screenshot capture complete!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error during screenshots:', err);
  process.exit(1);
});
