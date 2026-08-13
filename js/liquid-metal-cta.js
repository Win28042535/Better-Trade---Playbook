import { createLiquidMetalButton } from './liquid-metal-button.js';

/* Config verbatim from the kit's README ("Config ต้นฉบับ Better Trade") — do not change these
   values without direction, they're what makes this match the real Better Trade 2026 hero CTA. */
const heroDesktopOptions = {
    label: 'ลงทะเบียน',
    height: 56,
    fontSize: 20,
    fontWeight: 400,
    fontFamily: "'FC Minimal'",
    textColor: '#111318',
    textShadow: 'none',
    pillBackground: 'linear-gradient(180deg, #ffffff 0%, #f3f4f8 55%, #e4e7ee 100%)',
    rimPalette: 'linear-gradient(90deg, #00d4fe, #1f87e6, #113cf3, #722df4, #e63bd8, #f79319)',
    paddingX: 48,
    rim: 3,
    metalShiftRed: 0.2,
    metalShiftBlue: 0.2,
};

const heroCompactOptions = {
    height: 49,
    fontSize: 18,
    paddingX: 42,
};

/* "compact" preset — for every OTHER Liquid Metal button in the app: the header QR pill, and
   in-content secondary CTAs (home's "ขั้นต่อไป" card, games' "เล่นเกมนี้ต่อ" card). None of these
   are a screen's single main action the way the splash hero button is, so they're deliberately
   smaller. Sizing recorded in PLAYBOOK-2026-DATA-BASELINE.md §11 — reuse these numbers rather
   than picking new ones per instance. Same rim palette/pill background as the hero so every
   Liquid Metal button in the app reads as one family, just at two sizes. */
const compactDesktopOptions = {
    height: 40,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'var(--font)',
    textColor: '#111318',
    textShadow: 'none',
    pillBackground: 'linear-gradient(180deg, #ffffff 0%, #f3f4f8 55%, #e4e7ee 100%)',
    rimPalette: 'linear-gradient(90deg, #00d4fe, #1f87e6, #113cf3, #722df4, #e63bd8, #f79319)',
    paddingX: 22,
    rim: 2,
    metalShiftRed: 0.15,
    metalShiftBlue: 0.15,
};

const compactCompactOptions = {
    height: 38,
    fontSize: 14,
    paddingX: 18,
};

const PRESETS = {
    hero: { base: heroDesktopOptions, compact: heroCompactOptions },
    compact: { base: compactDesktopOptions, compact: compactCompactOptions },
};

/* Adapted from the kit's original one-shot IIFE (which assumed its slot is a single DOM node
   that lives for the page's whole lifetime, captured once via a top-level querySelector). This
   project is a hand-rolled SPA: every screen render replaces root.innerHTML wholesale, which
   detaches the OLD slot and inserts a brand-new empty one — a stale cached `target` would
   silently mount into a node nobody can see. It's also now a multi-instance manager, not a
   singleton: the app mounts several independent Liquid Metal buttons at once (header QR pill +
   whichever screen-specific CTA that screen has), each into its own slot, each needing its own
   remembered overrides/preset so a breakpoint change can remount ALL of them correctly — not just
   whichever one happened to be mounted last. Keyed by selector string. */
const compactQuery = window.matchMedia('(max-width: 575px)');
const instances = new Map(); // selector -> {button, overrides, preset}

function mountNow(selector) {
    const entry = instances.get(selector);
    if (!entry) return null;
    const target = document.querySelector(selector);
    if (!target) return null;

    const { base, compact } = PRESETS[entry.preset] || PRESETS.hero;
    entry.button?.destroy?.();
    entry.button = createLiquidMetalButton({
        ...base,
        ...(compactQuery.matches ? compact : {}),
        ...entry.overrides,
    });
    target.replaceChildren(entry.button.el);
    return entry.button;
}

// Width is measured from the label's real rendered glyphs, so the button must not mount before
// the font has actually loaded — otherwise it sizes off a fallback font and re-measures wrong.
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

/**
 * Mount (or remount) a Liquid Metal button into `selector`.
 * @param {string} selector   CSS selector for the mount target, re-queried fresh every call.
 * @param {'hero'|'compact'} preset  'hero' = the splash-screen size; 'compact' = every other
 *                                    instance (header pill, in-content secondary CTAs).
 * @param {object} overrides   Per-call options merged over the preset — label/onClick/icon/etc.
 *                             Remembered so a later breakpoint-change remount reuses them.
 * @returns {Promise<{el:HTMLElement,button:HTMLButtonElement,destroy:Function}|null>}
 */
export function mountLiquidMetalButtonInto(selector, preset, overrides = {}) {
    instances.set(selector, { button: instances.get(selector)?.button ?? null, overrides, preset });
    return fontsReady.then(() => mountNow(selector));
}

/**
 * Back-compat convenience wrapper — the splash screen's original single-instance call, always the
 * hero preset into #cta-slot.
 */
export function mountLiquidMetalCta(overrides = {}) {
    return mountLiquidMetalButtonInto('#cta-slot', 'hero', overrides);
}

// Breakpoint crossing 575px re-mounts EVERY currently-tracked instance with its own remembered
// overrides/preset — each one's width/height genuinely changes size (base vs compact options),
// not just CSS.
compactQuery.addEventListener('change', () => {
    instances.forEach((_entry, selector) => mountNow(selector));
});
