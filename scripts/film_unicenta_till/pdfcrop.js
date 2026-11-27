// ⚠ DO NOT REMOVE — Scope: cut the owner's own screen capture (p23 "MAKING A SALES") and diagram (p50 "ERP TO POS INTEGRATION MODEL") out of ~/Downloads/openbravoPOSGuide.pdf for the film v2 (prompts/POS_PLUGIN_LOCAL_FIRST.md §34.C/§34.D). The PDF is NOT committed; the crops are generated here on every build.
// Image boxes come from the PDF itself (pdftohtml -xml, page units = 1.5 x pt), rendered with pdftoppm at 300 dpi (>= 200), cropped to the image box only (no page text). The page text (pdftotext) is saved as the fact source for every number the voice says about them.
// Usage: node pdfcrop.js <outDir>  ->  <outDir>/p23_screen.png, p50_diagram.png, p1_text.txt, p23_text.txt, p50_text.txt, pdfcrop.log     READ THE LOG.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const PDF = process.env.GUIDE_PDF || path.join(os.homedir(), 'Downloads', 'openbravoPOSGuide.pdf'), OUT = path.resolve(process.argv[2] || 'out/pdf'); fs.mkdirSync(OUT, { recursive: true });
if (!fs.existsSync(PDF)) { console.log('§PDFCROP FAIL no guide at ' + PDF); process.exit(1); }
const DPI = 300, tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfcrop-')); fs.copyFileSync(PDF, path.join(tmp, 'g.pdf'));
// [page, index of the image on that page (document order), output]
for (const [pg, idx, name] of [[23, 0, 'p23_screen'], [50, 0, 'p50_diagram']]) {
  const xml = execFileSync('pdftohtml', ['-xml', '-f', String(pg), '-l', String(pg), '-stdout', 'g.pdf'], { cwd: tmp, maxBuffer: 1 << 26 }).toString(), pw = +/<page [^>]*width="(\d+)"/.exec(xml)[1];
  const im = [...xml.matchAll(/<image top="(\d+)" left="(\d+)" width="(\d+)" height="(\d+)"/g)].map(m => m.slice(1).map(Number))[idx]; if (!im) { console.log('§PDFCROP FAIL no image ' + idx + ' on p' + pg); process.exit(1); }
  const k = DPI / 72 / (pw / 612), [t, l, w, h] = im.map(v => Math.round(v * k)); // top,left,width,height in px at DPI
  const ord = [t, l, w, h]; execFileSync('pdftoppm', ['-r', String(DPI), '-f', String(pg), '-l', String(pg), '-x', String(l), '-y', String(t), '-W', String(w), '-H', String(h), '-png', '-singlefile', 'g.pdf', path.join(OUT, name)], { cwd: tmp });
  fs.writeFileSync(path.join(OUT, 'p' + pg + '_text.txt'), execFileSync('pdftotext', ['-f', String(pg), '-l', String(pg), '-layout', 'g.pdf', '-'], { cwd: tmp }).toString());
  const dim = execFileSync('identify', ['-format', '%wx%h', path.join(OUT, name + '.png')]).toString(); console.log(`§PDFCROP p${pg} dpi=${DPI} box_units(top,left,w,h)=${im} crop_px(top,left,w,h)=${ord} out=${name}.png ${dim}`);
}
fs.writeFileSync(path.join(OUT, 'p1_text.txt'), execFileSync('pdftotext', ['-f', '1', '-l', '1', '-layout', 'g.pdf', '-'], { cwd: tmp }).toString());
fs.rmSync(tmp, { recursive: true, force: true }); console.log('§PDFCROP_DONE');
