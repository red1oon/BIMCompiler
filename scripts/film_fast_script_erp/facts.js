#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "Fast Script ERP" (prompts/FILM_COMMAND_LINE_ERP.md "CH fast-script-erp"; cloned from film_red1_shell/facts.js): reads THIS build's own recording (out/rec/frames.json, out/rec/red1.err = the shell's §RED1/§DOOR log, out/rec/setup.log, the scratch op-log)
// and writes out/facts.json: every number the film speaks or shows. Sources, in order of trust: the shell's own § log lines, then the screens the shell drew (frames.json), then ONE independent read per claim (a door line or SQL on the dictionary, never the shell's own answer).
// Checks, each printed (each can say FAIL; a missing figure is INCONCLUSIVE, never PASS):
//  S setup: all of setup.door answered ok · I isolation: the film's request ids are not in the real journal, the real op-log folder is unchanged
//  C1 every typed line drew its `→` line (or its session-word log line)       · C2 no scroll: every beat's screen starts at its first line and ends above the bottom row
//  C3 the questions of `run` are the dictionary's own parameters, in SeqNo order (independent SQL)   · C4 the phase menu offers exactly the chosen project's phases (independent door read) and other projects have phases (not vacuous)
//  C5 the three purchase orders of beat 5 = the op-log's c_order creates = the `ls` rows of beat 6 = opSummary; `do CO` and `next` use the SAME number, one of them · C6 do CO: DR before, CO after
//  C7 `next` tree = the §RED1 draw tree legal list · C8 the gap line: once, only after the no-port process, never after anything else; no unexpected refusal/error in the door log · C9 the report draft names the line that gapped
//  C10 the GitHub link on screen (rows joined) is exactly the chars the shell said, and the log says via=github · C11 cost: rows add up to the total; = viewer.cost's own answer; its groups add up to it (independent door read)
//  C12 no table wrapped; C13 no other building name or private name on any screen · C14 the film ends on the bash prompt
// READ out/facts.log. Usage: node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const OD = process.env.OUTD || 'out', REC = path.join(__dirname, OD, 'rec'), rec = JSON.parse(fs.readFileSync(path.join(REC, 'frames.json'), 'utf8'));
const OOTB = process.env.OOTB || '/tmp/wt-film-fse-ootb';
const err = fs.readFileSync(path.join(REC, 'red1.err'), 'utf8').split('\n').map(l => l.replace(/^\S+Z (?=§)/, '')).filter(Boolean);
const L = (m) => console.log('§FACTS ' + m); let bad = 0, missing = 0; const chk = (id, ok, what) => { if (!ok) bad++; L('check ' + id + ' ' + (ok ? 'OK  ' : 'FAIL') + ' ' + what); };
const need = (v, what) => { if (v == null || (typeof v === 'number' && isNaN(v)) || (Array.isArray(v) && !v.length)) { missing++; L('MISSING ' + what); } return v; };
const last = {}, firstIdx = {}; rec.frames.forEach((f, i) => { if (f.kind === 'a') last[f.step] = f; if (!(f.step in firstIdx)) firstIdx[f.step] = i; });
const T = (s) => (last[s] ? last[s].text : []);
const grab = (lines, re) => { for (let i = lines.length - 1; i >= 0; i--) { const m = re.exec(lines[i]); if (m) return m; } return null; };
const has = (lines, re) => lines.some(l => re.test(l));
const door = (line) => { const e = { BIM_DOOR_JOURNAL: path.join(rec.scratch, 'facts_journal.jsonl'), BIM_OBJECT_OPLOG: path.join(rec.scratch, 'ops.jsonl') };
  const r = cp.spawnSync('node', [path.join(OOTB, 'common/door/door.js'), line], { encoding: 'utf8', env: Object.assign({}, process.env, e), timeout: 600000 });
  return (r.stdout || '').split('\n').filter(l => l.charAt(0) === '{').map(l => JSON.parse(l)).pop(); };
