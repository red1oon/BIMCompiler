// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md). Shared helpers for the capture scripts: a static server for a read-only
// `git archive origin/main` export of bim-ootb on a private port, and the browser launch (GPU by default after nvidia-smi is logged; GL=sw for software GL). READ THE LOG after every run.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.sql': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml' };
exports.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
exports.serve = (tree, port) => new Promise((res) => { const s = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); fs.readFile(path.join(tree, p), (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b); }); }); s.listen(port || 0, '127.0.0.1', () => res(s)); });
exports.launch = () => { const sw = process.env.GL === 'sw';
  const args = sw ? ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-gl=angle', '--use-angle=gl'];
  console.log('§FILM_GL mode=' + (sw ? 'software(swiftshader)' : 'gpu') + ' args=' + args.join(' ')); return puppeteer.launch({ headless: 'new', args, protocolTimeout: 600000 }); };
exports.puppeteer = puppeteer;
