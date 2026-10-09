// §COVERAGE (user 2026-10-10: no "covered all" claim without a denominator) — reads a run_all log, prints ONE line:
//   models with scenarios N1 of dictionary doc tables N2 (tables carrying DocAction, from the SQLite seed dictionary = legacy's, §49) · cycles covered K of M · windows identical X of N.
// The scenario-prefix → document-table map below is DATA: which tables a scenario family drives on BOTH sides (read from the witnesses' descriptors). A prefix not in the map is reported, never guessed.
'use strict';
const fs = require('fs'), path = require('path');
const Database = require('better-sqlite3');
const log = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const DRIVES = {   // scenario id prefix → document tables it completes on both sides (witness_m3_gap.js / witness_fa_gap.js / cycle_o2c.js descriptors)
  S: ['C_Order', 'M_InOut', 'C_Invoice'], T1: ['C_Order', 'M_InOut', 'C_Invoice'], MV: ['M_Movement'], PAY: ['C_Payment', 'C_AllocationHdr'], INV: ['C_Invoice'], PI: ['M_Inventory'],
  FA: ['A_Asset_Addition', 'A_Depreciation_Entry'], REQ: ['M_Requisition'], CASH: ['C_Cash', 'C_Invoice', 'C_AllocationHdr'], O2C: ['C_Order', 'M_InOut', 'C_Invoice', 'C_Payment', 'C_AllocationHdr'], P2P: ['C_Order', 'M_InOut', 'C_Invoice', 'C_Payment', 'C_AllocationHdr'] };
const CYCLES = ['O2C', 'P2P'];   // cycles DEFINED in the spec (§64, §65)
const seed = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_seed_fullwidth.db'), { readonly: true });
const docTables = seed.prepare("SELECT DISTINCT t.tablename n FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id WHERE c.columnname='DocAction' AND t.isview='N' AND t.isactive='Y' ORDER BY 1").all().map(r => r.n);
const scn = log.map(l => /^§SCN (\S+) (\S+)/.exec(l)).filter(Boolean).map(m => ({ id: m[1], verdict: m[2] })).filter(s => !s.id.startsWith('NEG-'));
const prefixOf = id => Object.keys(DRIVES).sort((a, b) => b.length - a.length).find(p => id.startsWith(p) && /[0-9-]/.test(id.charAt(p.length)));
const tables = {}, unmapped = [];
for (const s of scn) { const p = prefixOf(s.id); if (!p) { unmapped.push(s.id); continue; } for (const t of DRIVES[p]) { tables[t] = tables[t] || { n: 0, match: 0 }; tables[t].n++; if (s.verdict === 'MATCH') tables[t].match++; } }
const withScn = docTables.filter(t => tables[t]), allMatch = withScn.filter(t => tables[t].match === tables[t].n);
const cyc = CYCLES.map(c => { const st = scn.filter(s => s.id.startsWith(c)); return { c, steps: st.length, ok: st.length > 0 && st.every(s => s.verdict === 'MATCH') }; });
const lf = log.map(l => /^§LF_WINDOWS pass=(\d+) of N=(\d+)/.exec(l)).filter(Boolean)[0], lfp = log.map(l => /^§LF_PATCHED .*pass=(\d+) of N=(\d+)/.exec(l)).filter(Boolean)[0];
console.log(`§COVERAGE models_with_scenarios=${withScn.length} of dictionary_doc_tables=${docTables.length} [${withScn.join(',')}] all_scenarios_MATCH=${allMatch.length} of ${withScn.length}` +
  ` · cycles_covered=${cyc.filter(x => x.ok).length} of ${CYCLES.length} [${cyc.map(x => `${x.c}:${x.steps ? (x.ok ? 'MATCH ' : 'GAP ') + x.steps + ' steps' : 'not run'}`).join(',')}]` +
  ` · windows_identical=${lf ? lf[1] + ' of ' + lf[2] : 'not run'}${lfp ? ' (' + lfp[1] + ' of ' + lfp[2] + ' after the generated dict patches, scratch only)' : ''}` +
  `${unmapped.length ? ' · UNMAPPED scenarios (not counted): ' + unmapped.join(',') : ''}`);
console.log(`§COVERAGE_NOT_COVERED ${docTables.filter(t => !tables[t]).join(',')}`);
