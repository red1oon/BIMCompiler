#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "One line" (prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §24): runs every command the film shows through the door on a bim-ootb checkout and keeps the real answers.
// READ out/facts.log after a run. Nothing here is typed by hand into the film: cards.js prints out/facts.json. Usage: OOTB=<bim-ootb checkout at main> node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB; if (!OOTB || !fs.existsSync(path.join(OOTB, 'common/door/door.js'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout'); process.exit(2); }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oneline_')), env = Object.assign({}, process.env, { BIM_OBJECT_OPLOG: path.join(dir, 'ops.jsonl'), BIM_DOOR_JOURNAL: path.join(dir, 'journal.jsonl') });
const L = (m) => console.log('§FACTS ' + m), out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), lines: {} };
const door = (id, line) => { const r = spawnSync(process.execPath, [path.join(OOTB, 'common/door/door.js'), line], { env, encoding: 'utf8', maxBuffer: 1 << 26 }); const j = JSON.parse(r.stdout.trim().split('\n').pop()); out.lines[id] = { line, status: j.status, why: j.why, answer: j.answer }; L(id + ' status=' + j.status + ' ' + line); if (j.status !== 'ok') throw new Error(id + ' is ' + j.status + ': ' + j.why); return j; };
const envB = Object.assign({}, env, { BIM_OBJECT_OPLOG: path.join(dir, 'ops_model.jsonl') });   // the building's op-log is its own file (the ERP's ops are not the model's)
const dotted = (id, chain) => { const r = spawnSync(process.execPath, [path.join(OOTB, 'common/door/dotted.js'), chain], { env: envB, encoding: 'utf8', maxBuffer: 1 << 26 }); const j = JSON.parse(r.stdout.trim().split('\n').pop()); out.lines[id] = { line: chain, doorLine: j.lines[0], status: j.envelope.status, value: j.value }; L(id + ' ' + chain + ' -> ' + j.lines[0] + ' value=' + j.value); if (j.envelope.status !== 'ok') throw new Error(id + ' ' + j.envelope.why); return j; };
(async () => {
  const D = require(path.join(OOTB, 'common/door/tests/erp_draft.js')); Object.assign(process.env, { BIM_OBJECT_OPLOG: env.BIM_OBJECT_OPLOG });
  const draft = async () => { const o = await D.draftOrder({}, {}); return o; };
  // 2-3: one order found, asked, completed
  const o1 = await draft(); out.order = { number: o1.number, id: o1.id, grandTotal: o1.grandTotal, qty: o1.facts.qty };
  const f = door('find', 'erp.find kind=Order number=' + o1.number); out.find = f.answer.matches[0];
  const a = door('actions', 'erp.actions kind=Order id=' + o1.id); out.actions = a.answer.actions.actions || a.answer.actions;
  const c = door('complete', 'erp.complete kind=Order id=' + o1.id); out.complete = { before: c.answer.before, after: c.answer.after };
  // 4: void, close, reverse, each on its own completed order
  for (const v of ['void', 'close', 'reverse']) { const o = await draft(); door(v + '_complete', 'erp.complete kind=Order id=' + o.id); const r = door(v, 'erp.' + v + ' kind=Order id=' + o.id); out[v] = { number: o.number, before: r.answer.before, after: r.answer.after }; }
  // 5: the building
  out.rooms = dotted('rooms', 'viewer(Duplex).Room.count').value; out.walk = dotted('walk', 'modeller(Duplex).walk(FP).count').value;
  // 6: a three-line script on a fresh order
  const o5 = await draft(), script = ['o = erp.find kind=Order number=' + o5.number, 'erp.actions kind=Order id=' + o5.id, 'erp.complete kind=Order id=' + o5.id].join('\n'), sf = path.join(dir, 'order.txt'); fs.writeFileSync(sf, script + '\n');
  const r = spawnSync(process.execPath, [path.join(OOTB, 'common/door/door.js'), '--script', sf], { env, encoding: 'utf8', maxBuffer: 1 << 26 }), envs = r.stdout.trim().split('\n').map(x => JSON.parse(x));
  out.script = { text: script, statuses: envs.map(e => e.verb + ' ' + e.status), after: envs[2] && envs[2].answer && envs[2].answer.after }; L('script ' + out.script.statuses.join(' | '));
  if (envs.length !== 3 || envs.some(e => e.status !== 'ok')) throw new Error('the script did not run three ok lines');
  out.verbs = JSON.parse(fs.readFileSync(path.join(OOTB, 'common/door/verbs.json'), 'utf8')).verbs.length;
  fs.writeFileSync(path.join(__dirname, 'out', 'facts.json'), JSON.stringify(out, null, 1)); L('wrote out/facts.json verbs=' + out.verbs + ' rooms=' + out.rooms + ' walk=' + out.walk + ' order=' + out.order.number);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
