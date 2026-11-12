# 01 — Product Requirements Document (PRD): ReMake

## 1. Vision
ReMake is a web app that turns waste people already have into things they can make. The user picks (or photographs) their waste, gets reuse ideas with materials, tools, photo steps, time, difficulty, cost, selling price and the waste/CO2 the idea saves. Ideas made and tested by the ReMake team are shown first and clearly badged. AI (Groq) fills gaps with clearly labelled, untested suggestions.

Tagline: **"Turn what you throw into what you grow."**

Team (shown on the About page): Hamza Shah, Muhammad Hashim, Abdullah Nauman, Mehmood, Mohid, Hamza Mansoor, Muhammad Hamza Rizwan. University: National University of Computer & Emerging Sciences (NUCES). Course: Environmental Science and Sustainability for Business. Do not use the university logo in the app; credit it in text only.

Proposal commitments the app must support: (a) a database of reuse ideas searchable by waste type (the proposal mentions a Google Sheet as the content source, so admin Import from CSV/published Sheet is a Should-have), (b) idea pages with materials, tools, photo steps, time, difficulty, cost, sell price, waste and CO2 saved, (c) an "I made this" feedback button, (d) the team makes and tests 3-4 ideas itself and classmates/friends try others through the app, so real results can be shown, (e) physical products (bottle-cap keychains, letter keychains, bottle-bottom items) with price cards, (f) QR-code posters and Instagram branding, (g) an exhibition stall with a laptop running the app and impact dashboard and a live demo where visitors pick waste and get an idea.

Origin: course project for *Environmental Science and Sustainability for Business* (waste & circular economy, digital tools for tracking sustainability, business & finance). The app is demoed live at an exhibition stall alongside physical products (bottle-cap keychains, letter keychains, bottle-bottom items).

## 2. Problem
- Reuse ideas online are scattered and sorted by finished project; you must already know what to make.
- They are rarely tested and do not give time, cost, or selling price.
- People never see the effect of their reuse, so they lose interest.

## 3. Target users
| Persona | Need |
|---|---|
| **Student maker (Ayesha, 20)** | Quick, cheap ideas from bottles/caps; wants to sell crafts for pocket money |
| **Home family (Mr & Mrs Khan)** | Kid-friendly, safe ideas from kitchen/household waste |
| **Micro-entrepreneur (Bilal, 28)** | Which idea earns most per hour; price cards |
| **Exhibition visitor** | 30-second demo: pick/scan waste -> get idea |
| **Admin (ReMake team)** | Add tested ideas, moderate "I made this" photos, edit products & factors |

Primary locale: Pakistan (PKR, English + Urdu with RTL).

## 4. Goals and success metrics
| Goal | Metric (demo/pilot) |
|---|---|
| Fast path to an idea | Scan -> idea list < 8 s p90 on normal wifi; manual pick -> list < 3 clicks |
| Trust | 100% of ideas show a status badge (Tested / Untested / AI draft) |
| Feedback loop | >= 20 "I made this" submissions from classmates before exhibition |
| Impact visibility | Every user sees personal totals (kg waste, kg CO2, ideas made, Rs saved/earned) |
| Exhibition readiness | Kiosk mode works offline-ish (AI fallback, cached ideas) |

## 4b. Differentiators vs. existing apps
(Researched earlier: Valuable Trash, Re-Up, Crafty, Scrapp, EcoPal, Olio.)
- Search by **the waste you have**, not the finished project (Crafty is closest but community-only).
- **Human-tested** ideas with real time/cost/price numbers (AI-first apps lack this).
- **Business angle**: sell price, profit per hour, Shop with price cards.
- **Impact tied to what you actually made** (not generic carbon tracking).
- **Honest AI**: AI ideas are labelled untested and can be promoted to tested after a real make.
- Pinterest is deliberately NOT used (no public discovery search in API v5, scraping prohibited by its guidelines, and untested pins contradict our promise).

## 5. Scope (MoSCoW)
**Must**
1. Guest-first access; optional email/password account (guest data is kept on signup).
2. Browse/search by waste type (multi-select), idea list with filters/sort.
3. Idea detail (materials, tools, steps with photos, time, difficulty, cost, sell price, impact, safety).
4. Step-by-step "Make mode" with progress + timers.
5. **AI Scan**: upload/capture photo -> Groq vision identifies waste -> tested ideas + AI-generated draft ideas.
6. "I made this" feedback (outcome, time, rating, photo, notes) with moderation.
7. Impact dashboard (totals, weekly chart, by-type chart, equivalents, streak, badges) + manual "Log my reuse".
8. Saved ideas, My Makes.
9. Admin panel: ideas CRUD (with steps/photos), moderation queue, products, waste types & emission factors, settings, stats, promote AI idea -> tested.
10. English + Urdu (RTL), light/dark theme, responsive (mobile-first), accessible.
11. Seed data (waste types, 12 ideas, products, badges).

**Should**
12. Shop page (ReMake products, price cards, "Order on WhatsApp", Instagram link).
13. Community gallery (approved makes, likes).
14. Exhibition/kiosk mode `/exhibit` with QR code, big waste picker, live counters, idle auto-reset.
15. PWA: installable, offline cache of idea pages and app shell.
16. "Ask ReMake" AI helper on an idea ("I don't have X, what can I use?", "explain step 3").
17. Admin CSV / published Google Sheet import of ideas.
18. Shareable idea card image / QR poster page.

**Could**: web push reminders, voice search, multiple-photo scan, idea of the day.
**Won't (v1)**: payments/checkout, native mobile apps, Pinterest integration, marketplace for users to sell.

## 6. Key user flows
1. **Scan flow**: Home -> Scan -> take/upload photo -> "Analysing..." -> detected waste chips (editable) -> Tested ideas section + AI suggestions section -> idea detail -> Make mode -> "I made this" -> impact added -> badge.
2. **Manual flow**: Home -> Pick waste -> Show ideas -> filter -> detail.
3. **Admin flow**: login -> Ideas -> New idea (steps + photos) -> publish; Moderation -> approve/reject; Promote AI idea.
4. **Exhibition flow**: /exhibit -> visitor taps waste -> idea card + QR to open full idea on phone.

## 7. Content rules
- Every idea has a status: `TESTED` (team made it, real numbers), `UNTESTED` (curated, not yet made), `AI_DRAFT` (generated), `ARCHIVED`.
- Seeded numbers are **sample placeholders** (`isSampleData=true`), shown with a subtle "sample data" marker in admin only, and the README tells the team to replace them with real measurements before presenting. The app must never present sample numbers as verified in public UI for ideas not `TESTED`.
- Impact numbers are labelled "estimated" and link to "How we calculate this".

## 8. Risks
| Risk | Mitigation |
|---|---|
| Groq model/ID changes (vision model is a *preview*) | Env-configurable model + fallback chain + `/api/health/ai` check + mock mode |
| AI hallucinated unsafe ideas | Safety rules in prompts, banned-waste list, mandatory safety note, "untested" labelling |
| Wifi failure at exhibition | AI mock/fallback results, cached ideas, PWA |
| Abuse of free AI endpoint | Rate limits per user/IP, image size caps, daily scan quota |
| Few tested ideas | Mark UNTESTED honestly; feedback loop to grow tested set |
