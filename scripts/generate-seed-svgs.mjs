import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const targetDir = resolve(__dirname, '../apps/web/public/seed');

const SVG_TEMPLATES = {
  'idea-letter-keychain.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#EBD5F5"/>
  <circle cx="200" cy="65" r="28" stroke="#1B2A22" stroke-width="8" fill="none"/>
  <rect x="195" y="93" width="10" height="20" rx="5" fill="#1B2A22"/>
  <rect x="195" y="113" width="10" height="20" rx="5" fill="#1B2A22"/>
  <path d="M140 140H220C240 140 250 150 250 170C250 190 235 200 215 200L255 260H215L180 205H170V260H140V140ZM170 165V180H210C218 180 222 176 222 172C222 168 218 165 210 165H170Z" fill="#F4B63F" stroke="#1B2A22" stroke-width="7" stroke-linejoin="round"/>
  <text x="200" y="290" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">INITIAL R FROM BOTTLE CAPS</text>
</svg>`,

  'idea-coaster.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#D2EBF7"/>
  <!-- 5-Petal Flower Coaster -->
  <circle cx="200" cy="150" r="45" fill="#FFFDF7" stroke="#1B2A22" stroke-width="8"/>
  <circle cx="200" cy="85" r="35" fill="#5CCB8A" stroke="#1B2A22" stroke-width="7"/>
  <circle cx="260" cy="130" r="35" fill="#5CCB8A" stroke="#1B2A22" stroke-width="7"/>
  <circle cx="240" cy="200" r="35" fill="#5CCB8A" stroke="#1B2A22" stroke-width="7"/>
  <circle cx="160" cy="200" r="35" fill="#5CCB8A" stroke="#1B2A22" stroke-width="7"/>
  <circle cx="140" cy="130" r="35" fill="#5CCB8A" stroke="#1B2A22" stroke-width="7"/>
  <circle cx="200" cy="150" r="20" fill="#F4B63F" stroke="#1B2A22" stroke-width="6"/>
  <text x="200" y="275" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">PET BOTTLE BOTTOM FLOWER COASTER</text>
</svg>`,

  'idea-planter.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#D6EFD8"/>
  <!-- Bottom water reservoir -->
  <rect x="130" y="160" width="140" height="100" rx="16" fill="#D2EBF7" stroke="#1B2A22" stroke-width="8"/>
  <!-- Water level -->
  <rect x="138" y="210" width="124" height="42" fill="#4F9BC9" opacity="0.6"/>
  <!-- Top inverted funnel -->
  <path d="M140 90H260L230 190H170L140 90Z" fill="#FFFDF7" stroke="#1B2A22" stroke-width="8" stroke-linejoin="round"/>
  <!-- Soil -->
  <path d="M148 105H252L235 160H165L148 105Z" fill="#5C3A21"/>
  <!-- Green plant sprout -->
  <path d="M200 105V50" stroke="#2E7D4F" stroke-width="6" stroke-linecap="round"/>
  <path d="M200 70C215 55 240 65 235 80C215 85 205 75 200 70Z" fill="#5CCB8A" stroke="#1B2A22" stroke-width="4"/>
  <path d="M200 60C185 45 160 55 165 70C185 75 195 65 200 60Z" fill="#5CCB8A" stroke="#1B2A22" stroke-width="4"/>
</svg>`,

  'idea-pouch.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#FCE3AA"/>
  <!-- Denim pouch -->
  <rect x="80" y="70" width="240" height="160" rx="16" fill="#4F9BC9" stroke="#1B2A22" stroke-width="8"/>
  <!-- Zipper on top -->
  <line x1="80" y1="95" x2="320" y2="95" stroke="#F4B63F" stroke-width="8"/>
  <rect x="130" y="87" width="20" height="16" rx="4" fill="#1B2A22"/>
  <!-- Contrast stitch lines -->
  <line x1="95" y1="110" x2="305" y2="110" stroke="#FFFDF7" stroke-width="3" stroke-dasharray="8 6"/>
  <line x1="95" y1="215" x2="305" y2="215" stroke="#FFFDF7" stroke-width="3" stroke-dasharray="8 6"/>
  <line x1="95" y1="110" x2="95" y2="215" stroke="#FFFDF7" stroke-width="3" stroke-dasharray="8 6"/>
  <line x1="305" y1="110" x2="305" y2="215" stroke="#FFFDF7" stroke-width="3" stroke-dasharray="8 6"/>
  <text x="200" y="270" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">UPCYCLED TEXTILE POUCH</text>
</svg>`,

  'idea-organizer.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#ECD9BA"/>
  <!-- Cardboard tiered organizer -->
  <rect x="90" y="60" width="220" height="180" rx="12" fill="#DDBB88" stroke="#1B2A22" stroke-width="8"/>
  <rect x="90" y="110" width="220" height="130" fill="#C89D62" stroke="#1B2A22" stroke-width="6"/>
  <rect x="90" y="160" width="220" height="80" fill="#B8874E" stroke="#1B2A22" stroke-width="6"/>
  <line x1="160" y1="60" x2="160" y2="240" stroke="#1B2A22" stroke-width="6"/>
  <line x1="240" y1="60" x2="240" y2="240" stroke="#1B2A22" stroke-width="6"/>
  <text x="200" y="275" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">CORRUGATED DESK CADDY</text>
</svg>`,

  'idea-compost.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#D6EFD8"/>
  <!-- Compost bin bucket -->
  <polygon points="120,70 280,70 260,240 140,240" fill="#FFFDF7" stroke="#1B2A22" stroke-width="8" stroke-linejoin="round"/>
  <!-- Lid -->
  <rect x="110" y="55" width="180" height="20" rx="6" fill="#2E7D4F" stroke="#1B2A22" stroke-width="6"/>
  <!-- Compost layers -->
  <polygon points="138,220 262,220 260,235 140,235" fill="#5C3A21"/>
  <polygon points="142,190 258,190 262,220 138,220" fill="#5CCB8A"/>
  <polygon points="146,160 254,160 258,190 142,190" fill="#C89D62"/>
  <!-- Aeration holes -->
  <circle cx="160" cy="110" r="5" fill="#1B2A22"/>
  <circle cx="200" cy="110" r="5" fill="#1B2A22"/>
  <circle cx="240" cy="110" r="5" fill="#1B2A22"/>
  <text x="200" y="275" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">KITCHEN COMPOST STARTER</text>
</svg>`,

  'idea-lantern.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#17201B"/>
  <!-- Twine rope handle -->
  <path d="M160 90C160 40 240 40 240 90" stroke="#F4B63F" stroke-width="6" stroke-linecap="round" fill="none"/>
  <!-- Glass jar glowing -->
  <rect x="140" y="90" width="120" height="150" rx="20" fill="#22302A" stroke="#FFFDF7" stroke-width="6"/>
  <!-- Glowing candle light -->
  <circle cx="200" cy="180" r="40" fill="#F4B63F" opacity="0.3"/>
  <circle cx="200" cy="180" r="22" fill="#F4B63F" opacity="0.6"/>
  <ellipse cx="200" cy="175" rx="8" ry="14" fill="#FF7A57"/>
  <ellipse cx="200" cy="178" rx="4" ry="8" fill="#FFFDF7"/>
  <!-- Twine wrap collar -->
  <rect x="145" y="92" width="110" height="18" fill="#DDBB88" stroke="#1B2A22" stroke-width="4"/>
  <text x="200" y="280" font-family="sans-serif" font-weight="900" font-size="14" fill="#FFFDF7" text-anchor="middle">RUSTIC TWINE GLASS LANTERN</text>
</svg>`,

  'idea-tin-holder.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#FCE3AA"/>
  <!-- Tin Can Pen Holder -->
  <ellipse cx="200" cy="100" rx="60" ry="24" fill="#E3E8EC" stroke="#1B2A22" stroke-width="8"/>
  <path d="M140 100V220C140 235 167 245 200 245C233 245 260 235 260 220V100" fill="#4F9BC9" stroke="#1B2A22" stroke-width="8"/>
  <!-- Pens sticking out -->
  <polygon points="175,30 185,30 180,95 170,95" fill="#D9532F" stroke="#1B2A22" stroke-width="4"/>
  <polygon points="215,20 225,20 222,95 212,95" fill="#2E7D4F" stroke="#1B2A22" stroke-width="4"/>
  <polygon points="195,25 205,25 202,95 192,95" fill="#F4B63F" stroke="#1B2A22" stroke-width="4"/>
  <text x="200" y="280" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">UPCYCLED TIN CAN PEN HOLDER</text>
</svg>`,

  'idea-basket.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#ECD9BA"/>
  <!-- Woven basket bowl -->
  <path d="M110 110L140 230H260L290 110H110Z" fill="#FFFDF7" stroke="#1B2A22" stroke-width="8" stroke-linejoin="round"/>
  <!-- Weave patterns -->
  <line x1="115" y1="140" x2="285" y2="140" stroke="#B8874E" stroke-width="6"/>
  <line x1="125" y1="170" x2="275" y2="170" stroke="#B8874E" stroke-width="6"/>
  <line x1="135" y1="200" x2="265" y2="200" stroke="#B8874E" stroke-width="6"/>
  <line x1="150" y1="110" x2="160" y2="230" stroke="#1B2A22" stroke-width="4"/>
  <line x1="200" y1="110" x2="200" y2="230" stroke="#1B2A22" stroke-width="4"/>
  <line x1="250" y1="110" x2="240" y2="230" stroke="#1B2A22" stroke-width="4"/>
  <text x="200" y="275" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">NEWSPAPER REED BASKET</text>
</svg>`,

  'idea-mat.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#D2EBF7"/>
  <!-- Oval Braided Mat -->
  <ellipse cx="200" cy="150" rx="130" ry="75" fill="#FFE6D6" stroke="#1B2A22" stroke-width="8"/>
  <ellipse cx="200" cy="150" rx="95" ry="50" fill="#F07A48" stroke="#1B2A22" stroke-width="6"/>
  <ellipse cx="200" cy="150" rx="60" ry="30" fill="#5CCB8A" stroke="#1B2A22" stroke-width="5"/>
  <ellipse cx="200" cy="150" rx="25" ry="12" fill="#F4B63F" stroke="#1B2A22" stroke-width="4"/>
  <text x="200" y="270" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">BRAIDED SHOPPER PLARN MAT</text>
</svg>`,

  'idea-wallet.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#FFF0BA"/>
  <!-- Folded Tetra Pack Wallet -->
  <rect x="100" y="90" width="200" height="130" rx="12" fill="#FFFDF7" stroke="#1B2A22" stroke-width="8"/>
  <!-- Flap -->
  <polygon points="100,90 200,165 300,90" fill="#E0B228" stroke="#1B2A22" stroke-width="7" stroke-linejoin="round"/>
  <!-- Button clasp -->
  <circle cx="200" cy="145" r="10" fill="#D9532F" stroke="#1B2A22" stroke-width="4"/>
  <text x="200" y="270" font-family="sans-serif" font-weight="900" font-size="14" fill="#1B2A22" text-anchor="middle">ORIGAMI TETRA PACK WALLET</text>
</svg>`,

  // Product SVGs
  'product-cap-keychain.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#FCE3AA"/>
  <circle cx="200" cy="80" r="30" stroke="#1B2A22" stroke-width="8" fill="none"/>
  <rect x="194" y="110" width="12" height="24" rx="6" fill="#1B2A22"/>
  <circle cx="200" cy="190" r="60" fill="#F4B63F" stroke="#1B2A22" stroke-width="8"/>
  <text x="200" y="280" font-family="sans-serif" font-weight="900" font-size="16" fill="#1B2A22" text-anchor="middle">Rs 250 • BOTTLE CAP KEYCHAIN</text>
</svg>`,

  'product-letter-keychain.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#EBD5F5"/>
  <circle cx="200" cy="70" r="28" stroke="#1B2A22" stroke-width="8" fill="none"/>
  <path d="M150 130H220C235 130 245 140 245 155C245 170 235 180 215 180L245 230H215L190 185H175V230H150V130ZM175 150V165H205C210 165 215 160 215 157C215 153 210 150 205 150H175Z" fill="#F4B63F" stroke="#1B2A22" stroke-width="7" stroke-linejoin="round"/>
  <text x="200" y="275" font-family="sans-serif" font-weight="900" font-size="16" fill="#1B2A22" text-anchor="middle">Rs 300 • LETTER KEYCHAIN</text>
</svg>`,

  'product-coasters.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#D2EBF7"/>
  <circle cx="160" cy="140" r="50" fill="#5CCB8A" stroke="#1B2A22" stroke-width="7"/>
  <circle cx="240" cy="140" r="50" fill="#F4B63F" stroke="#1B2A22" stroke-width="7"/>
  <text x="200" y="270" font-family="sans-serif" font-weight="900" font-size="16" fill="#1B2A22" text-anchor="middle">Rs 400 • SET OF 4 COASTERS</text>
</svg>`,

  'product-planter.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#D6EFD8"/>
  <rect x="140" y="140" width="120" height="90" rx="14" fill="#D2EBF7" stroke="#1B2A22" stroke-width="8"/>
  <path d="M150 80H250L225 165H175L150 80Z" fill="#FFFDF7" stroke="#1B2A22" stroke-width="7" stroke-linejoin="round"/>
  <path d="M200 90V45" stroke="#2E7D4F" stroke-width="6" stroke-linecap="round"/>
  <circle cx="215" cy="50" r="10" fill="#5CCB8A"/>
  <circle cx="185" cy="60" r="8" fill="#5CCB8A"/>
  <text x="200" y="275" font-family="sans-serif" font-weight="900" font-size="16" fill="#1B2A22" text-anchor="middle">Rs 350 • SELF-WATERING PLANTER</text>
</svg>`,

  'demo-make-1.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#FFFDF7"/>
  <!-- Polaroid frame -->
  <rect x="40" y="20" width="320" height="260" rx="8" fill="#FFFDF7" stroke="#1B2A22" stroke-width="4"/>
  <rect x="65" y="40" width="270" height="190" fill="#FCE3AA"/>
  <!-- Keychains made -->
  <circle cx="150" cy="135" r="45" fill="#5CCB8A" stroke="#1B2A22" stroke-width="6"/>
  <circle cx="250" cy="135" r="45" fill="#F4B63F" stroke="#1B2A22" stroke-width="6"/>
  <text x="200" y="260" font-family="'Caveat', cursive" font-weight="700" font-size="20" fill="#1B2A22" text-anchor="middle">Made by Ayesha • Campus Workshop</text>
</svg>`,

  'step-caps-sort.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <rect width="400" height="240" fill="#FFFDF7"/>
  <circle cx="120" cy="120" r="32" fill="#F4B63F" stroke="#1B2A22" stroke-width="5"/>
  <circle cx="200" cy="120" r="32" fill="#5CCB8A" stroke="#1B2A22" stroke-width="5"/>
  <circle cx="280" cy="120" r="32" fill="#4F9BC9" stroke="#1B2A22" stroke-width="5"/>
  <text x="200" y="200" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1B2A22" text-anchor="middle">Sort and arrange clean caps</text>
</svg>`,

  'step-iron.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <rect width="400" height="240" fill="#FFFDF7"/>
  <path d="M120 160H280L250 110H160L120 160Z" fill="#DDBB88" stroke="#1B2A22" stroke-width="6"/>
  <rect x="170" y="70" width="70" height="40" rx="8" fill="#1B2A22"/>
  <path d="M150 180H250" stroke="#FF7A57" stroke-width="6" stroke-dasharray="8 6"/>
  <text x="200" y="215" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1B2A22" text-anchor="middle">Press through parchment paper</text>
</svg>`
};

for (const [filename, content] of Object.entries(SVG_TEMPLATES)) {
  const filePath = resolve(targetDir, filename);
  writeFileSync(filePath, content.trim());
}

console.log(`✅ Generated ${Object.keys(SVG_TEMPLATES).length} seed SVGs in ${targetDir}`);
