import fs from 'node:fs';
import path from 'node:path';

const p = path.resolve('apps/api/prisma/seed.ts');
let s = fs.readFileSync(p, 'utf-8');

s = s.replace(/\/seed\/idea-([a-z0-9-]+)\.svg/g, '/seed/idea-$1.jpg');
s = s.replace(/\/seed\/step-([a-z0-9-]+)\.svg/g, '/seed/step-$1.jpg');
s = s.replace(/\/seed\/demo-([a-z0-9-]+)\.svg/g, '/seed/demo-$1.jpg');
s = s.replace(/\/seed\/product-([a-z0-9-]+)\.svg/g, '/seed/product-$1.jpg');

fs.writeFileSync(p, s, 'utf-8');
console.log('✅ Updated seed.ts image paths from .svg to .jpg');

