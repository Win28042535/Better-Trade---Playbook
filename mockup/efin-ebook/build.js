/* Builds index.html = the live event page + the two E-BOOK placements.
   node build.js          → patch the saved live.html
   node build.js --fetch  → re-download the live page first */
const fs = require('fs'), path = require('path'), https = require('https');
const LIVE = 'https://www.efin.finance/events/better-trade/better-trade2026';
const dir = __dirname;

/* Rev 3 (2026-11-24): wireframe copy; both buttons download the PDF directly (data-ebook-href / data-ebook-download).
   "สิทธิ์ดาวน์โหลดตามประเภทบัตร" + "วิธีดาวน์โหลด" (from the poster) stay in the markup but are hidden for now. */
const PROP = (k, w, h) => `<span class="ebook__prop ebook__prop--${k}"><img src="images/${k}.webp" width="${w}" height="${h}" alt="" loading="lazy" decoding="async"></span>`;
const EBOOK_SECTION = `
    <!-- Start Section : E-Book (mockup) — วางต่อจาก Rerun Ticket -->
    <section id="ebook" class="ebook" aria-labelledby="ebook-title">
        <div class="ebook__inner container">
            <div class="ebook__panel">
                <div class="ebook__props" aria-hidden="true">
                    ${PROP('bitcoin', 787, 800)}${PROP('stock', 178, 800)}${PROP('heart', 800, 750)}${PROP('gold', 369, 800)}
                </div>
                <div class="ebook__hero row align-items-center">
                    <div class="ebook__media col-12 col-lg-5">
                        <div class="ebook__stage" data-reveal="fade-up">
                            <span class="ebook__glow" aria-hidden="true"></span>
                            <span class="ebook__rays" aria-hidden="true"></span>
                            <span class="ebook__spark ebook__spark--1" aria-hidden="true"></span>
                            <span class="ebook__spark ebook__spark--2" aria-hidden="true"></span>
                            <span class="ebook__spark ebook__spark--3" aria-hidden="true"></span>
                            <img class="ebook__cover" src="mock-ebook/ebook-cover.png" width="503" height="651" alt="ปก E-Book THE CAPITAL PLAYBOOK 2027 อ่านเกมเงิน เกมลงทุน" loading="lazy" decoding="async">
                        </div>
                    </div>
                    <div class="ebook__body col-12 col-lg-7">
                        <h2 id="ebook-title" class="bt-section-title ebook__title"><span class="ebook__title-en">THE CAPITAL <span class="text-nowrap">PLAYBOOK 2027</span></span><span class="bt-title-highlight has-px"><span class="text-nowrap">อ่านเกมเงิน</span> <span class="text-nowrap">เกมลงทุน</span></span></h2>
                        <p class="bt-section-subtext ebook__label">E-Book</p>
                                                <p class="ebook__lead" data-reveal="fade-up" style="--reveal-delay:180ms">INSIGHTS และกลยุทธ์<span class="text-nowrap">ทุกประเด็นร้อน</span> ต่อยอดเป็น <span class="text-nowrap">PLAYBOOK ของคุณ</span></p>
                        <div class="ebook__action" data-reveal="fade-up" style="--reveal-delay:260ms" data-ebook-slot data-ebook-href="https://inevents.efin.finance/api/conference-file/18c26b41-ce7b-4024-a57e-2ab30b6acf8c" data-ebook-download="The_Capital_Playbook_2027.pdf"></div>
                    </div>
                </div>

                <!-- ปิดไว้ก่อน (2026-11-24): สิทธิ์ดาวน์โหลดตามประเภทบัตร + วิธีดาวน์โหลด — เอา hidden ออกเพื่อเปิดใช้ -->
                <div class="ebook__rights" hidden>
                    <h3 class="ebook__h3">สิทธิ์ดาวน์โหลดตามประเภทบัตร</h3>
                    <div class="ebook__tiers">
                        <article class="ebook__tier ebook__tier--ultimate">
                            <p class="ebook__tier-name">Ultimate Ticket</p>
                            <p class="ebook__tier-when">ดาวน์โหลดได้แล้ววันนี้</p>
                            <p class="ebook__tier-via">ผ่าน Dashboard Playbook ของคุณ</p>
                        </article>
                        <article class="ebook__tier ebook__tier--explorer">
                            <p class="ebook__tier-name">Explorer และ Master Class Ticket</p>
                            <p class="ebook__tier-when">เริ่ม 1 ธันวาคม 2569</p>
                            <p class="ebook__tier-via">ผ่าน Dashboard Playbook ของคุณ</p>
                        </article>
                    </div>
                </div>

                <div class="ebook__howto" id="ebook-howto" hidden>
                    <h3 class="ebook__h3 ebook__h3--inverse">วิธีดาวน์โหลด</h3>
                    <ol class="ebook__steps">
                        <li><b>สแกน QR Code ลงทะเบียน</b><span>จากอีเมลที่ได้รับเมื่อซื้อบัตรครั้งแรก <span class="text-nowrap">หรือจากริสต์แบนด์</span></span></li>
                        <li><b>เข้า Dashboard Playbook</b><span>เพื่อดาวน์โหลด E-BOOK</span></li>
                    </ol>
                    <p class="ebook__howto-note">ผู้ถือบัตรรับชมงานย้อนหลัง <span class="text-nowrap">สามารถดาวน์โหลดได้ผ่านช่องทางเดียวกัน</span></p>
                </div>
            </div>
        </div>
    </section>
    <!-- End Section : E-Book -->
`;

