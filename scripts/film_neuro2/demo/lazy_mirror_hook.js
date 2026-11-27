// # ⚠ DO NOT REMOVE — MEASUREMENT TOOL for W-FILM-NEURO2-CLI (NEURO_SYMBOLIC_ORDER_CONTRACT.md §22.8). Read the log after every run.
// `node -r ./lazy_mirror_hook.js viewer_verbs.js ...` : wraps http.createServer so that, when the viewer driver's local server is asked for a file
// that is not in its folder, the file is first fetched from the LIVE site (https://red1oon.github.io/bim-ootb/<path>) and the path is logged.
// Purpose: find out which files the Viewer CLI really needs. It never changes the product's code; the final demo downloads the measured list and runs WITHOUT this hook.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), https = require('https');
const LIVE = 'https://red1oon.github.io/bim-ootb/', ROOT = process.env.MIRROR_ROOT, OUT = process.env.MIRROR_LIST;
const got = new Set(), miss = new Set();
function fetch(url) { return new Promise((res, rej) => https.get(url, { family: 4 }, r => { if (r.statusCode !== 200) { r.resume(); return res(null); } const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c))); }).on('error', rej)); }
const orig = http.createServer;
http.createServer = function (listener) {
  return orig.call(http, async (req, res) => {
    try {
      const u = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
      const fp = path.join(ROOT, u);
      if (u && u !== '__fpv/model.db' && !fs.existsSync(fp) && !miss.has(u)) {
        const b = await fetch(LIVE + u);
        if (b) { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, b); got.add(u); fs.writeFileSync(OUT, [...got].sort().join('\n') + '\n'); }
        else miss.add(u);
      }
    } catch (e) { /* fall through to the real handler */ }
    listener(req, res);
  });
};
process.on('exit', () => { fs.writeFileSync(OUT, [...got].sort().join('\n') + '\n'); fs.writeFileSync(OUT + '.404', [...miss].sort().join('\n') + '\n'); });
