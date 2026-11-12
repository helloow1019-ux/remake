# Decisions Log — ReMake

This document logs architectural and design decisions, conflicts identified between docs and prompt, and rationale for choices made.

## 1. Database & ORM
- **Choice**: SQLite by default (`file:./dev.db`), with Prisma ORM.
- **Portability**: String columns with Zod / TypeScript enums are used rather than database-level native enums. This guarantees smooth migration to PostgreSQL simply by changing `provider = "postgresql"` and `DATABASE_URL` in `schema.prisma`.
- **Transactions**: Multi-write operations (Makes + Impact calculations + aggregate counter updates + badge awards) are executed within `prisma.$transaction`.

## 2. API & Client Architecture
- **Monorepo**: npm workspaces with `packages/shared`, `apps/api`, and `apps/web`.
- **Validation**: Shared zod schemas exported from `packages/shared` and consumed directly in both `apps/api` (request validation middleware) and `apps/web` (form handling and typing).
- **Session & Auth**: Cookie-based JWT (`remake_token`, httpOnly, SameSite=Lax). Auto-creates guest on first visit (`isGuest=true`). Upon registration, the guest user row is updated in-place to preserve all scans, saves, makes, and impact logs. Upon login to an existing account, guest data is merged and the orphaned guest record is pruned.

## 3. AI Groq Integration
- **Server-Only**: Groq API key is strictly maintained on the server (`apps/api`). Never exposed in bundle, client responses, or logs.
- **Model Fallbacks**: Verified at startup against `https://api.groq.com/openai/v1/models`. If primary model (`meta-llama/llama-4-scout-17b-16e-instruct`) is unavailable, tries configured fallbacks, and falls back gracefully to `mock` mode if offline or unavailable.
- **Honesty Rule**: AI-suggested ideas are strictly tagged `AI_DRAFT` (`isAi: true`), displayed with dashed borders, sparkle badges, and "~" approximate numbers. Impact calculations are strictly performed on the server based on DB waste factors, never trusted from AI output.
- **Safety First**: Hazardous and non-waste photos are rejected with specific 422 error codes (`HAZARDOUS`, `NOT_WASTE`) and safe guidance.

## 4. UI & Design System
- **Theme**: "The Maker's Workbench" tactile kraft-paper aesthetic using Tailwind tokens (`--paper`, `--paper-2`, `--ink`, `--leaf`, `--marigold`, `--chili`, `--sky`, `--card`), torn-paper edges, stitched borders, and rubber stamps.
- **Typography & RTL**: Bricolage Grotesque / Inter / Caveat, and Noto Nastaliq Urdu / Noto Naskh Arabic for Urdu. Dynamic `dir="rtl"` applied to `<html>` with complete layout mirroring.
- **Signature Interactions**:
  - Waste Picker: Interactive tactile sticker bin where waste items pop and peel with stitch marks.
  - Scan: Viewfinder camera box with live scanning laser animation, photo polaroid display, and editable chips.
  - Make Mode: Fullscreen step-by-step index cards with countdown timers, progress stitch bar, and swipe/keyboard nav.
  - Impact: Kraft receipt ledger with growing garden / bottle tower visual and badge display.
- **PWA & Offline**: Installable via service worker; offline banner displayed when disconnected; cached idea views.

## 5. Course & Origin Context
- Team members: Hamza Shah, Muhammad Hashim, Abdullah Nauman, Mehmood, Mohid, Hamza Mansoor, Muhammad Hamza Rizwan (NUCES, Environmental Science and Sustainability for Business).
- NUCES credited in plain text without logo per PRD.
