# 05 — REST API specification

Base: `/api`. JSON in/out except uploads (`multipart/form-data`). Auth via httpOnly cookie `remake_token`. Errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }` with proper HTTP status. All inputs validated with zod schemas exported from `packages/shared`. Pagination: `?page=1&pageSize=20` -> `{ items, total, page, pageSize }`.

Locale: `?lang=en|ur` or `Accept-Language`; responses include both fields where useful (`titleEn`, `titleUr`), client picks.

## Health
- `GET /health` -> `{ok, version, uptime}`
- `GET /health/ai` -> `{ok, visionModel, textModel, reachable, mode}` (does a cheap models-list call; cached 60 s)

## Auth / session
- `GET /session` -> creates guest if no cookie; returns `{ user: {id, name, email?, isGuest, role, locale, theme}, quota: {scansToday, scansLimit} }`
- `POST /auth/register` {name,email,password} -> upgrades current guest
- `POST /auth/login` {email,password} -> merges guest data
- `POST /auth/logout`
- `PATCH /me` {name?,locale?,theme?}
- `DELETE /me` (password confirm unless guest)

## Catalog
- `GET /waste-types` -> list with `ideaCount`
- `GET /ideas` query: `waste=slug1,slug2`, `matchAll=bool`, `q`, `difficulty`, `maxTime`, `maxCost`, `canSell`, `status=TESTED|UNTESTED`, `sort=match|time|cost|profit|impact`, pagination. Excludes AI_DRAFT unless owned by caller and `includeMine=true`.
- `GET /ideas/trending`, `GET /ideas/quick-wins`
- `GET /ideas/:slug` -> full idea with waste, materials, tools, steps, aggregates, `viewerState {saved, made}`; AI drafts only to owner/admin.
- `POST /ideas/:id/save` / `DELETE /ideas/:id/save`
- `GET /me/saved`

## AI
- `POST /scans` (multipart: `images[]` 1-3 files) -> `201 { scan: {id, mode, model, latencyMs, items:[{label, wasteTypeSlug, material, estimatedPieces, condition, confidence, notes}], overallConfidence, warnings:[] }, imageUrls:[...], matchedIdeas: Idea[] }`
  - 422 `NOT_WASTE`/`HAZARDOUS` with friendly message; 429 `QUOTA_EXCEEDED` with `resetAt`; 503 never — falls back and returns `mode: FALLBACK|MOCK`.
- `PATCH /scans/:id/items` {items:[{wasteTypeSlug,pieces}]} -> re-matches ideas (no AI call)
- `POST /scans/:id/suggest` {regenerate?:bool} -> `{ ideas: Idea[] }` AI_DRAFT ideas created (3 per call), counts toward quota
- `GET /scans/:id`, `GET /me/scans`
- `POST /ideas/:id/assistant` {message, history?:[{role,content}]} -> `{reply, disclaimer:"AI-generated"}` (rate limited; idea context injected server-side)
- `POST /ideas/:id/adapt` {have:[string]} -> `{ materialsMap:[{need,use,note}], notes }` (AI)

## Makes (feedback)
- `POST /ideas/:id/makes` (multipart: outcome, timeTakenMin?, difficultyFelt?, rating?, notes?, photo?) -> `201 { make, impactAdded:{wasteG,co2G,moneyPkr}, newBadges:[Badge], streak }`
- `GET /me/makes`, `PATCH /makes/:id`, `DELETE /makes/:id` (owner)
- `GET /community` (approved makes) query `waste`, pagination; `POST /makes/:id/like` / `DELETE`

## Impact
- `GET /me/impact` -> `{ totals:{wasteG,co2G,ideasMade,moneyPkr}, weekly:[{weekStart,wasteG,co2G}], byWaste:[{slug,wasteG}], equivalents:[{key,count,labelEn,labelUr}], streak:{current,best}, badges:[{key,earned,awardedAt}] }`
- `POST /me/impact-logs` {wasteTypeSlug,pieces?,grams?,note?} -> log + `newBadges`
- `GET /impact/method` -> waste types with `co2PerKg`, `factorSource`, equivalents constants, formula text

## Shop / misc
- `GET /products`, `GET /products/:slug`
- `GET /settings/public` -> whatsapp number, instagram, site name, kioskLock
- `POST /suggestions` {kind:'WASTE'|'IDEA', text}
- `GET /stats/today` -> `{ makesToday, wasteGToday, scansToday, visitorsToday }` (public, cached 10 s)

## Admin (`role=ADMIN`)
- `GET /admin/dashboard`
- Ideas: `GET /admin/ideas`, `POST /admin/ideas`, `GET/PUT/DELETE /admin/ideas/:id`, `POST /admin/ideas/:id/publish`, `POST /admin/ideas/:id/promote` (AI draft -> UNTESTED copy), `POST /admin/uploads` (image; returns url)
- Moderation: `GET /admin/makes?status=PENDING`, `POST /admin/makes/:id/approve`, `POST /admin/makes/:id/reject` {reason}, bulk `POST /admin/makes/bulk` {ids, action}
- Waste types: `GET/POST/PUT/DELETE /admin/waste-types` (editing `co2PerKg` triggers recompute of affected ideas and returns count)
- Products: CRUD `/admin/products`
- Import: `POST /admin/import/preview` (csv file or `sheetUrl`) -> rows + errors; `POST /admin/import/commit`; `GET /admin/import/template.csv`
- Suggestions: `GET /admin/suggestions`, `PATCH /admin/suggestions/:id`
- Settings: `GET/PUT /admin/settings`
- Export: `GET /admin/export/makes.csv`, `GET /admin/export/impact.csv`

## Status codes
200/201 success, 400 validation, 401 unauth, 403 forbidden, 404, 409 conflict, 413 too large, 415 bad media type, 422 semantic (NOT_WASTE, HAZARDOUS), 429 rate/quota, 500 generic (no internals).

## Idea JSON (public shape)
```json
{
  "id":"", "slug":"bottle-cap-keychain", "status":"TESTED", "isAi":false,
  "titleEn":"", "titleUr":"", "summaryEn":"", "summaryUr":"",
  "difficulty":1, "timeMinutes":25, "costPkr":40, "sellPricePkr":250, "profitPerHourPkr":504,
  "wasteGrams":18, "co2SavedG":41,
  "coverImage":"/uploads/...", "safetyNoteEn":"", "safetyNoteUr":"",
  "waste":[{"slug":"bottle-cap","pieces":9,"grams":18}],
  "materials":[{"nameEn":"","nameUr":"","quantity":"9 caps","isWaste":true}],
  "tools":[{"nameEn":""}],
  "steps":[{"position":1,"textEn":"","textUr":"","tipEn":"","imageUrl":"","timerSeconds":null}],
  "stats":{"makes":12,"workedPct":83,"avgRating":4.5,"avgTimeFeltMin":28},
  "viewerState":{"saved":false,"made":false}
}
```
`profitPerHourPkr = max(0, sell - cost) / (timeMinutes/60)`, rounded. AI drafts set `isAi:true` and numeric fields are estimates (UI shows "~").
