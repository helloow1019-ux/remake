import fs from 'node:fs';
import path from 'node:path';

const seedDir = path.resolve('apps/web/public/seed');
const mapping = {
  'plastic-bottle': 'idea-planter.jpg',
  'bottle-cap': 'product-cap-keychain.jpg',
  'food-scraps': 'idea-compost.jpg',
  'old-cloth': 'idea-pouch.jpg',
  'cardboard': 'idea-organizer.jpg',
  'glass-jar': 'idea-lantern.jpg',
  'tin-can': 'idea-tin-holder.jpg',
  'paper-newspaper': 'idea-basket.jpg',
  'plastic-bag': 'product-tote.jpg',
  'tetra-pack': 'idea-wallet.jpg',
  'other': 'idea-mat.jpg',
};

console.log('🔄 Updating waste icons to realistic craft studio images...');

for (const [slug, srcJpg] of Object.entries(mapping)) {
  const srcPath = path.join(seedDir, srcJpg);
  const targetJpg = path.join(seedDir, `waste-${slug}.jpg`);
  const targetSvg = path.join(seedDir, `waste-${slug}.svg`);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, targetJpg);
    const b64 = fs.readFileSync(srcPath).toString('base64');
    const svgWrap = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <image href="data:image/jpeg;base64,${b64}" x="0" y="0" width="500" height="500" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
    fs.writeFileSync(targetSvg, svgWrap, 'utf-8');
    console.log(`  ✓ Updated waste-${slug} with ${srcJpg}`);
  } else {
    console.warn(`  ⚠️ Missing ${srcPath}`);
  }
}

console.log('🎉 Done! All waste icons are now photorealistic.');

