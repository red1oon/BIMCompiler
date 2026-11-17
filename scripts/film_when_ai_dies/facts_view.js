// ⚠ DO NOT REMOVE — film "When AI Dies": the ONE place that turns the raw evidence (out/facts.json, out/shots.log from the real VS Code, the witness logs copied into out/, out/erp.json from the real ERP page) into the named values
// the narration speaks and the cards show. Every value carries its source. A missing source throws: nothing is defaulted. guard.js re-checks the values against the raw text.
'use strict';
const fs = require('fs'), path = require('path'), OUT = path.join(__dirname, process.env.OUTD || 'out'), BASE = path.join(__dirname, 'out');   // evidence is shared by the language cuts (out/); each cut has its own work folder
const rd = f => fs.readFileSync(path.join(BASE, f), 'utf8');
const F = JSON.parse(rd('facts.json')), SH = rd('shots.log'), ERP = JSON.parse(rd('erp.json')), OFF = F.offline;
const shot = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); if (!ls.length) throw new Error('no §FILM_SHOT for ' + name); const l = ls[ls.length - 1], m = / json=(.*)$/.exec(l); const o = JSON.parse(m[1]); o.__line = l; return o; };
const wl = n => rd(F.witness[n].log.replace(/^out\//, ''));
const num = (re, txt, what) => { const m = re.exec(txt); if (!m) throw new Error('not found in ' + what + ': ' + re); return Number(m[1]); };
const S = { before: shot('before'), q1: shot('q1_refs'), q2: shot('q2_line'), q3: shot('q3_hover'), q4: shot('q4_warn'), q5i: shot('q5_idle'), q5r: shot('q5_ready'), q5w: shot('q5_written'), pass: shot('passenger') };
const erpLog = wl('erp_hover'), rv = wl('realvsc'), cp = F.witness.core_pure.line, bp = F.witness.bump_parity.line, bb = F.witness.bump_button.line, isoL = F.witness.isolation.line;
const lastv = S.q3.last_value_line, bump = (/CACHE_VERSION v(\d+)->v(\d+)/.exec(S.q5r.lines.join(' ')) || []);
const V = {
  'ai.setting': [String(S.before.setting), 'shots.log before: chat.disableAIFeatures read from VS Code'], 'ext.count': [String(S.before.non_builtin_extensions.length), 'shots.log before: extensions that are not built in'],
  'refs.places': [String(S.q1.places), 'shots.log q1_refs: executeReferenceProvider'], 'refs.files': [String(S.q1.files), 'shots.log q1_refs: distinct files'],
  'refs.builtin_defs': [String(num(/gave (\d+) other definition/, rv, 'realvsc log')), 'W-X0-REALVSC: the built-in JavaScript support'],
  'erp.layers': [String(ERP.layers.length), 'erp.json: the tooltip of the hovered field'], 'erp.fields': [String(num(/E2 fields=(\d+)/, erpLog, 'erp hover log')), 'W-ERP-HOVER E2'],
  'erp.wrong_line': [String(num(/E2 fields=\d+ .*wrong_line=(\d+)/, erpLog, 'erp hover log')), 'W-ERP-HOVER E2'], 'erp.keys': [String(num(/E4 keys tried=(\d+)/, erpLog, 'erp hover log')), 'W-ERP-HOVER E4'],
  'erp.keys_bad': [String(num(/E4 keys tried=\d+ wrong_or_dead=(\d+)/, erpLog, 'erp hover log')), 'W-ERP-HOVER E4'],
  'tag.hosted_total': [String(num(/hostedTotal=(\d+)/, lastv, 'q3 last value')), 'shots.log q3_hover: the hover\'s own last-value line'], 'tag.matched': [String(num(/matched=(\d+)/, lastv, 'q3 last value')), 'same'],
  'purity.core_files': [String(num(/core_files=(\d+)/, cp, 'core purity witness')), 'W-X0-CORE-PURE'], 'purity.kind': [(/x0\.core-pure\.(\w+)/.exec(S.q4.code) || [])[1] || 'N', 'shots.log q4_warn: the diagnostic code'],
  'purity.diagnostics': [String(S.q4.diagnostics), 'shots.log q4_warn'], 'purity.advice': [/Env\.edge\(\)\.nowMs\(\)/.test(S.q4.message) ? 'Y' : 'N', 'shots.log q4_warn: the diagnostic message'],
  'bump.from': [bump[1], 'shots.log q5_ready: the real check\'s §BUMP line'], 'bump.to': [bump[2], 'same'], 'bump.step': [String(Number(bump[2]) - Number(bump[1])), 'shots.log q5_ready: the real check\'s §BUMP line (to minus from)'], 'bump.written': [String(num(/written=(\d+)/, S.q5w.lines.join(' '), 'q5_written lines')), 'shots.log q5_written: §BUMP_DONE'],
  'bump.button_checks': [String(num(/checks=(\d+)/, bb, 'bump button witness')), 'W-X0-BUMP-BUTTON'], 'bump.parity_judged': [String(num(/judged=(\d+)/, bp, 'bump parity witness')), 'W-BUMP-PARITY'],
  'off.features': [String(OFF.understanding.length), 'offline.json'], 'off.net': [String(OFF.understandNet), 'offline.json'], 'off.files': [String(OFF.files), 'offline.json'], 'off.deps': [String(num(/deps=(\d+)/, isoL, 'isolation witness')), 'W-X0-ISOLATION'],
  'ctx.lines': [String(S.pass.block_lines), 'shots.log passenger: the block copied']
};
const v = k => { if (!V[k]) throw new Error('no fact ' + k); return V[k][0]; };
module.exports = { F, S, V, v, ERP, OFF, SH, shot, BASE, OUT, rd };
