# 09 — Test plan, acceptance checklist, deployment

## Test strategy
- **API** (Vitest + Supertest, in-memory/temp SQLite): auth (guest->register upgrade, login merge), ideas filtering/sorting/matching, saves, makes + impact snapshots + badges, impact endpoint maths (use fixed fixtures), moderation permissions, admin RBAC (403 for users), upload validation (wrong MIME, too big, spoofed extension), rate limit & quota, import preview/commit, AI layer (mocked Groq: success, bad JSON retry, 404 model fallback, 429, hazardous, not-waste, banned-term filter).
- **Web** (Vitest + Testing Library): filters/URL sync, waste picker, scan result editing, make mode navigation + timers (fake timers), forms, i18n/RTL switch, impact counters.
- **E2E** (Playwright, AI_MODE=mock): guest scan -> idea -> make mode -> I made this -> dashboard shows impact; admin login -> create idea -> approve make; language switch Urdu; offline reload of a viewed idea.
- **Manual AI smoke**: `npm run ai:smoke -- sample.jpg` against real Groq.
- **Accessibility/perf**: Lighthouse CI script on Home, Idea detail, Scan (targets in SRS NFR-01).

## Acceptance checklist (agent must tick every item with evidence in `TESTING.md`)
- [ ] `npm install && npm run setup && npm run dev` works on a clean clone (setup = prisma migrate + seed + copy `.env.example` if missing).
- [ ] Guest can: pick waste -> see ideas -> open detail -> Make mode -> I made this -> impact updates.
- [ ] Scan with a real photo (Groq key present) returns detected chips, tested ideas, and 3 AI drafts; AI drafts are labelled untested.
- [ ] Scan with `AI_MODE=mock` works with no key; invalid key falls back gracefully.
- [ ] Non-waste image -> NOT_WASTE message; hazardous item -> safe message; quota exceeded -> friendly message.
- [ ] Register upgrades guest and keeps data; login merges guest data.
- [ ] Admin: create/edit idea with steps+photos, approve/reject makes, edit factor -> ideas recomputed, import CSV, promote AI draft, export CSV.
- [ ] Urdu RTL renders correctly on every screen; dark theme on every screen.
- [ ] PWA installs; viewed ideas readable offline; offline banner shows.
- [ ] `/exhibit` kiosk works fullscreen with QR + live counters + idle reset.
- [ ] No secrets in client bundle (grep for `GROQ`), `.env` git-ignored, `.env.example` complete.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all pass.
- [ ] Lighthouse thresholds met; no console errors on main flows.
- [ ] README explains: setup, env, seed, admin login, replacing sample data with real tested data, adding Groq key, switching to Postgres, deployment.

## Environment (`.env.example`)
```
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=change-me-long-random
COOKIE_SECURE=false
UPLOAD_DIR=./uploads
ADMIN_EMAIL=admin@remake.local
ADMIN_PASSWORD=change-me-now
SEED_DEMO=false
GROQ_API_KEY=
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
GROQ_VISION_FALLBACKS=meta-llama/llama-4-maverick-17b-128e-instruct,qwen/qwen3.6-27b
GROQ_TEXT_MODEL=llama-3.3-70b-versatile
AI_MODE=live
AI_FALLBACK_TO_MOCK=true
AI_MODERATION=false
AI_TIMEOUT_MS=25000
SCAN_HOURLY_LIMIT=10
SCAN_DAILY_LIMIT=30
```

## Deployment (document in README; implement scripts/Dockerfile)
- **Single-container**: `npm run build` builds web into `apps/web/dist`; API serves it statically with SPA fallback; `Dockerfile` (multi-stage) + `docker-compose.yml` (api + optional postgres).
- **Free-tier friendly path**: Render/Railway/Fly for the app + **PostgreSQL** (Neon/Supabase/Render) because SQLite files and `/uploads` are ephemeral on free hosts; for uploads either a persistent disk or an S3/Cloudinary adapter behind the `Storage` interface.
- Production checks: refuse to boot with default `JWT_SECRET`/`ADMIN_PASSWORD`; `COOKIE_SECURE=true`; HTTPS; CORS origin set.
- **Exhibition tip**: run locally on the laptop (`AI_MODE=live` with phone hotspot, falls back to mock if network drops), plus QR pointing to the deployed URL.
