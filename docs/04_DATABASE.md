# 04 — Database design (Prisma) and seed data

Default provider SQLite. Keep the schema portable (no provider-specific types; use normalized tables, `String` enums via Prisma `enum` are not supported on SQLite in older Prisma — use `String` columns with zod/TS union validation, or Prisma enums if the installed Prisma version supports them on SQLite; document the choice in DECISIONS.md).

## Models (fields abbreviated; add `createdAt DateTime @default(now())`, `updatedAt @updatedAt` where sensible)

```prisma
model User {
  id           String   @id @default(cuid())
  isGuest      Boolean  @default(true)
  email        String?  @unique
  passwordHash String?
  name         String   @default("Maker")
  role         String   @default("USER")      // USER | ADMIN
  locale       String   @default("en")        // en | ur
  theme        String   @default("system")
  createdAt    DateTime @default(now())
  scans        Scan[]
  makes        Make[]
  saves        Save[]
  logs         ImpactLog[]
  badges       UserBadge[]
  likes        Like[]
  suggestions  Suggestion[]
}

model WasteType {
  id             String  @id @default(cuid())
  slug           String  @unique
  nameEn         String
  nameUr         String
  icon           String          // icon key / emoji / svg name
  gramsPerPiece  Int             // default weight of one piece
  co2PerKg       Float           // kg CO2e per kg of this waste (illustrative default, editable)
  factorSource   String          // citation / note, REQUIRED
  sortOrder      Int     @default(0)
  active         Boolean @default(true)
  ideas          IdeaWaste[]
  logs           ImpactLog[]
}

model Idea {
  id            String   @id @default(cuid())
  slug          String   @unique
  status        String   @default("UNTESTED")  // TESTED | UNTESTED | AI_DRAFT | ARCHIVED
  published     Boolean  @default(true)
  titleEn       String
  titleUr       String?
  summaryEn     String
  summaryUr     String?
  difficulty    Int                       // 1 easy, 2 medium, 3 hard
  timeMinutes   Int
  costPkr       Int
  sellPricePkr  Int?                      // null = not sellable
  safetyNoteEn  String
  safetyNoteUr  String?
  coverImage    String?                   // /uploads/... or /seed/...
  wasteGrams    Int                       // total waste mass reused (computed from IdeaWaste, cached)
  co2SavedG     Int                       // cached estimate
  isSampleData  Boolean  @default(false)
  source        String   @default("ADMIN") // ADMIN | AI | SHEET
  scanId        String?                   // for AI drafts
  scan          Scan?    @relation(fields: [scanId], references: [id])
  ownerUserId   String?                   // AI drafts visible to this user only
  makesCount    Int      @default(0)
  workedCount   Int      @default(0)
  ratingSum     Int      @default(0)
  ratingCount   Int      @default(0)
  timeFeltSum   Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  waste         IdeaWaste[]
  materials     IdeaMaterial[]
  tools         IdeaTool[]
  steps         IdeaStep[]
  makes         Make[]
  saves         Save[]
  @@index([status, published])
}

model IdeaWaste   { id String @id @default(cuid()) ideaId String wasteTypeId String pieces Int @default(1) grams Int
                    idea Idea @relation(fields:[ideaId], references:[id], onDelete: Cascade)
                    wasteType WasteType @relation(fields:[wasteTypeId], references:[id])
                    @@index([wasteTypeId]) }
model IdeaMaterial{ id String @id @default(cuid()) ideaId String nameEn String nameUr String? quantity String? isWaste Boolean @default(false) sortOrder Int @default(0)
                    idea Idea @relation(fields:[ideaId], references:[id], onDelete: Cascade) }
model IdeaTool    { id String @id @default(cuid()) ideaId String nameEn String nameUr String? sortOrder Int @default(0)
                    idea Idea @relation(fields:[ideaId], references:[id], onDelete: Cascade) }
model IdeaStep    { id String @id @default(cuid()) ideaId String position Int textEn String textUr String? tipEn String? tipUr String? imageUrl String? timerSeconds Int?
                    idea Idea @relation(fields:[ideaId], references:[id], onDelete: Cascade)
                    @@unique([ideaId, position]) }

model Scan {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields:[userId], references:[id], onDelete: Cascade)
  imagePaths  String                   // JSON array string of /uploads paths
  resultJson  String                   // validated detection result (JSON string)
  model       String
  latencyMs   Int
  mode        String   @default("LIVE") // LIVE | FALLBACK | MOCK
  createdAt   DateTime @default(now())
  ideas       Idea[]
}

model Make {
  id            String   @id @default(cuid())
  userId        String
  ideaId        String
  outcome       String                    // WORKED | PARTLY | FAILED
  timeTakenMin  Int?
  difficultyFelt Int?
  rating        Int?
  notes         String?
  photoUrl      String?
  status        String   @default("PENDING") // PENDING | APPROVED | REJECTED
  rejectReason  String?
  wasteGramsSnapshot Int
  co2GramsSnapshot   Int
  moneyPkrSnapshot   Int                  // sell price - cost, min 0 (estimate)
  createdAt     DateTime @default(now())
  user User @relation(fields:[userId], references:[id], onDelete: Cascade)
  idea Idea @relation(fields:[ideaId], references:[id])
  likes Like[]
  @@index([userId, status])
}

model Like { id String @id @default(cuid()) userId String makeId String
             user User @relation(fields:[userId], references:[id], onDelete: Cascade)
             make Make @relation(fields:[makeId], references:[id], onDelete: Cascade)
             @@unique([userId, makeId]) }
model Save { id String @id @default(cuid()) userId String ideaId String createdAt DateTime @default(now())
             user User @relation(fields:[userId], references:[id], onDelete: Cascade)
             idea Idea @relation(fields:[ideaId], references:[id], onDelete: Cascade)
             @@unique([userId, ideaId]) }
model ImpactLog { id String @id @default(cuid()) userId String wasteTypeId String pieces Int grams Int co2Grams Int note String? createdAt DateTime @default(now())
                  user User @relation(fields:[userId], references:[id], onDelete: Cascade)
                  wasteType WasteType @relation(fields:[wasteTypeId], references:[id]) }
model Badge { id String @id @default(cuid()) key String @unique nameEn String nameUr String descriptionEn String descriptionUr String icon String
              users UserBadge[] }
model UserBadge { id String @id @default(cuid()) userId String badgeId String awardedAt DateTime @default(now())
                  user User @relation(fields:[userId], references:[id], onDelete: Cascade)
                  badge Badge @relation(fields:[badgeId], references:[id])
                  @@unique([userId, badgeId]) }
model Product { id String @id @default(cuid()) slug String @unique nameEn String nameUr String? descriptionEn String pricePkr Int image String? wasteTypeSlugs String // comma list
                wasteGrams Int co2SavedG Int active Boolean @default(true) sortOrder Int @default(0) }
model Suggestion { id String @id @default(cuid()) userId String kind String text String status String @default("NEW") createdAt DateTime @default(now())
                   user User @relation(fields:[userId], references:[id], onDelete: Cascade) }
model Setting { key String @id value String }
```

