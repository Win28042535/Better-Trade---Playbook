# Typography DNA — Digital Playbook / Better Trade 2026

Source of truth: `:root` in [dna-quiz-flow.html](dna-quiz-flow.html) (search `--fs-`, `--w-`, `--font`, `--serif`).
This file is a **read-out** of that CSS, not a new spec — if the two ever disagree, the CSS wins; update this doc to match.

*Last synced to the CSS: 2026-10-08 — the 8 stale points listed in [TYPOGRAPHY-AUDIT.md](TYPOGRAPHY-AUDIT.md) §6 are fixed below, plus the
Playbook พอร์ต tab (§10). Findings the audit raised against the CODE (not this doc) are tracked in the audit, not here.*

Related memory: `design-dna-bt2026` (active DNA + history), `design-md-location` (sibling marketing-site DESIGN.md).

---

## 1. Two-typeface system

| Role | Token | Typeface | Weight axis | Used for |
|---|---|---|---|---|
| UI voice (default) | `--font` | **FC Minimal** | variable, 100–900 | everything: body copy, labels, buttons, nav, Thai text |
| Editorial display voice | `--serif` | **Baskervville** | variable, 400–700 | English display text + numerals *only* |

```css
--font:'FC Minimal','Taviraj',system-ui,-apple-system,'Segoe UI',sans-serif;
--serif:'Baskervville','Bodoni MT','Didot',Georgia,'Times New Roman',serif;
```

All faces are self-hosted as `.ttf` files under `assets/`, loaded with `url()` (no CDN; no longer base64 inside the HTML since the asset split): FC Minimal ships as **two** `@font-face` slices — `fc-minimal-100-500.ttf` and `fc-minimal-600-900.ttf` — to cover its full variable axis across browsers; Baskervville is one slice, `baskervville-400-700.ttf` (OFL-licensed). **Taviraj** (`taviraj-medium.ttf` / `taviraj-bold.ttf`) is embedded only as the Thai fallback inside `--font` (2026-09-25: the old Noto Sans Thai / Thonburi / DB Helvethaica X tail was never actually embedded), never as a display face.

**Hard rule — Thai always renders in FC Minimal, never in the serif, regardless of size or role.** This is a deliberate brand rule, not a fallback gap: some past display-serif candidates (e.g. Taviraj) actually had full Thai glyph coverage, so the serif would "just work" for Thai too if applied by accident. Check every new `--serif`-classed element for Thai characters before shipping.

### History (why this keeps moving — check the live CSS, not old docs)
The display-serif slot has changed **three times**: Canela/Ivar (placeholder) → Taviraj (fully embedded, then retired) → Trirong (matched the printed character-card art) → **Baskervville (current)**. Each swap kept the same rule (serif = EN display/numerals only) and the same token name (`--serif`), only the font-face changed. Any doc or memory older than 2026-08-19 may still say Trirong — the file itself is authoritative.

---

## 2. Type scale

Fixed tokens — **identical across mobile / tablet / pc**. Only spacing (`--sp-section`) changes per breakpoint, never font size; desktop is a seamless full-width page (capped ~760px content), not a scaled-up phone layout.

| Token | Size | Typical use |
|---|---|---|
| `--fs-title` | 36px | quiz question headline (`.q-title`), confidence score (`.conf-sc`), mini-game points (`.play-sum-pts`). *Not* the consent headline any more: `.consent-h` is a one-off 64px, the reveal headline 40px |
| `--fs-heading` | 28px | section/hero headline (`.hero-th`, `.s-h`) |
| `--fs-h2` | 24px | topbar title, stat/rank numerals, progress value, pass name (`.tb-title`, `.prog-val`, `.pass-name`, `.int-sec-rank`) |
| `--fs-sub` | 22px | component titles, answer option text, button label (`.opt-text`, `.btn`, `.side-t`, `.scan-t`) |
| `--fs-body` | 22px | paragraph copy (`.consent-p`) — same size as `--fs-sub`, distinct semantic role |
| `--fs-bodysm` | 18px | the app's default supporting-text size — most captions/descriptions/secondary copy |
| `--fs-label` | 16px | option-key numerals, list item titles, inline note text |
| `--fs-eyebrow` | 14px | uppercase kicker/section labels |
| `--fs-meta` | 14px | meta/count text — same size as eyebrow, kept as a separate token for semantic clarity (per 2026-08-15 audit, this is now the only deliberate two-way size overlap in the scale) |

*(v3, 2026-08-19: every rung stepped up uniformly from the v2 numbers — title 32→36, heading 24→28, h2 22→24, sub/body 18→20, bodysm 16→18, label 14→16, eyebrow/meta 12→14 — same relative hierarchy, larger absolute scale.)*

