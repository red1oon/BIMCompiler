// ⚠ DO NOT REMOVE — LOOK & FEEL parity witness (spec prompts/SQLiteIDEMPIERE.md §49, cardinal rule 3). READ THE LOG.
// Legacy dictionary (local pilot, read-only WS types) vs the dictionary the SQLite window engine renders from (a SCRATCH COPY of
// ~/bim-ootb/erp/ad_seed.db — the shipped file is never modified). Two questions, answered separately:
//   §LF_TABLE / §LF_GAP   which dictionary rows/cells/columns/tables differ (DATA + SCHEMA class) → reviewable patches in out/lf_*.sql
//   §LF_WINDOWS           X of N legacy windows whose tab + field structure is identical (N = legacy windows, the dictionary denominator)
// Controls: §LF_NEG (a changed field label must FAIL its window), §LF_PATCHED (the generated patches applied to the scratch copy ⇒ X' of N).
// Honest bound: DICTIONARY-level parity only; what the renderer computes at runtime is the next layer (not claimed here).
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
const { cfgFromEnv } = require('./ad_client');
const D = require('./dict_diff');
const specs = require('./dict_spec_lf.json');
const log = l => console.log(l);
let fails = 0, incon = 0;
const out = (tag, ok, msg) => { log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };
const lc = r => { const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };
const n = v => (v === null || v === undefined || v === '') ? null : (/^-?\d+(\.\d+)?$/.test(String(v)) ? String(Number(v)) : (v === true ? 'Y' : v === false ? 'N' : String(v)));

const UI_SRC = process.env.BRIDGE_UI_DB || path.join(os.homedir(), 'bim-ootb', 'erp', 'ad_seed.db');

// window structure from row sets (same function for both sides — the comparison cannot favour one)
function structure(rows) {
  const col = new Map(rows.ad_column.map(c => [n(c.ad_column_id), c]));
  const tabsBy = new Map(); for (const t of rows.ad_tab.filter(t => n(t.isactive) !== 'N')) { const w = n(t.ad_window_id); if (!tabsBy.has(w)) tabsBy.set(w, []); tabsBy.get(w).push(t); }
  const fieldsBy = new Map(); for (const f of rows.ad_field.filter(f => n(f.isactive) !== 'N')) { const t = n(f.ad_tab_id); if (!fieldsBy.has(t)) fieldsBy.set(t, []); fieldsBy.get(t).push(f); }
  const ord = (a, b) => (Number(a.seqno) - Number(b.seqno)) || (Number(a.ad_field_id || a.ad_tab_id) - Number(b.ad_field_id || b.ad_tab_id));
  const W = new Map();
  for (const w of rows.ad_window.filter(w => n(w.isactive) !== 'N')) {
    const id = n(w.ad_window_id);
    const tabs = (tabsBy.get(id) || []).slice().sort(ord).map(t => {
      const flds = (fieldsBy.get(n(t.ad_tab_id)) || []).slice().sort(ord).map(f => { const c = col.get(n(f.ad_column_id)) || {};
        return [n(f.name), n(f.seqno), n(f.isdisplayed), n(f.isreadonly), n(f.displaylogic), n(f.issameline), n(c.columnname), n(c.ismandatory), n(c.ad_reference_id), n(c.defaultvalue)].join('¦'); });
      return { head: [n(t.name), n(t.seqno), n(t.tablevel), n(t.ad_table_id), n(t.isreadonly), n(t.whereclause)].join('¦'), fields: flds };
    });
    W.set(id, { name: n(w.name), tabs });
  }
  return W;
}
const FIELD_ATTR = ['name', 'seqno', 'isdisplayed', 'isreadonly', 'displaylogic', 'issameline', 'columnname', 'ismandatory', 'ad_reference_id', 'defaultvalue'];
const TAB_ATTR = ['name', 'seqno', 'tablevel', 'ad_table_id', 'isreadonly', 'whereclause'];
function firstDiff(a, b) {   // legacy window vs SQLite window → null (equal) or a short reason
  if (!b) return 'window missing in SQLite';
  if (a.tabs.length !== b.tabs.length) return `tabs ${a.tabs.length} vs ${b.tabs.length}`;
  for (let i = 0; i < a.tabs.length; i++) {
    const x = a.tabs[i], y = b.tabs[i];
    if (x.head !== y.head) { const p = x.head.split('¦'), q = y.head.split('¦'), k = p.findIndex((v, j) => v !== q[j]); return `tab#${i + 1} ${TAB_ATTR[k]} "${p[k]}" vs "${q[k]}"`; }
    if (x.fields.length !== y.fields.length) return `tab#${i + 1} "${x.head.split('¦')[0]}" fields ${x.fields.length} vs ${y.fields.length}`;
    for (let j = 0; j < x.fields.length; j++) if (x.fields[j] !== y.fields[j]) {
      const p = x.fields[j].split('¦'), q = y.fields[j].split('¦'), k = p.findIndex((v, m) => v !== q[m]);
      return `tab#${i + 1} field#${j + 1} "${p[0]}" ${FIELD_ATTR[k]} "${p[k]}" vs "${q[k]}"`;
    }
  }
  return null;
}
function score(L, S) {
  const res = []; for (const [id, w] of L) res.push({ id, name: w.name, diff: firstDiff(w, S.get(id)) });
  return { pass: res.filter(r => !r.diff).length, n: res.length, res };
}
const uiRows = db => Object.fromEntries(['ad_window', 'ad_tab', 'ad_field', 'ad_column'].map(t => [t, db.prepare(`SELECT * FROM ${t}`).all().map(lc)]));