const CTA_INNER = `
                <div class="cta-ebook">
                    <div class="cta-ebook__stage">
                        <span class="ebook__glow" aria-hidden="true"></span>
                        <img class="cta-ebook__cover" src="mock-ebook/ebook-cover.png" width="503" height="651" alt="ปก E-Book THE CAPITAL PLAYBOOK 2027" loading="lazy" decoding="async">
                    </div>
                    <div class="cta-ebook__body">
                        <h2 id="cta-title" class="cta__title bt-section-title" data-reveal="fade-up">THE CAPITAL <span class="text-nowrap">PLAYBOOK 2027</span><br><span class="bt-title-highlight has-ps"><span class="text-nowrap">อ่านเกมเงิน</span> <span class="text-nowrap">เกมลงทุน</span></span></h2>
                        <p class="bt-section-subtext">E-Book</p>
                        <div class="cta__action" data-ebook-slot data-ebook-href="https://inevents.efin.finance/api/conference-file/18c26b41-ce7b-4024-a57e-2ab30b6acf8c" data-ebook-download="The_Capital_Playbook_2027.pdf"></div>
                    </div>
                </div>`;

function get(url) {
  return new Promise((ok, no) => https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
    if (r.statusCode >= 300 && r.headers.location) return ok(get(new URL(r.headers.location, url).href));
    let d = ''; r.setEncoding('utf8'); r.on('data', (c) => (d += c)); r.on('end', () => ok(d));
  }).on('error', no));
}

(async () => {
  if (process.argv.includes('--fetch')) fs.writeFileSync(path.join(dir, 'live.html'), await get(LIVE));
  let s = fs.readFileSync(path.join(dir, 'live.html'), 'utf8');
  const one = (re, fn, label) => { const m = s.match(re); if (!m) throw new Error('not found: ' + label); s = s.replace(re, fn); };

  // 1) section after Rerun Ticket
  one(/(<!-- End Section : Rerun Ticket -->\n)/, (m) => m + EBOOK_SECTION, 'rerun end');
  // 2) CTA content → e-book banner (keeps .cta__panel + .cta__assets; drops date/venue + #cta-ticket-slot)
  one(/<section id="cta" class="cta"/, () => '<section id="cta" class="cta cta--ebook"', 'cta open');
  one(/(<\/div>\s*)<h2 id="cta-title"[\s\S]*?<div id="cta-ticket-slot" class="cta__action"><\/div>/, (m, a) => a + CTA_INNER.trimStart(), 'cta body');
  // styles + script
  one(/<\/head>/, () => '    <link rel="stylesheet" href="mock-ebook/ebook.css?v=13">\n</head>', 'head');
  one(/<\/body>/, () => '    <script type="module" src="mock-ebook/ebook.js?v=4"></script>\n</body>', 'body');

  fs.writeFileSync(path.join(dir, 'index.html'), s);
  console.log('index.html written');
})();
