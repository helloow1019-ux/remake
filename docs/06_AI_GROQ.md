# 06 — AI integration (Groq)

All AI calls are made **server-side** with `groq-sdk` (or fetch to `https://api.groq.com/openai/v1/chat/completions`). Never ship the key to the browser.

## Models (env-configurable; verify at build time)
| Env | Default | Purpose |
|---|---|---|
| `GROQ_API_KEY` | — | required for LIVE mode |
| `GROQ_VISION_MODEL` | `meta-llama/llama-4-scout-17b-16e-instruct` | image -> detection JSON (Groq lists it as a **preview** vision model supporting JSON mode, tool use, up to 5 images/request, base64 request limit 4 MB, 33 MP/image) |
| `GROQ_VISION_FALLBACKS` | `meta-llama/llama-4-maverick-17b-128e-instruct,qwen/qwen3.6-27b` | tried in order if the primary returns model-not-found / 5xx / timeout |
| `GROQ_TEXT_MODEL` | `llama-3.3-70b-versatile` | idea generation, assistant, adapt |
| `AI_MODE` | `live` | `live` or `mock` (mock returns canned, realistic results; for offline exhibition/tests) |
| `AI_TIMEOUT_MS` | `25000` | per call |

At startup and in `/api/health/ai`, call Groq's models list endpoint (`GET /openai/v1/models`) and log whether the configured IDs exist. If the vision model is missing, auto-select the first available fallback and log a warning. Groq model catalogue changes — **never hardcode beyond these env defaults**.

