// ⚠ DO NOT REMOVE — Scope: facts.json for Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24). NO number is typed by hand: every fact is (a) a LIVE read-only query of
// build/erp/ad_full.db (command + output kept), (b) a line of build/scriptor/*.log, (c) a count of the engine's files by the stated command, (d) a number in prompts/TEAMWORK_FRAMEWORK.md §20, or (e) Film 1's
// facts.js (trace events + treat.log). A fact that cannot be read THROWS. Cross-checks between sources are asserted. Read the log after every run:  node facts2.js
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..'), SC = path.join(ROOT, 'build', 'scriptor'), DB = 'build/erp/ad_full.db';
const { buildFacts } = require('../facts.js');
const rd = f => fs.readFileSync(f, 'utf8');
function build() {
  const R = buildFacts(), F = R.F, SRC = R.SRC, Q = [];
  const put = (k, v, src) => { if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) throw new Error('fact ' + k + ' unreadable from ' + src); F[k] = v; SRC[k] = src; return v; };
  const eq = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('cross-check failed: ' + what + ' ' + JSON.stringify(a) + ' != ' + JSON.stringify(b)); };
  const grab = (txt, re, what) => { const m = re.exec(txt); if (!m) throw new Error('not found in source: ' + what + ' ' + re); return m; };
  const sql = (id, s) => { const out = execFileSync('sqlite3', ['-readonly', path.join(ROOT, DB), s], { encoding: 'utf8' }).trim(); const cmd = 'sqlite3 -readonly ' + DB + ' "' + s + '"'; Q.push({ id, cmd, out }); return out; };
  const L = f => rd(path.join(SC, f));
  const S1 = L('s1.log'), DRY = L('dryrun.log'), REG = L('registry.log'), VIR = L('virtual.log'), MESH = L('mesh.log'), TL = L('treat.log');
  // ---- (a) live dictionary queries ----
  const q1 = sql('tables', "select count(*) from ad_table; select count(*) from ad_table where isactive='Y'; select count(*) from ad_column;").split('\n').map(Number);
  put('adTables', q1[0], 'live query "tables" (ad_full.db)'); put('adActive', q1[1], 'live query "tables"'); put('adColumns', q1[2], 'live query "tables"');
  const si = grab(S1, /§S1_INPUT ad_full.db tables=(\d+) activeTables=(\d+) columns=(\d+)/, '§S1_INPUT'); eq([+si[1], +si[2], +si[3]], q1, 'live counts == s1.log §S1_INPUT');
  const ER1 = "select count(*) from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id join ad_ref_table rt on rt.ad_reference_id=c.ad_reference_value_id where c.isactive='Y' and t.isactive='Y' and c.ad_reference_id in (18,200233,30,200235,200162,200163) and c.ad_reference_value_id is not null and c.ad_reference_value_id<>0;";
  const REN = "'SalesRep_ID','C_DocTypeTarget_ID','Bill_BPartner_ID','Bill_Location_ID','BillTo_ID','Account_ID','C_LocFrom_ID','C_LocTo_ID','BP_Location_ID','C_UOM_To_ID','M_AttributeSetInstanceTo_ID','M_LocatorTo_ID','AD_OrgBP_ID','AD_OrgTrx_ID','AD_OrgTo_ID'";
  const ER2 = "select count(*) from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id join ad_table t2 on lower(t2.tablename)=lower(substr(c.columnname,1,length(c.columnname)-3)) where c.isactive='Y' and t.isactive='Y' and t2.isactive='Y' and (c.ad_reference_id in (19,200234) or (c.ad_reference_id in (18,200233,30,200235,200162,200163) and (c.ad_reference_value_id is null or c.ad_reference_value_id=0))) and (c.columnname like '%\\_ID' escape '\\' or c.columnname like '%\\_UU' escape '\\') and c.columnname not in (" + REN + ");";
  const ER4 = "select count(*) from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id join ad_table t2 on lower(t2.tablename)=case c.ad_reference_id when 21 then 'c_location' when 25 then 'c_validcombination' when 31 then 'm_locator' when 35 then 'm_attributesetinstance' end where c.isactive='Y' and t.isactive='Y' and t2.isactive='Y' and c.ad_reference_id in (21,25,31,35);";
  const e1 = +sql('er1', ER1), e2 = +sql('er2', ER2), e4 = +sql('er4', ER4);
  const wr = grab(S1, /W-FLOW-REFS — ER-1 js=(\d+) sql=(\d+) \(js-only 0, sql-only 0\); ER-2 js=(\d+) sql=(\d+) \(js-only 0, sql-only 0\); ER-4 js=(\d+) sql=(\d+) \(js-only 0, sql-only 0\)/, 'W-FLOW-REFS');
  eq([+wr[1], +wr[2], +wr[3], +wr[4], +wr[5], +wr[6]], [e1, e1, e2, e2, e4, e4], 'live ER counts == s1.log W-FLOW-REFS (js == sql == live)');
  put('er1', e1, 'live query "er1" == s1.log W-FLOW-REFS'); put('er2', e2, 'live query "er2" == s1.log W-FLOW-REFS'); put('er4', e4, 'live query "er4" == s1.log W-FLOW-REFS');
  const ge = grab(S1, /§S1_UNRESOLVED global edges=(\d+) unresolved=(\d+)/, 'global edges'); put('edges', +ge[1], 's1.log §S1_UNRESOLVED global edges'); eq(e1 + e2 + e4, F.edges, 'ER-1 + ER-2 + ER-4 == global edges'); put('edgesUnresolved', +ge[2], 's1.log §S1_UNRESOLVED');
  const olc = sql('orderline_cols', "select count(*) from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id where t.tablename='C_OrderLine' and c.isactive='Y';");
  const olt = sql('orderline_types', "select r.name, count(*) from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id join ad_reference r on r.ad_reference_id=c.ad_reference_id where t.tablename='C_OrderLine' and c.isactive='Y' group by r.name order by 2 desc, 1;");
  const olcols = sql('orderline_names', "select c.columnname, r.name from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id join ad_reference r on r.ad_reference_id=c.ad_reference_id where t.tablename='C_OrderLine' and c.isactive='Y' order by c.columnname;").split('\n').map(x => x.split('|'));
  put('olCols', +olc, 'live query "orderline_cols"'); eq(olcols.length, F.olCols, 'column list length == count');
  const types = olt.split('\n').map(x => x.split('|')); eq(types.reduce((n, x) => n + +x[1], 0), F.olCols, 'type groups sum to the column count'); F.olTypes = types.map(x => [x[0], +x[1]]); SRC.olTypes = 'live query "orderline_types"'; F.olNames = olcols; SRC.olNames = 'live query "orderline_names"';
  const wm = grab(S1, /W-FLOW-MINIMAL — F1 (\d+)\/(\d+) cols, F2 (\d+)\/(\d+)/, 'W-FLOW-MINIMAL'); eq(+wm[2], F.olCols, 's1.log table columns == live count'); put('wire', +wm[1], 's1.log W-FLOW-MINIMAL'); put('wire2', +wm[3], 's1.log W-FLOW-MINIMAL'); put('table2Cols', +wm[4], 's1.log W-FLOW-MINIMAL');
  const pay = grab(S1, /§S1_FLOW F1 [^\n]*\n\s+payload: ([^\n]*)\n\s+implicit: ([^\n]*?)\s+baseRequirement: ([^\n]*)\n\s+mandatory-uncarried [^\n]*: ([^\n]*)/, 'F1 payload');
  F.payloadList = pay[1].split(', '); SRC.payloadList = 's1.log §S1_FLOW F1 payload'; F.implicitList = pay[2].split(', '); SRC.implicitList = 's1.log §S1_FLOW F1 implicit'; F.mandList = pay[4].split(', '); SRC.mandList = 's1.log §S1_FLOW F1 mandatory-uncarried';
  eq(F.payloadList.length + F.implicitList.length, F.wire, 'payload (3) + implicit (3) == 6'); put('mand', F.mandList.length, 's1.log §S1_FLOW F1 mandatory-uncarried (list length)'); eq(F.mand, +grab(S1, /W-FLOW-MANDATORY — F1 leaves (\d+)/, 'W-FLOW-MANDATORY')[1], 'mandatory list == W-FLOW-MANDATORY');
  put('derivedLine', grab(S1, /(W-FLOW-NO-DERIVED — [^\n]*)/, 'NO-DERIVED')[1], 's1.log W-FLOW-NO-DERIVED'); put('mandLine', grab(S1, /(W-FLOW-MANDATORY — [^\n]*)/, 'MANDATORY')[1], 's1.log W-FLOW-MANDATORY');
  put('wireDerived', 0, 's1.log W-FLOW-NO-DERIVED "F1 derived carried 0"'); grab(S1, /F1 derived carried 0, F2 0/, 'derived carried 0');
  // strategy 100 (the query the dry-run witness uses, witness_scriptor_dryrun.js:75)
  const st = sql('strategy100', "select rt.replicationtype, count(*) from ad_replicationtable rt join ad_table t on t.ad_table_id=rt.ad_table_id where rt.ad_replicationstrategy_id=100 and rt.isactive='Y' and t.isactive='Y' group by rt.replicationtype order by rt.replicationtype;");
  const T = {}; st.split('\n').forEach(x => { const a = x.split('|'); T[a[0]] = +a[1]; });
  put('stratM', T.M, 'live query "strategy100"'); put('stratR', T.R, 'live query "strategy100"'); put('stratL', T.L, 'live query "strategy100"'); put('stratUnlisted', F.adActive - (T.M + T.R + T.L + (T.B || 0)), 'derived: active tables - listed');
  const dm = grab(DRY, /strategy 100 typing re-measured: active tables=(\d+) M=(\d+) R=(\d+) L=(\d+) B=(\d+) unlisted=(\d+)/, 'dryrun typing'); eq([+dm[1], +dm[2], +dm[3], +dm[4], +dm[5], +dm[6]], [F.adActive, F.stratM, F.stratR, F.stratL, T.B || 0, F.stratUnlisted], 'live strategy counts == dryrun.log');
  // ---- (b) the witness logs ----
  const verd = (txt, tag) => { const m = grab(txt, new RegExp('(§' + tag + ' PASS judged=(\\d+) fails=(\\d+)[^\\n]*)'), tag); return { line: m[1], judged: +m[2], fails: +m[3] }; };
  const vs1 = verd(S1, 'S1_VERDICT'), vtr = verd(TL, 'TREAT_VERDICT'), vrg = verd(REG, 'REG_VERDICT'), vvi = verd(VIR, 'VIRT_VERDICT'), vme = verd(MESH, 'MESH_VERDICT'), vdr = verd(DRY, 'DRY_VERDICT');
  [['s1', vs1], ['treat', vtr], ['reg', vrg], ['virt', vvi], ['mesh', vme], ['dry', vdr]].forEach(([k, v]) => { if (v.fails !== 0) throw new Error(k + ' verdict has fails'); put('v_' + k, v.judged, k + ' log verdict judged'); F['vline_' + k] = v.line; SRC['vline_' + k] = k + ' log verdict'; });
  put('s1Inconclusive', +grab(S1, /S1_VERDICT PASS judged=\d+ fails=0 inconclusive=(\d+)/, 's1 inconclusive')[1], 's1.log §S1_VERDICT'); put('virtVacuous', +grab(VIR, /VIRT_VERDICT PASS judged=\d+ fails=0 vacuous=(\d+)/, 'virt vacuous')[1], 'virtual.log §VIRT_VERDICT'); put('dryOpen', +grab(DRY, /DRY_VERDICT PASS judged=\d+ fails=0 open=(\d+)/, 'dry open')[1], 'dryrun.log §DRY_VERDICT');
  const zc = grab(S1, /\(2\) every new row compiles with G1-G6 evaluated, no error — (\d+)\/(\d+) flows: ([^\n]*)/, 'ZERO-CODE (2)'); put('zcFlows', +zc[1], 's1.log W-FLOW-ZERO-CODE (2)'); eq(+zc[1], +zc[2], 'all new rows compile'); F.zcList = zc[3]; SRC.zcList = 's1.log W-FLOW-ZERO-CODE (2)';
  put('zcHash', grab(S1, /\(3\) compiler code hash identical before and after the rows were added — (\S+)/, 'zc hash')[1], 's1.log W-FLOW-ZERO-CODE (3)'); put('zcTypo', grab(S1, /\(4\) a deliberately wrong row turns red \(the test can fail\) — declaredMissing=(\[[^\]]*\])/, 'zc typo')[1], 's1.log W-FLOW-ZERO-CODE (4)');
  put('regHash', grab(REG, /core files sha256 identical before and after the new treatment was added — (\S+)/, 'reg hash')[1], 'registry.log W-REG-ZEROCODE'); put('regAcks', +grab(REG, /ack reached the hub once across two cycles\) — loaded=\S+ validate=\[\] acks=(\d+)/, 'reg acks')[1], 'registry.log W-REG-ZEROCODE');
  put('regMutants', (REG.split('§W-REG-MUTANTS')[1].match(/🟢/g) || []).length, 'registry.log W-REG-MUTANTS (green arms)'); put('treatMutants', (TL.split('§W-TREAT-MUTANTS')[1].split('§TREAT_TRACE')[0].match(/🟢/g) || []).length, 'treat.log W-TREAT-MUTANTS (green arms)');
  const vp = grab(VIR, /bim_element row compiles as a virtual table — error=undefined tableType=virtual cols=(\d+) payload=(\d+) \((\d+) carried \+ key\)/, 'virtual compile'); put('virtCols', +vp[1], 'virtual.log W-VIRT-COMPILE'); put('virtPayload', +vp[2], 'virtual.log W-VIRT-COMPILE'); put('virtCarried', +vp[3], 'virtual.log W-VIRT-COMPILE');
  put('virtTypo', grab(VIR, /a typo'd carried column is declaredMissing — declaredMissing=(\[[^\]]*\])/, 'virt typo')[1], 'virtual.log W-VIRT-TYPO');
  put('virtMutants', (VIR.split('§W-VIRT-MUTANTS')[1].match(/🟢/g) || []).length, 'virtual.log W-VIRT-MUTANTS'); put('meshMutants', (MESH.split('§W-MESH-MUTANTS')[1].match(/🟢/g) || []).length, 'mesh.log W-MESH-MUTANTS');
  const dd = grab(DRY, /D5 shared-by-rows \(list values \+ the move\) equals Object.keys\(CLASS\) — (\d+) vs (\d+)/, 'D5'); eq(dd[1], dd[2], 'D5'); put('drySharedOps', +dd[1], 'dryrun.log D5');
  const d2 = grab(DRY, /D2 [^\n]*\((\d+) vs (\d+)\)/, 'D2'); eq(d2[1], d2[2], 'D2'); put('dryValues', +d2[1], 'dryrun.log D2');
  const d1 = grab(DRY, /D1 the Modeller rows compile: (\d+) virtual table \+ (\d+) FACT row/, 'D1'); put('dryVirtual', +d1[1], 'dryrun.log D1'); put('dryRows', +d1[2], 'dryrun.log D1');
  const d6 = grab(DRY, /D6 shared \((\d+)\) is inside N=(\d+); local-only = the (\d+) names/, 'D6'); put('dryAllOps', +d6[2], 'dryrun.log D6'); put('dryLocalOps', +d6[3], 'dryrun.log D6'); eq(+d6[1], F.drySharedOps, 'D6 shared == D5');
  const d7 = grab(DRY, /D7 the (\d+) declared-Local rows equal the adapter's STATION_LOCAL/, 'D7'); put('dryLocalRows', +d7[1], 'dryrun.log D7');
  const d8 = grab(DRY, /shared-by-default today = (\d+) of (\d+) active tables .*? shared by default-deny with the Merge rows = (\d+) · tables that would STOP being shared = (\d+) \((\d+)%\)/, 'D8b'); put('erpShared', +d8[1], 'dryrun.log D8b'); put('erpDeny', +d8[3], 'dryrun.log D8b'); put('erpStop', +d8[4], 'dryrun.log D8b'); put('erpStopPct', +d8[5], 'dryrun.log D8b'); eq(+d8[2], F.adActive, 'D8b active tables'); eq(F.erpShared, F.adActive - F.dryLocalRows, 'shared today = active - STATION_LOCAL'); eq(F.erpDeny, F.stratM, 'default-deny shares exactly the Merge rows');
  const d8c = grab(DRY, /D8c [^\n]*in the Merge set (\d+)\/(\d+)/, 'D8c'); put('g9In', +d8c[1], 'dryrun.log D8c'); put('g9Of', +d8c[2], 'dryrun.log D8c'); put('g9Out', F.g9Of - F.g9In, 'dryrun.log D8c (of - in)');
  // ---- (c) file counts: the engine, counted here by the stated command ----
  const CMD = "grep -vE '^[[:space:]]*($|//|/\\*|\\*)' <file> | wc -l      (non-blank, non-comment lines; run from build/scriptor/)";
  const cnt = f => rd(path.join(SC, f)).split('\n').filter(l => !/^\s*($|\/\/|\/\*|\*)/.test(l)).length;
  const cnt2 = f => +execFileSync('bash', ['-c', "grep -vE '^[[:space:]]*($|//|/\\*|\\*)' " + f + ' | wc -l'], { cwd: SC, encoding: 'utf8' }).trim();
  const C = {}; ['treat.js', 'sim.js', 'treatments/fact.js', 'treatments/instrument.js', 'treatments/seed.js', 'treatments/rule.js', 'treatments/local.js', 'scope.js', 'flow.js', 'compile.js'].forEach(f => { C[f] = cnt(f); eq(C[f], cnt2(f), 'node count == grep count ' + f); });
  put('linesCore', C['treat.js'] + C['sim.js'], 'count: treat.js ' + C['treat.js'] + ' + sim.js ' + C['sim.js']); put('linesComponents', ['fact', 'instrument', 'seed', 'rule', 'local'].reduce((n, k) => n + C['treatments/' + k + '.js'], 0), 'count: treatments/*.js');
  put('linesEngine', F.linesCore + F.linesComponents, 'count: core + components'); put('linesToolchain', C['scope.js'] + C['flow.js'] + C['compile.js'], 'count: scope.js ' + C['scope.js'] + ' + flow.js ' + C['flow.js'] + ' + compile.js ' + C['compile.js']);
  eq([F.linesCore, F.linesComponents, F.linesEngine, F.linesToolchain], [93, 129, 222, 274], 'line counts == the coordinator-verified 93 / 129 / 222 / 274 (2026-10-25)');
  put('lineCommand', CMD, 'facts2.js (the counting command, recorded)'); F.lineEach = C; SRC.lineEach = CMD;
  eq(F.linesToolchain, +grab(S1, /S1_ZERO_CODE_NUMBERS [^\n]*total=(\d+)/, 'toolchain total')[1], 'toolchain count == s1.log §S1_ZERO_CODE_NUMBERS');
  // ---- (d) the sale path makes no call; adapters from §20 ----
  const lo = grab(TL, /W-TREAT-LOCAL — a sale made (\d+) pipe calls; scanning a cashier code made (\d+); control: one visit made (\d+)/, 'W-TREAT-LOCAL'); put('salePipeCalls', +lo[1], 'treat.log W-TREAT-LOCAL'); put('codePipeCalls', +lo[2], 'treat.log W-TREAT-LOCAL'); put('visitPipeCalls', +lo[3], 'treat.log W-TREAT-LOCAL (control)');
  const FW = rd(path.join(ROOT, 'prompts', 'TEAMWORK_FRAMEWORK.md')); const ad = grab(FW, /Of ~(\d+) adapter lines about \*\*(\d+)\*\* \(≈(\d+) %\) decide what is shared; the other ≈(\d+) %/, '§20 adapters');
  put('adapterLines', +ad[1], 'TEAMWORK_FRAMEWORK.md §20 verdict (a grep-based estimate)'); put('adapterDecide', +ad[2], 'TEAMWORK_FRAMEWORK.md §20'); put('adapterPct', +ad[3], 'TEAMWORK_FRAMEWORK.md §20'); put('adapterStayPct', +ad[4], 'TEAMWORK_FRAMEWORK.md §20'); eq(F.adapterPct + F.adapterStayPct, 100, '2 % + 98 %');
  const fm = JSON.parse(rd(path.join(SC, 'flows_modeller.json'))), fe = JSON.parse(rd(path.join(SC, 'flows_erp.json')));
  put('stationLocalRows', fe.length, 'flows_erp.json (row count)'); eq(F.stationLocalRows, F.dryLocalRows, 'rows == D7');
  return { F, SRC, Q, R, flows: R.flows, flowsModeller: fm, flowsErp: fe };
}
module.exports = { build };
if (require.main === module) { const r = build(); Object.keys(r.F).forEach(k => { if (!/^(olNames|lineEach)$/.test(k)) console.log('§FACT2 ' + k + '=' + JSON.stringify(r.F[k]).slice(0, 160)); }); r.Q.forEach(q => console.log('§QUERY ' + q.id + ' => ' + q.out.replace(/\n/g, ' ; ').slice(0, 120)));
  console.log('§FACTS2_DONE n=' + Object.keys(r.F).length + ' queries=' + r.Q.length + ' (all cross-checks passed)'); }
