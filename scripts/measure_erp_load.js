// ⚠ DO NOT REMOVE — SCOPE: READ-ONLY headless measurement of what the shipped ERP (bim-ootb origin/main erp/idempiere.html)
// costs a browser to load. Emits `§ERP_LOAD key=value` lines (numbers only, no screenshots). READ THE LOG
// (build/erp/logs_load/erp_load_<ts>.log) after every run — exit code is not evidence.
// Chromium is launched --disable-gpu (no GPU use). Serves the repo root of ERP_ROOT's parent with NO compression;
// gz sizes are computed here with zlib level 9 (what a gzip-ing server would send). Nothing is estimated:
// anything not observable prints UNMEASURED reason=…
// Run: ERP_ROOT=/tmp/wt-ootb-shopday2/erp node scripts/measure_erp_load.js   (RUNS=3 default)
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const ERP_DIR = process.env.ERP_ROOT; if (!ERP_DIR) { console.error('set ERP_ROOT'); process.exit(2); }
const ROOT = path.dirname(ERP_DIR), RUNS = +(process.env.RUNS || 3);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.sql': 'text/plain' };
const ts = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
const LOG = path.join(__dirname, '..', 'build/erp/logs_load', 'erp_load_' + ts + '.log');
const out = (k, v) => { const l = '§ERP_LOAD ' + k + '=' + v; console.log(l); fs.appendFileSync(LOG, l + '\n'); };
const stat = a => { a = a.filter(x => typeof x === 'number' && !isNaN(x)).sort((x, y) => x - y); if (!a.length) return 'UNMEASURED reason=no-samples'; return 'min:' + a[0] + ' med:' + a[a.length >> 1] + ' max:' + a[a.length - 1]; };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/erp/idempiere.html';
  fs.readFile(path.join(ROOT, p), (e, b) => {
    if (e) { r.writeHead(404); r.end('404'); return; }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b);
  });
});
const kind = u => /\.js(\?|$)/.test(u) ? 'JS' : /\.db(\?|$)/.test(u) ? 'DB' : /\.wasm/.test(u) ? 'WASM' : 'other';
const procMem = pid => { try { const s = fs.readFileSync('/proc/' + pid + '/status', 'utf8'); const g = k => +(s.match(new RegExp(k + ':\\s+(\\d+) kB')) || [])[1] * 1024; return { rss: g('VmRSS'), hwm: g('VmHWM') }; } catch (e) { return null; } };
const kids = root => { const all = {}; for (const d of fs.readdirSync('/proc')) if (/^\d+$/.test(d)) { try { const st = fs.readFileSync('/proc/' + d + '/stat', 'utf8'); all[d] = st.slice(st.lastIndexOf(')') + 2).split(' ')[1]; } catch (e) {} } const res = [String(root)]; let ch = true; while (ch) { ch = false; for (const p in all) if (!res.includes(p) && res.includes(all[p])) { res.push(p); ch = true; } } return res; };
(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  out('erp_root', ERP_DIR); out('runs', RUNS);
  const R = { cold: {}, warm: {}, net: [], mem: {}, rss: [], wasm: [] };
  const push = (o, k, v) => (o[k] = o[k] || []).push(v);
  let netDetail = null;
  for (let run = 1; run <= RUNS; run++) {
    const br = await chromium.launch({ args: ['--disable-gpu', '--use-gl=disabled', '--enable-precise-memory-info'] });
    const ctx = await br.newContext(); const pg = await ctx.newPage();
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Network.enable'); await cdp.send('Performance.enable'); await cdp.send('HeapProfiler.enable');
    await pg.addInitScript(() => {
      window.__wasm = []; const cap = o => { try { const m = o && (o.instance ? o.instance : o).exports; for (const k in m) if (m[k] instanceof WebAssembly.Memory && !window.__wasm.includes(m[k])) window.__wasm.push(m[k]); } catch (e) {} return o; };
      const M = WebAssembly.Memory; WebAssembly.Memory = function (d) { const m = new M(d); window.__wasm.push(m); return m; }; WebAssembly.Memory.prototype = M.prototype;
      for (const f of ['instantiate', 'instantiateStreaming']) { const o = WebAssembly[f]; WebAssembly[f] = function () { return o.apply(this, arguments).then(cap); }; }
      window.__t = {}; const mo = new MutationObserver(() => { if (!window.__t.tree && document.querySelector('#idmp-tree .idmp-row.leaf')) window.__t.tree = performance.now(); }); document.addEventListener('DOMContentLoaded', () => mo.observe(document.documentElement, { childList: true, subtree: true }));
    });
    const reqs = {};
    cdp.on('Network.responseReceived', e => { reqs[e.requestId] = { url: e.response.url, status: e.response.status, fromSW: e.response.fromServiceWorker, enc: 0 }; });
    cdp.on('Network.loadingFinished', e => { if (reqs[e.requestId]) reqs[e.requestId].enc = e.encodedDataLength; });
    const heap = async () => { const h = await pg.evaluate(() => ({ u: performance.memory.usedJSHeapSize, t: performance.memory.totalJSHeapSize })); const m = (await cdp.send('Performance.getMetrics')).metrics; const g = n => (m.find(x => x.name === n) || {}).value; return { used: h.u, total: h.t, cdpUsed: g('JSHeapUsedSize'), cdpTotal: g('JSHeapTotalSize'), nodes: g('Nodes'), docs: g('Documents') }; };
    const url = `http://localhost:${port}/erp/idempiere.html?login=GardenAdmin`;
    const snap = async tag => { const h = await heap(); h.wasmBytes = await pg.evaluate(() => (window.__wasm || []).reduce((a, m) => a + m.buffer.byteLength, 0)); for (const k in h) push(R.mem, tag + '.' + k, h[k]); };
    await snap('before_load');
    const t0 = Date.now();
    await pg.goto(url, { waitUntil: 'networkidle' });
    await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 60000 });
    const nav = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, tree: window.__t.tree }; });
    push(R.cold, 'dcl_ms', nav.dcl); push(R.cold, 'load_ms', nav.load); push(R.cold, 'tree_ms', nav.tree);
    // transfer set to idle + first leaf
    const list = Object.values(reqs).filter(r => r.url.startsWith('http://localhost:' + port));
    const rows = list.map(r => { const rel = decodeURIComponent(new URL(r.url).pathname); let raw = 0, gz = 0; try { const b = fs.readFileSync(path.join(ROOT, rel)); raw = b.length; gz = /\.(js|html|css|json|sql|svg|db|wasm|md)$/.test(rel) ? zlib.gzipSync(b, { level: 9 }).length : raw; } catch (e) {} return { rel, kind: kind(rel), status: r.status, raw, gz, enc: r.enc }; });
    push(R.net, 'rows', rows);
    const sw = await pg.evaluate(async () => { const r = await navigator.serviceWorker.getRegistrations(); return r.length; });
    if (run === 1) out('service_worker_registrations_after_cold_load', sw);
    await snap('after_tree');
    const clickLeaf = name => pg.$$eval('#idmp-tree .idmp-row.leaf', (rows, n) => { const r = rows.find(x => x.dataset.name === n); if (!r) return false; r.click(); return true; }, name);
    const openWin = async name => { const before = await pg.$$eval('.idmp-wintab', e => e.length); const ts0 = await pg.evaluate(() => performance.now()); if (!await clickLeaf(name)) return { ok: false }; try { await pg.waitForFunction(b => document.querySelectorAll('.idmp-wintab').length > b && document.querySelector('.idmp-grid tbody tr, .idmp-grid tr'), before, { timeout: 30000 }); } catch (e) { return { ok: false, why: 'timeout' }; } const ts1 = await pg.evaluate(() => performance.now()); return { ok: true, ms: ts1 - ts0 }; };
    const w1 = await openWin('sales order'); if (!w1.ok) out('window_open_sales_order', 'UNMEASURED reason=' + (w1.why || 'leaf-not-found')); else push(R.cold, 'win_sales_order_ms', w1.ms);
    await snap('after_sales_order');
    for (const n of ['business partner', 'product', 'purchase order']) { const w = await openWin(n); if (!w.ok) out('window_open_' + n.replace(/ /g, '_'), 'UNMEASURED reason=' + (w.why || 'leaf-not-found')); else push(R.cold, 'win_' + n.replace(/ /g, '_') + '_ms', w.ms); }
    await snap('after_3_more_windows');
    await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('HeapProfiler.collectGarbage');
    await snap('after_gc');
    const wasm = await pg.evaluate(() => (window.__wasm || []).map(m => m.buffer.byteLength));
    push(R.wasm, 'bytes', wasm.reduce((a, b) => a + b, 0)); push(R.wasm, 'n', wasm.length);
    // RSS: renderer(s) + whole browser tree
    const bs = await br.newBrowserCDPSession(); const pi = (await bs.send('SystemInfo.getProcessInfo')).processInfo;
    const procs = pi.map(x => ({ p: x.id, cmd: x.type, m: procMem(x.id) })).filter(x => x.m);
    const rend = procs.filter(x => x.cmd === 'renderer'); const rhwm = Math.max(...rend.map(x => x.m.hwm)), rrss = Math.max(...rend.map(x => x.m.rss));
    push(R.rss, 'renderer_peak_hwm', rhwm); push(R.rss, 'renderer_rss_end', rrss); push(R.rss, 'tree_sum_rss', procs.reduce((a, x) => a + x.m.rss, 0));
    if (run === 1) { out('process_types', procs.map(x => x.cmd + ':' + x.m.rss).join(',')); }
    // warm: SW cache populated -> reload
    await pg.waitForTimeout(3000);
    const reqs2n = Object.keys(reqs).length;
    await pg.reload({ waitUntil: 'networkidle' });
    await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 60000 });
    const nav2 = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, tree: window.__t.tree }; });
    push(R.warm, 'dcl_ms', nav2.dcl); push(R.warm, 'load_ms', nav2.load); push(R.warm, 'tree_ms', nav2.tree);
    const warmReqs = Object.values(reqs).slice(reqs2n); push(R.warm, 'requests', warmReqs.length); push(R.warm, 'fromSW', warmReqs.filter(r => r.fromSW).length);
    push(R.warm, 'wire_bytes', warmReqs.reduce((a, r) => a + r.enc, 0));
    const w2 = await openWin('sales order'); if (w2.ok) push(R.warm, 'win_sales_order_ms', w2.ms);
    await br.close();
  }
  // ---- report ----
  const rowsR = R.net.rows;
  const tot = (rs, f) => rs.reduce((a, r) => a + f(r), 0);
  const MB = x => (x / 1048576).toFixed(3);
  out('cold.requests', stat(rowsR.map(r => r.length)));
  out('cold.requests_404', stat(rowsR.map(r => r.filter(x => x.status === 404).length)));
  out('cold.bytes_raw_MB', stat(rowsR.map(r => +MB(tot(r, x => x.raw)))));
  out('cold.bytes_gzip9_MB', stat(rowsR.map(r => +MB(tot(r, x => x.gz)))));
  out('cold.bytes_wire_localserver_MB', stat(rowsR.map(r => +MB(tot(r, x => x.enc)))));
  for (const k of ['JS', 'DB', 'WASM', 'other']) { out('cold.' + k + '.count', stat(rowsR.map(r => r.filter(x => x.kind === k).length))); out('cold.' + k + '.raw_MB', stat(rowsR.map(r => +MB(tot(r.filter(x => x.kind === k), x => x.raw))))); out('cold.' + k + '.gzip9_MB', stat(rowsR.map(r => +MB(tot(r.filter(x => x.kind === k), x => x.gz))))); }
  const big = rowsR[0].slice().sort((a, b) => b.raw - a.raw).slice(0, 10);
  big.forEach((b, i) => out('biggest_' + (i + 1), b.rel + ' raw=' + b.raw + ' gzip9=' + b.gz + ' kind=' + b.kind));
  out('seed_dbs_loaded', rowsR[0].filter(r => r.kind === 'DB').map(r => r.rel + ' raw=' + r.raw + ' gzip9=' + r.gz).join(' | ') || 'none');
  out('patches_loaded', rowsR[0].filter(r => /\/patches\//.test(r.rel)).map(r => r.rel + ' raw=' + r.raw + ' gzip9=' + r.gz).join(' | ') || 'none');
  for (const [w, o] of [['cold', R.cold], ['warm', R.warm]]) for (const k in o) out(w + '.' + k, stat(o[k]));
  for (const k in R.mem) out('heap.' + k, stat(R.mem[k]));
  out('wasm_memory_bytes_total_all_WebAssembly.Memory', stat(R.wasm.bytes)); out('wasm_memory_count', stat(R.wasm.n));
  for (const k in R.rss) out('rss.' + k, stat(R.rss[k]));
  const peak = Math.max(...R.rss.renderer_peak_hwm);
  out('phone_budget', 'renderer_peak_hwm_max=' + (peak / 1073741824).toFixed(3) + 'GB vs CLAUDE.md PERF BUDGET phone figure ~0.6GB/tab (UNVERIFIED figure; comparison only, ratio=' + (peak / 0.6 / 1073741824).toFixed(2) + ')');
  server.close(); process.exit(0);
})().catch(e => { out('FATAL', String(e.stack || e).slice(0, 400)); process.exit(1); });
