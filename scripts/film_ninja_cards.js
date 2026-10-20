// ⚠ DO NOT REMOVE — Scope guard
// Scope: §TB-CARDS (bim-compiler prompts/NINJAEXCEL_TEMPLATE_ENGINE.md) — renders the series CARDS (intro, part 2, comparison, closing) as silent 1920x1080 / 24 fps mp4 segments, English and Thai,
//   to be narrated with the same fit/mux pipeline as the films and joined into the single long film. Cards are pure text (no logos, no invented visuals); every claim carries its source in the card's "src" field,
//   which is also written to the card manifest (cards_manifest.json) so the narration TSV's source column can quote it. Playwright screenshot (CPU only) + ffmpeg still-to-video.
// Run: node scripts/film_ninja_cards.js <outDir>        -> <outDir>/card_<id>_<lang>.mp4 + .png + cards_manifest.json
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const OUT = path.resolve(process.argv[2] || '.'); fs.mkdirSync(OUT, { recursive: true });
const CARDS = [
  { id: 'intro', sec: 26, src: "internal/NinjaExcelAdaptation.md §2 Motivation (author's design notes): Jasper is a banded engine; a grid inside a grid needs a separate subreport; in Excel a grid is just cells",
    en: { h: 'NinjaExcel Report', lines: ['You design the report in Excel — layout, fonts, formulas, exactly as you like.', 'A short query tells each cell where its number comes from.', 'A banded report engine such as JasperReports needs a separate subreport for a grid inside a grid.', 'In Excel, a grid is just cells — a sub-grid is just more cells.'], small: "Source: the author's design notes" },
    th: { h: 'NinjaExcel Report', lines: ['คุณออกแบบรายงานใน Excel ได้อย่างอิสระ ทั้งเลย์เอาต์ ฟอนต์ และสูตร', 'คำสั่งค้นข้อมูลสั้นๆ บอกว่าตัวเลขแต่ละช่องมาจากไหน', 'เครื่องมือรายงานแบบแบนด์ เช่น JasperReports ต้องแยกซับรายงาน เมื่อมีตารางซ้อนในตาราง', 'ใน Excel ตารางก็คือเซลล์ ตารางย่อยก็คือเซลล์เพิ่ม'], small: 'ที่มา: บันทึกการออกแบบของผู้พัฒนา' } },
  { id: 'part2', sec: 17, src: 'film 2 facts: §TB_FILM2_FACT baseline.registerRows=4, three UC-1 sales entered on camera',
    en: { h: 'Part 2 — a report that grows as you sell', lines: ['Four invoices today. Three sales entered live in the ERP.', 'Watch the register push its rows down — and the total follow.', 'Then the books are checked, and the system is reset clean.'], small: '' },
    th: { h: 'ตอนที่ 2 — รายงานที่โตไปพร้อมกับการขาย', lines: ['วันนี้มีใบกำกับ 4 ใบ แล้วเราบันทึกการขาย 3 รายการสดๆ ในระบบ ERP', 'ดูรายงานทะเบียนการขายดันแถวลงมา และผลรวมก็เลื่อนตาม', 'จากนั้นตรวจสมุดบัญชี แล้วรีเซ็ตระบบให้สะอาด'], small: '' } },
  { id: 'compare', sec: 24, src: 'web check 2026-10-14: Microsoft Learn "Nested data regions in a paginated report"; jxls.sourceforge.net formulas reference; BIRT community forum threads (Excel output); Jaspersoft ideas JSPR-I-4678; author notes NinjaExcelAdaptation §2; this repo gates R_register_big, U_usecases',
    en: { h: 'How this compares', table: [['Approach', 'Grids inside grids'],
        ['JasperReports', 'banded layout; nested grids need subreports'],
        ['BIRT', 'nested tables supported; in Excel output a nested table stays in one cell (community reports)'],
        ['SSRS / paginated', 'nested data regions supported; same dataset as the parent'],
        ['Excel template libraries', 'rows expand; formulas rewritten to cover the new cells'],
        ['NinjaExcel Report', 'the layout is the Excel sheet itself; rows push down, formulas follow']], small: 'Checked 2026-10-14 from vendor and community documentation — versions change.' },
    th: { h: 'เปรียบเทียบแนวทาง', table: [['แนวทาง', 'ตารางซ้อนในตาราง'],
        ['JasperReports', 'เลย์เอาต์แบบแบนด์ ตารางซ้อนต้องใช้ซับรายงาน'],
        ['BIRT', 'รองรับตารางซ้อน แต่ในไฟล์ Excel ตารางย่อยอยู่ในเซลล์เดียว (ตามรายงานของชุมชน)'],
        ['SSRS / paginated', 'รองรับ nested data region ต้องใช้ชุดข้อมูลเดียวกับแม่'],
        ['ไลบรารีเทมเพลต Excel', 'ขยายแถวได้ และเขียนสูตรใหม่ให้ครอบคลุมเซลล์ที่เพิ่ม'],
        ['NinjaExcel Report', 'เลย์เอาต์คือชีต Excel เอง แถวถูกดันลง สูตรเลื่อนตาม']], small: 'ตรวจสอบเมื่อ 2026-10-14 จากเอกสารของผู้พัฒนาและชุมชน — เวอร์ชันอาจเปลี่ยน' } },
  { id: 'closing', sec: 16, src: "author's statement (red1, 2026-10-14): the legacy version used successfully for 4 years in a UNICEF project in IndoChina for very elaborate reporting formats; this SQLite version is the improvement and upgrade. Text only, no logo.",
    en: { h: 'Proven in the field', lines: ['The legacy version has been used successfully for four years in a UNICEF project in IndoChina, for very elaborate reporting formats.', 'This SQLite version is our improvement and upgrade of it.'], small: 'GardenWorld demo data shown in these films' },
    th: { h: 'พิสูจน์แล้วในงานจริง', lines: ['เวอร์ชันเดิมถูกใช้งานอย่างประสบความสำเร็จมา 4 ปีในโครงการ UNICEF ในอินโดจีน สำหรับรายงานรูปแบบซับซ้อนมาก', 'เวอร์ชัน SQLite นี้คือการปรับปรุงและยกระดับจากเวอร์ชันเดิม'], small: 'ข้อมูลในภาพยนตร์เป็นข้อมูลสาธิต GardenWorld' } },
];
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = (c) => `<style>body{margin:0;background:#12151f;color:#e6ebf5;font-family:'Noto Sans Thai','Noto Sans',system-ui,sans-serif}
 .card{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 110px;box-sizing:border-box}
 h1{font-size:58px;margin:0 0 34px;font-weight:600}p{font-size:34px;margin:12px 0;opacity:.9;line-height:1.35}small{font-size:22px;opacity:.6;margin-top:34px}
 table{border-collapse:collapse;font-size:28px;text-align:left;margin-top:6px}td,th{border:1px solid #39425f;padding:10px 18px}th{background:#2b3452}tr:last-child td{background:#33401f;font-weight:600}</style>
 <div class="card"><h1>${esc(c.h)}</h1>${(c.lines || []).map(l => `<p>${esc(l)}</p>`).join('')}${c.table ? '<table>' + c.table.map((r, i) => '<tr>' + r.map(x => `<${i ? 'td' : 'th'}>${esc(x)}</${i ? 'td' : 'th'}>`).join('') + '</tr>').join('') + '</table>' : ''}${c.small ? `<small>${esc(c.small)}</small>` : ''}</div>`;
(async () => {
  const br = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] }); const pg = await (await br.newContext({ viewport: { width: 1920, height: 1080 } })).newPage(); const man = [];
  for (const c of CARDS) for (const lang of ['en', 'th']) {
    await pg.setContent(html(c[lang])); await pg.waitForTimeout(300);
    const png = path.join(OUT, `card_${c.id}_${lang}.png`), mp4 = path.join(OUT, `card_${c.id}_${lang}.mp4`);
    await pg.screenshot({ path: png });
    cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-i', png, '-t', String(c.sec), '-r', '24', '-vf', 'scale=1920:1080,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    man.push({ id: c.id, lang, seconds: c.sec, mp4: path.basename(mp4), src: c.src }); console.log(`§TB_CARD id=${c.id} lang=${lang} seconds=${c.sec} out=${path.basename(mp4)}`);
  }
  fs.writeFileSync(path.join(OUT, 'cards_manifest.json'), JSON.stringify(man, null, 1)); await br.close();
})().catch(e => { console.log('§TB_CARD ERROR', e.stack); process.exit(1); });
