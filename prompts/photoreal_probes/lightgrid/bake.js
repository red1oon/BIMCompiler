// bake.js <port> <bld...> : §LIGHT_FIELD_PATCH bake. Per building: fresh profile, open viewer.html?db=../buildings/<bld>_extracted.db,
// LightZones.build + field (no render), dbPack -> write <tree>/buildings/patches/<bld>_extracted.db.lightfield.bin ('LFP1' + u32 header
// length + JSON header + gzip blob). Prints §LIGHT_FIELD_BAKE per building. Env TREE (default /tmp/wt-lfdb).
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, ...BLDS] = process.argv.slice(2), TREE = process.env.TREE || '/tmp/wt-lfdb';
(async () => { for (const bld of BLDS) { const t00 = Date.now(), b = await puppeteer.launch({ headless: true, protocolTimeout: 3600000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 800, height: 450 }); const L = []; p.on('console', m => { const t = m.text(); if (/§(LIGHT_FIELD|ZONE_IDB|SKY_VIEW_FIELD on|SKY_FIELD_EXACT|GLASS_REFL_OPEN|PATCH)|Uncaptured WebGPU/.test(t)) L.push(t.slice(0, 400)); }); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=../buildings/' + bld + '_extracted.db', { waitUntil: 'domcontentloaded' });
  { let last = -1, same = 0; for (let i = 0; i < 400 && same < 5; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } }
  const R = await p.evaluate(async () => { const A = window.APP, LZ = window.LightZones, t0 = performance.now(); const Z = LZ.build(A), F = Z && LZ.field(A); if (!F) return { err: 'no field' }; const t1 = performance.now();
    await LZ.dbPack(A); const rec = LZ.dbRecord(true); if (!rec) return { err: 'no record' }; let s = ''; const u = rec.blob; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
    return { key: rec.key, bld: rec.bld, fp: rec.fp, bytes: rec.bytes, raw_bytes: rec.rawBytes, created: rec.created, b64: btoa(s), fieldMs: Math.round(t1 - t0), guids: Object.keys(A.guidMap).length }; });
  if (R.err) { console.log('§LIGHT_FIELD_BAKE ' + bld + ' FAIL ' + R.err + ' | ' + L.join(' | ')); await b.close(); continue; }
  const blob = Buffer.from(R.b64, 'base64'), H = Buffer.from(JSON.stringify({ key: R.key, bld: R.bld, fp: R.fp, bytes: R.bytes, raw_bytes: R.raw_bytes, created: R.created })), hl = Buffer.alloc(4); hl.writeUInt32LE(H.length);
  const out = TREE + '/buildings/patches/' + bld + '_extracted.db.lightfield.bin'; fs.writeFileSync(out, Buffer.concat([Buffer.from('LFP1'), hl, H, blob]));
  console.log('§LIGHT_FIELD_BAKE ' + bld + ' key=' + R.key + ' bytes=' + R.bytes + ' raw=' + R.raw_bytes + ' guids=' + R.guids + ' fieldMs=' + R.fieldMs + ' wallS=' + Math.round((Date.now() - t00) / 1000) + ' -> ' + out + ' blobOk=' + (blob.length === R.bytes)); L.forEach(t => console.log('   ' + t));
  await b.close(); } })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