## Fallback chain (FR-D5)
1. Primary model -> 2. fallbacks in order -> 3. if all fail and `AI_FALLBACK_TO_MOCK=true` (default true): return **MOCK** detection by simple heuristics (filename/mime can't tell content; use a neutral "Plastic bottle" example ONLY when mode is explicitly `mock`; in LIVE failure, respond with `mode:"FALLBACK"`, empty items and ask user to pick manually, plus show cached popular ideas). Be honest in UI: never pretend a mock detection is real.

## Image preparation
- Accept jpeg/png/webp up to 8 MB; sniff magic bytes.
- `sharp`: rotate by EXIF, resize longest side to 1280 px, re-encode JPEG q80 (strip metadata). Target < 1 MB. Send as `data:image/jpeg;base64,...` in `image_url`.
- Up to 3 images per scan.

## Prompt 1 — Vision detection (JSON mode)
`response_format: { type: "json_object" }`, `temperature: 0.2`, `max_tokens: 900`. The prompt must contain the word JSON.

System:
```
You are ReMake's waste identification assistant. You look at photos and identify household waste items that could be reused for crafts or useful objects.
Return ONLY a JSON object. Be literal: only list what is clearly visible. Never invent items.
Map each item to exactly one of these wasteTypeSlug values: plastic-bottle, bottle-cap, food-scraps, old-cloth, cardboard, glass-jar, tin-can, paper-newspaper, plastic-bag, tetra-pack, other.
Mark hazardous items (batteries, electronics with batteries, chemicals/pesticide containers, medical sharps or medicine, aerosol cans, broken glass, asbestos, gas cylinders) with "hazardous": true.
If the photo has no reusable waste (people, pets, scenery, screens, documents with personal data) set "isWaste": false.
Schema:
{
 "isWaste": boolean,
 "overallConfidence": number (0-1),
 "items": [{
   "label": string (short, English),
   "wasteTypeSlug": string,
   "material": string (e.g. PET plastic, HDPE, cotton, corrugated cardboard, glass, steel),
   "estimatedPieces": integer (>=1),
   "condition": "clean" | "dirty" | "damaged" | "unknown",
   "hazardous": boolean,
   "confidence": number (0-1)
 }],
 "warnings": [string]
}
```
User content: `[ {type:"text", text:"Identify the waste in these photos. Respond in JSON."}, {type:"image_url", image_url:{url:...}} x N ]`.

Validation (zod in `packages/shared`): clamp numbers, drop unknown slugs to `other`, cap items to 8, trim strings to 80 chars. Parse failure -> retry once with `temperature 0` and a "Return valid JSON only" nudge; second failure -> FALLBACK. If any item `hazardous` -> 422 `HAZARDOUS` listing a **safe disposal message**, not ideas. If `isWaste:false` -> 422 `NOT_WASTE`.

## Prompt 2 — Idea generation (text model, JSON mode)
`temperature: 0.7`, `max_tokens: 2200`. Input: confirmed items (slug, pieces), locale hint, existing tested idea titles to avoid duplicating.

System:
```
You are ReMake's craft designer for beginners in Pakistan. Suggest 3 DISTINCT reuse ideas using ONLY the waste items given plus cheap common household extras (scissors, glue, thread, markers, paint, string). Prices in PKR. Be realistic and safe.
Rules:
- No ideas needing hazardous tools or materials (open flame, soldering, chemicals, power tools). Hot glue and craft knife only with an adult-supervision note.
- Do not suggest storing food or drink in reused containers unless explicitly food-safe; never suggest reusing medicine/chemical containers.
- Steps must be short, concrete, numbered, each doable in under 10 minutes; 4-8 steps.
- Be honest: these are untested drafts. Numbers are estimates.
- Give Urdu translations (natural, simple Urdu) for titles, summaries, steps and safety note.
Return ONLY JSON:
{ "ideas": [{
  "titleEn","titleUr","summaryEn","summaryUr",
  "difficulty": 1|2|3, "timeMinutes": int, "costPkr": int, "sellPricePkr": int|null,
  "materials":[{"nameEn","nameUr","quantity","isWaste":bool}],
  "tools":[{"nameEn","nameUr"}],
  "steps":[{"textEn","textUr","tipEn"?, "timerSeconds"?: int}],
  "safetyNoteEn","safetyNoteUr",
  "wasteUsed":[{"wasteTypeSlug","pieces":int}]
}]}
```
Server post-processing: zod-validate; clamp (time 5-480, cost 0-2000, sell <= 5000); **impact is computed server-side from `wasteUsed` and DB factors (never trusted from AI)**; ensure safety note non-empty (insert default); slugify unique; save as `AI_DRAFT` with `source=AI`, `ownerUserId`, `scanId`, no cover image (UI renders an illustrated placeholder by waste type). Reject/regenerate ideas whose text contains banned terms (see below).

## Prompt 3 — Idea assistant ("Ask ReMake")
System: grounded in the given idea JSON (title, materials, steps, safety). Answer in the user's language (EN or UR), <= 120 words, practical, safe; if asked something outside the idea/craft/reuse topic, politely redirect. Refuse anything hazardous. Return plain text. `temperature 0.4`, `max_tokens 400`. Prepend nothing hidden; UI labels as AI-generated.

## Prompt 4 — Adapt to what I have
Input: idea materials + user's list of available items. Output JSON `{materialsMap:[{need,use,note}], notes}` mapping missing materials to substitutes; must keep safety rules.

## Banned/hazard terms (server-side filter on generated text)
battery, batteries, lithium, bleach, acid, pesticide, insecticide, solder, open flame, gasoline, petrol, kerosene, medicine bottle for food, asbestos, firecracker. If matched in an AI idea -> drop idea and regenerate once; if still bad return fewer ideas.

## Safety + abuse
- Per-user and per-IP quotas (see SRS). Quota counters in DB `Scan` table (count per user per window).
- Log model, latency, mode, token usage (if provided), never log images or keys.
- Optional hardening: before vision analysis, run `meta-llama/llama-guard-4-12b` image moderation if enabled by `AI_MODERATION=true` (reject unsafe images with a neutral message).
- Treat all model text as untrusted: escape when rendering; never `dangerouslySetInnerHTML`.

## Mock mode data
`apps/api/src/ai/mock.ts` exports 3 canned scenarios (plastic bottles+caps, old cloth, cardboard) with fully valid detection + 3 idea drafts each, used when `AI_MODE=mock` and in tests. UI shows a small "Demo mode" chip when `mode=MOCK`.

## Testing AI code
Unit-test the zod validators, JSON-repair/retry path, fallback chain (mock the Groq client to throw 404/429/500), hazardous/non-waste branches, and banned-term filter. Provide a manual script `npm run ai:smoke -- path/to/photo.jpg` that hits the real API and prints the validated result.
