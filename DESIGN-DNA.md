# Design DNA — Digital Playbook / Better Trade 2026 (DNA Quiz App)

Source of truth: [dna-quiz-flow.html](dna-quiz-flow.html) — the `:root` block (tokens), the CSS immediately
below it (components), and the `<script>` at the bottom (motion + render logic). **This document is a
read-out of that live file, not a new spec.** If this doc and the CSS ever disagree, the CSS wins — grep
the file (`--fs-`, `--ink`, `.next-step`, etc.) before trusting a number here. Written 2026-08-26 for
design review, last synced 2026-09-01 (see §10); expect it to drift the same way its siblings have (see §11).

**Sibling docs** (this file indexes/condenses them — don't duplicate their detail here):
- [PRODUCT.md](PRODUCT.md) — brand personality, users, product purpose, anti-references
- [TYPOGRAPHY-DNA.md](TYPOGRAPHY-DNA.md) — full type-scale read-out
- [EFINAI-ORB-DNA.md](EFINAI-ORB-DNA.md) — the efin AI orb icon's own DNA
- [GLOW-BORDER-DNA.md](GLOW-BORDER-DNA.md) — the ตัวตน card preview's living rotating comet border
- [AURORA-BACKGROUND-DNA.md](AURORA-BACKGROUND-DNA.md) — the analyzing screen's drifting light-blob background
- [PLAYBOOK-2026-DATA-BASELINE.md](PLAYBOOK-2026-DATA-BASELINE.md) — content/persona data source

---

## 1. Brand voice (condensed from PRODUCT.md)

**"Calm, but credible"** — Kinfolk-inspired editorial restraint, not SaaS-dashboard energy or a loud
gamified event app. In practice:
- **Scenes, not components** — sections are individually composed with white space + hairlines, not
  uniform boxed cards with shadows stacked identically down the page.
- **Spectrum gradient is a rare accent, never a fill** — reserved for interactive/selected moments
  (button borders, underlines, progress) — never a background or resting-state color.
- **Animation enhances, never gates** — every reveal has a `prefers-reduced-motion` fallback; content is
  never hidden behind a class-triggered transition.
- **One source of truth for tokens** — `:root` in this file, not a designer's original spec elsewhere.
- **Device reality first** — attendees use whatever phone/event-tablet is in hand; the type scale is
  fixed across breakpoints (only spacing breathes wider on tablet/pc — see §4).

**Anti-references** (things this app deliberately does *not* look like): generic AI-slop SaaS (uniform
card grids, gradient-text headlines, glassmorphism-as-decoration), and loud badge-heavy confetti-first
gamified event apps.

---

## 2. Color tokens

```css
--ink:#111318;  --muted:#687078;
--paper:#f7f8f7; --cloud:#eef1f6; --white:#ffffff;
--accent:rgba(17,19,24,0.06);
--line:rgba(17,19,24,0.09); --line-soft:rgba(17,19,24,0.08);
--line-strong:rgba(17,19,24,0.17); --line-header:rgba(17,19,24,0.06);
--focus:#2b6cff; --popover:rgba(255,255,255,0.96);
```

**⚠️ Correction to stale memory:** this app is **light-theme only** — a prior memory note claimed a full
dark-mode token set exists; the live CSS says otherwise verbatim ("Light theme only — dark mode
intentionally removed, per direction: keep the original editorial theme"). Don't re-introduce a
`prefers-color-scheme` branch without a fresh direction.

### 2.1 Brand spectrum (rare accent)
```css
--cyan:#61e8ed; --violet:#9c91ff; --pink:#f178d8; --yellow:#f2ea83;
--spectrum:linear-gradient(90deg,#61e8ed,#9c91ff,#f178d8,#f2ea83,#61e8ed);
```
Used on interactive/accent moments only (Liquid Metal button rim, hero video badge) — never a section
background.

### 2.2 Status-tone ladder — the semantic color system

This is the one place in the file where color carries *meaning*, not just decoration. Four tones, each
with a fixed job — **don't borrow one tone's color for another tone's job** (this has drifted and been
re-collapsed at least twice already, see the inline comments at each token):

| Tone | Meaning | Base color | Wash/bg | Border | Fill/chip | Text |
|---|---|---|---|---|---|---|
| **Violet** | in progress / active / neutral info | `--violet` | `--active-wash` (10%) | `--active-border` (35%) | `--active-fill` (15%) | `--ink` |
| **Cyan** | done / unlocked | `--cyan` | `--done-wash` (10%) | `--done-border` (35%) | `--done-fill` (15%) | `--ink` |
| **Amber** | needs attention, do this | `--amber-bg:#fef4e2` | — (bg itself) | `--amber-border:#f3daa0` | same as bg | `--amber-text:#8a5a00` |
| **Green** | success / positive outcome | `--green-text:#15803d` | `color-mix(in srgb,var(--green-text) 7%,var(--white))` | `color-mix(in srgb,var(--green-text) 32%,transparent)` | `color-mix(in srgb,var(--green-text) 14%,var(--white))` | `--green-text` |

Cyan/violet are true design tokens (wash/fill/border rungs pre-defined in `:root`); amber is a token trio
too (`--amber-bg/-border/-text`); **green only has one token (`--green-text`)** — every green wash/border
you see is hand-mixed inline via `color-mix()` at point of use (e.g. `.next-step.ds-ok`, `.trait-chip.done`,
`.ds-joined`). If green usage grows, promoting it to a real `--green-bg`/`--green-border` pair (mirroring
amber's shape) is worth a review — see §11.

**Where each tone shows up today:**
- Violet: `.bp-fill` (booth progress bar, not-yet-complete), `.rt-badge.new`, active tab state, `.int-bar-fi` (interest bars, real signal)
- Cyan: `.bp-fill`/`.pe-track-badge.full` once complete, `.bc-play.played`, `.game-row.played`
- Amber: `.draw-status`→`.next-step.ds-need` ("ยังขาด"), `.redeem-card.on`, `.prof-tier`, `.rt-badge.feat`
- Green: `.next-step.ds-ok` ("ครบเงื่อนไขแล้ว" prize-draw success card), `.trait-chip.done`, `.ds-joined` (post-CTA acknowledgment)

---

## 3. Typography (condensed — see TYPOGRAPHY-DNA.md for the full read-out)

Two typefaces: **FC Minimal** (`--font`, UI voice — everything, incl. all Thai text) and **Baskervville**
(`--serif`, editorial display voice — **English display text + numerals only, never Thai**). Both
self-hosted base64 `@font-face`, no CDN dependency.

Fixed scale (identical mobile/tablet/pc — only spacing grows on wider viewports, never type size):

| Token | Size | | Token | Size |
|---|---|---|---|---|
| `--fs-title` | 36px | | `--fs-bodysm` | 18px |
| `--fs-heading` | 28px | | `--fs-label` | 16px |
| `--fs-h2` | 24px | | `--fs-eyebrow` | 14px |
| `--fs-sub` / `--fs-body` | 22px *(2026-08-26, was 20)* | | `--fs-meta` | 14px |

Two rendered weights only: `--w-body`/`--w-head` = 500, `--w-label` = 700. Headlines default to
`letter-spacing:0` (a deliberate signature — don't "fix" it). Uppercase eyebrow labels get `0.02–0.12em`
positive tracking.

---

## 4. Spacing, radius, shadow

Named-by-use-case spacing scale (10 values) — pick the *case* that matches, not a raw px. The
2026-08-31 border/spacing audit rounded ~58 off-grid literals (9/10/14/18/26/28px, etc., that had
drifted in ad hoc) onto the nearest existing rung below — no new tokens were added, this was
compliance cleanup, not a re-tune:

| Token | px | Use case |
|---|---|---|
| `--sp-hairline` | 2 | optical nudge only (never a real gap) |
| `--sp-stack-tight` | 4 | title/value → its one caption line |
| `--sp-glue` | 6 | an icon glued to its own label |
| `--sp-list` | 8 *(2026-08-26, was 9)* | gap between repeated rows in one list/stack |
| `--sp-inline` | 12 *(2026-08-26, was 10)* | two related items sharing a row (icon + text) |
| `--sp-stack` | 16 *(2026-08-26, was 14)* | a card's own eyebrow/heading → its body |
| `--sp-card-pad` | 22 *(2026-08-26, was 20)* | a card's inner edge padding |
| `--sp-card-pad-sm` | 16 *(2026-08-26, was 14)* | small (`--r1`) cards' inner padding |
| `--sp-edge` | 20 | the screen's outer gutter |
| `--sp-block` | 22 | one labeled sub-section to the next inside one card |
| `--sp-section` | 20 (24 tablet/pc) | gap between top-level sections on a long scroll |

Radius: `--r0:6px` (micro-chrome — tooltip/focus ring/route badge), `--r1:8px` (small cards), `--r2:16px`
(cards), `--rpill:48px` (pills/buttons). 12px and 24px are reserved, unused — **enforced by the
2026-08-31 border/spacing audit**, which caught 3 consumers (`.ns-ic`, `.scan-mine-qr`, `.scan-note`)
that had drifted onto a stray literal `12px` and repointed them at `var(--r2)`; the "reserved" claim is
now actually true again, not just documented.

Shadows: `--shadow-action`/`--shadow-primary` (buttons — genuine floating controls keep a shadow),
`--shadow-md`/`--shadow-lg` (overlays: demo panel, map lightbox, scan/share/howto sheets). **Cards/
sections themselves carry no shadow** — hairline border only (`--line-soft`), per the "scenes, not
components" principle in §1. `--shadow-lg` was also re-tuned in the 2026-08-31 audit: it now matches
the value already hand-duplicated across the map lightbox + `.scan-card`/`.share-sheet`/`.howto-card`
(instead of an old 24px/64px/.26 definition none of them actually used), and those 4 consumers now
reference the token instead of repeating the literal. `.demo-panel` is the only other `--shadow-lg`
consumer and got marginally stronger as a side effect (dev-only tool, not user-facing).

---

## 5. Icon system

**Default: Lucide** (outline, 24×24 grid, `currentColor`, round caps/joins) — 53 symbols embedded as
inline `<symbol>` defs, rendered via `ic('lc-name')` → an inline `<svg><use></use></svg>`. Stroke width
steps with size: 16px→1.75px, 20/24px→2px. Never filled/duotone/emoji.

**Override: custom PNG icon-set art**, embedded as base64 `data:` URIs, for specific domains where
bespoke illustrated icons were supplied (17 images: `ICON_STOCK_TH_PNG`, `ICON_GOLD_PNG`,
`ICON_JOYSTICK_PNG`, `ICON_CROWN_PNG`, etc.). Every consumer follows the same **fallback pattern** —
PNG art if this specific key has it, else fall back to the Lucide symbol — so a future entry without
commissioned art never renders broken:
```js
BOOTH_ICON_PNG[b.asset] ? '<img src="'+BOOTH_ICON_PNG[b.asset]+'" alt="">' : ic(b.icon,'bc-asset-ic')
```
Live today on: the 10 booth-zone asset icons (`BOOTH_ICON_PNG`), the 3 ticket-tier badges
(`TIER_ICON_PNG` — crown/gem/compass), and the "เล่นเกมนี้ต่อ"/"ขั้นต่อไป" next-step card's joystick icon
(always-PNG, no Lucide fallback needed there).

**Icon sizing tokens:** `--ic-sm:16px`, `--ic-md:20px`, `--ic-lg:24px` — a PNG `<img>` inside any of these
contexts sizes identically to the SVG it replaces (`.ns-ic img{width:var(--ic-lg);height:var(--ic-lg);
object-fit:contain;}`), so swapping art never shifts a badge's footprint.

---

## 6. Motion DNA

Three independent motion systems, layered, each with its own reduced-motion fallback:

### 6.1 Container Scroll Animation (`.scroll-reveal`)
Every section-level card carries `.scroll-reveal`. `revealTick()` (rAF-throttled, bound to
window+`#root` scroll) computes each element's scroll progress between entering at ~92% down the
viewport and settling flat by ~42%, and applies a 3D tip-back transform that eases out as it scrolls into
place. **Scroll paces the reveal, it never gates content** — nothing is invisible before its transform
settles. `prefers-reduced-motion` collapses straight to flat (`transform:none`).

### 6.2 Chart reveal (`.viz-bar` / `initCharts`)
A one-time `IntersectionObserver` (threshold 0.3) adds `.viz-in` to a chart's containing card the first
time it enters the viewport, then unobserves — **never replays on re-scroll**. Any element with class
`.viz-bar` animates `width:0 → width:var(--tw)` over `.7s` once its ancestor gets `.viz-in`. This is the
one shared idiom behind every bar chart in the app (see §7.3) — a new bar chart should reuse this exact
mechanism, not invent its own reveal.

### 6.3 Liquid Metal buttons
A ported shader-based button component (`js/liquid-metal-button.js` + `js/liquid-metal-cta.js`, ES
modules, ships its own WebGL rim shader with a CSS-gradient fallback if WebGL fails). Three size presets
— `hero` (splash CTA, standalone), `cta` (in-card single action — next-step, prize-draw), `compact`
(header QR pill, secondary CTAs) — same rainbow rim palette and white pill fill at every size, so every
Liquid Metal button reads as one family. Mounted imperatively per-render via
`mountLiquidMetalButtonInto('#slotId','cta',{label,icon,onClick})` into a slot the markup leaves empty,
since this SPA replaces `root.innerHTML` wholesale on every render (see §9.2).

---

## 7. Component library

### 7.1 Buttons
- `.btn.btn-primary` — ink fill / cloud text, 48px pill, the plain-CSS default action button.
- Liquid Metal (§6.3) — for the app's genuine "the one thing to tap" CTAs inside a card.
- `.howto-btn` — light-bordered pill (white bg, ink text) for a secondary/info action ("วิธีเล่น").

### 7.2 Cards
- `.home-card` — the generic top-level section card (hairline border, `--r2`, no shadow).
- **`.next-step`** — the reusable "one prominent action" card: an icon badge (`.ns-ic`, 48px rounded
  square) beside an eyebrow/title/body text block (`.ns-tx` → `.ns-ey`/`.ns-t`/`.ns-b`), with a CTA slot
  (`.ns-cta-slot`) as a third flex sibling that wraps full-width/right-aligned on mobile. Originally the
  ink-dark hero-style card (Home's "ขั้นต่อไป", Games' "เล่นเกมนี้ต่อ"); **as of 2026-08-26 also reskinned
  via tone modifiers** (`.next-step.ds-ok` green, `.next-step.ds-need` amber) for the booth prize-draw
  card — same icon-badge/eyebrow/title/body/cta-slot layout, just recolored per the status-tone ladder in
  §2.2 instead of ink. **This is the pattern to reuse next time a new "one action, in a card" moment
  needs a home** — don't invent a fourth bespoke card shape for it.
- `.conf-box` — the Confidence Score card (sub-score bars + a `.conf-foot` note+CTA row, itself using the
  full-width `.btn.btn-primary` shape, not Liquid Metal, for its "เล่นเกม 6 ด้าน" button). **Also reused
  as-is by `skillCardHTML()`** for the SKILL ประจำการ์ด card (title + `.skc-chiprow` + `.conf-bars` rows,
  same shell) — a second consumer of the same class, not a fork. Its "ยังขาด" badge (amber `.sc.act`
  chip beside the title, laid out via a `.trait-hd` flex wrapper shared with `.skc-t`) was removed
  2026-09-01 per direction; `.trait-hd` was deleted with it since nothing else used that wrapper, and
  `.skc-t` went back to its own default margin instead of the inline zero it used to need.

### 7.3 Bars & charts — three idioms, one reveal mechanism
All three share the `.viz-bar` reveal (§6.2) and a `grid-template-columns:1fr auto` row shape
(label+value on top, a full-width track below), so a new metric can be dropped into whichever idiom fits
without inventing new motion:

| Idiom | Series | Used for | Color |
|---|---|---|---|
| `.trait-row` | single value/max | คะแนนพฤติกรรม (behavior score) | violet→cyan gradient fill |
| `.alloc-bar`/`.alloc-seg` | stacked % segments + legend | แผนจัดพอร์ตที่แนะนำ (recommended allocation) | 4-hue palette, softened 55% toward white |
| `.int-bar-row` | single %, sorted desc | เรดาร์ความสนใจ (interest bars) | full violet (touched) / pale violet tint (muted) — **same hue family, not gray**, per direction |

**Real-data discipline:** `.int-bar-row`'s % is computed from genuine `BOOTH_CHK`/`BOOTH_ACT` signal, not
invented — the file's own comment history flags this explicitly ("NOT a fabricated per-category %") and
it's worth checking before adding a new bar chart: if there's no real signal behind a number, either tag
the section `.ex-tag` "ตัวอย่าง" (§8) or don't ship the bar at all.

### 7.4 Chips, pills, badges
- `.ex-tag` — the "ตัวอย่าง" (example/mock data) marker pill — see §8.
- `.ds-chip` / `.trait-chip` — small status pills, tone-colored per §2.2.
- `.route-badge`, `.rt-badge` (`.pick`/`.feat`/`.new` variants) — booth-route status pills.

### 7.5 Navigation
- `.book-tabbar` — the app-shell bottom tab bar (5 tabs: หน้าหลัก/คู่มือของคุณ/เดินบูธ/เกมหลัก/โปรไฟล์).
- `.bt-tabs--secondary` (pill row) — Book v2's in-page sub-nav (ตัวตน/วิเคราะห์/พอร์ต/เส้นทาง).
- `.bt-tabs--primary` — asset drill-down tabs ("เจาะรายสินทรัพย์").

---

## 8. Content conventions

- **"ตัวอย่าง" (example) tagging** — any section built on illustrative/mocked data (no real backing
  measurement yet, e.g. `traitBars()`, `allocBars()`) carries a visible `<span class="ex-tag">ตัวอย่าง</span>`
  next to its heading. This is a house rule, not a one-off: **never present mocked data as if it were the
  user's real measured result** — tag it, or compute it from something real (see §7.3's `.int-bar-row`
  discipline).
- **No fabricated percentages** — when a real signal exists (booth check-ins, quiz picks, game plays),
  prefer deriving a chart's numbers from it over hand-picking illustrative ones, even for a demo.
- **Thai/English serif split** — Baskervville (`--serif`) never renders Thai text, full stop. See
  TYPOGRAPHY-DNA.md §"Hard rule."
- **Mock interactions still acknowledge the tap** — buttons with no real backend (post-event
  "ดาวน์โหลด", prize-draw "ร่วมลุ้นรางวัล") flip to a small "…แล้ว (ตัวอย่าง)" acknowledgment state on
  click rather than doing nothing, so the prototype never feels unresponsive.

---

## 9. Dev / review tooling conventions

Two standing mechanisms exist specifically to support design review (not real end-user features) — worth
knowing about since they're how this app is normally reviewed:

### 9.1 "จำลองเคส" demo panel (`buildDemo()` / `.demo-panel`)
A floating dev panel (bottom-right FAB, `id="demoFab"`) simulating states that would otherwise require
real interaction to reach: viewport preset, ticket tier, a persona shortcut, quiz-done toggle, and —
as of this session — **explicit force-toggles for edge-case states** (e.g. `DEMO.draw`: อัตโนมัติ/
ครบเงื่อนไขแล้ว/ยังขาด for the prize-draw card) so both branches of a conditional UI can be previewed
without manually driving the real counters to the threshold. **When a new screen has a meaningful
if/else state, add a demo-panel override for it** — this has become the established way to make a state
reviewable.

### 9.2 Version-preview toggles (retired pattern — `BOOK_VER`, `POSTER_VER`)
Global vars (not real user-facing settings) that let the demo panel A/B two implementations of the same
screen side-by-side during a redesign (Book v1 vs v2, Poster v1/v2/v3) before one is retired. Once a
version "won," the loser was usually kept reachable via the panel for a while rather than deleted
immediately, in case review reopened it — but both examples here have since had their loser actually
deleted once no one reopened it: `POSTER_VER` (2026-08-29, only V3 ever reachable) and `BOOK_VER`
(2026-08-30, "ลบ คู่มือ 1 ออก" — คู่มือ 1's `renderBook()` removed, `renderBook2()` renamed to
`renderBook`). Neither var exists in the code anymore; this section stays as a record of the pattern
for the next time a version A/B is needed, not as a pointer to live code.

---

## 10. What changed most recently

For quick orientation on what's newest and least battle-tested — worth a closer look in review.
Newest first; each session's own commit(s) are named so you can `git show` for the full diff.

**2026-09-01** (`894dc5e`) — two unrelated fixes in one commit:
- Glow border (`.hero-glow-spin`'s conic-gradient) reworked for a longer spectrum + softer graduated
  tail — stop positions/angles only, motion/mask technique untouched. Detailed in full in
  [GLOW-BORDER-DNA.md](GLOW-BORDER-DNA.md) §7–§8 (kept in sync there, not duplicated here).
- `skillCardHTML()`'s "ยังขาด" badge removed per direction — see the `.conf-box` bullet in §7.2.

**2026-08-31** (`32aad80`, "Border & spacing audit") — compliance cleanup, no new tokens or visual
redesign: 3 stray `border-radius:12px` consumers repointed at `var(--r2)`, `--shadow-lg` aligned to
the value already duplicated across 4 overlay cards, ~58 off-grid spacing literals rounded onto the
existing scale. Full detail folded into §4 above. Verified in-browser (no console errors, no
clipping/overlap) across Book, Home, and demo-panel screens.

**2026-08-26** (token re-tune + content additions, folded into their sections above rather than kept
here as a separate list): `--fs-sub`/`--fs-body` 20→22px; `--sp-list` 9→8, `--sp-inline` 10→12,
`--sp-stack`/`--sp-card-pad-sm` 14→16, `--sp-card-pad` 20→22 (see §3/§4). Booth-zone icon-set
completed (all 10 zones now have bespoke PNG icons, §5). New **green** status tone added (§2.2) —
still the newest tone, only one hand-mixed token deep, unchanged since. `.next-step` extended with
tone modifiers `ds-ok`/`ds-need` (§7.2) and `.int-bar-row` interest-bar chart added (§7.3) — both
still current, no further changes since.

---

## 11. Open items for review

- **Green tone is under-tokenized** relative to cyan/violet/amber — only `--green-text` exists; every
  wash/border is an inline `color-mix()`. Worth promoting to a real token trio if green usage grows past
  its current 3 consumers.
- **`.next-step` now serves two visual jobs** (ink-dark hero card *and* light tone-colored status card) —
  confirm this dual-purpose is intentional going forward, not a shortcut that should fork into two
  components once one of them grows more custom needs.
- **`.conf-box` now serves two jobs too** (Confidence Score card *and* the SKILL card via
  `skillCardHTML()`, §7.2) — same watch-out as `.next-step` above: fine while both stay simple rows +
  a foot/chip row, worth a second look if either grows bespoke needs the other shouldn't inherit.
- **This doc itself will go stale** — the same way `design-dna-bt2026` (memory) and the sibling `.md`
  files already have, per their own admitted history. Re-grep `:root` and the component classes named
  here before trusting a specific value in a future review.