Notes:
- Totals for the dashboard = SUM over the user's Makes snapshots + ImpactLogs. Weekly chart groups by ISO week of `createdAt`.
- Idea aggregates (`makesCount`, etc.) updated in the same transaction as Make create/delete/outcome change.
- `Idea.wasteGrams` / `co2SavedG` recomputed in a service function whenever IdeaWaste or WasteType factor changes (admin factor edit triggers bulk recompute).
- Guest cleanup job: delete guest users with no data older than 30 days.

## Seed data (idempotent `npm run seed`)

### Waste types (slug — EN / UR — gramsPerPiece)
1. `plastic-bottle` — Plastic bottle / پلاسٹک کی بوتل — 20
2. `bottle-cap` — Bottle cap / بوتل کا ڈھکن — 2
3. `food-scraps` — Food scraps / کھانے کا بچا ہوا — 100
4. `old-cloth` — Old cloth / پرانا کپڑا — 150
5. `cardboard` — Cardboard / گتہ — 80
6. `glass-jar` — Glass jar / شیشے کا جار — 250
7. `tin-can` — Tin can / ٹین کا ڈبہ — 60
8. `paper-newspaper` — Paper & newspaper / کاغذ اور اخبار — 50
9. `plastic-bag` — Plastic bag (shopper) / شاپر — 8
10. `tetra-pack` — Tetra pack / ٹیٹرا پیک — 25
(Plus hidden `other`.) Emission factors: seed **illustrative placeholders** and set `factorSource = "Illustrative default — replace with cited value (e.g., EPA WARM / DEFRA / ecoinvent) before presenting"`. The UI on the method page must show that source string verbatim.

### Ideas (12; all with EN + UR title/summary, >= 4 steps, materials, tools, safety note, cover image placeholder in `apps/web/public/seed/` generated as tasteful SVG/PNG illustrations — no stock photos with copyright)
TESTED-flagged candidates (the team's 3-4 real makes; seeded with `status=TESTED`, `isSampleData=true` so the team replaces numbers/photos):
1. Bottle Cap Keychain (bottle-cap)
2. Letter Keychain from Caps (bottle-cap)
3. Bottle-Bottom Flower Coaster (plastic-bottle)
4. Bottle Planter (plastic-bottle)

UNTESTED (curated, labelled "Not tested by us yet"):
5. Cloth Scrap Pouch (old-cloth)
6. Cardboard Desk Organizer (cardboard)
7. Kitchen Compost Starter (food-scraps)
8. Glass Jar Lantern (glass-jar)
9. Tin Can Pen Holder (tin-can)
10. Newspaper Storage Basket (paper-newspaper)
11. Braided Shopper-Bag Mat (plastic-bag)
12. Tetra Pack Wallet (tetra-pack)

Realistic sample values: times 15-90 min, cost Rs 0-150, sell price Rs 100-600 where sensible; safety notes mention scissors/hot-glue/sharp edges, adult supervision for children.

### Products (4)
Bottle Cap Keychain (Rs 250), Letter Keychain (Rs 300), Bottle-Bottom Coaster Set (Rs 400), Mini Planter (Rs 350) — editable.

### Badges (8)
`first-make`, `five-makes`, `streak-3`, `one-kg-club`, `bottle-hero` (10 bottles worth), `cloth-saver`, `sharing-is-caring`, `scanner`.

### Settings
`whatsapp_number` (placeholder `923000000000`), `instagram_url`, `site_name=ReMake`, `scan_daily_quota=30`, `scan_hourly_quota=10`, `kiosk_lock=false`.

### Users
Admin from env. Optionally 5 demo users + 15 approved demo makes ONLY when `SEED_DEMO=true` (flagged so they can be wiped with `npm run seed:clean-demo`).
