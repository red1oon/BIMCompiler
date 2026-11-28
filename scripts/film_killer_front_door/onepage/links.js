// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 3: the links on the closing card are shown only if they answer HTTP 200 NOW (§FILM_LINK lines). The guide page must also carry its anchor. Writes out/links.json. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), OD = process.env.OUTD || 'out';
const L = [
  { id: 'pdf', url: 'https://red1oon.github.io/bim-ootb/pdf/', shown: 'red1oon.github.io/bim-ootb/pdf' },
  ...(process.env.FILM === '1' ? [{ id: 'history', url: 'https://red1oon.github.io/bim-ootb/history/', shown: 'red1oon.github.io/bim-ootb/history' }] : [{ id: 'fileit', url: 'https://red1oon.github.io/bim-ootb/file-it/', shown: 'red1oon.github.io/bim-ootb/file-it' }]),
  // the guide is linked only if it answers 200, carries the anchor of the section the film shows, and its text covers the one-page editor and the ERP report print
  { id: 'guide', url: 'https://red1oon.github.io/BIMCompiler/PdfPageGuide/', anchor: '2-pdf-change-text-or-a-number-right-on-the-page', needs: /font not same[\s\S]*A report printed by the ERP/, shown: 'red1oon.github.io/BIMCompiler/PdfPageGuide' }
], out = { links: [], dropped: [] };
L.forEach(l => { const g = cp.spawnSync('curl', ['-s', '-L', '-w', '\n%{http_code}', l.url], { encoding: 'utf8', maxBuffer: 1 << 27 }), code = +g.stdout.trim().split('\n').pop(), anchor = l.anchor ? new RegExp('id="' + l.anchor + '"').test(g.stdout) : null, covers = l.needs ? l.needs.test(g.stdout.replace(/<[^>]*>/g, ' ')) : null;
  const ok = code === 200 && (l.anchor ? anchor : true) && (l.needs ? covers : true); console.log('§FILM_LINK id=' + l.id + ' url=' + l.url + ' http=' + code + (l.anchor ? ' anchor=' + l.anchor + ' found=' + anchor : '') + (l.needs ? ' page_covers_the_history_page=' + covers : '') + (ok ? ' SHOWN' : ' DROPPED')); (ok ? out.links : out.dropped).push({ id: l.id, url: l.url, shown: l.shown, http: code, anchor: l.anchor ? anchor : undefined }); });
fs.mkdirSync(path.join(__dirname, OD), { recursive: true }); fs.writeFileSync(path.join(__dirname, OD, 'links.json'), JSON.stringify(out, null, 1));
console.log('§FILM_LINK_VERDICT ' + (out.links.length ? 'PASS' : 'INCONCLUSIVE') + ' shown=' + out.links.length + ' dropped=' + out.dropped.length); process.exit(out.links.length ? 0 : 2);