const F = { made: new Date().toISOString(), ootb: cp.spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), noport: rec.noport };
(async () => {
// ---- S setup + I isolation
const setup = fs.readFileSync(path.join(REC, 'setup.log'), 'utf8').split('\n').filter(l => l.charAt(0) === '{').map(l => JSON.parse(l)), nSetup = fs.readFileSync(path.join(__dirname, 'setup.door'), 'utf8').split('\n').filter(l => l.trim()).length;
F.setup = { lines: nSetup, ok: setup.filter(e => e.status === 'ok').length }; chk('S', F.setup.ok === nSetup && nSetup > 0, 'setup.door: ' + F.setup.ok + ' of ' + nSetup + ' lines answered ok (scratch op-log only)');
const scratchJ = fs.existsSync(path.join(rec.scratch, 'journal.jsonl')) ? fs.readFileSync(path.join(rec.scratch, 'journal.jsonl'), 'utf8').split('\n').filter(Boolean) : [];
const ids = scratchJ.map(l => { try { return JSON.parse(l).request; } catch (e) { return null; } }).filter(Boolean), realJ = path.join(os.homedir(), '.cache', 'bim_door', 'journal.jsonl'), realTxt = fs.existsSync(realJ) ? fs.readFileSync(realJ, 'utf8') : '';
const leaked = ids.filter(i => realTxt.indexOf(i) >= 0), objDir = path.join(os.homedir(), '.cache', 'bim_object'), objFiles = fs.existsSync(objDir) ? fs.readdirSync(objDir) : [];
F.isolation = { sceneRequests: ids.length, leaked: leaked.length, realOpLogFiles: objFiles.length };
chk('I', ids.length > 0 && !leaked.length && JSON.stringify(rec.objBefore) === JSON.stringify(rec.objAfter), 'the film\'s ' + ids.length + ' journalled lines are in the scratch journal only (' + leaked.length + ' of their request ids found in ~/.cache/bim_door/journal.jsonl); ~/.cache/bim_object (the default op-log folder) holds ' + Object.keys(rec.objAfter || {}).length + ' files, identical before and after the run');
// ---- screens
const g = T('start'), gm = grab(g, /red1 ([\d.]+) · (\d+) verbs · (\d+) words(?: · (\w+))?/);
F.greet = { version: gm && gm[1], verbs: gm && +gm[2], words: gm && +gm[3], commit: gm && gm[4], tip: has(g, /^Tip: type level student/), welcome: has(g, /^Welcome to red1, the scripting door into BIM and ERP, stored in SQLite\./), name: has(g, /^REMEMBER THE NAME\./), hint: has(g, /^Type help for the list of commands/) }; need(F.greet.verbs, 'greeting verbs');
const hT = T('help'), groups = hT.map(l => /^  (bim|mis|erp)\s+(.+?)\s+start with: (.+?)\s+\((\d+) words\)/.exec(l)).filter(Boolean).map(m => ({ g: m[1], title: m[2], n: +m[4] }));
const ewi = hT.findIndex(l => /^erp: document actions/.test(l)), ewords = ewi < 0 ? [] : hT.slice(ewi + 1).map(l => /^  (\w+)\s+/.exec(l)).filter(Boolean).map(m => m[1]);
F.help = { groups: groups.length, list: groups, erpWords: ewords, erpN: ewords.length }; need(groups, 'help groups');
const lT = T('level'); F.level = { set: has(lT, /^level student: help <word> also shows/), what: has(lT, /what it does:/), line: has(lT, /→ erp\.process/), taken: has(lT, /taken from where you are: kind/) };
const bT = T('bp'), bpFrames = rec.frames.filter(f => f.step === 'bp'), ghost = bpFrames.find(f => /red1> cd Busi\s+▸ "Business Partner"/.test(f.text[f.cy] || '')), tab = bpFrames.find(f => f.what === 'Tab');
F.bp = { ghost: !!ghost, ghostText: ghost && (/▸ ("Business Partner".*)$/.exec(ghost.text[ghost.cy]) || [])[1], tabLine: tab && tab.text[tab.cy].replace(/^red1> /, ''), props: +((grab(bT, /^Business Partner: (\d+) properties/) || [])[1]), shown: +((grab(bT, /^shown (\d+) of (\d+) Business Partner/) || [])[1]), of: +((grab(bT, /^shown (\d+) of (\d+) Business Partner/) || [])[2]), ms: +((grab(bT, /^ok · mis\.list · (\d+) ms/) || [])[1]) }; need(F.bp.of, 'bp rows');
// the PO dialog, stage by stage
const menuOf = (lines) => lines.map(l => /^[> ]\s+(\d+)\s{4}(.*)$/.exec(l)).filter(Boolean).map(m => m[2]);
const p1 = T('po1'), p2 = T('po2'), p3 = T('po3'), p4 = T('po4');
const pm1 = grab(p1, /^run: pick (.+) \((\w+), (\d+)\)/), pm2 = grab(p2, /^run: pick (.+) \((\w+), (\d+)\)/), pm3 = grab(p3, /^run: pick (.+) \((\w+), (\d+)\)/);
const asked = [pm1 && pm1[2], pm2 && pm2[2], pm3 && pm3[2], (grab(p4, /\((ConsolidateDocument)\)\? \[(\w+)\]/) || [])[1]], consDef = (grab(p4, /\(ConsolidateDocument\)\? \[(\w+)\]/) || [])[1];
const projItems = menuOf(p1), phaseItems = menuOf(p2), pickedProj = grab(p2, /^C_Project_ID = (.+) · (\d+)$/), phaseArrow = grab(p2, /^→ mis\.lookup column=C_ProjectPhase_ID .* C_Project_ID=(\d+)/);
const phaseIds = phaseItems.filter(x => !/leave it out/.test(x)).map(x => +(/ · (\d+)$/.exec(x) || [])[1]);
const runArrow = grab(p4, /^→ erp\.process name="Generate PO from Project" kind=Project C_Project_ID=(\d+) ConsolidateDocument=(\w)$/), os_ = grab(p4, /^opSummary: (\{.*\})$/), runMs = grab(p4, /^ok · erp\.process · (\d+) ms/);
const opSum = os_ ? JSON.parse(os_[1]) : null;
F.po = { asked, consolidateDefault: consDef, project: { n: pm1 && +pm1[3], items: projItems, picked: pickedProj && pickedProj[1], id: pickedProj && +pickedProj[2] }, phase: { n: pm2 && +pm2[3], ids: phaseIds, projectInArrow: phaseArrow && +phaseArrow[1], leftOut: has(p3, /^C_ProjectPhase_ID: left out/) }, line: { n: pm3 && +pm3[3], leftOut: has(p4, /^C_ProjectLine_ID: left out/) },
  run: { id: runArrow && +runArrow[1], ms: runMs && +runMs[1], sec: runMs && Math.round(+runMs[1] / 1000), orders: opSum && opSum['create:c_order'], orderLines: opSum && opSum['create:c_orderline'], projectLines: opSum && opSum['update:c_projectline'], planned: +((grab(p4, /^planned: (\d+)/) || [])[1]) } };
need(opSum, 'opSummary of the run'); need(pm2, 'phase menu');
const oT = T('ord'), orows = oT.map(l => /^(\d+)\s+(\d+)\s+(\w+)\s+([YN])\s+(.*Hospital.*)$/.exec(l)).filter(Boolean).map(m => ({ id: +m[1], no: m[2], status: m[3], desc: m[5].trim() })), osh = grab(oT, /^shown (\d+) of (\d+) Order/);
F.ord = { rows: orows.length, numbers: orows.map(r => r.no), statuses: orows.map(r => r.status), shown: osh && +osh[1], of: osh && +osh[2] };
const cT = T('co'), cA = grab(cT, /^→ erp\.complete kind=Order number=(\d+)$/), cD = grab(cT, /^document: (\{.*\})$/), cB = grab(cT, /^before: (\{.*\})$/), cAf = grab(cT, /^after: (\{.*\})$/), cMs = grab(cT, /^ok · erp\.complete · (\d+) ms/);
F.co = { number: cA && cA[1], before: cB && JSON.parse(cB[1]).docStatus, after: cAf && JSON.parse(cAf[1]).docStatus, total: cAf && JSON.parse(cAf[1]).grandTotal, doc: cD && JSON.parse(cD[1]).number, ms: cMs && +cMs[1], sec: cMs && Math.round(+cMs[1] / 1000) }; need(F.co.number, 'do CO line');
const nT = T('next'), nA = grab(nT, /^→ erp\.actions kind=Order number=(\d+)$/), nH = grab(nT, /^Order (\d+)\s+status (\w+)/), nr = nT.map(l => /^[├└]─ (\w+)\s+(.*)$/.exec(l)).filter(Boolean).map(m => ({ code: m[1], what: m[2] })), nLog = grab(err, /§RED1 draw tree lines=(\d+) legal=(\[.*\])/);
F.next = { number: nA && nA[1], head: nH && nH[1], status: nH && nH[2], moves: nr, legalLog: nLog && JSON.parse(nLog[2]), withWord: nr.filter(r => /^→ do /.test(r.what)).map(r => r.code), noWord: nr.filter(r => /no red1 word/.test(r.what)).map(r => r.code) }; need(nr, 'next tree');
const gT = T('gap'), gl = grab(gT, /^→ erp\.process name=(.+?) kind=Order$/), gr = grab(gT, /"reason": "(.*) was not run: it has no JS port yet \(class (.+)\)"/);
F.gap = { arrowName: gl && gl[1], reasonName: gr && gr[1], klass: gr && gr[2], hint: has(gT, /^This is a gap in red1, not your mistake\. Type report to send it to us/), kind: has(gT, /"gapKind": "no-port"/) ? 'no-port' : null, process: rec.noport && rec.noport.name, noPortCount: rec.noport && +rec.noport.count }; need(gr, 'gap refusal');
const rT = T('report'), rA = grab(rT, /^red1 line: (.*)$/); F.report = { draft: has(rT, /^Draft \(nothing is sent until you open it\):/), line: rA && rA[1], send: has(rT, /^Send by: 1 GitHub issue · 2 email · q cancel/), answer: grab(rT, /^Answer: (.*)$/) && grab(rT, /^Answer: (.*)$/)[1] };
const uT = T('url'), uh = uT.findIndex(l => /^GitHub issue \((\d+) chars\), open it to send:/.test(l)), um = uh < 0 ? null : /\((\d+) chars\)/.exec(uT[uh]);
let urlText = ''; if (uh >= 0) for (let i = uh + 1; i < uT.length && !/^red1 /.test(uT[i]); i++) urlText += uT[i];
const ulog = grab(err, /§RED1 report via=(\w+) chars=(\d+)/);
F.url = { chars: um && +um[1], joined: urlText.length, host: /^https:\/\/github\.com\/red1oon\/bim-ootb\/issues\/new\?/.test(urlText), rowsWide: uh < 0 ? 0 : uT.slice(uh + 1).filter(l => l.length === rec.cols).length, via: ulog && ulog[1], logChars: ulog && +ulog[2] }; need(F.url.chars, 'github link chars');
const kT = T('cost'), kh = grab(kT, /^(\d+) elements · (\d+) total \((\d+) with no rate\); (\d+) with no size, not priced/), kms = grab(kT, /^ok · viewer\.cost · (\d+) ms/);
const krows = kT.map(l => /^(ARC|MEP|STR|PLB|ELEC)\s+(Ifc\w+)\s+(.+?)\s+(\d+)\s+(\S+)\s+\S+\s+\S+\s+(\d+)$/.exec(l)).filter(Boolean).map(m => ({ disc: m[1], cls: m[2], n: +m[4], cost: +m[6] })), bydisc = {}; krows.forEach(r => { bydisc[r.disc] = (bydisc[r.disc] || 0) + r.cost; });
F.cost = { elements: kh && +kh[1], total: kh && +kh[2], noRate: kh && +kh[3], noSize: kh && +kh[4], ms: kms && +kms[1], rows: krows.length, rowSum: krows.reduce((a, r) => a + r.cost, 0), byDisc: bydisc, discs: Object.keys(bydisc).length, arrow: has(kT, /^→ viewer\.cost building=Duplex by=discipline$/) }; need(kh, 'cost header');
const counts = door('viewer.counts building=Duplex by=discipline'); F.duplexElements = counts && counts.answer && (counts.answer.total || (counts.answer.rows || []).reduce((a, r) => a + (r.count || r.n || 0), 0));
// ---- C1 typed lines
const arr = (s, re) => has(T(s), re), lg = (re) => err.some(l => re.test(l));
const n0 = F.co.number;
const C1 = [['start', 'welcome', lg(/^§RED1 welcome lines=4 tips=1/)], ['help', 'help', lg(/^§RED1 help topic="" words=1/)], ['help', 'erp', lg(/^§RED1 help topic="erp" words=1/)], ['level', 'level student', arr('level', /^level student:/)], ['level', 'help run', lg(/^§RED1 help topic="run" words=1/)],
  ['bp', 'cd', arr('bp', /^→ mis\.describe kind="Business Partner"$/)], ['bp', 'ls', arr('bp', /^→ mis\.list kind="Business Partner" /)], ['po1', 'cd Project', arr('po1', /^→ mis\.describe kind=Project$/)], ['po1', 'run (params)', arr('po1', /^→ mis\.list kind=AD_Process_Para .*master="Process\/Generate PO from Project"$/)], ['po1', 'run (project list)', arr('po1', /^→ mis\.lookup column=C_Project_ID /)],
  ['po2', 'pick project', arr('po2', /^→ mis\.lookup column=C_ProjectPhase_ID /)], ['po3', 'leave phase out', arr('po3', /^→ mis\.lookup column=C_ProjectLine_ID /)], ['po4', 'Enter default', !!runArrow], ['ord', 'cd Order', arr('ord', /^→ mis\.describe kind=Order$/)], ['ord', 'ls', arr('ord', /^→ mis\.list kind=Order .* Description=\*Hospital\*$/)],
  ['co', 'do CO', !!cA], ['next', 'next', !!nA], ['gap', 'run (no port)', !!gl], ['report', 'report', F.report.draft], ['url', '1', lg(/^§RED1 report via=github/)], ['cost', 'cd Duplex', arr('cost', /^building Duplex$/)], ['cost', 'cost discipline', F.cost.arrow]];
C1.forEach(([s, w, ok]) => { if (!ok) bad++; L('check C1 ' + (ok ? 'OK  ' : 'FAIL') + ' beat ' + s + ': `' + w + '` drew its line'); });
// C2 no scroll
const sc = Object.keys(last).filter(s => s !== 'cover').map(s => { const t = last[s].text, used = Math.max.apply(null, t.map((l, i) => l.trim() ? i + 1 : 0)), first = t[0]; return { s, used, first: /^(\$ red1|red1[ >]|\$ ?$)/.test(first) || /^\$/.test(first) }; });
chk('C2', sc.every(x => x.used <= rec.rows - 2 && x.first), 'no beat scrolled: each screen starts at its first line and ends above the bottom (max used rows ' + Math.max.apply(null, sc.map(x => x.used)) + ' of ' + rec.rows + '; bad: ' + sc.filter(x => !(x.used <= rec.rows - 2 && x.first)).map(x => x.s).join(',') + ')');
// C3 questions vs dictionary (independent SQL)
const SQL = await require(path.join(OOTB, 'modeller/lib/sql-wasm.js'))({ wasmBinary: fs.readFileSync(path.join(OOTB, 'modeller/lib/sql-wasm.wasm')) }), adb = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp/ad_seed.db')));
const q = adb.exec("SELECT pp.columnname, pp.defaultvalue FROM ad_process_para pp JOIN ad_process p ON p.ad_process_id=pp.ad_process_id WHERE p.name='Generate PO from Project' AND pp.isactive='Y' ORDER BY pp.seqno"), want = q.length ? q[0].values : [];
F.po.dictionary = want.map(w => w[0]); chk('C3', want.length > 0 && JSON.stringify(asked) === JSON.stringify(want.map(w => w[0])) && consDef === String(want[want.length - 1][1]), 'the screens asked ' + asked.join(', ') + '; AD_Process_Para SeqNo order is ' + want.map(w => w[0]).join(', ') + '; the default shown [' + consDef + '] = the dictionary\'s [' + (want.length ? want[want.length - 1][1] : '?') + ']');
// C4 phases of the chosen project (independent door reads)
const ph = door('mis.list kind="Project Phase" C_Project_ID=' + (F.po.project.id || 0) + ' columns=C_ProjectPhase_ID,C_Project_ID limit=200'), phAll = door('mis.list kind="Project Phase" columns=C_ProjectPhase_ID,C_Project_ID limit=500');
const mine = ph && ph.answer && ph.answer.rows ? ph.answer.rows.map(r => +r.C_ProjectPhase_ID).sort((a, b) => a - b) : null, allRows = phAll && phAll.answer && phAll.answer.rows ? phAll.answer.rows : null, others = allRows ? allRows.filter(r => +r.C_Project_ID !== F.po.project.id).length : null;
F.po.phase.mine = mine; F.po.phase.otherProjectsPhases = others;
if (!mine || others == null) { missing++; L('MISSING phase reads'); }
chk('C4', !!mine && JSON.stringify(mine) === JSON.stringify(phaseIds.slice().sort((a, b) => a - b)) && others > 0 && F.po.phase.projectInArrow === F.po.project.id && F.po.phase.n === phaseIds.length, 'the phase menu offers ' + phaseIds.length + ' phases (' + phaseIds.join(',') + '), the project ' + F.po.project.id + '\'s own are ' + (mine || []).length + ' (' + (mine || []).join(',') + '); ' + others + ' phases of other projects exist and were not offered; the lookup line carried C_Project_ID=' + F.po.phase.projectInArrow);
// C5 purchase orders
const ops = fs.readFileSync(path.join(rec.scratch, 'ops.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
const made = rec.pos || []; F.po.numbersMade = made; F.po.opLogOrderCreates = ops.filter(o => o.op_type === 'CRUD_CREATE' && o.table === 'c_order').length;
chk('C5a', made.length > 0 && made.length === F.po.run.orders && F.po.opLogOrderCreates === F.po.run.orders, 'the run said it created ' + F.po.run.orders + ' orders (opSummary); the scratch op-log holds ' + F.po.opLogOrderCreates + ' c_order creates, document numbers ' + made.join(', '));
chk('C5b', JSON.stringify(F.ord.numbers.slice().sort()) === JSON.stringify(made.slice().sort()) && F.ord.rows === F.po.run.orders && F.ord.shown === F.ord.of, 'beat 6\'s `ls` lists ' + F.ord.rows + ' orders, numbers ' + F.ord.numbers.join(', ') + ' = the numbers beat 5 made (' + made.join(', ') + ')');
chk('C5c', F.co.number === F.next.number && F.co.number === F.co.doc && F.next.head === F.co.number && made.indexOf(F.co.number) >= 0, '`do CO ' + F.co.number + '` and `next ' + F.next.number + '` use the same number, one that beat 5 made (the answer\'s document number ' + F.co.doc + ')');
chk('C6', F.co.before === 'DR' && F.co.after === 'CO' && F.next.status === 'CO' && F.ord.statuses.every(s => s === 'DR'), 'the order was ' + F.co.before + ' before, ' + F.co.after + ' after, and `next` reads status ' + F.next.status + '; the listed three were all ' + F.ord.statuses.join('/') + ' before');
chk('C7', JSON.stringify(F.next.moves.map(m => m.code)) === JSON.stringify(F.next.legalLog) && F.next.moves.length > 0, 'the tree\'s moves [' + F.next.moves.map(m => m.code).join(',') + '] = the §RED1 draw tree legal list [' + (F.next.legalLog || []).join(',') + ']');
// C8 the gap
const gapIdx = rec.frames.map((f, i) => (/This is a gap in red1, not your mistake/.test(f.text.join('\n')) ? i : -1)).filter(i => i >= 0), retIdx = rec.frames.findIndex(f => f.step === 'gap' && f.kind === 'r'), gapLog = err.filter(l => /^§RED1 gap /.test(l)), doorSt = err.map(l => /^§DOOR .* verb=(\S+) status=(\w+)/.exec(l)).filter(Boolean).map(m => ({ verb: m[1], status: m[2] })), notOk = doorSt.filter(x => x.status !== 'ok');
F.gap.hintFrames = gapIdx.length; F.gap.firstHintFrame = gapIdx[0]; F.gap.runReturnFrame = retIdx; F.gap.logLines = gapLog.length; F.gap.nonOkDoorLines = notOk;
chk('C8', gapIdx.length > 0 && retIdx >= 0 && gapIdx[0] > retIdx && gapIdx.every(i => rec.frames[i].step === 'gap' && rec.frames[i].kind === 'a') && gapLog.length === 1 && /kind=no-port/.test(gapLog[0]) && notOk.length === 1 && notOk[0].verb === 'erp.process' && F.gap.arrowName === F.gap.process && F.gap.reasonName === F.gap.process,
  'the gap line first appears in frame ' + gapIdx[0] + ' after the no-port run\'s Return (frame ' + retIdx + '), only in that beat\'s answer; §RED1 gap lines ' + gapLog.length + '; of ' + doorSt.length + ' door lines ' + notOk.length + ' did not answer ok (' + notOk.map(x => x.verb + ' ' + x.status).join(',') + '); the process is ' + F.gap.process + ' from the dictionary (' + F.gap.noPortCount + ' have no port), class ' + F.gap.klass);
chk('C8b', F.gap.klass === (rec.noport && rec.noport.class), 'the class the shell names (' + F.gap.klass + ') = the class the dictionary + loaded ports give for ' + F.gap.process + ' (' + (rec.noport && rec.noport.class) + ')');
chk('C9', F.report.draft && F.report.send && F.report.line === 'erp.process name=' + F.gap.process + ' kind=Order' && /refused \(gap: no-port\)/.test(F.report.answer || ''), 'the draft says nothing is sent until you open it, names the line `' + F.report.line + '` and its answer `' + F.report.answer + '`');
chk('C10', F.url.chars > 0 && F.url.joined === F.url.chars && F.url.host && F.url.via === 'github' && F.url.logChars === F.url.chars && process.env.RED1_NO_OPEN !== '0', 'the GitHub link on screen, its ' + F.url.rowsWide + ' wrapped rows joined, is ' + F.url.joined + ' characters = the ' + F.url.chars + ' the shell said = the §RED1 report line (' + F.url.via + ' ' + F.url.logChars + '); RED1_NO_OPEN=1 was set in the recording, nothing was opened');
// C11 cost
const door_ = door('viewer.cost building=Duplex by=discipline'), da = door_ && door_.answer; F.cost.door = da && { total: da.total, elements: da.elements, groups: (da.groups || []).length, groupSum: (da.groups || []).reduce((s, x) => s + x.cost, 0) };
if (!da) { missing++; L('MISSING viewer.cost independent read'); }
const discDoor = {}; ((da && da.groups) || []).forEach(x => { discDoor[x.key] = x.cost; }); F.cost.byDiscDoor = discDoor;
chk('C11', !!da && F.cost.rowSum === F.cost.total && F.cost.total === da.total && F.cost.elements === da.elements && F.cost.door.groupSum === da.total && F.cost.rows > 0 && F.cost.discs === (da.groups || []).length && Object.keys(discDoor).every(k => discDoor[k] === bydisc[k]),
  'the ' + F.cost.rows + ' priced rows on screen add up to ' + F.cost.rowSum + ' = the total line ' + F.cost.total + ' = viewer.cost\'s own total ' + (da && da.total) + '; its ' + (da && (da.groups || []).length) + ' discipline groups add up to ' + (F.cost.door && F.cost.door.groupSum) + ' and each equals the screen rows of that discipline (' + Object.keys(bydisc).map(k => k + ' ' + bydisc[k]).join(', ') + ')');
// C12 wrap, C13 names, C14 end
const wide = (s) => T(s).filter(l => l.length >= rec.cols).length; const tabs = ['bp', 'ord', 'next', 'cost'].map(s => [s, wide(s)]);
chk('C12', tabs.every(x => x[1] === 0), 'no table or tree line is as wide as the terminal (' + rec.cols + ' columns): ' + tabs.map(x => x[0] + '=' + x[1]).join(' ') + '; wrapped paragraphs/JSON/link rows are the terminal\'s own wrapping of one long line (help run, do CO ops, the link)');
const buildings = []; [path.join(OOTB, 'buildings'), path.join(os.homedir(), 'bim-ootb', 'buildings')].forEach(dir => { try { fs.readdirSync(dir).forEach(n => { const m = /^(.+)_extracted\.db$/.exec(n); if (m && ['Duplex', 'Hospital'].indexOf(m[1]) < 0 && buildings.indexOf(m[1]) < 0) buildings.push(m[1]); }); } catch (e) { /* none */ } });
const all = rec.frames.map(f => f.text.join('\n')).join('\n'), hit = buildings.filter(b => b.length > 2 && new RegExp('(?<![A-Za-z])' + b.replace(/[^A-Za-z0-9]/g, '.') + '(?![A-Za-z])', 'i').test(all)), priv = /jelapang|jebel|hhs|jkr|\bltu\b|civil works/i.test(all), refus = /unknown building|no such building/i.test(all);
chk('C13', buildings.length > 0 && !hit.length && !priv && !refus, 'screens checked against ' + buildings.length + ' other local building names (Duplex and the project name Hospital are the owner\'s) + the private-name list + the refused-cd text: hits=' + JSON.stringify(hit));
const ex = last.exit; chk('C14', !!ex && /^\$\s*$/.test(ex.text[ex.cy]) && /exit/.test(ex.text.join('\n')), 'the last screen ends on the bash prompt');
F.checks = { bad, missing, frames: rec.frames.length, rows: rec.rows, cols: rec.cols, buildingsChecked: buildings.length };
fs.writeFileSync(path.join(__dirname, OD, 'facts.json'), JSON.stringify(F, null, 1));
L('wrote facts.json ' + JSON.stringify({ verbs: F.greet.verbs, words: F.greet.words, groups: F.help.groups, bp: [F.bp.shown, F.bp.of], po: [F.po.project.n, F.po.phase.n, F.po.line.n, F.po.run.orders, F.po.run.orderLines, F.po.run.sec], made, co: [F.co.number, F.co.before, F.co.after, F.co.total], gap: F.gap.process, url: F.url.chars, cost: [F.cost.elements, F.cost.total, F.cost.rows] }));
const verdict = missing ? 'INCONCLUSIVE' : (bad ? 'FAIL' : 'PASS'); L('FACTS_VERDICT ' + verdict + ' bad=' + bad + ' missing=' + missing); process.exit(verdict === 'PASS' ? 0 : (verdict === 'FAIL' ? 1 : 2));
})().catch(e => { console.log('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
