// ⚠ DO NOT REMOVE — CLIENT-SCOPED DICT_DIFF witness (spec prompts/SQLiteIDEMPIERE.md §SHOPDAY-BUILD-1 (c)). READ THE LOG: §DDS lines.
//  §DDS_TABLE  per table: unscoped vs scoped(client 11) summary (legacy/local rows, changed cells, onlyLegacy, onlyLocal) -> SAME | DIFFERS (+ why)
//  §DDS_SELFTEST PASS only if every compared table is SAME and judged rows > 0; INCONCLUSIVE if nothing was judged
//  §DDS_VACUOUS  a scope with 0 legacy rows (control: client 99999) is reported, never PASS
//  §DDS_NEG      a corrupted cell + a deleted row in a scratch copy are both detected by the SCOPED run
//  §DDS_NATURAL  natural-key mode on client 11 (ids differ across systems for a fresh client): same legacy/local row counts as the id-keyed run
// READ-ONLY on the pilot (read WS); works on scratch copies of the SQLite dbs. Never patches a shared seed.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
const { cfgFromEnv } = require('./ad_client');
const D = require('./dict_diff');
const base = require('./dict_spec.json'), extra = require('./dict_spec_client.json');
const log = console.log;
(async () => {
  const cfg = cfgFromEnv(); let fails = 0, incon = 0;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dds-'));
  const cp = (f, n) => { const p = path.join(tmp, n); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', f), p); return new Database(p); };
  const seed = cp('ad_seed_fullwidth.db', 'seed.db'), gbd = cp('glassbowl_data.db', 'gb.db');
  const dbFor = sp => (sp.db === 'glassbowl' ? gbd : seed);
  const sum = r => ({ legacy: r.legacy, local: r.local, changed: r.changed.map(c => `${c.id}.${c.col}`).sort().join(','), onlyLegacy: r.onlyLegacy.length, onlyLocal: r.onlyLocal.slice().sort().join(',') });
  const specs = base.concat(extra.map(e => ({ ...e, _extra: true })));
  let judged = 0, same = 0, differs = 0; const vac = [];
  const cache = {};
  for (const sp of specs) {
    const tag = (sp.out || sp.table) + (sp.db === 'glassbowl' ? '@gb' : '');
    if (sp.columnsOnly) { log(`§DDS_TABLE ${tag} SKIP columnsOnly`); continue; }
    let u, s;
    try {
      const Lu = await D.discover(cfg, sp), ss = D.scopeSpec(sp, 11), Ls = await D.discover(cfg, ss);
      u = D.compare(Lu, dbFor(sp), sp); s = D.compare(Ls, dbFor(sp), ss);
      cache[tag] = { sp, ss, Ls, s };
    } catch (e) { log(`§DDS_TABLE ${tag} ERROR ${e.message.replace(/\s+/g, ' ').slice(0, 120)}`); fails++; continue; }
    let a = JSON.stringify(sum(u)); const b = JSON.stringify(sum(s));
    // the only legitimate difference: unscoped lists SQLite rows of OTHER clients (e.g. client-0 doctype id 0) as onlyLocal; scoped must drop exactly those
    let foreign = 0;
    if (a !== b && typeof sp.key === 'string') {
      const k = sp.key.toLowerCase(), has = dbFor(sp).prepare('SELECT 1 FROM pragma_table_info(?) WHERE lower(name)=\'ad_client_id\'').get(sp.table);
      if (has) {
        const fo = u.onlyLocal.filter(id => { const r = dbFor(sp).prepare(`SELECT ad_client_id c FROM ${sp.table} WHERE ${k}=?`).get(Number(id)); return r && Number(r.c) !== 11 && !(sp.clientIn0 && Number(r.c) === 0); });
        foreign = fo.length;
        const u2 = { ...sum(u), local: u.local - foreign, onlyLocal: u.onlyLocal.filter(id => !fo.includes(id)).sort().join(',') };
        if (JSON.stringify(u2) === b) { a = b; log(`§DDS_FOREIGN ${tag} unscoped lists ${foreign} SQLite row(s) of another client as onlyLocal (ids ${fo.join(',')}); scoped(11) correctly excludes them -> SAME otherwise`); }
      }
    }
    const ok = a === b; ok ? same++ : differs++;
    judged += s.legacy;
    log(`§DDS_TABLE ${tag} ${ok ? 'SAME' : 'DIFFERS'} unscoped(legacy=${u.legacy} local=${u.local} changed=${u.changed.length} onlyLegacy=${u.onlyLegacy.length} onlyLocal=${u.onlyLocal.length}) scoped11(legacy=${s.legacy} local=${s.local} changed=${s.changed.length} onlyLegacy=${s.onlyLegacy.length} onlyLocal=${s.onlyLocal.length}) where=[${ss_where(sp, 11)}]`);
    if (!ok) log(`§DDS_DIFFERS_DETAIL ${tag} unscoped=${a.slice(0, 300)} scoped=${b.slice(0, 300)}`);
    if (!s.legacy || !s.local) vac.push(tag), log(`§DDS_VACUOUS ${tag} scoped legacy=${s.legacy} local=${s.local} -- this table judged nothing`);
  }
  function ss_where(sp, id) { return D.scopeSpec(sp, id).where || ''; }
  if (!judged) { log('§DDS_SELFTEST INCONCLUSIVE nothing judged'); incon++; }
  else if (differs) { log(`§DDS_SELFTEST FAIL ${differs} table(s) differ between scoped(11) and unscoped (see §DDS_DIFFERS_DETAIL)`); fails++; }
  else log(`§DDS_SELFTEST PASS ${same - vac.length} tables SAME scoped(11) vs unscoped with rows on both sides, legacy rows judged=${judged}; vacuous (one side empty, listed not hidden): [${vac.join(',')}]`);

  // ---- vacuous control: a client with no rows
  {
    const sp = extra[0], v = D.scopeSpec(sp, 99999), L = await D.discover(cfg, v), r = D.compare(L, seed, v);
    if (!r.legacy) log(`§DDS_VACUOUS control client=99999 table=${sp.table} legacy_rows=0 -> reported as vacuous, verdict INCONCLUSIVE (PASS refused)`);
    else { log(`§DDS_VACUOUS control FAIL client 99999 returned ${r.legacy} rows`); fails++; }
  }

  // ---- natural-key mode on client 11
  for (const sp of extra.filter(e => e.natural)) {
    const ss = D.scopeSpec(sp, 11, { natural: true }), L = await D.discover(cfg, ss), r = D.compare(L, seed, ss);
    const idr = cache[sp.table].s;
    const dupL = L.length - new Set(L.map(row => ss.natural.map(c => String(row[c.toLowerCase()])).join('|'))).size;
    const ok = r.legacy === idr.legacy && r.local === idr.local;
    log(`§DDS_NATURAL ${sp.table} ${ok ? 'SAME_COUNTS' : 'DIFFERENT_COUNTS'} key=[${ss.natural.join(',')}] legacy=${r.legacy}/${idr.legacy} local=${r.local}/${idr.local} changed=${r.changed.length} onlyLegacy=${r.onlyLegacy.length} onlyLocal=${r.onlyLocal.length} dupNaturalKeys=${dupL} (FK *_id columns not compared in natural mode)`);
    if (!ok) { fails++; }
  }
  // ---- negative control on the SCOPED run: corrupt one cell, delete one row (c_doctype, client 11)
  {
    const c = cache['c_doctype']; const sp = c.ss, k = 'c_doctype_id';
    const pick = c.Ls.find(r => String(r[k]) === '135');
    const victim = c.Ls.find(r => String(r[k]) !== '135' && !c.s.onlyLegacy.includes(r) && !c.s.changed.some(x => x.id === String(r[k])));
    const was = seed.prepare('SELECT isautogenerateinout v FROM c_doctype WHERE c_doctype_id=135').get().v;
    const baseKeys = new Set(c.s.changed.map(x => x.id + '.' + x.col));
    seed.prepare('UPDATE c_doctype SET isautogenerateinout=? WHERE c_doctype_id=135').run(was === 'Y' ? 'N' : 'Y');
    seed.prepare('DELETE FROM c_doctype WHERE c_doctype_id=?').run(Number(victim[k]));
    const r1 = D.compare(c.Ls, seed, sp);
    const d1 = r1.changed.some(x => x.id === '135' && x.col === 'isautogenerateinout'), d2 = r1.onlyLegacy.some(r => String(r[k]) === String(victim[k]));
    const newOnes = r1.changed.filter(x => !baseKeys.has(x.id + '.' + x.col)).length;
    const ok = pick && d1 && d2 && newOnes === 1;
    log(`§DDS_NEG ${ok ? 'PASS' : 'FAIL'} scoped(11) detects corrupted 135.isautogenerateinout (was ${was})=${d1} and deleted doctype ${victim[k]}=${d2}; new changed cells=${newOnes}`); if (!ok) fails++;
    seed.prepare('UPDATE c_doctype SET isautogenerateinout=? WHERE c_doctype_id=135').run(was);   // scratch copy only
  }

  log(`§DDS_VERDICT ${fails ? 'FAIL' : incon ? 'INCONCLUSIVE' : 'PASS'}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§DDS_VERDICT HARNESS-FAIL ' + e.message); process.exit(1); });
