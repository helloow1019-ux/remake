# MASTER PROMPT — Build ReMake (full-stack web app) — for Claude Opus 4.6 in Antigravity

You are a senior full-stack engineer and product designer. Build **ReMake**, a complete, production-quality, fully working web application, end to end: frontend, backend, database, AI integration, admin panel, tests and docs. This is not a prototype or a scaffold. Everything described must work when I run it.

## 0. Read first
The folder `docs/` next to this file is the source of truth. Read ALL of it before writing code, in this order:
`01_PRD.md`, `02_SRS.md`, `03_FRD.md`, `04_DATABASE.md`, `05_API_SPEC.md`, `06_AI_GROQ.md`, `07_UI_DESIGN_BRIEF.md`, `08_IMPACT_FORMULAS.md`, `09_TEST_AND_DEPLOY.md`.
If anything in this prompt conflicts with a doc, this prompt wins; tell me about the conflict in `DECISIONS.md`. If something is genuinely ambiguous, choose the most reasonable option, record it in `DECISIONS.md`, and keep going. Don't stop to ask me unless you are blocked.

## 1. Product in one paragraph
ReMake is a waste-to-value platform for a university sustainability course. A user picks the waste they have (plastic bottles, caps, food scraps, old cloth, cardboard, etc.) or **uploads/captures a photo of it**. The app identifies the waste with **Groq vision AI**, then shows (1) **tested ideas made by the ReMake team** with materials, tools, photo steps, time, difficulty, cost, sell price and waste/CO2 saved, and (2) **AI-generated draft ideas**, clearly labelled untested, with AI-generated step-by-step instructions. Users follow a step-by-step Make mode, tap "I made this" to give feedback (with a photo), and watch a personal impact dashboard grow. There is an admin panel, a shop of the team's physical products, English + Urdu (RTL), a PWA, and an exhibition/kiosk mode for a live stall demo.

## 2. Non-negotiable decisions
- Stack exactly as in `02_SRS.md` section 3: npm workspaces monorepo, React 18 + Vite + TypeScript, Tailwind with custom tokens, Express + TypeScript, Prisma, SQLite by default (Postgres-portable), zod shared schemas, Groq via `groq-sdk`, Vitest/Supertest/Playwright. It is a **web app, not React Native and not Android**.
- **Groq key only on the server.** Never in the client bundle, logs, or repo. `.env` git-ignored; `.env.example` complete.
- **No Pinterest, no scraping.** Ideas come from the DB (team-tested/curated) and Groq (AI drafts).
- **Honesty rule:** every idea displays its status (Tested / Not yet tested / AI-suggested). AI numbers are shown with "~". Impact numbers are labelled estimates and link to the method page. Seeded numbers and emission factors are placeholders: mark them `isSampleData` / "Illustrative default" and say so in the README. Never present invented data as verified.
- **Impact is computed server-side from DB factors, never from AI output.**
- Safety first: hazardous waste and non-waste photos are handled per `06_AI_GROQ.md`; every idea has a safety note.
- Model IDs come from env with fallbacks. Verify them against Groq's `/models` endpoint at startup. Groq's catalogue changes, so don't assume.

## 3. UI quality bar (very important)
The UI must be **creative, distinctive and polished, not generic**. Follow `07_UI_DESIGN_BRIEF.md` ("The Maker's Workbench": kraft-paper, stickers, stamps, price tags, stitched lines, caution-tape safety banners, original SVG waste illustrations). No default component-library look, no purple gradients, no stock hero images, no uniform grey card grids on key pages. Each of the picker, scan, make mode and impact screens needs a signature interaction. Design light and dark themes deliberately. Build and test Urdu RTL on every screen. Respect reduced motion. Before finishing the UI, run the anti-generic checklist at the bottom of the design brief and fix failures. You may use the `frontend-design` skill if you have it. Take Playwright screenshots of every key screen at 390px and 1280px, in light, dark and Urdu, review them yourself, and iterate until they look professional. Save them to `docs/screenshots/`.

