import { createLiquidMetalButton } from './liquid-metal-button.js';

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

const target = document.querySelector('#cta-slot');
const compactQuery = window.matchMedia('(max-width: 575px)');
let currentButton = null;
let isCompact = null;

function mountLiquidMetalCta() {
    if (!target) return;

    const nextCompact = compactQuery.matches;

    if (isCompact === nextCompact) return;

    isCompact = nextCompact;
    currentButton?.destroy?.();
    currentButton = createLiquidMetalButton({
        ...desktopOptions,
        ...(nextCompact ? compactOptions : {}),
        onClick: () => {
            window.location.hash = 'ticket';
        },
    });

    target.replaceChildren(currentButton.el);
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    mountLiquidMetalCta();
    compactQuery.addEventListener('change', mountLiquidMetalCta);
});
