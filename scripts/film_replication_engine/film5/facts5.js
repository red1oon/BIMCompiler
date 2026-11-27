// ⚠ DO NOT REMOVE — Scope: FACTS of Film 5 "Trust and the thin pipe" (prompts/TEAMWORK_FRAMEWORK.md §16.35, §35, §36). Every number the film shows or says is EXTRACTED here by a regular expression from a FROZEN copy of its source
// (inputs/*.log = build/comm/logs/witness_comm_plantrust.log, build/scriptor/hosts.log, build/scriptor/witness_thin_derive.log; inputs/tf_4018_4068.txt = lines 4018-4068 of prompts/TEAMWORK_FRAMEWORK.md).
// Nothing is typed in. A fact that does not match its source throws; cross-checks (sums, counts) throw when they disagree with the number the prompt file states. Read the log after every run: §FACT_* lines.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const IN = path.join(__dirname, 'inputs');
const rd = f => fs.readFileSync(path.join(IN, f), 'utf8');
const TEXT = { tf: rd('tf_4018_4068.txt'), pt: rd('plantrust.log'), ho: rd('hosts.log'), td: rd('thin_derive.log') };
const SRCNAME = { tf: 'TEAMWORK_FRAMEWORK.md', pt: 'build/comm/logs/witness_comm_plantrust.log', ho: 'build/scriptor/hosts.log', td: 'build/scriptor/witness_thin_derive.log' };
const LINE0 = { tf: 4017, pt: 0, ho: 0, td: 0 };                     // frozen tf file starts at line 4018 of the real prompt file
const F = {}, SRC = {}, D = {}, LOG = [];
const say = s => { LOG.push(s); };
const lineOf = (k, idx) => LINE0[k] + TEXT[k].slice(0, idx).split('\n').length;
const num = s => Number(String(s).replace(/,/g, ''));
// grab(key, name, regex, groupIndex, which) -> sets F[name] and SRC[name] from the which-th match (0 = first)
function grab(k, name, re, g, which) {
  const R = new RegExp(re.source, re.flags.indexOf('g') < 0 ? re.flags + 'g' : re.flags); let m, i = 0;
  while ((m = R.exec(TEXT[k]))) { if (i === (which || 0)) break; i++; m = null; }
  if (!m) throw new Error('§FACT_FAIL ' + name + ' : no match for ' + re + ' in ' + SRCNAME[k]);
  F[name] = num(m[g === undefined ? 1 : g]); SRC[name] = SRCNAME[k] + ':' + lineOf(k, m.index);
  say(`§FACT ${name}=${F[name]} <- ${SRC[name]}  "${m[0].slice(0, 90).replace(/\s+/g, ' ')}"`); return m;
}
const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
function set(name, v, src, how) { F[name] = v; SRC[name] = src; say(`§FACT ${name}=${v} <- ${src}  (${how})`); }

