# 03 — Functional Requirements Document (FRD): ReMake

Notation: FR-ID, priority (M=Must, S=Should), behaviour, acceptance criteria (AC).

## A. Access and accounts
| ID | P | Requirement |
|---|---|---|
| FR-A1 | M | First visit auto-creates a guest user (cookie). Guest can scan, save, make, log impact. |
| FR-A2 | M | Register (name, email, password) **upgrades the current guest row**, keeping all its data. AC: after signup, saved ideas/makes/scans persist. |
| FR-A3 | M | Login/logout; if logging into an existing account from a guest session, merge guest data into that account (saves, makes, logs, scans) and delete the empty guest. |
| FR-A4 | M | Profile: edit name, language, theme; delete account (confirm) removes personal data and uploaded photos. |
| FR-A5 | M | Admin role seeded from env; admin link visible only to admins. |

## B. Discovery
| ID | P | Requirement |
|---|---|---|
| FR-B1 | M | **Pick your waste**: grid of waste-type cards (icon, name EN/UR, idea count); multi-select; sticky "Show ideas (n)" CTA. |
| FR-B2 | M | Ideas result matches ideas using **any** selected type by default; toggle "must use all"; ranks by (match count desc, TESTED first, shorter time). Shows "Uses: bottle + cap" chips. |
| FR-B3 | M | Text search over idea title/summary/materials (EN+UR), debounced, with recent searches (localStorage) and suggestions. |
| FR-B4 | M | Filters: difficulty (1-3), max time, max cost, can-sell toggle, status (Tested only). Sort: Best match, Quickest, Cheapest, Highest profit, Most impact. URL reflects filters (shareable). |
| FR-B5 | M | Empty state with "Suggest this waste" form (stores `Suggestion`) and "Try AI Scan". |
| FR-B6 | M | Home: greeting, search, waste grid, trending (by makes in last 14 days), "Quick wins < 20 min", impact summary, Scan CTA. |

## C. Idea detail and Make mode
| ID | P | Requirement |
|---|---|---|
| FR-C1 | M | Detail shows: hero image, title, status badge (Tested by ReMake / Not yet tested / AI-suggested), stat row (time, difficulty, cost, sells for, profit/hour), impact row (waste g, CO2 g, equivalents), materials (checklist, tick state local), tools, safety callout, steps preview, community strip ("Made by N, X% worked"), Save, Share, Start making, I made this. |
| FR-C2 | M | Materials checklist can compute "you have 3/5". Optional "Adapt to what I have" (AI helper). |
| FR-C3 | M | **Make mode**: fullscreen one step at a time, photo, text, tip, optional timer (start/pause, notification sound off by default + vibration), progress bar, keyboard arrows, swipe, wake-lock if supported. Ends on Finish screen -> I made this. |
| FR-C4 | M | Share via Web Share API / copy link; `/i/:slug` public URLs with OG meta (SSR not required; use static meta from API `/api/ideas/:slug/og` optional). |
| FR-C5 | S | "Ask ReMake" chat drawer on idea (AI helper, see 06). Output labelled AI; rate limited. |

## D. AI Scan
| ID | P | Requirement |
|---|---|---|
| FR-D1 | M | Scan page: camera capture (mobile `capture="environment"`), drag-drop/upload, preview, up to 3 photos, client resize. |
| FR-D2 | M | `POST /api/scans` -> server validates image, calls Groq vision with JSON mode, validates result with zod, maps items to `WasteType` slugs (unknown -> `other`). Returns detected items with confidence. |
| FR-D3 | M | Result page: photo, editable detected chips (remove/add from waste list), confidence indicator, **Tested/Curated ideas** matching the chips, then **AI suggestions** (generated via separate call) with dashed border, sparkle icon, "not tested yet" label. |
| FR-D4 | M | AI suggestions are saved as `Idea(status=AI_DRAFT, scanId)` visible to the scanning user and linkable; detail page shows untested banner, approx numbers ("~"), safety note. |
| FR-D5 | M | Failure states: unreadable/unsupported -> "Couldn't recognise this" + retry + pick manually; non-waste or hazardous detection -> safe message (see 06 banned list); quota exceeded -> friendly message with reset time; Groq down -> fallback chain then mock/cached suggestion set flagged "offline suggestions". |
| FR-D6 | S | "Regenerate ideas" button (counts toward quota). |
| FR-D7 | M | Admin can **promote** an AI draft into an editable idea (status UNTESTED), then to TESTED after real measurements. |

