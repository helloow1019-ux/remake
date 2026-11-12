# ReMake — Waste-to-Value Platform

> **Turn what you throw into what you grow.**  
> An open waste-to-value circular economy web platform created for the course *Environmental Science and Sustainability for Business* at the **National University of Computer & Emerging Sciences (NUCES)**.

ReMake uses **ReMake Vision** (powered by high-performance LLaMA vision models on the server) to identify household and campus waste (PET bottles, HDPE caps, cardboard packaging, fabric scraps, egg cartons) and matches them to:
1. **Maker-Tested Blueprints**: Verified, step-by-step upcycling recipes developed and tested by the student team with materials, tool requirements, timers, cost, resale prices, verified CO₂ offsets, and high-resolution artisan studio photography.
2. **ReMake Experimental Blueprints**: Novel upcycling proposals labeled clearly as untested drafts.

The platform embraces a tactile, artisanal "Maker's Workbench" aesthetic (warm honey kraft paper, cutting mat grids, washi tape corners, brass eyelets, rubber stamps, and photorealistic craft imagery), step-by-step Make mode with timers, an "I made this" submission flow with photo upload, an honesty-driven personal impact ledger, student shop, Urdu (RTL) localization, PWA offline capability, and an exhibition kiosk mode (`/exhibit`) for live demonstrations.

---

## 1. Quick Start (How to Run)

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0

### Exact Setup Commands
```bash
# 1. Clone repository and enter folder
git clone <repo-url> remake
cd remake

# 2. Install dependencies across all monorepo workspaces
npm install

# 3. Run automated project setup (generates Prisma client, applies schema, seeds DB, creates seed SVGs)
npm run setup

# 4. Start local development servers (API on :4000, Vite Web on :5173)
npm run dev
```

Open your browser at **`http://localhost:5173`**.

### Production Single-Container Build & Run
To run the production-compiled version (Express API serving the Vite production build and uploads on a single port):
```bash
# Compile TypeScript across all packages and bundle web with Vite
npm run build

# Start production server on port 4000
npm start
```
Access the application at **`http://localhost:4000`**.

### Default Admin Credentials
- **URL**: `http://localhost:5173/auth` (or `/admin` once authenticated)
- **Email**: `admin@remake.local`
- **Password**: `change-me-now`

---

## 2. What Works, What is Mocked, and Input Needed

### What Works Fully
- **Guest Auto-Provisioning & Session Merging**: Any visitor can explore, scan, and make crafts without an account. Registering upgrades the active guest session without losing progress.
- **Groq AI Vision & Fallback Chain**: Server-side client wrapper with timeout protection (25s), exponential retry backoff, model fallback chain, JSON schema validation and repair, hazardous item detection, and banned-term filtering.
- **Honest Environmental Impact Engine**: Conservative 50% displacement formula ($0.5 \times \text{virgin offset}$) calculated deterministically from database lifecycle factors.
- **Interactive Make Mode**: Step-by-step focus view with integrated countdown timers and checklist.
- **Photo Upload & Moderation**: Multer upload pipeline with Sharp resizing (1280px max) and magic-byte MIME sniffing. Admin approval publishes makes to the community feed.
- **Bilingual Interface**: Seamless switching between English and Urdu (RTL) across all 18 pages.
- **Live Exhibition Kiosk (`/exhibit`)**: Attract screen with live telemetry counters (polled every 15s) and 60-second idle reset.
- **Printable Price Tags (`/shop/price-cards`)**: Formatted for display tables with tear lines and scissors marks.

### What is Mocked / Fallback Mode
- If no `GROQ_API_KEY` is provided, or if the external Groq service experiences an outage or rate limit (HTTP 429), ReMake automatically activates its canned fallback scenarios (PET bottles, cardboard organizer, hazardous aerosol cans).
- Baseline emission factors are pre-seeded using EPA WARM v15 and peer-reviewed life-cycle analyses labeled `isSampleData: true`.

### What Needs Real Input from the Team
1. **Groq API Keys**: Configured in `.env` (`GROQ_API_KEY=gsk_...` and optional `GROQ_API_KEY_SECONDARY=gsk_...`). ReMake includes a multi-key connection pool with automatic failover on rate limits (429) or token limits. The keys are strictly server-isolated and never delivered to the client bundle.
2. **Groq Models**: ReMake is configured for Groq's active vision catalog with `qwen/qwen3.8-27b` for multimodal vision scanning and text tasks with automatic catalog fallback.
3. **Local Laboratory Measurements**: In `apps/web/src/pages/admin/AdminWasteTypes.tsx` (or `/admin/waste-types`), replace sample default weights with physical digital-scale measurements taken in the university lab.
4. **Contact Channels**: Update your team's WhatsApp order number and Instagram profile in `apps/api/src/config.ts` or via the Admin Settings page (`/admin/settings`).

---

## 3. Switching to PostgreSQL for Production

ReMake's Prisma schema is designed for seamless portability between SQLite (`dev.db`) and PostgreSQL (e.g. Supabase, Neon, or Render Postgres).

To switch:
1. Open `apps/api/prisma/schema.prisma` and change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/remake?schema=public"
   ```
3. Run migrations and seed:
   ```bash
   npm run db:push --workspace=apps/api
   npm run seed --workspace=apps/api
   ```

---

## 4. Live Exhibition Stall Demo Tips

When demonstrating ReMake at a university stall or public sustainability showcase:
1. **Local Reliability**: Run `npm start` on a laptop connected to a mobile phone hotspot. If the venue Wi-Fi drops, ReMake automatically degrades to its offline mock mode without crashing.
2. **Fullscreen Attract Mode**: Open `http://localhost:4000/exhibit` and press `F11` for browser fullscreen. The screen features large touch tiles for passersby to tap.
3. **60-Second Auto-Reset**: If a visitor walks away midway through exploring a project, the kiosk automatically resets back to the attract screen after 60 seconds of inactivity.
4. **QR Code Pairing**: Direct stall visitors to scan the on-screen QR code with their smartphones to test live camera waste scanning on their own devices.

---

## 5. Verification & Deliverables Index

- **Acceptance Checklist & Evidence**: [`TESTING.md`](./TESTING.md)
- **Architectural Diagram & Scan Data Flow**: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- **Key Design Decisions**: [`DECISIONS.md`](./DECISIONS.md)
- **Captured Screenshots (16 high-resolution viewports)**: [`docs/screenshots/`](./docs/screenshots/)
  - `home-desktop-light.png`
  - `home-desktop-dark.png`
  - `home-urdu-desktop.png`
  - `home-urdu-mobile.png`
  - `scan-desktop.png`
  - `idea-detail-desktop.png`
  - `make-mode-mobile.png`
  - `impact-dashboard-desktop.png`
  - `exhibit-kiosk-desktop.png`
  - `shop-desktop.png`

---

## 6. Academic Credit

- **Institution**: National University of Computer & Emerging Sciences (NUCES)
- **Course**: *Environmental Science and Sustainability for Business*
- **Student Team**:
  - Hamza Shah
  - Muhammad Hashim
  - Abdullah Nauman
  - Mehmood
  - Mohid
  - Hamza Mansoor
  - Muhammad Hamza Rizwan
