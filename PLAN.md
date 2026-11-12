# ReMake — Build Plan

## Milestones

### M1: Scaffold & Shared Package (foundation)
- [x] npm workspaces monorepo: `apps/web`, `apps/api`, `packages/shared`
- [x] TypeScript, ESLint, Prettier configs
- [x] All root scripts: `dev`, `build`, `start`, `setup`, `seed`, `typecheck`, `lint`, `test`, `test:e2e`, `ai:smoke`
- [x] `.env.example` with all vars; env validation (fail-fast)
- [x] Prisma schema from 04_DATABASE.md, migration, idempotent seed
- [x] `packages/shared`: zod schemas, types, impact math with unit tests

### M2: Backend API
- [x] Express app with helmet, cors, rate-limit, pino, error handler
- [x] Auth: guest auto-create, register (upgrade guest), login (merge), logout, JWT httpOnly cookie
- [x] Catalog: waste-types, ideas (matching, filters, sort, pagination), trending, quick-wins
- [x] Saves (optimistic), Makes (+ impact snapshot + badges + aggregates in transaction)
- [x] Impact endpoint (totals, weekly, by-waste, equivalents, streak, badges)
- [x] Impact logs (manual "Log my reuse")
- [x] Upload with sharp, MIME sniffing, random filenames
- [x] Admin APIs: dashboard, ideas CRUD + steps, moderation, waste types, products, import, settings, exports, promote AI draft
- [x] Stats/today for exhibition counters
- [x] Health endpoints (`/health`, `/health/ai`)
- [x] API tests (Vitest + Supertest)

### M3: AI Module
- [x] Groq client wrapper with timeout, retry, model fallback chain
- [x] JSON validation/repair with zod
- [x] Vision detection (Prompt 1)
- [x] Idea generation (Prompt 2)
- [x] Idea assistant (Prompt 3)
- [x] Adapt materials (Prompt 4)
- [x] Hazard/non-waste handling, banned-term filter
- [x] Mock mode with canned scenarios
- [x] Quotas (per-user, per-IP)
- [x] `ai:smoke` script
- [x] AI unit tests (mocked Groq client)

### M4: Design System & App Shell
- [x] Tailwind config with custom tokens (palette, typography)
- [x] Self-hosted fonts (@fontsource)
- [x] UI component library: Button, Sticker, Stamp, TicketStat, TapeCard, PaperSheet, Chip, BottomSheet, Toast, Skeleton, ProgressStitch, Counter, Confetti
- [x] React Router layout with bottom dock (mobile) / side rail (desktop)
- [x] i18n (EN/UR with RTL)
- [x] Theme system (light/dark/system)
- [x] PWA manifest + service worker + offline banner
- [x] Design demo route `/_design`

### M5: Public Screens
- [x] Onboarding (3 slides)
- [x] Home (search, waste grid, trending, quick wins, impact summary, scan CTA)
- [x] Pick Waste / Explore
- [x] Search / Results with filters & sort
- [x] Idea Detail
- [x] Make Mode (step-by-step)
- [x] Scan flow (camera/upload, analysing, results)
- [x] "I Made This" + celebration
- [x] Impact Dashboard
- [x] Saved, My Makes
- [x] Community gallery
- [x] Shop (+ printable price cards)
- [x] About, Method, Settings, Auth
- [x] 404/500 pages

### M6: Exhibition Mode
- [x] `/exhibit` fullscreen landscape
- [x] QR codes, big waste picker, live counters
- [x] Idle auto-reset (60s)

### M7: Admin Panel
- [x] Dashboard, Ideas editor (step builder), Moderation queue
- [x] Waste types/factors CRUD, Products CRUD
- [x] Import (CSV/Sheet), AI drafts/promote
- [x] Suggestions inbox, Settings, Exports

### M8: Seed Content
- [x] 10 waste types with SVG icons
- [x] 12 ideas with full EN+UR content
- [x] 4 products, 8 badges
- [x] Original SVG illustrations

### M9: Quality & Polish
- [ ] Test suite green (unit, integration, e2e)
- [ ] a11y audit, Lighthouse check
- [ ] Screenshots (390px + 1280px, light/dark/Urdu)
- [ ] Security review (no secrets in bundle)
- [ ] Anti-generic checklist pass

### M10: Documentation
- [ ] README.md (complete)
- [ ] DECISIONS.md
- [ ] TESTING.md with evidence
- [ ] docs/ARCHITECTURE.md

## Folder Structure
```
remake-pack/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── index.ts          # entry
│   │   │   ├── app.ts            # Express app
│   │   │   ├── env.ts            # env validation
│   │   │   ├── middleware/       # auth, error, rate-limit, upload
│   │   │   ├── routes/           # auth, ideas, scans, makes, impact, admin, etc.
│   │   │   ├── services/         # business logic
│   │   │   ├── ai/               # Groq client, prompts, mock, fallback
│   │   │   └── utils/            # helpers
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── scripts/
│   │   │   └── ai-smoke.ts
│   │   ├── tests/
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── ui/               # design system components
│       │   ├── features/         # feature modules
│       │   ├── pages/            # route pages
│       │   ├── hooks/            # custom hooks
│       │   ├── lib/              # api client, i18n, theme, utils
│       │   ├── locales/          # en.json, ur.json
│       │   └── assets/           # fonts, SVGs
│       ├── public/
│       │   ├── seed/             # SVG illustrations
│       │   ├── manifest.json
│       │   └── sw.js
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── schemas/          # zod schemas
│       │   ├── types/            # TypeScript types
│       │   ├── impact.ts         # impact formulas
│       │   └── index.ts
│       ├── tests/
│       ├── tsconfig.json
│       └── package.json
├── docs/                          # spec docs (read-only)
├── package.json                   # workspace root
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── PLAN.md
├── DECISIONS.md
├── TESTING.md
└── README.md
```

## Risks
| Risk | Mitigation |
|---|---|
| Groq model IDs may be stale | Env-configurable + fallback chain + health check |
| SQLite limitations (no enums) | String columns + zod validation |
| Large scope | Prioritise Must items; cut in order per master prompt |
| PWA + offline complexity | Service worker caches app shell + API responses |
| RTL testing | Test every component in Urdu mode |

