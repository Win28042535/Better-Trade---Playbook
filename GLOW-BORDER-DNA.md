# Glow Border — Design & Interaction DNA

Applied to: **`.hero-gw`** — the section wrapper around the whole identity card block (badge +
tabs + card + detail text + redeem card + CTA) in **หน้าคู่มือ → tab ตัวตน** — confirmed as the
intended target ("border section, not the character card"). Markup is a shared `heroGlowMarkup()`
helper in [dna-quiz-flow.html](dna-quiz-flow.html) (search `GLOW BORDER`), dropped inside `.hero-gw`
right before `.hero-in`. This doc is the spec as given; the CSS is the implementation of it — if
they ever disagree, re-read this file before trusting the CSS's specific numbers.

**Current technique (2026-08-30, 3rd rewrite)** — built on the reference the user pointed at,
[Origin Kit's Glow Border](https://www.originkit.dev/components/glow-border?preset=base): a
conic-gradient spins on an oversized square centered behind the frame, and a mask (two solid layers
clipped to content-box/border-box, XOR'd) cuts that spinning square down to just the border ring.
See §7/§8 below for the full mechanics. Two earlier techniques were tried and abandoned first —
kept here as history so the same mistakes aren't repeated:

1. **conic-gradient()+`@property`-angle directly on `.hero-gw`** (same technique
   `.efin-ai-orb::before` uses, see [EFINAI-ORB-DNA.md](EFINAI-ORB-DNA.md)) — its angle-to-position
   mapping is only even on a roughly square box; at real content height `.hero-gw` is a tall ~1:4.6
   (width:height) box, so the two long edges each swallowed ~43% of the 360° sweep while top/bottom
   got ~7% each — both long edges lit at once instead of one comet visibly traveling (confirmed by
   screenshot). A same-day "fix" moved the effect onto `.pc-glow` (wrapping just the small 5:7
   character card instead, closer to square so the same technique read correctly) — but that moved
   the glow OFF the section border, and since `.pc-glow` only existed inside `pcViewer()` (Book v1's
   viewer), Book v2's identity tab lost the glow entirely (**"คู่มือ 2 หายไป"**). Corrected back onto
   `.hero-gw`.
2. **SVG `<rect>` traced by `stroke-dasharray`/`stroke-dashoffset`**, `pathLength="100"`-normalized
   to the shape's real perimeter so it advances by arc length instead of angle (correct on any
   aspect ratio, unlike #1) — but shipped its own bugs: a single dash sized 16% of a real tall
   perimeter is a huge *absolute* length, rendering as a solid ~40%-of-one-edge flat-colored bar
   with a hard-cut edge, no head/tail fade; and its gradient only varied with *x*, so it sat at one
   flat hue along the long vertical edges. A later pass split it into 3 layered dashes (head/
   tail/fading-trail) and rotated the gradient diagonal, fixing both — but it was still fundamentally
   "warp something to fit this specific box's shape", the same category of fragility as #1.

**Lesson from both** (worth repeating a 3rd time): before animating a border, check (1) what the
wrapper *actually* bounds at real content height, not what its name/position suggests, and (2)
whether the chosen technique's "even travel"/"even color" assumptions hold at that box's real
aspect ratio. The Origin Kit technique below sidesteps this category of bug entirely, rather than
patching around it again — see §7/§8.

## 1. Core DNA

Glow Border เป็น Visual Effect ที่มี DNA หลักเป็น:

- Dynamic
- Futuristic
- Energetic
- Minimal
- Interactive
- Responsive
- Premium

แนวคิดหลัก:

> **A living light that travels around the edge.**

ตัว Border ไม่ได้เป็นเพียงเส้นตกแต่ง แต่ทำหน้าที่เป็น **Active Visual Element** ที่สร้างความรู้สึกว่า Content มีพลังและกำลังทำงานอยู่

## 2. Visual structure

```text
Container
↓
Rotating Gradient Layer
↓
Mask
↓
Border Ring
↓
Moving Light / Comet
```

Comet anatomy (front → back of the moving light):

```text
Bright Head
↓
Soft Tail
↓
Fading Trail
↓
Resting Border
```

The border everywhere the comet *isn't* still reads as a real edge (Resting Border), not an
invisible one — the comet is a brighter highlight sweeping over a base ring, not the only visible
part of the border.

## 3. Motion

```text
Border
↓
Continuous Rotation
↓
Light travels around perimeter
↓
Loop
```

- **4s per full loop**, linear, infinite — **same speed idle and on hover, no hover speed-up.**
  (Bug fixed 2026-08-30: this doc previously specified `speed=10`→10s/loop with
  `hoverMultiplier=5`→2s/loop on hover, matching Origin Kit's own default props — but confirmed via
  direction that the actual intended numbers here are 4s/loop in BOTH states, hoverMultiplier
  removed entirely. The `@media(hover:hover){.hero-gw:hover .hero-glow-spin{...}}` rule this used to
  need no longer exists — there's nothing left for it to change.)
- Respect the page's global `prefers-reduced-motion:reduce` kill-switch — no separate rule needed,
  every animation already collapses to a frozen final frame under it (see
  [DESIGN-DNA.md](DESIGN-DNA.md) motion section).

## 4. Color system

ใช้ `--spectrum` token ที่มีอยู่แล้ว (`#61e8ed → #9c91ff → #f178d8 → #f2ea83`) — ไม่เพิ่มชุดสีใหม่, ตรงกับ
DESIGN-DNA.md ("Spectrum gradient is a rare accent, never a fill").

## 5. Border width

`borderWidth = 3px` (spec's own default was 4px/Medium; tried 2px/Thin, settled at 3px, per
direction across several follow-ups).

Reference scale (for future reuse elsewhere — this instance uses **Medium**):

| Weight | Reads as |
|---|---|
| Thin | Elegant / Subtle |
| Medium (4px) | Interactive / Premium |
| Thick | Strong / Energetic |

## 6. Shape

```text
Square
→ Rounded Rectangle
→ Pill
```

This card uses **Rounded Rectangle**, matching `.hero-gw`'s own CSS
`border-radius: calc(var(--r2) + 3px)` — the mask wrapper uses `border-radius:inherit` so the ring
always follows whatever radius `.hero-gw` itself has, no separate radius value to keep in sync.

## 7. Layer order

```text
Glow Border
↓
Container
↓
Content
```

i.e. the effect wraps *outside* the content. `heroGlowMarkup()` emits
`<div class="hero-glow-mask"><div class="hero-glow-spin"></div></div>` (one shared JS helper,
called once inside `.hero-gw`) placed *before* `.hero-in` in the markup — `.hero-in`'s own opaque
white background then paints over everything but `.hero-gw`'s 3px `padding` gap, same
padding-box-reveal trick this file already uses elsewhere (`.q-opt.sel`, `.pcv-btn.on`, etc.).

## 8. Implementation notes (this instance) — Origin Kit technique

**Structure**, matching §2's `Container → Rotating Gradient Layer → Mask → Border Ring → Comet`:

- `.hero-glow-spin` is the **Rotating Gradient Layer**: an absolutely-positioned square, centered
  on `.hero-gw` via `top:50%;left:50%;transform:translate(-50%,-50%) rotate(...)`, with
  `background:conic-gradient(...)` painting the whole "Bright Head → Soft Tail → Fading Trail →
  Resting Border" anatomy in ONE gradient. **Stops revised 2026-09-01** ("Long Spectrum & Soft
  Tail" direction — the original 8/9/34/59/84/130deg shape read as short against this frame's long
  ~1:4 perimeter, and its tail/head were both hard 1–2-stop linear cuts instead of a gradual fade).
  Angles now live on custom properties (`--g-lead` etc., set on `.hero-glow-spin` itself) so they
  can be read/tuned without re-deriving the whole gradient string:
  `--g-lead:6deg` → `--g-head-mid:13deg` (soft onset midpoint, `rgba(57,126,131,.54)`, replacing the
  old 1deg knife-edge jump) → `--g-head:20deg` (`#61e8ed`, head reaches full brightness — still the
  *shortest*, crispest ramp on the ring per §3's "head stays a bit more defined than the tail") →
  `--g-hue1:50deg` (`#9c91ff`) → `--g-hue2:80deg` (`#f178d8`) → `--g-core-end:110deg` (`#f2ea83`,
  core spectrum widened 75deg→90deg) → four graduated tail stops, each lerped toward
  `var(--line-soft)` in BOTH hue and alpha (100/82/63/45/26% intensity, matching a Head→Core→Tail→
  Background step-down instead of one flat blend): `--g-tail1:132deg` (`rgba(197,191,111,.82)`) →
  `--g-tail2:154deg` (`rgba(152,148,88,.63)`) → `--g-tail3:176deg` (`rgba(107,105,67,.45)`) →
  `--g-tail4:198deg` (`rgba(62,62,45,.26)`) → `--g-rest:220deg` (`var(--line-soft)`, fully resting —
  tail widened 46deg→110deg) → flat `var(--line-soft)` 220–360deg (resting arc, now 146deg instead
  of 230deg — spectrum+tail nearly doubled, 121deg→220deg, intentionally, per "frame should feel a
  light presence covering it"). 0deg/360deg still resolve to the same color so the gradient's own
  definition seam stays invisible in the flat resting arc. Responsive: `@media(max-width:1024px)`
  and `(max-width:640px)` trim `.hero-glow-spin`'s own `opacity` (.92/.85) rather than re-deriving
  the angle set — per spec, smaller viewports should stay "same long spectrum, just a touch
  quieter," not shorter. `@keyframes heroGlowSpin{to{transform:...rotate(360deg)}}` still drives the
  spin, `4s linear infinite` — **same speed idle and on hover**, per §3 (no `@media(hover:hover)`
  rule needed any more, unlike the SVG-era version this replaced) — untouched by this revision.
- `sizeHeroGlow()` (JS, dna-quiz-flow.html) is what makes this square "oversized" correctly for
  *any* aspect ratio: it measures `.hero-gw`'s real `clientWidth`/`clientHeight`, sets
  `.hero-glow-spin`'s `width`/`height` to `sqrt(w²+h²)+48` (diagonal + 24px margin each side, Origin
  Kit's own default margin) so the square's corners stay outside `.hero-gw`'s real corners at every
  rotation angle — otherwise a corner could swing into view unlit for part of the loop. Run once
  right after every `renderBook()` (fresh DOM each render) and again on `window resize` (one-shot
  listener, guarded by `HERO_GLOW_RESIZE_BOUND` so repeated renders never stack duplicates — same
  pattern `buildGoTop()`'s own resize binding already uses elsewhere in this file). CSS alone can't
  express "the diagonal of this specific element" without container-query units this codebase
  doesn't otherwise use, hence doing it in JS.
- `.hero-glow-mask` is both the **Mask** and the overflow-clipper: `padding:3px` (the `borderWidth`)
  + `mask-image` of two solid white layers, one `mask-clip:content-box` (inside the padding) and one
  `mask-clip:border-box` (the whole box), composited with the XOR operator — this is what Origin
  Kit's own docs describe as "masked with mask-composite: xor" — so only the ring (border-box minus
  content-box) survives; `overflow:hidden` keeps `.hero-glow-spin`'s oversized square from spilling
  past `.hero-gw`'s own rounded bounds. Since the mask exactly follows `.hero-gw`'s REAL edges
  (whatever its aspect ratio), and the gradient underneath is always spinning evenly on a true
  square regardless of that ratio, the visible **Border Ring** reads correctly on any shape with no
  per-instance tuning — the aspect-ratio problem both earlier techniques fought is sidestepped
  entirely rather than patched around again.
- **Bug fixed 2026-08-30 (mask-composite conflict)** — the usual cross-browser-safe pairing (declare
  both the standard `mask-composite:exclude` AND the legacy `-webkit-mask-composite:xor` on the same
  rule, same as this file already does for every other `-webkit-`-prefixed property, e.g.
  `backdrop-filter`) silently broke the composite in this engine specifically for this 2-layer XOR
  case — NOTHING was revealed at all (not even the faint resting ring), confirmed by screenshot.
  Either set alone (standard-only, or webkit-only) renders correctly — the two just can't coexist on
  one element here. Fixed with `@supports (mask-composite:exclude)` / `@supports not (...)` feature
  queries so only one set is ever active per engine, instead of declaring both unconditionally.
- Colors reuse the same 4 `--spectrum` stops as every earlier version
  (`#61e8ed → #9c91ff → #f178d8 → #f2ea83`) and `var(--line-soft)` for the resting arc — Origin
  Kit's own "standard" mode uses a single `glowColor`+`tailColor`, but GLOW-BORDER-DNA.md calls for
  reusing the existing spectrum token rather than a new single-hue one, so the head sweeps through
  all 4 stops instead of fading a single color.