(async () => {
  if (!fs.existsSync(UI_SRC) || fs.statSync(UI_SRC).size < 1e6) { out('§LF_VERDICT', 'INCONCLUSIVE', `UI dictionary not available (${UI_SRC})`); log(`§LF_VERDICT INCONCLUSIVE`); process.exit(0); }
  const cfg = cfgFromEnv();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lf-')), scratch = path.join(tmp, 'ui.db');
  fs.copyFileSync(UI_SRC, scratch); const db = new Database(scratch);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });

  // ---- step 1: table diffs (DATA + SCHEMA class)
  const legacy = {}, results = {};
  for (const sp of specs) {
    legacy[sp.table] = await D.discover(cfg, sp);
    const r = D.compare(legacy[sp.table], db, sp); results[sp.table] = r;
    if (r.missingTable) log(`§LF_TABLE ${sp.table} MISSING-IN-SQLITE legacy=${r.legacy}`);
    else {
      const byCol = {}; r.changed.forEach(c => { byCol[c.col] = (byCol[c.col] || 0) + 1; });
      log(`§LF_TABLE ${sp.table} legacy=${r.legacy} local=${r.local} cols_compared=${r.columns} onlyLegacy=${r.onlyLegacy.length} onlyLocal=${r.onlyLocal.length} changed_cells=${r.changed.length} by_col=${JSON.stringify(byCol)}`);
      if (r.missingCols.length) log(`§LF_COLUMNS ${sp.table} legacy-has-but-sqlite-lacks=[${r.missingCols.join(',')}]`);
      for (const c of r.changed.slice(0, 3)) log(`§LF_GAP ${sp.table}#${c.id}.${c.col} legacy=${JSON.stringify(c.legacy)} sqlite=${JSON.stringify(c.local)}`);
      // rows only the SQLite UI has: a user would see them, legacy users would not — reported (patches never delete), decision belongs to the ledger
      if (r.onlyLocal.length && ['ad_window', 'ad_menu', 'ad_tab'].includes(sp.table)) {
        const k = [].concat(sp.key)[0].toLowerCase(), nm = db.prepare(`SELECT ${k} id, name FROM ${sp.table} WHERE ${k}=?`);
        log(`§LF_ONLY_SQLITE ${sp.table} ${r.onlyLocal.slice(0, 12).map(id => { const x = nm.get(Number(id)); return id + ':' + (x ? x.name || x.Name : '?'); }).join(' | ')}`);
      }
    }
    // the patch: missing rows + changed cells (legacy values) + the whole table when missing; added columns would need an explicit list (reported above)
    fs.writeFileSync(path.join(__dirname, 'out', `lf_patch_${sp.table}.sql`), r.missingTable ? D.toSchemaPatch(r, sp) : D.toPatch(r, sp));
  }
  const total = Object.values(results).reduce((a, r) => a + r.legacy, 0);
  if (!total) out('§LF_TABLES', 'INCONCLUSIVE', 'legacy returned 0 rows'); else log(`§LF_TABLES legacy_rows=${total} patches=out/lf_patch_*.sql (NOT applied to any shipped db)`);

  // ---- step 2: X of N windows
  const L = structure(Object.fromEntries(['ad_window', 'ad_tab', 'ad_field', 'ad_column'].map(t => [t, legacy[t]])));
  const before = score(L, structure(uiRows(db)));
  const reasons = {}; before.res.filter(r => r.diff).forEach(r => { const k = r.diff.replace(/".*$/, '').replace(/#\d+/g, '#').trim(); reasons[k] = (reasons[k] || 0) + 1; });
  log(`§LF_WINDOWS pass=${before.pass} of N=${before.n} (dictionary-level: tabs + fields + column attributes identical)`);
  log(`§LF_WINDOWS_REASONS ${JSON.stringify(reasons)}`);
  for (const r of before.res.filter(r => r.diff).slice(0, 8)) log(`§LF_WINDOW_FAIL ${r.id} "${r.name}" first-diff: ${r.diff}`);
  if (!before.n) out('§LF_NOT_VACUOUS', 'INCONCLUSIVE', 'no legacy windows'); else out('§LF_NOT_VACUOUS', true, `N=${before.n} legacy windows judged`);

  // ---- negative control: change one field label of a PASSing window on the scratch copy ⇒ that window must FAIL
  const ok1 = before.res.find(r => !r.diff);
  if (ok1) {
    const w = structure(uiRows(db)).get(ok1.id), tabId = db.prepare('SELECT ad_tab_id FROM ad_tab WHERE ad_window_id=? AND isactive=\'Y\' ORDER BY seqno LIMIT 1').get(Number(ok1.id));
    const fld = db.prepare("SELECT ad_field_id, name FROM ad_field WHERE ad_tab_id=? AND isactive='Y' ORDER BY seqno LIMIT 1").get(tabId.ad_tab_id || tabId.AD_Tab_ID);
    const fid = fld.ad_field_id || fld.AD_Field_ID, oldName = fld.name || fld.Name;
    db.prepare('UPDATE ad_field SET name=? WHERE ad_field_id=?').run(oldName + ' X', fid);
    const neg = firstDiff(L.get(ok1.id), structure(uiRows(db)).get(ok1.id));
    db.prepare('UPDATE ad_field SET name=? WHERE ad_field_id=?').run(oldName, fid);
    out('§LF_NEG', !!neg && /name/.test(neg), `window ${ok1.id} "${ok1.name}" with field ${fid} relabelled ⇒ ${neg || 'NOT DETECTED'}`);
    void w;
  } else out('§LF_NEG', 'INCONCLUSIVE', 'no passing window to corrupt');

  // ---- patched: apply every generated patch to the scratch copy ⇒ X' of N (the DATA/SCHEMA class closed mechanically?)
  let applied = 0, errs = [];
  for (const sp of specs) { try { D.applyPatch(db, fs.readFileSync(path.join(__dirname, 'out', `lf_patch_${sp.table}.sql`), 'utf8')); applied++; } catch (e) { errs.push(sp.table + ':' + e.message.slice(0, 80)); } }
  const after = score(L, structure(uiRows(db)));
  log(`§LF_PATCHED applied=${applied}/${specs.length} errors=${errs.join(';') || 'none'} pass=${after.pass} of N=${after.n}`);
  for (const r of after.res.filter(r => r.diff).slice(0, 5)) log(`§LF_WINDOW_FAIL_AFTER_PATCH ${r.id} "${r.name}" first-diff: ${r.diff}`);
  out('§LF_PATCH_EFFECT', after.pass >= before.pass && !errs.length, `before=${before.pass}/${before.n} after=${after.pass}/${after.n} (patches never delete; a remaining FAIL is a row SQLite has that legacy does not, or a column outside the patch)`);
  log(`§LF_FINDINGS windows_equal=${before.pass}/${before.n} after_patch=${after.pass}/${after.n} — the product, not a harness failure`);
  log(`§LF_VERDICT ${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§LF_VERDICT FAIL exception ' + e.stack); process.exit(2); });
