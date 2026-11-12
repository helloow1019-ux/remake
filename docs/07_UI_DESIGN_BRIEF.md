# 07 — UI / UX design brief ("not generic" is a hard requirement)

## Concept: "The Maker's Workbench"
A warm, tactile, paper-craft world. The app should feel like a creative workshop table covered in kraft paper, cut-out stickers, stitched lines, price tags and stamps — not a SaaS dashboard, not a default Tailwind/shadcn look, not purple gradients, not a plain card grid with stock icons.

### Look and feel
- **Surfaces**: kraft/cardboard paper textures (subtle SVG noise), torn-paper edge dividers, taped corners, sticker-style waste icons with thick white outline and slight rotation, stitched dashed borders, rubber-stamp badges ("TESTED", "UNTESTED", "AI DRAFT") with a slightly irregular stamp feel.
- **Light theme ("Daylight workbench")** and **dark theme ("Workshop at night")** — both designed, not auto-inverted.
- **Illustration**: build an original set of flat, chunky illustrations/SVG icons for the 10 waste types and an animated mascot-free scene (no copyrighted characters, no stock clip art). Use inline SVG with `currentColor`/tokens.
- **Photography placeholders**: tasteful SVG compositions or generated gradients with shapes for ideas without photos; never grey boxes.

### Palette (CSS variables; AA contrast verified)
| Token | Light | Dark |
|---|---|---|
| `--paper` | #F3E9D2 (kraft cream) | #17201B |
| `--paper-2` | #E8D8B5 | #1F2B24 |
| `--ink` | #1B2A22 | #F3EBD8 |
| `--leaf` (primary) | #2E7D4F | #5CCB8A |
| `--marigold` (accent) | #F4B63F | #F4B63F |
| `--chili` (alert/CTA-2) | #D9532F | #FF7A57 |
| `--sky` (info/stitch) | #4F9BC9 | #7CC0E8 |
| `--card` | #FFFDF7 | #22302A |
Use marigold for primary CTAs on paper backgrounds, leaf for success/impact, chili sparingly (stamps, warnings).

### Typography
- Display: **Bricolage Grotesque** or **Fraunces** (expressive, chunky) for headings; Body: **DM Sans** / **Inter**; Handwritten accents (tips, notes): **Caveat** or **Patrick Hand**; Urdu: **Noto Nastaliq Urdu** (headings/body, with generous line-height 1.9) with **Noto Naskh Arabic** fallback. Self-host fonts via `@fontsource` for offline/PWA.
- Fluid type scale (clamp), tight display tracking, big confident headlines.

### Layout and motion
- Mobile-first, thumb-friendly bottom dock on small screens (Home, Explore, Scan (raised center button), Impact, Me); left rail on desktop; admin uses a distinct, denser "ledger" layout (still on-brand).
- Asymmetric, collage-like sections with overlap, rotated stickers, tape pieces; avoid uniform equal-card grids on key pages (use mixed sizes/masonry).
- Framer Motion: page transitions (paper slide), card "lift and tilt" on hover/press, waste stickers that **peel and pop** when selected, step transitions like turning index cards, confetti of cap/bottle shapes on success (respect `prefers-reduced-motion`).
- Sound: none by default (optional subtle tick on timer end behind a setting).

## Key screens (all must be designed and built)
1. **Splash/Onboarding (3 slides)** — illustrated scenes (pick -> make -> see impact), skip button.
2. **Home** — headline "What have you got?", giant sticker-grid waste picker as a "bin" you tap items out of; trending idea strip as hanging price tags; "Quick wins" as a ticket row; impact "jar" that fills up; raised Scan CTA.
3. **Pick waste / Explore** — big sticker tiles with idea counts, selection shows a stitched ring + tick stamp, sticky bottom "Show ideas (n)" bar.
4. **Scan** — full-bleed camera/preview with a rounded viewfinder with corner brackets, hint text, gallery upload, flash/torch (if supported), capture button; analysing state with a scanning-line animation and rotating friendly messages.
5. **Scan result** — photo as a pinned polaroid, detected items as editable sticker chips with confidence dots, two clearly different zones: **"Tested by ReMake"** (solid stamped cards) and **"AI suggestions — not tested yet"** (dashed border, sparkle, tilt).
6. **Results list** — filter chips + bottom sheet, sort menu, match chips "uses: bottle + cap", skeletons, empty state with suggestion form.
7. **Idea detail** — hero photo with tape corners, stat row as ticket stubs, impact row with animated counters, materials checklist (strike-through on tick), tools as sticker row, **safety callout as a caution-tape banner**, steps preview as a stitched timeline, community strip ("Made by 12 · 83% worked"), sticky action bar (Start making / I made this / Save / Share), "Ask ReMake" drawer.
8. **Make mode** — one step per screen as a big index card, photo, text, handwritten tip, timer ring, stitched progress line, swipe/arrow keys, finish card.
9. **I made this** — friendly 3-step form (outcome faces, time/difficulty/rating, photo + notes), then **celebration screen** with impact added, badge reveal, share card.
10. **Impact dashboard** — hero numbers on a kraft receipt/ledger style, a "bottle tower / growing garden" visual that grows with kg saved, weekly bars, donut by waste, equivalents as fun sentences, streak flame, badge shelf (locked silhouettes vs inked stamps), "How we calculate this" link.
11. **Saved**, **My Makes** (polaroid wall with status stamps), **Community** (masonry wall of approved photos with likes).
12. **Shop** — product price tags/cards, "Order on WhatsApp", Instagram; printable price-card page.
13. **Profile, Settings (language EN/اردو, theme, motion, offline cache), About/Method, Auth (sign in/up, continue as guest).**
14. **Exhibition mode (`/exhibit`)** — landscape fullscreen, giant tiles, huge idea card, QR code, live counters ticker, attract-loop animation, idle reset.
15. **Admin** — dashboard, ideas table + editor (step builder with drag-reorder, image upload), moderation queue (swipe-like approve/reject with keyboard shortcuts), waste types/factors, products, import, settings.
16. **States** — offline banner, skeletons, error with retry, 404, quota exceeded, AI demo-mode chip.

## UX rules
- One primary action per screen; touch targets >= 44 px; visible focus rings; skip-to-content; labels not just colour; alt text everywhere; `prefers-reduced-motion` disables parallax/confetti/tilt.
- RTL: mirror layout and directional icons, numbers stay Latin or Eastern Arabic per setting default Latin, timeline/progress direction flips; test every screen in Urdu.
- Microcopy: friendly, plain, encouraging, never preachy; Urdu strings reviewed for natural phrasing (simple everyday Urdu).
- Performance: lazy-load routes, responsive images (`srcset`/WebP), skeletons, avoid layout shift, preload critical fonts (subset).
- Components: build a small in-house design system (`Button`, `Sticker`, `Stamp`, `TicketStat`, `TapeCard`, `PaperSheet`, `Chip`, `BottomSheet`, `Toast`, `Skeleton`, `ProgressStitch`, `Counter`, `Confetti`) in `apps/web/src/ui` with Storybook-like demo route `/_design` (dev only).

## Anti-generic checklist (agent must self-review before finishing the UI)
- [ ] Could this screenshot belong to any random template? If yes, redesign.
- [ ] No default component-library look; no purple/blue gradient hero; no stock hero image.
- [ ] Waste picker, scan, impact and make mode each have a **signature interaction**.
- [ ] Dark theme and Urdu RTL look intentional.
- [ ] Empty/loading/error states are illustrated and on-brand.
- [ ] Lighthouse a11y >= 95 and no contrast failures.