*(v4, 2026-08-26, per direct spec: only sub/body moved this round, 20→22 — every other rung held. This
narrows the h2(24)↔sub/body(22) gap to 2px and widens sub/body(22)↔bodysm(18) to 4px, breaking the
"ratios preserved" pattern v2/v3 kept — a deliberate, isolated bump, not a full re-scale.)*

**Card-art scale** (`--pc-fs-1`…`--pc-fs-5`: 24/13/11/10/8.5px) is a **separate, smaller scale** used only by the persona collectible card front/back — deliberately not folded into `--fs-*` because the card is signature illustration art, not app chrome.

---

## 3. Weight scale

```css
--w-body:500;  /* baseline body copy — kept as a distinct token name for semantic role */
--w-head:500;  /* headings/labels at default weight — same rendered value as --w-body */
--w-label:700; /* emphasis: titles, labels, buttons, numerals that need to stand out */
```

The system is meant to render **exactly two weights** (500 / 700), collapsed down from three per direct user instruction ("ให้ในระบบเหลือใช้แค่ 500, 700"). Known leaks (audit 2026-09-21): `.pass-card` rendered 400 (a `<button>` keeping the browser weight) — fixed 2026-09-21; the Liquid Metal buttons (`js/liquid-metal-cta.js` presets, 600) — still open. Any `<button>`, `<input>` or `<table>` must set its weight explicitly (see §9). `--w-body` and `--w-head` are kept as separate token *names* (not merged into one) purely so future edits can still tell "this is baseline copy" from "this is a heading at default weight" — but both currently resolve to 500. **Don't reintroduce a third rendered weight without explicit direction.**

---

## 4. Letter-spacing

- **Headlines/titles/labels default to `letter-spacing:0`** — zero tracking is a DNA signature carried over from the original marketing-site design system.
- **Display-serif numerals/names** get slight **negative** tracking, `-0.01em` to `-0.015em` — tightens the letterforms at large sizes. Actually applied on `.conf-sc`, `.pcE-en`, `.cr-en`, `.pe-num` (and the dead `.sp-h`); `.pcb-en` has none. No sans headline carries tracking (`.consent-h` went -0.01em → 0 on 2026-09-21).
- **Serif codes/English labels in Asset Knowledge** (`.apb-en`, `.apb-hd-en`, `.apb-code`) use **positive** `0.06em` — they are small uppercase-style labels, so they follow the eyebrow rule, not the display rule.
- **Uppercase eyebrow/kicker labels** get generous **positive** tracking, typically `0.02em`–`0.12em` (tuned per component, not one fixed value — e.g. `.rc-kicker` 0.08em, `.hero-en` 0.1em, `.pass-ey`/`.ns-ey` 0.08–0.12em).

---

## 5. Line-height by role

**Base:** `body{line-height:1.5}` (since 2026-09-21 — before that 64% of rendered text fell back to `normal`). Two `:where()` overrides at zero specificity: headings (`.tb-title, .s-h, .prog-val, .conf-sc, .consent-h …`) 1.2; anything named `*-pill / *-chip / *-badge / *-tag` 1.1. Everything below is an explicit per-component value on top of that base.

| Tier | Range | Examples |
|---|---|---|
| Display/title | 1.0–1.2 | `.q-title` 1.2, `.hero-th` 1.1, `.pcE-en` 1.05, `.consent-h` 1.06, `.conf-sc` 1 (stat-style, no descender room — only for numerals with no Thai beside them) |
| Component title/sub | 1.25–1.4 | `.bt-t` 1.25, `.scan-t` 1.3, `.side-t` 1.3 |
| Body/paragraph copy | 1.4–1.65 | `.consent-p` 1.65, `.risk-desc` 1.65, `.side-dl p` 1.65, `.opt-text` 1.5 |
| Label/eyebrow/meta | 1.35–1.55 | most `.fs-eyebrow`/`.fs-meta` text |

---

## 6. Uppercase eyebrow pattern

The recurring "kicker" recipe used for every section label / pill / badge in the app:

```css
font-size:var(--fs-eyebrow); font-weight:var(--w-head) /* or --w-label for extra emphasis */;
text-transform:uppercase; letter-spacing:0.02–0.12em; color:var(--muted) /* or --ink / section accent */;
```
Seen on (18): `.rc-kicker`, `.prog-lbl`, `.hero-en`, `.hero-leg-lbl`, `.s-ey`, `.upd-pill`, `.risk-slbl`, `.conf-ml`, `.quote-badge`, `.ex-tag`, `.pass-ey`, `.ns-ey`, `.play-result-ey`, `.gh-restlbl`, `.pq-lbl`, `.pcb-ey`, `.pcb-hd`, `.demo-lbl` (dev-only). The tracking value is still tuned per component (audit: 9 different values) — when adding a new one, reuse `0.04em` or `0.08em` rather than a new number.

