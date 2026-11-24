/* E-BOOK buttons (mockup) — the site's own Liquid Metal pill, same options as hero-v2-cta.js's "รับชมย้อนหลัง".
   Each slot links to its data-ebook-href; with data-ebook-download set (both slots, rev 3) one tap downloads the PDF. */
import { createLiquidMetalButton } from '../js/liquid-metal-button.js?v=3';

const base = {
    label: 'ดาวน์โหลด E-BOOK ฟรี', height: 56, fontSize: 18, fontWeight: 400, fontFamily: "'FC Minimal'",
    textShadow: 'none', rimPalette: 'var(--spectrum)', paddingX: 48, rim: 3, metalShiftRed: 0.2, metalShiftBlue: 0.2,
    textColor: '#ffffff', // the component's default is #dfe4ee (reads grey on the dark pill); the site's own buttons pass white too
};
const small = window.matchMedia('(max-width: 767px)');
const tiny = window.matchMedia('(max-width: 359px)');
const mounted = [];

function mountAll() {
    mounted.splice(0).forEach((b) => b?.destroy?.());
    document.querySelectorAll('[data-ebook-slot]').forEach((slot) => {
        const size = tiny.matches ? { height: 46, fontSize: 15, paddingX: 20 } : small.matches ? { height: 46, fontSize: 16, paddingX: 28 } : {};
        const href = slot.dataset.ebookHref || '#ebook', file = slot.dataset.ebookDownload;
        const b = createLiquidMetalButton({ ...base, ...size, href });
        slot.replaceChildren(b.el);
        if (file) { // direct download (rev 3) — no popup, no page change
            const a = b.el.tagName === 'A' ? b.el : b.el.querySelector('a');
            if (a) { a.setAttribute('download', file); a.setAttribute('aria-label', 'ดาวน์โหลด E-BOOK THE CAPITAL PLAYBOOK 2027 ฟรี (PDF)'); }
            else b.el.addEventListener('click', (e) => { e.preventDefault(); const t = document.createElement('a'); t.href = href; t.download = file; t.click(); });
        }
        mounted.push(b);
    });
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    mountAll();
    small.addEventListener('change', mountAll);
    tiny.addEventListener('change', mountAll);
});