## 4. How to work (follow this order; commit at each milestone)
1. **Plan**: write `PLAN.md` (milestones, folder structure, risks). Keep a running task list.
2. **Scaffold**: monorepo, tooling, scripts (`dev`, `build`, `start`, `setup`, `seed`, `typecheck`, `lint`, `test`, `test:e2e`, `ai:smoke`), env validation (fail fast with clear messages), Prisma schema + migration + idempotent seed from `04_DATABASE.md`.
3. **Shared package**: zod schemas, types, impact math (`08_IMPACT_FORMULAS.md`) with unit tests.
4. **Backend**: auth/guest sessions, catalog, ideas matching/filters/sort, saves, makes + moderation, impact + badges + streaks, uploads (sharp, MIME sniffing), admin APIs, import, stats, rate limits/quotas, error format, health endpoints. Then tests.
5. **AI module**: Groq client wrapper with timeout, retry, model fallback chain, JSON validation/repair, hazard/non-waste handling, banned-term filter, mock mode, quotas, `ai:smoke` script. Mock the client in tests. Implement all four prompts in `06_AI_GROQ.md`.
6. **Design system + app shell**: tokens, fonts (self-hosted), `ui/` components, routing, i18n (EN/UR), theme, PWA, offline banner.
7. **Public screens**: onboarding, home, pick waste, search/results/filters, idea detail, Make mode, scan flow, "I made this" + celebration, impact, saved, my makes, community, shop (+ printable price cards), about, method, settings, auth.
8. **Exhibition mode** `/exhibit` with QR, live counters, idle reset.
9. **Admin panel**: dashboard, ideas editor (step builder, uploads), moderation, waste types/factors, products, import, AI drafts/promote, suggestions, settings, exports.
10. **Seed content**: 10 waste types, 12 ideas with full EN + UR content, 4 products, 8 badges, with original SVG illustrations in `apps/web/public/seed/`. Make the Urdu natural, simple and correct.
11. **Quality**: tests, a11y pass, Lighthouse, screenshots review, security review against `02_SRS.md` section 7, bundle check that no secret leaks.
12. **Docs**: `README.md` (setup, env, seed, admin login, adding the Groq key, replacing sample data with real tested data, Postgres switch, deploy, exhibition tips), `DECISIONS.md`, `TESTING.md` with evidence for every item in the acceptance checklist, `docs/ARCHITECTURE.md` (diagram + data flow for scan).

## 5. Definition of done
All of the following, with proof in `TESTING.md`:
- The acceptance checklist in `09_TEST_AND_DEPLOY.md` is fully ticked.
- A clean clone runs with `npm install && npm run setup && npm run dev`, and the app works with **no Groq key** (mock mode) and with a key (live mode).
- I can: open the app as a guest, scan or pick waste, get tested + AI ideas, follow Make mode, submit "I made this" with a photo, see impact change, switch to Urdu and dark mode, log in as admin, approve the photo, and see it in the community gallery.
- Typecheck, lint, unit/integration tests, Playwright e2e and build all pass with no skipped tests that hide failures.
- No placeholder text, dead buttons, fake data presented as real, TODOs in user-facing paths, or console errors.

## 6. Engineering standards
Strict TypeScript, no `any` in domain code; small cohesive modules; shared validation; consistent error format; transactions for multi-write operations (make + impact + aggregates + badges); indexes per `04_DATABASE.md`; idempotent seed; pagination everywhere; optimistic UI where appropriate; no N+1 queries; accessible semantic HTML; meaningful commit messages; no dead code. Don't add features beyond the docs unless it is needed to make a documented feature work. If you must cut scope under time pressure, cut Could/Should items in this order: sheet import, community likes, Ask ReMake, shop price cards. **Never** cut AI scan, tested/AI labelling, the impact dashboard, admin moderation, Urdu or kiosk mode.

## 7. When finished, reply with
1. How to run it (exact commands) and the admin login.
2. What works, what is mocked, and what needs my input (Groq key, real emission-factor citations, team's real measurements/photos, WhatsApp number, Instagram URL).
3. Known limitations and suggested next steps.
4. Paths to the screenshots and `TESTING.md`.

Begin now with step 0 (read the docs) and step 1 (`PLAN.md`).
