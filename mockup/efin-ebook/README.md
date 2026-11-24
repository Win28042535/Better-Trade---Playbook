# E-BOOK sections — efin.finance Better Trade 2026 page (mockup)

Preview: `node proxy.js` (or the `efin-ebook-mock` launch config) → http://localhost:8740/
The proxy serves the live page with the two sections injected and passes every other request to www.efin.finance,
so fonts, CSS and the Liquid Metal button run exactly as on the live site.

## What goes where (for the web team)

| # | Placement | Markup |
|---|---|---|
| 1 | New `<section id="ebook">` right after `<!-- End Section : Rerun Ticket -->` | `EBOOK_SECTION` in `build.js` |
| 2 | `#cta` keeps its `.cta__panel` + floating props; add class `cta--ebook`, replace the title / date / `#cta-ticket-slot` with the e-book banner | `CTA_INNER` in `build.js` |

- Styles: `ebook.css` — only the site's own tokens (`--space-*`, `--color-*`, `--card-radius`, `--shadow-elevated`)
  and classes (`bt-section-title`, `bt-title-highlight`, `bt-section-subtext`).
- Buttons: `ebook.js` — mounts the site's `createLiquidMetalButton` (same options as "รับชมย้อนหลัง") into every
  `[data-ebook-slot]`, label "ดาวน์โหลด E-BOOK ฟรี"; `data-ebook-href` + `data-ebook-download` make one tap download the PDF
  (both buttons), pointing at the hosted file https://inevents.efin.finance/api/conference-file/18c26b41-ce7b-4024-a57e-2ab30b6acf8c (the server sends Content-Disposition: attachment, so it downloads even cross-origin). Place the script next to `hero-v2-cta.js`.
- Content (rev 3): wireframe copy. "สิทธิ์ดาวน์โหลดตามประเภทบัตร" + "วิธีดาวน์โหลด" (from the poster) are in the markup but
  `hidden` for now — remove the attribute to show them; their CSS is kept.
- Cover: `ebook-cover.png` = die-cut (transparent) cover, cut along the book's 4 corners incl. page edges; light stage
  behind it (glow + rays + sparks; static cover, no hover) and the site's 3D props (bitcoin/stock/heart/gold) around it.

## Still temporary
- `ebook-cover.png` is die-cut from the wireframe crop (`ebook-cover.jpg`) — swap in the original cover file (transparent PNG).
- `The_Capital_Playbook_2027.pdf` (28 MB) is no longer used by the page (buttons point at the hosted file); kept only as the supplied copy.

## Rebuild
`node build.js` re-patches `live.html` → `index.html`; `node build.js --fetch` grabs a fresh copy of the live page first.
