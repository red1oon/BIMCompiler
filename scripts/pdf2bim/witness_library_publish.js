#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-LIB-PUB (prompts/PDF2BIM_VECTOR_PROBE.md §34). Read the log after every run.
// THE ISSUE THIS PROVES OR DISPROVES: replacing the published library for one house could silently change every other set: a lost mesh, an old family turned ambiguous by a new size pair, a Duplex fill bound elsewhere. Run BEFORE latest.json moves.
//   P1 every live mesh byte-equal in the new version   P2 every live family resolves to the same reference   P3 the published Duplex marked samples: same verdict and same fills on live and new
//   P4 what is added is only the three generated windows + the two door descriptions
// VACUOUS (exit 2) if the samples or the live index cannot be read.
// usage: PDF2BIM_OOTB=<tree> node witness_library_publish.js <new export dir ending with /> <samples dir>
'use strict';
const fs = require('fs'), path = require('path'), D = (process.env.PDF2BIM_OOTB || '/home/red1/bim-ootb') + '/modeller/';
const I = require(D + 'dxf2bim_import.js'), P = require(D + 'dxf2prep.js'), S = require(D + 'dxf2bim/dxf2shell.js');
const NEW = process.argv[2], SAM = process.argv[3], LIVE = process.env.PDF2BIM_LIVE || 'https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/dxf2bim/library/';
let fails = 0, judged = 0; const ok = (id, c, m) => { judged++; console.log((c ? '§PASS ' : '§FAIL ') + id + (m ? '  ' + m : '')); if (!c) fails++; };
const liveJ = async u => { const r = await fetch(u.startsWith('http') ? u : LIVE + u); if (r.status === 404) return null; if (!r.ok) throw new Error(u + ' HTTP ' + r.status); return r.json(); };
const newJ = async u => { const f = u.startsWith(NEW) ? u : path.join(NEW, u); try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const sheets = () => I.readSheets(fs.readdirSync(SAM).filter(f => f.endsWith('.dxf')).sort().map(n => ({ name: n, text: fs.readFileSync(path.join(SAM, n), 'utf8') })), { prep: P, prepChoices: {} });
const fills = R => (R.els || []).filter(e => e.family_id).map(e => [e.guid, e.family_id, e.element_ref, e.geometry_hash, (e.centre || []).join(',')].join('|')).sort();
(async () => {
  const la = await liveJ('latest.json'), lb = await newJ('latest.json');
  if (!la || !lb) { console.log('§VACUOUS latest.json unreadable'); process.exit(2); }
  const ia = await liveJ(la.index), ib = await newJ(lb.index);
  console.log('§LIVE ' + la.index + ' §NEW ' + lb.index + ' live ' + JSON.stringify(ia.counts) + ' new ' + JSON.stringify(ib.counts));
  let same = 0, diff = [], n = 0;
  for (const s of ia.shards) {
    const a = await liveJ(la.index.split('/')[0] + '/' + s.name + '.json') || await liveJ(la.index.split('/')[0] + '/' + s.name), b = await newJ(lb.index.split('/')[0] + '/' + (s.name.endsWith('.json') ? s.name : s.name + '.json'));
    if (!a || !b) { diff.push(s.name + ' unreadable'); continue; }
    for (const h of Object.keys(a.meshes || {})) { n++; JSON.stringify(a.meshes[h]) === JSON.stringify((b.meshes || {})[h]) ? same++ : diff.push(h); }
  }
  if (!n) { console.log('§VACUOUS no live mesh read'); process.exit(2); }
  ok('P1 every live mesh is byte-equal in the new version', !diff.length && same === ia.counts.meshes, same + ' of ' + ia.counts.meshes + ' meshes, differing ' + diff.slice(0, 5));
  const geoms = x => x.rows.ad_geometry_map, res = (f, g) => JSON.stringify(S.familyToRef(f, g)), fb = {}; ib.rows.ad_opening_family.forEach(f => { fb[f.family_id] = f; });
  const moved = []; let fine = 0; ia.rows.ad_opening_family.forEach(f => { const a = res(f, geoms(ia)), b = res(fb[f.family_id] || {}, geoms(ib)); if (a === b) fine++; else moved.push(f.family_id + ' ' + a.slice(0, 80) + ' -> ' + b.slice(0, 80)); });
  const door = /^INST_FIRE_DOOR_(900|750)$/; const others = moved.filter(m => !door.test(m.split(' ')[0]));
  moved.forEach(m => console.log('§MOVED ' + m));
  ok('P2 every old family resolves as before, except the 2 doors CL006 makes bindable', !others.length && moved.length === 2, fine + ' same, ' + moved.length + ' moved');
  const added = ib.rows.ad_opening_family.filter(f => !ia.rows.ad_opening_family.some(q => q.family_id === f.family_id)).map(f => f.family_id).sort();
  const gk = r => r.element_ref + '|' + r.geometry_hash, ga = new Set(geoms(ia).map(gk)), addG = geoms(ib).filter(r => !ga.has(gk(r))), lost = geoms(ia).filter(r => !geoms(ib).some(q => gk(q) === gk(r)));
  const descs = ib.rows.ad_opening_family.filter(f => { const q = ia.rows.ad_opening_family.find(z => z.family_id === f.family_id); return q && q.description !== f.description; }).map(f => f.family_id).sort();
  ok('P4 added: only the 3 generated window families and 6 meshes; changed: only 2 door descriptions; lost: nothing', added.join() === 'LCSSU_W1_1800x1000,LCSSU_W2_1200x1000,LCSSU_W3_600x500' && addG.length === 6 && !lost.length && descs.join() === 'INST_FIRE_DOOR_750,INST_FIRE_DOOR_900', added.join() + ' | map rows +' + addG.length + ' -' + lost.length + ' | ' + descs.join());
  if (!fs.existsSync(SAM) || fs.readdirSync(SAM).filter(f => f.endsWith('.dxf')).length !== 8) { console.log('§VACUOUS the 8 Duplex marked samples are missing'); process.exit(2); }
  const ra = await I.loadOci(sheets(), { base: LIVE, fetchJson: liveJ, convertOpts: {} }), rb = await I.loadOci(sheets(), { base: NEW, fetchJson: newJ, convertOpts: {} });
  const fa = fills(ra.R), fb2 = fills(rb.R), va = ra.R.verdict, vb = rb.R.verdict;
  console.log('§DUPLEX live verdict ' + va.verdict + ' blocking ' + va.blocking.length + ' fills ' + fa.length + ' | new verdict ' + vb.verdict + ' blocking ' + vb.blocking.length + ' fills ' + fb2.length);
  if (!fa.length) { console.log('§VACUOUS no fill placed on the live library'); process.exit(2); }
  ok('P3 the Duplex samples: same verdict, same counts, same fills on live and new', va.verdict === vb.verdict && JSON.stringify(va.counts) === JSON.stringify(vb.counts) && fa.join() === fb2.join() && (ra.R.els || []).length === (rb.R.els || []).length, fa.length + ' fills, ' + (rb.R.els || []).length + ' elements');
  console.log('§RESULT judged=' + judged + ' fails=' + fails + ' ' + (fails ? 'FAIL' : 'PASS')); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§ERROR ' + String(e && e.stack || e).slice(0, 600)); process.exit(3); });
