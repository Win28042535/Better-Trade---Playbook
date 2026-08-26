# Typography DNA — Digital Playbook / Better Trade 2026

Source of truth: `:root` in [dna-quiz-flow.html](dna-quiz-flow.html) (search `--fs-`, `--w-`, `--font`, `--serif`).
This file is a **read-out** of that CSS, not a new spec — if the two ever disagree, the CSS wins; update this doc to match.

Related memory: `design-dna-bt2026` (active DNA + history), `design-md-location` (sibling marketing-site DESIGN.md).

---

## 1. Two-typeface system

| Role | Token | Typeface | Weight axis | Used for |
|---|---|---|---|---|
| UI voice (default) | `--font` | **FC Minimal** | variable, 100–900 | everything: body copy, labels, buttons, nav, Thai text |
| Editorial display voice | `--serif` | **Baskervville** | variable, 400–700 | English display text + numerals *only* |

```css
--font:'FC Minimal','Noto Sans Thai','Thonburi','DB Helvethaica X',system-ui,-apple-system,'Segoe UI',sans-serif;
--serif:'Baskervville','Bodoni MT','Didot',Georgia,'Times New Roman',serif;
```

Both are self-hosted as base64 `@font-face` (no CDN/network dependency). FC Minimal ships as **two** `@font-face` slices — weight range `100 500` and `600 900` — to cover its full variable axis across browsers; Baskervville is one slice, `400 700` (OFL-licensed).

**Hard rule — Thai always renders in FC Minimal, never in the serif, regardless of size or role.** This is a deliberate brand rule, not a fallback gap: some past display-serif candidates (e.g. Taviraj) actually had full Thai glyph coverage, so the serif would "just work" for Thai too if applied by accident. Check every new `--serif`-classed element for Thai characters before shipping.

### History (why this keeps moving — check the live CSS, not old docs)
The display-serif slot has changed **three times**: Canela/Ivar (placeholder) → Taviraj (fully embedded, then retired) → Trirong (matched the printed character-card art) → **Baskervville (current)**. Each swap kept the same rule (serif = EN display/numerals only) and the same token name (`--serif`), only the font-face changed. Any doc or memory older than 2026-08-19 may still say Trirong — the file itself is authoritative.

---

## 2. Type scale

Fixed tokens — **identical across mobile / tablet / pc**. Only spacing (`--sp-section`) changes per breakpoint, never font size; desktop is a seamless full-width page (capped ~760px content), not a scaled-up phone layout.

| Token | Size | Typical use |
|---|---|---|
| `--fs-title` | 36px | quiz question headline (`.q-title`), consent headline (`.consent-h`) |
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

The system renders **exactly two weights** (500 / 700), collapsed down from three per direct user instruction ("ให้ในระบบเหลือใช้แค่ 500, 700"). `--w-body` and `--w-head` are kept as separate token *names* (not merged into one) purely so future edits can still tell "this is baseline copy" from "this is a heading at default weight" — but both currently resolve to 500. **Don't reintroduce a third rendered weight without explicit direction.**

---

## 4. Letter-spacing

- **Headlines/titles/labels default to `letter-spacing:0`** — zero tracking is a DNA signature carried over from the original marketing-site design system.
- **Display-serif numerals/names** (`.conf-sc`, `.pcE-en`, `.pcb-en`) get slight **negative** tracking, `-0.01em` to `-0.015em` — tightens the Didone-style letterforms at large sizes.
- **Uppercase eyebrow/kicker labels** get generous **positive** tracking, typically `0.02em`–`0.12em` (tuned per component, not one fixed value — e.g. `.rc-kicker` 0.08em, `.hero-en` 0.1em, `.pass-ey`/`.ns-ey` 0.08–0.12em).

---

## 5. Line-height by role

| Tier | Range | Examples |
|---|---|---|
| Display/title | 1.0–1.2 | `.q-title` 1.2, `.hero-th` 1.1, `.pcE-en` 1.05, `.conf-sc`/`.int-sec-rank` 1 (stat-style, no descender room) |
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
Seen on: `.rc-kicker`, `.prog-lbl`, `.hero-en`, `.s-ey`, `.conf-ml`, `.risk-slbl`, `.quote-badge`, `.ex-tag`, `.hero-leg-lbl`, `.upd-pill`, `.ns-ey`, `.pass-ey`.

---

## 7. Where the serif actually appears (audit)

English display text + numerals only — confirmed no Thai-text usage:
- `.ln` — legend investor name (e.g. "Warren Buffett")
- `.risk-vl`, `.conf-vl`, `.conf-sc` — risk value / confidence score numerals
- `.trait-v`, `.alloc-p`, `.lib-num` — stat/data numerals
- `.sp-h` — splash hero display headline
- `.pcE-en`, `.pcb-en`, `.pcb-leg b` — persona card display name (front + back) and legend name

---

## 8. Governing principles (the *why*)

- **"Calm, but credible"** (Kinfolk north star) — type carries hierarchy through scale/weight, not decoration; restraint is the house style.
- The serif is the **"fore" layer** of the 4-layer Graphic Formula (base = whitespace, mid = line drawings, fore = architectural serif type, accent = spectrum gradient, used rarely) — reserved for moments that want editorial gravity: names, scores, headlines. Everything else stays on FC Minimal.
- **Thai/English split is a brand rule, not a technical fallback** — the easiest rule in this doc to break by accident; always check.
- **Zero letter-spacing on headlines** is an intentional signature, not an oversight — don't "fix" it by adding tracking.
- **Two rendered weights only (500/700)** — a deliberate simplification; resist a third weight creeping back in.
- Type scale does **not** grow on wider viewports — the phone-frame's scale is the app's scale everywhere; only spacing breathes on tablet/pc.