// ---------- §16.35 / §16.35.1 / §16.35.2 (publish signed rules) ----------
grab('tf', 'pr1', /bim-ootb \*\*PR #(\d+) MERGED\*\*/, 1, 0);          // 2382
grab('tf', 'pr2', /bim-ootb \*\*PR #(\d+) MERGED\*\*/, 1, 1);          // 2383
grab('tf', 'verJudged', /witness_comm_versions\.js` \*\*PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 1);
grab('tf', 'verFails', /witness_comm_versions\.js` \*\*PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 2);
grab('tf', 'verMut', /witness_comm_versions\.js` \*\*PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 3);
grab('tf', 'pubModJudged', /W-PUBLISH-MODELLER PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 1);
grab('tf', 'pubModMut', /W-PUBLISH-MODELLER PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 3);
grab('tf', 'pubErpJudged', /W-PUBLISH-ERP PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 1);
grab('tf', 'pubErpMut', /W-PUBLISH-ERP PASS (\d+)\/(\d+), mutants (\d+)\/(\d+)\*\*/, 3);
if (F.pubModJudged !== F.pubErpJudged || F.pubModMut !== F.pubErpMut) throw new Error('§FACT_FAIL the two hosts differ: cannot say "each host passed N"');
set('pubJudged', F.pubErpJudged, SRC.pubErpJudged + ' = ' + SRC.pubModJudged, 'both hosts equal');
set('pubMut', F.pubErpMut, SRC.pubErpMut + ' = ' + SRC.pubModMut, 'both hosts equal');
{ const m = /three Chromium devices — A admin, B approved joiner, C joins after the publish/.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL devices'); set('devices', 3, SRC.pubJudged.split(' ')[0].replace(/:\d+/, '') + ':' + lineOf('tf', m.index), 'the sentence names three devices: A admin, B joiner, C late joiner'); }
grab('tf', 'maxSets', /at most (\d+) sets per space/, 1, 0);
{ const m = /Team browser suite run on that branch, logs read: (.*?) — 0 fails, 0 page errors/.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL suite'); const items = m[1].split(' · '); items.forEach(x => { if (!/^W-[A-Z-]+ \d+( \(.*\))?$/.test(x.trim())) throw new Error('§FACT_FAIL suite item ' + x); });
  set('suiteN', items.length, SRCNAME.tf + ':' + lineOf('tf', m.index), 'count of W-… items in the "browser suite … 0 fails, 0 page errors" sentence'); D.suiteItems = items; }
{ const m = /\*\*Step 1, host regression suite on `feat\/versions-publish`\*\* \(worktree `\/tmp\/wt-adopt`, logs read in full\): (.*?) — all 0 fails, 0 page errors\./.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL step 1 suite'); const items = m[1].split(' · ');
  items.forEach(x => { if (!/^W-[A-Z-]+ \d+/.test(x.trim())) throw new Error('§FACT_FAIL step 1 suite item ' + x); });
  set('suite2382', items.length, SRCNAME.tf + ':' + lineOf('tf', m.index), 'count of W-… test suites listed in §16.35.2 Step 1 ("all 0 fails, 0 page errors"); W-TEAM-SO is the one deviation, fixed in the witness and re-run 19/19, not in this count'); }

{ const m = /IF (four|three|five|six) things are built first/.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL mustBuild'); set('mustBuild', words[m[1]], SRCNAME.tf + ':' + lineOf('tf', m.index), '§36.1 "IF ' + m[1] + ' things are built first"'); }
// ---------- §35 / §35.1 (rotate the trusted-key list) ----------
grab('tf', 'keysMax', /keys:\[(\d)-(\d) public P-256 JWKs/, 2, 0);
grab('tf', 'keysMin', /keys:\[(\d)-(\d) public P-256 JWKs/, 1, 0);
grab('tf', 'redArms', /MERGED and IGNORED \(list stayed the genesis one, `planTrustEpoch` undefined, no refusal reason existed\): (\d+) red arms/, 1, 0);
grab('tf', 'hostsNow', /witness_scriptor_hosts\.js` \*\*PASS (\d+)\/(\d+)\*\* \(was (\d+)\)/, 1, 0);
grab('tf', 'hostsWas', /witness_scriptor_hosts\.js` \*\*PASS (\d+)\/(\d+)\*\* \(was (\d+)\)/, 3, 0);
{ const m = /\*\*Regression \(engine changed, all logs read\):\*\* (.*?) — identical to the recorded counts/.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL regression'); const items = m[1].split(' · ');
  set('regression', items.length, SRCNAME.tf + ':' + lineOf('tf', m.index), 'count of the older comm witnesses listed as unchanged'); }
{ const m = /Team browser suite run on that branch/.exec(TEXT.tf); set('pr2suite', F.suiteN, SRCNAME.tf + ':' + lineOf('tf', m.index), 'same sentence as suiteN (run on the #2383 branch)'); }

// ---------- the plan-trust log ----------
grab('pt', 'ptJudged', /§PLANTRUST_VERDICT PASS judged=(\d+) fails=(\d+)/, 1, 0);
grab('pt', 'ptFails', /§PLANTRUST_VERDICT PASS judged=(\d+) fails=(\d+)/, 2, 0);
{ const sec = (name) => { const a = TEXT.pt.indexOf(name); if (a < 0) throw new Error('§FACT_FAIL section ' + name); const rest = TEXT.pt.slice(a + name.length); const b = rest.search(/\n§[A-Z0-9_]+/); return { text: b < 0 ? rest : rest.slice(0, b), at: a }; };
  const green = s => s.text.split('\n').filter(l => /^\s+🟢/.test(l)), red = s => s.text.split('\n').filter(l => /^\s+🔴/.test(l));
  const t7 = sec('§T7 REFUSE'), mu = sec('§MUTANTS'), t6 = sec('§T6 ROTATE'), t9 = sec('§T9 ORDER'), t8 = sec('§T8 CARRY');
  if (red(t7).length || red(mu).length || red(t6).length) throw new Error('§FACT_FAIL a red arm in the plantrust log');
  set('refusals', green(t7).length, SRCNAME.pt + ':' + lineOf('pt', t7.at), 'count of 🟢 lines under §T7 REFUSE (each says REFUSED … on both devices; list unchanged)');
  D.refusals = green(t7).map(l => { const m = /^\s+🟢 (.*?) -> REFUSED:([^ ]+)/.exec(l) || /^\s+🟢 (.*?) — REFUSED:([^ ]+)/.exec(l); if (!m) { const m2 = /^\s+🟢 (.*)$/.exec(l); const r = /REFUSED:([a-z:A-Z-]+)/.exec(l); return { text: m2[1], code: r ? r[1] : '?' }; } return { text: m[1], code: m[2] }; });
  const mut = green(mu); if (mut.some(l => !/red arms: T\d/.test(l))) throw new Error('§FACT_FAIL a mutant line without red arms');
  set('plantrustMut', mut.length, SRCNAME.pt + ':' + lineOf('pt', mu.at), 'count of 🟢 lines under §MUTANTS, each naming the red arms it turned');
  D.mutLines = mut.map(l => l.replace(/^\s+🟢 /, ''));
  const mp = /MERGED:policy MERGED:policy list=(\d)\/(\d) epoch=(\d+)/.exec(t6.text); if (!mp) throw new Error('§FACT_FAIL T6 first rotation line');
  set('listAfterAdd', +mp[1], SRCNAME.pt + ':' + lineOf('pt', t6.at + t6.text.indexOf(mp[0])), 'T6: list size on founder after the primary adds a key (joiner: ' + mp[2] + ')');
  const mb = /list in force = \[K1,K3\]/.exec(t6.text), mb2 = /MERGED:policy MERGED:policy list=(\d)(?!\/)/.exec(t6.text); if (!mb || !mb2) throw new Error('§FACT_FAIL T6 backup rotation line');
  set('listAfterBackup', +mb2[1], SRCNAME.pt + ':' + lineOf('pt', t6.at + t6.text.indexOf(mb[0])), 'T6: list size after the backup signs [K1,K3]');
  const mo = /ingesting the same (\d+) ops in REVERSE arrival order returns the same list — C=(\d) F=(\d)/.exec(t9.text); if (!mo || mo[2] !== mo[3]) throw new Error('§FACT_FAIL T9');
  set('reverseOps', +mo[1], SRCNAME.pt + ':' + lineOf('pt', t9.at + t9.text.indexOf(mo[0])), 'T9: messages ingested in reverse order; both devices return the same list size ' + mo[2]);
  const mk = /K0=untrusted K3=ok/.exec(t6.text); if (!mk) throw new Error('§FACT_FAIL T6 reader');
  D.t6reader = SRCNAME.pt + ':' + lineOf('pt', t6.at + t6.text.indexOf(mk[0])); }
if (F.plantrustMut !== (/Mutants (\d+)\/\1 killed/.exec(TEXT.tf) ? +/Mutants (\d+)\/\1 killed/.exec(TEXT.tf)[1] : -1)) throw new Error('§FACT_FAIL mutant count in the log differs from the prompt file');
if (F.ptJudged !== +/judged=(\d+) fails=0`/.exec(TEXT.tf)[1]) throw new Error('§FACT_FAIL judged count in the log differs from the prompt file');

// ---------- the hosts log ----------
grab('ho', 'hostsJudged', /§HOSTS_VERDICT PASS judged=(\d+) fails=(\d+)/, 1, 0);
grab('ho', 'hostsFails', /§HOSTS_VERDICT PASS judged=(\d+) fails=(\d+)/, 2, 0);
if (F.hostsJudged !== F.hostsNow) throw new Error('§FACT_FAIL hosts judged differs from the prompt file');
{ const m = /after a K1-signed POLICY rotates the list to \[K2\], the SAME running host re-verifies: the K1-signed plan is now untrusted and the scope closes/.exec(TEXT.ho); if (!m) throw new Error('§FACT_FAIL hosts rotation arm'); D.hostsRotateSrc = SRCNAME.ho + ':' + lineOf('ho', m.index); }

// ---------- the thin-derive log ----------
{ const m = /§THIN_VERDICT EVIDENCE judged=(\d+) derivable=(\d+)\/(\d+) \[([^\]]*)\] notDerivable=\[([^\]]*)\] inconclusive=\[([^\]]*)\] mutants=(\d+)\/(\d+)/.exec(TEXT.td); if (!m) throw new Error('§FACT_FAIL thin verdict');
  const at = SRCNAME.td + ':' + lineOf('td', m.index);
  set('thinJudged', +m[1], at, 'verdict judged'); set('thinDerivable', +m[2], at, 'verdict derivable'); set('thinN', +m[3], at, 'verdict N = ML.DOCS'); set('thinNotDerivable', m[5] ? m[5].split(',').length : 0, at, 'notDerivable');
  D.derivable = m[4].split(','); D.inconclusive = m[6].split(','); set('thinInconclusive', D.inconclusive.length, at, 'inconclusive'); set('cmpMutants', +m[7], at, 'comparator mutants killed'); set('cmpMutantsOf', +m[8], at, 'comparator mutants total'); }
