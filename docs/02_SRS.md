# 02 — Software Requirements Specification (SRS): ReMake

## 1. Purpose and scope
Defines the system-level requirements for the ReMake web application (public site + admin panel + API + database + AI integration).

## 2. Overall description
- **Type**: Responsive web app (mobile-first) + installable PWA.
- **Architecture**: SPA frontend, REST JSON API, relational DB, local/object file storage, Groq API called **only from the backend**.
- **Users**: Guest, Registered user, Admin.

## 3. Technology decisions (fixed — do not substitute)
| Layer | Choice |
|---|---|
| Monorepo | npm workspaces: `apps/web`, `apps/api`, `packages/shared` |
| Frontend | React 18 + Vite + TypeScript, React Router, TanStack Query, Tailwind CSS (custom design tokens, NOT default look), Framer Motion, Recharts (or hand-built SVG charts), i18next (EN/UR + RTL), vite-plugin-pwa |
| Backend | Node 20+ + Express + TypeScript, zod validation, pino logging, helmet, cors, express-rate-limit, multer, sharp, bcrypt (or argon2), jsonwebtoken |
| Database | Prisma ORM. **SQLite by default** (zero setup, file `dev.db`), schema kept portable so switching to PostgreSQL = change `provider` + `DATABASE_URL`. Migrations + seed script required. |
| AI | Groq Chat Completions (OpenAI-compatible) via `groq-sdk`; models from env (see 06_AI_GROQ.md) |
| Tests | Vitest + Supertest (API), Vitest + Testing Library (web), Playwright (smoke e2e) |
| Tooling | ESLint, Prettier, `tsc --noEmit` in CI script |
| Run | `npm install && npm run setup && npm run dev` starts API (4000) + web (5173). `npm run build && npm start` serves built web from the API on one port. |

## 4. Functional requirements
See `03_FRD.md` (IDs FR-xxx). This SRS binds them with the constraints below.

## 5. External interfaces
- **Groq API** (`https://api.groq.com/openai/v1`): vision + text completions, JSON mode. Key in `GROQ_API_KEY` (server env only).
- **WhatsApp deep link** (`https://wa.me/<number>?text=...`) for orders; **Instagram** profile link (configurable settings).
- **Browser APIs**: `getUserMedia`/file input with `capture`, Clipboard/Web Share, Service Worker, `prefers-color-scheme`.
- **Optional** published Google Sheet CSV URL for idea import.

## 6. Non-functional requirements
| ID | Requirement |
|---|---|
| NFR-01 | LCP < 2.5 s on mid-range phone over 4G for Home and Idea detail; Lighthouse Performance >= 85, Accessibility >= 95, Best Practices >= 90, PWA installable |
| NFR-02 | Scan round trip (upload -> detected list) p90 < 8 s; AI draft ideas stream/appear progressively or within 12 s |
| NFR-03 | Images client-resized (max 1600 px) before upload; server re-encodes JPEG/WebP, strips EXIF, max 8 MB upload; image sent to Groq base64 <= ~1 MB (Groq limit is 4 MB per base64 request) |
| NFR-04 | WCAG 2.1 AA: contrast, focus rings, keyboard nav, alt text, reduced-motion respected, 44px touch targets |
| NFR-05 | i18n: all UI strings in locale files; Urdu uses RTL layout, correct font (Noto Nastaliq Urdu / Noto Naskh Arabic) |
| NFR-06 | Security: see section 7 |
| NFR-07 | Reliability: AI failure never blocks core browsing; graceful fallback + clear error UI with retry and "pick manually" |
| NFR-08 | Offline: app shell + previously viewed ideas available offline; offline banner |
| NFR-09 | Observability: structured logs, request ids, `/api/health` and `/api/health/ai` |
| NFR-10 | Maintainability: strict TS, shared zod schemas in `packages/shared`, no `any` in domain code, README + `.env.example` |
| NFR-11 | Responsive breakpoints: 360, 768, 1024, 1440; kiosk layout at >= 1024 landscape |
| NFR-12 | Data privacy: scan images and make photos visible only to owner (and admin) unless make is approved; deletion of account removes personal data |

## 7. Security requirements
- Passwords hashed (bcrypt cost >= 12). JWT in **httpOnly, SameSite=Lax, Secure (prod)** cookie; 7-day expiry; guest accounts auto-created on first visit (`isGuest=true`).
- Role-based access: `GUEST`, `USER`, `ADMIN`; admin routes under `/api/admin/*` guarded by middleware.
- Input validation with zod on every route; reject unknown fields.
- Upload constraints: MIME sniffing (not just extension), allow jpeg/png/webp, size caps, random filenames, served from `/uploads` with `X-Content-Type-Options: nosniff`.
- Rate limits: global 300/15 min/IP; auth 10/15 min; AI scan 10/hour and 30/day per user (guest) / IP, configurable; AI helper 30/hour.
- Helmet CSP tuned for Google Fonts and own assets. CORS allow-list from env.
- Never expose `GROQ_API_KEY`, stack traces, or raw provider errors to clients.
- Prompt-injection hygiene: treat model output as untrusted; validate with zod; never execute or render raw HTML from AI; escape on render.
- Seed admin from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`); refuse to start in production with default password.

## 8. Data requirements
See `04_DATABASE.md`. Required: relational integrity (FKs), indexes on `Idea.status`, `IdeaWaste.wasteTypeId`, `Make.userId/status`, unique `Save(userId,ideaId)`.

## 9. Constraints and assumptions
- Single-region deployment; one Node process is acceptable for v1.
- Uploaded files stored on local disk (`UPLOAD_DIR`); abstract behind a `Storage` interface so S3/Cloudinary can replace it.
- Currency PKR, metric units (g/kg), 24h time.
- All emission factors are admin-editable and must carry a `source` string.

## 10. Acceptance
The system is accepted when every Must item in the PRD works end-to-end and the checklist in `09_TEST_AND_DEPLOY.md` passes.
