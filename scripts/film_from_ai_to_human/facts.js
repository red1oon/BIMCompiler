#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "From AI to Human" (bim-compiler prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md, FILM "From AI to Human"): runs every AFTER command the film shows through the door on a bim-ootb checkout
// and keeps the real answers; the BEFORE side is read from files in bim-compiler (measured) or quoted as the assistant typed it on 2026-11-11 (source tagged). READ out/facts.log after a run.
// Nothing here is typed by hand into the film: cards.js prints out/facts.json. Needs the legacy test stack UP (legacy.status) and legacy order 50981 (the 2026-11-10 hand check).
// Usage: OOTB=<bim-ootb checkout at main> COMPILER=<bim-compiler checkout with origin/master fetched> node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB, COMP = process.env.COMPILER || path.join(os.homedir(), 'bim-compiler');
if (!OOTB || !fs.existsSync(path.join(OOTB, 'common/door/door.js'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at main'); process.exit(2); }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a2h_'));
const env = Object.assign({}, process.env, { BIM_OBJECT_OPLOG: path.join(dir, 'ops.jsonl'), BIM_DOOR_JOURNAL: path.join(dir, 'journal.jsonl'), NODE_OPTIONS: '--dns-result-order=ipv4first' });
const L = (m) => console.log('§FACTS ' + m);
const out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), lines: {}, before: {} };
const door = (id, line, actor) => {
  const a = [path.join(OOTB, 'common/door/door.js')].concat(actor ? ['--actor', actor, '--request', 'film-' + id] : [], [line]);
  const r = spawnSync(process.execPath, a, { env, encoding: 'utf8', maxBuffer: 1 << 26 });
  let j; try { j = JSON.parse(r.stdout.trim().split('\n').pop()); } catch (e) { throw new Error(id + ': no JSON (' + String(r.stderr).slice(-200) + ')'); }
  out.lines[id] = { line, status: j.status }; L(id + ' ' + j.status + ' ' + line); return j;
};
const show = (rel) => { const r = spawnSync('git', ['-C', COMP, 'show', 'origin/master:' + rel], { encoding: 'utf8', maxBuffer: 1 << 26 }); if (r.status !== 0) throw new Error('not on origin/master: ' + rel); return r.stdout; };
try {
  // ---- BEFORE (measured from files, or quoted as typed; the source is printed on the card)
  const tw = show('scripts/bridge/witness_erp_new_twin.js'), twLog = show('scripts/bridge/out/erpnew_twin_2026-11-10.log');
  out.before.twin = { file: 'scripts/bridge/witness_erp_new_twin.js', lines: tw.split('\n').length - 1, head: tw.split('\n').slice(0, 3).map(s => s.slice(0, 118)), logDiffs: twLog.split('\n').filter(l => /ERPNEW_TWIN (HEAD|LINE) DIFF/.test(l)).length };
  const typed = 'typed by the assistant on 11 November 2026';
  out.before.column = { source: typed, cmd: "docker exec postgres psql -U adempiere -d idempiere_pilot -x -c \"select c.columnname,c.defaultvalue,c.ad_val_rule_id,c.ad_reference_id from ad_column c join ad_table t using(ad_table_id) where t.tablename='C_Order' and c.columnname='C_ConversionType_ID'\"" };
  out.before.where = { source: typed, cmd: "grep -n \"INVOICERULE\\|\\\"InvoiceRule\\\"\\|IsDiscountPrinted\\|C_ConversionType_ID\" $F | head -20" };
  out.before.witness = { source: typed, cmd: "grep -E \"❌|^§WITNESS\" ~/.cache/bim_bridge/a7c_witness.log | cut -c1-220" };
  out.before.status = { source: typed, cmd: "docker ps --format '{{.Names}}'; curl -s -o /dev/null -w \"pilot %{http_code}\\n\" http://localhost:8088/webui/" };
  out.before.pack = { source: 'the script, before the verb (Fast Script Guide)', cmd: 'node erp/tools/xlsx_pack.js erp/plugins/models/BIM_Document.xlsx --version 1.0.0 --out plugin/META-INF --java plugin/src --package org.kernel.bim.model' };
  // ---- AFTER (real runs)
  const st = door('status', 'legacy.status'); if (st.status !== 'ok' || st.answer.verdict !== 'UP') throw new Error('the legacy stack is not UP: ' + JSON.stringify(st.answer && st.answer.summary));
  out.status = { verdict: st.answer.verdict, summary: st.answer.summary };
  const h = door('new_order', 'erp.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101'); if (h.status !== 'ok') throw new Error('erp.new: ' + h.why);
  door('new_line', 'erp.new kind=C_OrderLine order=' + h.answer.number + ' m_product_id=137 qtyentered=2');
  const cmp = door('compare', 'erp.compare kind=Order number=' + h.answer.number + ' legacy=50981'); if (cmp.status !== 'ok') throw new Error('erp.compare: ' + cmp.why);
  out.compare = { twinNumber: h.answer.number, legacyNumber: cmp.answer.legacy.number, cells: cmp.answer.cells, diffs: cmp.answer.diffs.map(d => d.column + ': ' + d.twin + ' | ' + d.legacy + ' (' + d.class + ')'), summary: cmp.answer.summary };
  const col = door('column', 'erp.column kind=Order column=C_ConversionType_ID'); if (col.status !== 'ok') throw new Error('erp.column: ' + col.why);
  out.column = { verdict: col.answer.verdict, legacyDefaultId: Number(col.answer.legacy.loginDefault.id), legacyFilledBy: col.answer.legacy.filledBy, twinNote: col.answer.twin.loginDefaultNote };
  const wh = door('where', 'idempiere.where symbol=InvoiceRule in=CalloutOrder limit=3'); if (wh.status !== 'ok') throw new Error('idempiere.where: ' + wh.why);
  out.where = { total: wh.answer.total, files: wh.answer.files, hits: wh.answer.hits.map(x => x.file.split('/').pop() + ':' + x.line + '  ' + x.text.slice(0, 70)) };
  const wr = door('witness', 'witness.run name=door_help'); if (wr.status !== 'ok') throw new Error('witness.run: ' + wr.why);
  out.witness = { verdict: wr.answer.verdict, pass: wr.answer.pass, fail: wr.answer.fail, name: wr.answer.name };
  const packOut = 'plugin/META-INF'; fs.rmSync(path.join(__dirname, 'plugin'), { recursive: true, force: true });   // the folder the film shows; removed after the run
  const PK = 'erp.pack book=erp/plugins/models/BIM_Document.xlsx version=1.0.0 out=' + packOut;
  const pk1 = door('pack', PK); if (pk1.status !== 'ok') throw new Error('erp.pack: ' + pk1.why);
  const pk2 = door('pack_again', PK); if (pk2.status !== 'ok') throw new Error('erp.pack again: ' + pk2.why);
  out.pack = { status: pk1.answer.status, again: pk2.answer.status, elements: pk1.answer.elements, records: pk1.answer.records, tables: pk1.answer.rows.AD_Table, columns: pk1.answer.rows.AD_Column, tabs: pk1.answer.rows.AD_Tab, processClasses: pk1.answer.classes.length, classes: pk1.answer.classes.map(c => c.split('.').pop()), sha: pk1.answer.sha256.slice(0, 16), sameSha: pk1.answer.sha256 === pk2.answer.sha256 };
  fs.rmSync(path.join(__dirname, 'plugin'), { recursive: true, force: true });
  // the workbook itself, read from the file (sheet order, rows per sheet, the first rows of two sheets)
  const XL = require(path.join(OOTB, 'erp/xlsx.mini.min.js')), wb = XL.read(fs.readFileSync(path.join(OOTB, 'erp/plugins/models/BIM_Document.xlsx')), { type: 'buffer', raw: true });
  const grid = (n) => XL.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' });
  out.sheet = { file: 'BIM_Document.xlsx', count: wb.SheetNames.length, order: wb.SheetNames.map(n => ({ name: n, rows: grid(n).length - 1 })), column: { head: grid('AD_Column')[0].slice(0, 6), rows: grid('AD_Column').slice(1, 5).map(r => r.slice(0, 6)) } };
  const ai = door('claim', 'erp.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101', 'ai'); out.claim = { status: ai.status, why: String(ai.why || '').slice(0, 140) };
  out.verbs = JSON.parse(fs.readFileSync(path.join(OOTB, 'common/door/verbs.json'), 'utf8')).verbs.length;
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'facts.json'), JSON.stringify(out, null, 1));
  L('wrote out/facts.json verbs=' + out.verbs + ' compare=' + out.compare.cells.match + '/' + out.compare.cells.diff + '/' + out.compare.cells.nullVsDefault + ' column114=' + out.column.legacyDefaultId + ' where=' + out.where.total + ' witness=' + out.witness.verdict + '/' + out.witness.pass + ' pack=' + out.pack.status + '/' + out.pack.again + ' elements=' + out.pack.elements + ' claim=' + out.claim.status + ' twinScriptLines=' + out.before.twin.lines);
} catch (e) { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); }