---

## 7. Where the serif actually appears (audit)

English display text + numerals only — confirmed no Thai-text usage:
- `.ln` — legend investor name (e.g. "Warren Buffett")
- `.conf-sc` — confidence score numeral
- `.trait-v`, `.alloc-p`, `.int-bar-v`, `.lib-num` — stat/data numerals
- `.cr-en` — character-card reveal English name (48px)
- `.pcE-en`, `.pcb-en`, `.pcb-leg b` — persona card display name (front + back) and legend name
- `.apb-en`, `.apb-hd-en`, `.apb-code`, `.apb-src b` — Asset Knowledge English book names, step codes, source numbers
- `.pe-num` — Playbook พอร์ต tab data numerals (§10)
- *(dead)* `.sp-h` — splash hero display headline: the rule is still in the CSS but no markup uses it any more

(`.risk-vl` / `.conf-vl` were listed here before but are FC Minimal in the CSS.)

---

## 8. Governing principles (the *why*)

- **"Calm, but credible"** (Kinfolk north star) — type carries hierarchy through scale/weight, not decoration; restraint is the house style.
- The serif is the **"fore" layer** of the 4-layer Graphic Formula (base = whitespace, mid = line drawings, fore = architectural serif type, accent = spectrum gradient, used rarely) — reserved for moments that want editorial gravity: names, scores, headlines. Everything else stays on FC Minimal.
- **Thai/English split is a brand rule, not a technical fallback** — the easiest rule in this doc to break by accident; always check.
- **Zero letter-spacing on headlines** is an intentional signature, not an oversight — don't "fix" it by adding tracking.
- **Two rendered weights only (500/700)** — a deliberate simplification; resist a third weight creeping back in.
- Type scale does **not** grow on wider viewports — the phone-frame's scale is the app's scale everywhere; only spacing breathes on tablet/pc.

---

## 9. Typography outside the CSS tokens (read these when auditing)

- **The file has no `<!DOCTYPE>` → quirks mode.** `<table>`/`<td>` do NOT inherit font-size/weight/line-height from `body`, and `<button>`/`<input>` keep the browser's 400 weight and `line-height:normal`. Every table, button and input must set `font-family`, `font-weight` and `line-height` itself (this is what caused the `.pass-card` 400 leak and the พอร์ต tab's 46 text nodes at 400 before 2026-10-08).
- **Liquid Metal buttons** (`js/liquid-metal-cta.js`) set their own font size/weight in JS presets (400 / 600) — not tokens.
- **SVG text** (radar labels, chart labels) uses `font-size=` attributes in the SVG, not `--fs-*`.
- **Inline `style="font-size…"`** inside JS template strings — see TYPOGRAPHY-AUDIT.md §4.6 for the list.

---

## 10. Playbook พอร์ต tab (Education Edition, 2026-10-08)

Measured on the rendered tab (169 text nodes): sizes 14/16/18/24/28 only (all on scale), weights 500/700 only, no `line-height:normal`, tracking 0 except the serif numerals, no Thai in the serif.

- **Card / sub-section titles** — `.s-h` 28/700 (same as the other Book tabs; sub-sections use `.trait-sec` + `.s-h` like "คะแนนพฤติกรรม").
- **Tables** (`.pe-lvt`, `.pe-cmp`) — 16/500, line-height 1.35, headers 14/700; set explicitly because of quirks mode (§9).
- **Data numerals in serif** — `.pe-num` = `--serif` + `-0.01em`, applied to: the range values ("50–60%"), the ladder averages ("+4.0%"), the growth headline amount, the compare-table results, the mix-bar legend values. The 5-level reference table stays FC Minimal (a reading/compare table, not a data callout).
- **Mixed Thai + number** — wrap the number only (`peFillNum` / `peNum`): "วันนี้ ≈ **147,176** บาท" keeps "วันนี้ ≈" and the unit "บาท" in FC Minimal (money is written as number + บาท, not with a ฿ prefix — ฿ (U+0E3F) is in the Thai block and Baskervville has no glyph for it).
- **Headline amount** (`.pe-big`) — 24/700 at line-height 1.2 (display tier), not the 1.0 stat tier, because Thai sits on the same line.