D.classes = {};
for (const cls of ['c_order', 'm_inout', 'c_invoice', 'c_payment', 'm_movement', 'm_inventory', 'm_rma']) {
  const o = D.classes[cls] = {};
  let m = new RegExp('§T1 SAME ' + cls + ' A\\.ok=true B\\.ok=true opsA=(\\d+) opsB=(\\d+) group=.* -> MATCH').exec(TEXT.td); if (!m || m[1] !== m[2]) throw new Error('§FACT_FAIL T1 ' + cls); o.ops = +m[1]; o.src = SRCNAME.td + ':' + lineOf('td', m.index);
  m = new RegExp('§T2 BYTES ' + cls + ' today=(\\d+) \\(doc (\\d+) \\+ complete group (\\d+)\\) thin=(\\d+) \\(doc (\\d+) \\+ intent (\\d+)\\) saving=(\\d+)%').exec(TEXT.td); if (!m) throw new Error('§FACT_FAIL T2 ' + cls);
  o.today = +m[1]; o.doc = +m[2]; o.group = +m[3]; o.thin = +m[4]; o.intent = +m[6]; o.saving = +m[7]; o.bytesSrc = SRCNAME.td + ':' + lineOf('td', m.index);
  if (o.today !== o.doc + o.group || o.thin !== o.doc + o.intent || +m[5] !== o.doc) throw new Error('§FACT_FAIL bytes do not add up ' + cls);
  o.net = Math.round(100 * (1 - o.thin / o.today)); o.groupShare = Math.round(100 * o.group / o.today);          // the witness's own `saving=` is the Complete group's SHARE of today's bytes (scripts/witness_thin_derive.js:128), not 1 - thin/today
  if (o.groupShare !== o.saving) throw new Error('§FACT_FAIL the log saving is not the group share for ' + cls);
  say(`§FACT_NOTE ${cls} log saving=${o.saving}% is the group's share of today's bytes; net 1-thin/today = ${(100 * (1 - o.thin / o.today)).toFixed(1)}% ${o.net === o.saving ? '(same after rounding)' : '(DIFFERS: the film shows bytes, and a percentage only where both agree)'}`);
  m = new RegExp('§T3 CLOCK ' + cls + ' .* -> (differs: (.*)|no column depends on the clock)').exec(TEXT.td); if (!m) throw new Error('§FACT_FAIL CLOCK ' + cls); o.clock = m[2] || null; o.clockSrc = SRCNAME.td + ':' + lineOf('td', m.index);
  m = new RegExp('§T3 DOCNO ' + cls + ' .* -> (differs: (.*)|no column depends on the sequence state)').exec(TEXT.td); if (!m) throw new Error('§FACT_FAIL DOCNO ' + cls); o.docno = m[2] || null; o.docnoSrc = SRCNAME.td + ':' + lineOf('td', m.index);
  m = new RegExp('§T3 RERUN ' + cls + ' a second CO on A after its group is applied -> (ok=false ops=0 msg="([^"]*)" IDEMPOTENT|ok=true ops=1 NOT IDEMPOTENT: (.*))').exec(TEXT.td); if (!m) throw new Error('§FACT_FAIL RERUN ' + cls); o.rerun = m[2] ? 'refused' : 'changed'; o.rerunDetail = m[2] || m[3]; o.rerunSrc = SRCNAME.td + ':' + lineOf('td', m.index);
  m = new RegExp('§T3 UU ' + cls + ' generated uu on A=(\\d+) B=(\\d+)').exec(TEXT.td); if (!m || m[1] !== m[2]) throw new Error('§FACT_FAIL UU ' + cls); o.uu = +m[1]; o.uuSrc = SRCNAME.td + ':' + lineOf('td', m.index);
}
{ let a = 0, b = 0; Object.keys(D.classes).forEach(k => { a += D.classes[k].today; b += D.classes[k].thin; });
  const p = /All 7: \*\*([\d,]+) → ([\d,]+) bytes \(−(\d+)%\)\*\*/.exec(TEXT.tf); if (!p) throw new Error('§FACT_FAIL prompt totals');
  if (num(p[1]) !== a || num(p[2]) !== b) throw new Error(`§FACT_FAIL sum of the log's per-class bytes (${a} -> ${b}) differs from the prompt file (${p[1]} -> ${p[2]})`);
  if (Math.round(100 * (1 - b / a)) !== +p[3]) throw new Error('§FACT_FAIL total saving');
  set('bytesToday', a, SRCNAME.td + ' T2 lines summed (checked equal to ' + SRCNAME.tf + ':' + lineOf('tf', p.index) + ')', 'sum of the 7 "today=" values'); set('bytesThin', b, SRCNAME.td + ' T2 lines summed (checked equal to the prompt file)', 'sum of the 7 "thin=" values'); set('bytesSaving', +p[3], SRCNAME.tf + ':' + lineOf('tf', p.index), 'prompt file; recomputed from the sums'); }
{ const c = D.classes.c_order; set('orderOps', c.ops, c.src, 'T1 opsA'); set('orderToday', c.today, c.bytesSrc, 'T2'); set('orderThin', c.thin, c.bytesSrc, 'T2'); set('orderDoc', c.doc, c.bytesSrc, 'T2'); set('orderGroup', c.group, c.bytesSrc, 'T2'); set('orderIntent', c.intent, c.bytesSrc, 'T2'); if (c.net !== c.saving) throw new Error('§FACT_FAIL order: net saving differs from the log saving'); set('orderSaving', c.saving, c.bytesSrc, 'T2 (net 1-thin/today agrees after rounding)'); }
{ const ms = [...TEXT.td.matchAll(/🟢 (one op dropped from B's group|one value altered in B's group|B's clock shifted without telling the comparator) -> (\d+)\/(\d+) MATCH classes turned/g)]; if (ms.length !== 3) throw new Error('§FACT_FAIL comparator mutant lines');
  set('mutDrop', +ms[0][2], SRCNAME.td + ':' + lineOf('td', ms[0].index), 'one op dropped -> classes turned'); set('mutAlter', +ms[1][2], SRCNAME.td + ':' + lineOf('td', ms[1].index), 'one value altered -> classes turned'); set('mutClock', +ms[2][2], SRCNAME.td + ':' + lineOf('td', ms[2].index), 'clock shifted -> classes turned'); set('mutOf', +ms[0][3], SRCNAME.td + ':' + lineOf('td', ms[0].index), 'classes judged'); }
{ const clk = Object.keys(D.classes).filter(k => D.classes[k].clock); if (clk.length !== F.mutClock) throw new Error('§FACT_FAIL classes with a clock column differ from the clock-mutant count');
  set('clockClasses', clk.length, SRCNAME.td + ' T3 CLOCK lines', 'classes whose group writes a clock column (' + clk.join(',') + ')'); D.clockClasses = clk; }
{ const dn = Object.keys(D.classes).filter(k => D.classes[k].docno); set('docnoClasses', dn.length, SRCNAME.td + ' T3 DOCNO lines', 'classes whose generated documents take numbers (' + dn.join(',') + ')'); D.docnoClasses = dn; }
{ const uus = Object.keys(D.classes).map(k => D.classes[k].uu).filter(x => x > 0); set('uuMin', Math.min(...uus), SRCNAME.td + ' T3 UU lines', 'smallest non-zero generated-id count'); set('uuMax', Math.max(...uus), SRCNAME.td + ' T3 UU lines', 'largest generated-id count'); }
{ const m = /§T5 SKEW OPEN \(not built\)/.exec(TEXT.td); if (!m) throw new Error('§FACT_FAIL T5'); D.skewSrc = SRCNAME.td + ':' + lineOf('td', m.index); }
{ const m = /DocumentEngine\.java:272-276/.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL DocumentEngine cite'); D.docEngineSrc = SRCNAME.tf + ':' + lineOf('tf', m.index); }
{ const m = /both seed allocations fail validation when cloned \(their invoices are already allocated\)/.exec(TEXT.tf), m2 = /no document in the base/.exec(TEXT.tf), m3 = /`dd_order` — table not in the base/.exec(TEXT.tf); if (!m || !m2 || !m3) throw new Error('§FACT_FAIL inconclusive reasons');
  D.incReasons = { c_allocationhdr: ['both seed allocations fail validation when cloned (their invoices are already allocated)', SRCNAME.tf + ':' + lineOf('tf', m.index)], m_movementconfirm: ['no document of this class in the base', SRCNAME.tf + ':' + lineOf('tf', m2.index)], dd_order: ['its table is not in the base', SRCNAME.tf + ':' + lineOf('tf', m3.index)] }; }
for (const k of ['c_allocationhdr', 'm_movementconfirm', 'dd_order']) if (D.inconclusive.indexOf(k) < 0) throw new Error('§FACT_FAIL inconclusive class missing ' + k);
{ const m = /(\*\*G9 \(§30\/§34\)|What this means for G9 \(§30\/§34\), stated for the owner, not decided)/.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL G9 not-decided line'); D.g9Src = SRCNAME.tf + ':' + lineOf('tf', m.index); }
{ const m = /bim-ootb model layer @ 5f484524/.exec(TEXT.tf); D.modelLayerSrc = SRCNAME.tf + ':' + lineOf('tf', m.index); }

// named line references into the prompt file (each looked up, never typed)
D.L = {}; { const LF = (name, re) => { const m = re.exec(TEXT.tf); if (!m) throw new Error('§FACT_FAIL line ref ' + name); D.L[name] = SRCNAME.tf + ' line ' + lineOf('tf', m.index); say('§FACT_LINE ' + name + ' = ' + D.L[name]); };
  LF('issue16', /\*\*Issue\.\*\* Today a set only arrives/); LF('design16', /\*\*Design decision \(and why/); LF('host16', /- Host half, bim-ootb branch/); LF('open16', /\*\*Open items that are NOT scheduled/);
  LF('s35issue', /\*\*Issue\.\*\* The plan trust list/); LF('s35design', /\*\*Design\.\*\* An optional/); LF('s35limits', /\*\*Limits stated before building\.\*\* \(1\) \*\*Sets already loaded/); LF('s35resid', /\*\*Residuals, stated:\*\*/);
  LF('s351red', /RED first: `build\/scriptor\/plantrust_rotate_RED_before\.log`/); LF('s351hosts', /\*\*Hosts \(Node, real engine/); LF('s351suite', /\*\*Copy \+ browser suite:\*\*/); LF('s36bytes', /\*\*T2 BYTES/); LF('s36t3', /\*\*T3 preconditions/); LF('s36result', /### §36\.1 RESULT/); LF('s36g9', /\*\*What this means for G9/); }
// input fingerprints (frozen copies) and whether the live sources moved since the copy
const live = { tf: path.join(__dirname, '../../../prompts/TEAMWORK_FRAMEWORK.md'), pt: path.join(__dirname, '../../../build/comm/logs/witness_comm_plantrust.log'), ho: path.join(__dirname, '../../../build/scriptor/hosts.log'), td: path.join(__dirname, '../../../build/scriptor/witness_thin_derive.log') };
const FILES = { tf: 'tf_4018_4068.txt', pt: 'plantrust.log', ho: 'hosts.log', td: 'thin_derive.log' };
const sha = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
const INPUTS = Object.keys(FILES).map(k => { let moved = 'n/a'; try { const lv = fs.readFileSync(live[k], 'utf8'); moved = k === 'tf' ? (lv.split('\n').slice(4017, 4068).join('\n') + '\n' === TEXT.tf ? 'same' : 'DIFFERS') : (lv === TEXT[k] ? 'same' : 'DIFFERS'); } catch (e) { moved = 'unreadable'; } return { key: k, frozen: FILES[k], source: SRCNAME[k], sha16: sha(fs.readFileSync(path.join(IN, FILES[k]))), liveNow: moved }; });
function build() { return { F, SRC, D, LOG, INPUTS, ALLTEXT: TEXT }; }
module.exports = { build };
if (require.main === module) { const X = build(); X.LOG.forEach(l => console.log(l)); X.INPUTS.forEach(i => console.log(`§INPUT ${i.key} frozen=${i.frozen} sha16=${i.sha16} live_now=${i.liveNow}`)); console.log(`§FACTS_DONE n=${Object.keys(X.F).length} all extracted from the frozen sources, all cross-checks passed`); }
