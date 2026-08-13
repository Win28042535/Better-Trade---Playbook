import { createLiquidMetalButton } from './liquid-metal-button.js';

/* Config verbatim from the kit's README ("Config ต้นฉบับ Better Trade") — do not change these
   values without direction, they're what makes this match the real Better Trade 2026 hero CTA. */
const desktopOptions = {
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

const compactOptions = {
    height: 49,
    fontSize: 18,
    paddingX: 42,
};

/* Adapted from the kit's original one-shot IIFE (which assumed #cta-slot is a single DOM node
   that lives for the page's whole lifetime, captured once via a top-level querySelector). This
   project is a hand-rolled SPA: every screen render replaces root.innerHTML wholesale, which
   detaches the OLD #cta-slot and inserts a brand-new empty one — a stale cached `target` would
   silently mount into a node nobody can see. So instead of self-mounting on load, this module
   exports mountLiquidMetalCta(overrides), which the app calls after every render() that puts a
   fresh #cta-slot on screen (same pattern as the app's own layoutSpecComets()). Each call
   re-queries the live #cta-slot, so it's always mounting into the node that's actually visible. */
const compactQuery = window.matchMedia('(max-width: 575px)');
let currentButton = null;
let lastOverrides = {};

function mountNow() {
    const target = document.querySelector('#cta-slot');
    if (!target) return null;

    currentButton?.destroy?.();
    currentButton = createLiquidMetalButton({
        ...desktopOptions,
        ...(compactQuery.matches ? compactOptions : {}),
        ...lastOverrides,
    });
    target.replaceChildren(currentButton.el);
    return currentButton;
}

// Width is measured from the label's real rendered glyphs, so the button must not mount before
// the font has actually loaded — otherwise it sizes off a fallback font and re-measures wrong.
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

/**
 * Mount (or remount) the liquid metal CTA into the current #cta-slot.
 * @param {object} overrides  Per-call options merged over desktop/compactOptions — e.g. label/onClick.
 *                             Remembered so a later breakpoint-change remount reuses them.
 * @returns {Promise<{el:HTMLElement,button:HTMLButtonElement,destroy:Function}|null>}
 */
export function mountLiquidMetalCta(overrides = {}) {
    lastOverrides = overrides;
    return fontsReady.then(mountNow);
}

// Breakpoint crossing 575px re-mounts with the same overrides as the last explicit call — the
// button's own width/height genuinely change size (desktopOptions vs compactOptions), not just CSS.
compactQuery.addEventListener('change', () => { if (currentButton) mountNow(); });