## E. "I made this" (feedback loop)
| ID | P | Requirement |
|---|---|---|
| FR-E1 | M | Form: outcome (Worked / Partly / Didn't), time taken (min), difficulty felt (1-3), rating (1-5), notes, optional photo (<= 8 MB). |
| FR-E2 | M | Submitting creates `Make(status=PENDING)` and **immediately adds impact** to the user's totals (idea waste/CO2 snapshot). Photo shows publicly only after admin approval. |
| FR-E3 | M | Success screen: impact added, streak, newly earned badge(s), share button. |
| FR-E4 | M | Idea aggregates: makes count, % worked, avg time felt, avg rating, recomputed on write. |
| FR-E5 | M | My Makes page: user's makes with status chips (Pending/Approved/Rejected) and edit/delete own. |
| FR-E6 | S | Community gallery: approved makes, filter by waste type, like toggle (one per user), idea tag link. |

## F. Impact
| ID | P | Requirement |
|---|---|---|
| FR-F1 | M | Dashboard: hero totals (kg waste saved, kg CO2 saved, ideas made, money saved/earned PKR), weekly bar chart (last 8 weeks), donut by waste type, equivalents ("= 12 plastic bottles kept out of landfill"), streak (consecutive days with a make/log), badges grid (locked/unlocked). |
| FR-F2 | M | "Log my reuse" sheet: pick waste type, quantity (pieces or g), optional note -> `ImpactLog`. Uses formulas in 08. |
| FR-F3 | M | "How we calculate this" page showing formulas, factors table (with sources) from DB. |
| FR-F4 | M | Badges awarded server-side on events (see 08): First Make, 5 Makes, 3-day Streak, 1 kg Club, Bottle Hero, Cloth Saver, Sharing is Caring (photo approved), Scanner (first scan). |

## G. Saved, shop, community, static
| ID | P | Requirement |
|---|---|---|
| FR-G1 | M | Save/unsave idea (heart), Saved page grid with empty state. Optimistic UI. |
| FR-G2 | S | Shop: product cards (photo, name, price PKR, waste used, impact). Detail with "Order on WhatsApp" (prefilled message), "Follow on Instagram". Price card printable view (`/shop/price-cards`) for the stall. |
| FR-G3 | S | About: mission, team, course credit, social links, method link. |
| FR-G4 | M | Settings: language EN/UR, theme (system/light/dark), reduce motion override, clear offline cache, sign out. |

## H. Exhibition mode
| ID | P | Requirement |
|---|---|---|
| FR-H1 | S | `/exhibit`: fullscreen landscape UI, large waste tiles, tap -> big idea card (photo, time, cost, sell price, impact) + QR to `/i/:slug`; "Scan" tile opens camera on the laptop/tablet. |
| FR-H2 | S | Live counter strip: ideas made today, kg waste saved (all users today), visitors served; auto-refresh every 15 s via polling `/api/stats/today`. |
| FR-H3 | S | Idle 60 s -> returns to attract screen (animated looping demo of items). |
| FR-H4 | S | Admin setting toggles "kiosk lock" (hides nav, disables sign-in prompts). |

## I. Admin panel (`/admin`)
| ID | P | Requirement |
|---|---|---|
| FR-I1 | M | Dashboard: totals (users, scans, makes, pending moderation), 14-day activity chart, top ideas. |
| FR-I2 | M | Ideas CRUD: title EN/UR, summary, status, difficulty, time, cost, sell price, waste links (type + grams), materials, tools, safety note, cover image, ordered steps (text EN/UR, image, optional timer, tip) with drag-reorder, preview, publish/unpublish. Validation prevents TESTED without >= 3 steps and cover image. |
| FR-I3 | M | Moderation queue: pending makes with photo, approve/reject (reason), bulk actions. |
| FR-I4 | M | Waste types CRUD (icon, EN/UR names, default grams per piece, emission factor + **source**). |
| FR-I5 | S | Products CRUD (photo, price, description, linked waste types, active toggle). |
| FR-I6 | S | Import ideas from CSV upload or published Google Sheet CSV URL (template downloadable); dry-run preview then commit. |
| FR-I7 | M | Settings: WhatsApp number, Instagram URL, site name, scan quotas, AI model names (read-only display of effective values), kiosk lock. |
| FR-I8 | M | AI drafts list with Promote/Archive. Suggestions inbox (waste/idea suggestions from users). |
| FR-I9 | S | Export makes and impact summary as CSV (for the course report). |

## J. System/UX
| ID | P | Requirement |
|---|---|---|
| FR-J1 | M | Loading skeletons, error boundaries, empty states for every list; offline banner; toast system. |
| FR-J2 | M | 404/500 pages with way home. |
| FR-J3 | M | Language switch EN/UR instantly; RTL flips layout, icons, progress direction. Idea content fields have `ur` variants; fall back to EN when missing. |
| FR-J4 | M | First-run onboarding (3 slides) shown once (localStorage) with Skip. |
