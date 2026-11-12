# 08 — Impact calculation, equivalents, badges, streaks

## Principle
Show **estimates**, transparently. All constants live in the DB (waste types) or in `packages/shared/src/impact.ts` constants, and are shown on the "How we calculate this" page.

## Formulas
- Idea waste mass: `wasteGrams = sum(IdeaWaste.grams)`; for each row `grams = pieces * WasteType.gramsPerPiece` unless the admin sets measured grams.
- Idea CO2 (grams CO2e): `co2SavedG = round( sum( grams_i / 1000 * co2PerKg_i ) * 1000 * REUSE_DISPLACEMENT )` where `REUSE_DISPLACEMENT = 0.5` (default, admin-editable setting `reuse_displacement`) — a deliberately conservative factor because reusing waste avoids part, not all, of the production/disposal emissions; the method page explains this.
- Money per make: `moneyPkr = max(0, (sellPricePkr ?? 0) - costPkr)` if the idea can be sold, else `max(0, costSavedEstimate)` = 0 by default. Label as "could earn". Dashboard splits "Earned/could earn".
- Profit per hour: `max(0, sell - cost) / (timeMinutes / 60)`.
- Manual log: `grams = grams ?? pieces * gramsPerPiece`; `co2G = round(grams/1000 * co2PerKg * 1000 * REUSE_DISPLACEMENT)`.
- Snapshot values onto `Make` at submission so later factor edits do not rewrite history.

## Seeded emission factors (illustrative placeholders — MUST be replaced with cited values)
| slug | co2PerKg (kg CO2e / kg material) |
|---|---|
| plastic-bottle | 2.3 |
| bottle-cap | 2.0 |
| food-scraps | 0.6 |
| old-cloth | 5.0 |
| cardboard | 1.0 |
| glass-jar | 0.9 |
| tin-can | 2.0 |
| paper-newspaper | 1.1 |
| plastic-bag | 2.0 |
| tetra-pack | 1.1 |
`factorSource` for each: `"Illustrative default — replace with cited value (e.g., EPA WARM / DEFRA / ecoinvent) before presenting"`. The README must tell the team to research and cite real values (their course report needs sources). The agent must NOT claim these are authoritative.

## Equivalents (constants in shared, shown with ≈)
- Plastic bottles kept out of landfill: `wasteG(plastic-bottle) / 20`
- Bottle caps: `wasteG(bottle-cap) / 2`
- "Phone charges" equivalent for CO2: `co2G / 8` (≈ 8 g CO2e per full smartphone charge — illustrative, editable constant with a note)
- Km not driven by car: `co2G / 170` (≈ 170 g CO2e/km average petrol car — illustrative, editable)
Show 2-3 relevant equivalents (those > 0), phrased fun, EN + UR.

## Streak
A day counts if the user has at least one Make or ImpactLog on that local calendar day (Asia/Karachi default; use user's browser tz offset stored at session). `current` = consecutive days ending today or yesterday; `best` = max.

## Badges (awarded by `awardBadges(userId)` after Make/ImpactLog/Scan/approval)
| key | rule |
|---|---|
| first-make | makes >= 1 |
| five-makes | makes >= 5 |
| streak-3 | best streak >= 3 |
| one-kg-club | total wasteG >= 1000 |
| bottle-hero | bottle-equivalents >= 10 |
| cloth-saver | cloth wasteG >= 500 |
| sharing-is-caring | >= 1 approved make with photo |
| scanner | scans >= 1 |
Return newly awarded badges in the responses of the triggering endpoints. Idempotent (unique constraint).

## Weekly chart
Last 8 ISO weeks (week starting Monday); fill empty weeks with 0.

## Exhibition counters
`/stats/today`: makes today (all users), waste g today (makes + logs), scans today, distinct users today. Cache 10 s.
