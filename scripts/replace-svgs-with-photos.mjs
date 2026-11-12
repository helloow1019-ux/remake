import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SEED_DIR = resolve(process.cwd(), 'apps/web/public/seed');

const MAPPINGS = [
  { svg: 'idea-planter.svg', jpg: 'idea-planter.jpg' },
  { svg: 'product-planter.svg', jpg: 'product-planter.jpg' },
  { svg: 'idea-organizer.svg', jpg: 'idea-organizer.jpg' },
  { svg: 'product-organizer.svg', jpg: 'product-organizer.jpg' },
  { svg: 'idea-coaster.svg', jpg: 'idea-coaster.jpg' },
  { svg: 'product-coasters.svg', jpg: 'product-coasters.jpg' },
  { svg: 'idea-basket.svg', jpg: 'idea-basket.jpg' },
  { svg: 'idea-bottle-cap-keychain.svg', jpg: 'idea-bottle-cap-keychain.jpg' },
  { svg: 'product-cap-keychain.svg', jpg: 'product-cap-keychain.jpg' },
  { svg: 'idea-letter-keychain.svg', jpg: 'idea-letter-keychain.jpg' },
  { svg: 'product-letter-keychain.svg', jpg: 'product-letter-keychain.jpg' },
  { svg: 'idea-pouch.svg', jpg: 'idea-pouch.jpg' },
  { svg: 'idea-lantern.svg', jpg: 'idea-lantern.jpg' },
  { svg: 'idea-tin-holder.svg', jpg: 'idea-tin-holder.jpg' },
  { svg: 'idea-mat.svg', jpg: 'idea-mat.jpg' },
  { svg: 'idea-wallet.svg', jpg: 'idea-wallet.jpg' },
  { svg: 'idea-compost.svg', jpg: 'idea-compost.jpg' },
  { svg: 'demo-make-1.svg', jpg: 'idea-planter.jpg' },
  { svg: 'step-caps-sort.svg', jpg: 'idea-bottle-cap-keychain.jpg' },
  { svg: 'step-iron.svg', jpg: 'idea-coaster.jpg' },
];

console.log('🖼️ Replacing cartoon vector SVGs with photorealistic image wrappers...');

for (const { svg, jpg } of MAPPINGS) {
  const jpgPath = resolve(SEED_DIR, jpg);
  const svgPath = resolve(SEED_DIR, svg);

  if (existsSync(jpgPath)) {
    const jpgBytes = readFileSync(jpgPath);
    const base64 = jpgBytes.toString('base64');
    const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <image href="data:image/jpeg;base64,${base64}" x="0" y="0" width="800" height="600" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
    writeFileSync(svgPath, svgWrapper, 'utf-8');
    console.log(`  ✓ Converted ${svg} -> photorealistic ${jpg}`);
  } else {
    console.warn(`  ⚠️ Missing ${jpg}`);
  }
}

console.log('🎉 All SVG vectors replaced with photorealistic image wrappers!');

