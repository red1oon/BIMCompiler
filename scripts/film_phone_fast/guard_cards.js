// ⚠ DO NOT REMOVE — Scope: FILM-M1 guard for the opening chapter card + the last card (cards_m1.js). READ <work>/cards/guard.log; the exit code is not evidence.
// Issues it proves or disproves: O the cards do not overflow (width/height measured by cards_m1.js, re-read here); T the chapter card carries the owner's words and sits on a plain background;
// P every prior-art source on the card has a citation that REALLY exists in the repo text (file + exact words + line), red control: a made-up source must fail; CR every credential's verdict is in
// MOBILE_PERF.md at origin/master inside the block of its PR, the PR is MERGED, red control: a made-up credential and a wrong verdict must fail; F the figures on the card re-derived from the raw logs by a
// DIFFERENT line than the one the card used; G the guide link answers HTTP 200 and its anchor is in the fetched page (§FILM_GUIDE). INCONCLUSIVE (never PASS) if a red control could not fail.
// Run: node guard_cards.js <work dir> [<app tree>]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const SRC = require('./m1_sources.js');
const W = path.resolve(process.argv[2] || '.'), APP = process.argv[3] || process.env.BIM_OOTB || '', C = path.join(W, 'cards');
const LOG = []; let bad = 0, judged = 0, redOk = 0, redN = 0;
const L = s => { LOG.push(s); console.log(s); }, must = (t, ok) => { judged++; if (!ok) bad++; L('§GUARD ' + (ok ? 'OK   ' : 'FAIL ') + t); }, red = (t, caught) => { redN++; if (caught) redOk++; L('§GUARD_RED ' + t + ' ' + (caught ? 'FAILS as required' : 'PASSED (guard blind!)')); };
const R = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } }, logOf = r => R(path.join(W, r, 'record.log')), g = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
const CL = R(path.join(C, 'cards.log')), J = (() => { try { return JSON.parse(R(path.join(C, 'close.json'))); } catch (e) { return null; } })();
const PA = JSON.parse(R(path.join(__dirname, 'priorart.json'))), CR = JSON.parse(R(path.join(__dirname, 'm1_credentials.json')));
// ---- O + T
must('O cards.log: both cards measured, none overflows (' + (g(CL, /(§CARDS_DONE .*)/) || 'missing').replace(/chapter=\S+ close=\S+ /, '') + ')', /§CARDS_DONE .* too_tall=0 OK/.test(CL) && !/TOO-TALL/.test(CL));
const ch = g(CL, /(§CARD kind=chapter .*)/) || '';
must('T chapter card: the owner\'s kicker, title and sub-line, plain dark background, no picture behind it', ch.indexOf('kicker="CH 0  ·  OFFLINE MOBILITY"') >= 0 && ch.indexOf('title="Offline mobility comes to the BIM and ERP world"') >= 0 && ch.indexOf('sub="The phone, fast: walk the site, snag it, HQ gets it."') >= 0 && /background=rgb\(11, 15, 23\) images_behind=0/.test(ch));
// ---- P
const pr = SRC.verifyPrior(PA.items, APP);
pr.forEach(r => must('P prior art "' + r.it.name + '" cited at ' + r.it.where.file + (r.ok ? ':' + r.line : '') + ' (' + r.it.where.section + ')' + (r.ok ? '' : ' — ' + r.why), r.ok));
must('P the card shows exactly the verified sources (' + pr.filter(r => r.ok).length + ' of ' + PA.items.length + ')', !!J && J.prior.length === pr.filter(r => r.ok).length && pr.every(r => J.text.some(t => t.indexOf(r.it.name) === 0)));
{ const fake = { name: 'Imaginary Layout Spec', where: { repo: 'bim-compiler', file: 'prompts/MOBILE_PERF.md', ref: 'origin/master', section: 'nowhere', text: 'the Imaginary Layout Spec says every sheet must wobble' }, does: 'x', took: 'y' };
  red('P made-up source "Imaginary Layout Spec"', !SRC.verifyPrior([fake], APP)[0].ok);
  const one = JSON.parse(JSON.stringify(PA.items[0])); one.where.text = one.where.text.replace('100 ms', '200 ms'); red('P a real source with one number changed (100 → 200 ms)', !SRC.verifyPrior([one], APP)[0].ok);
  const nof = JSON.parse(JSON.stringify(PA.items[0])); nof.where.file = 'prompts/NO_SUCH_FILE.md'; red('P a source citing a file that does not exist', !SRC.verifyPrior([nof], APP)[0].ok); }
// ---- CR
const states = SRC.prStates(CR.repo, [...new Set(CR.items.map(i => i.pr))]), vc = SRC.verifyCreds(CR, states);
vc.forEach(v => must('CR #' + v.c.pr + ' ' + v.c.witness + ' ' + v.c.verdict + ' <- MOBILE_PERF.md:' + v.line + ' (PR ' + states[v.c.pr] + ')' + (v.ok ? '' : ' — ' + v.why), v.ok));
must('CR the card prints every verified witness verdict (' + vc.filter(v => v.ok).length + ')', !!J && vc.filter(v => v.ok).every(v => J.text.some(t => t.indexOf(v.c.witness + ' ' + v.c.verdict + ' #' + v.c.pr) >= 0)));
{ const o = SRC.verifyCreds({ items: [Object.assign({ witness: 'offline' }, CR.offline)] }, states)[0]; must('CR offline claim (W-SEND-HQ-TEAM T4) <- MOBILE_PERF.md:' + o.line, o.ok && !!J && J.text.some(t => t.indexOf(CR.offline.says) >= 0));
  const fk = { pr: 9999, witness: 'W-IMAGINARY', verdict: '99/0', header: null, text: '`§WITNESS_IMAGINARY PASS judged=99 fails=0`' }; red('CR made-up credential W-IMAGINARY 99/0', !SRC.verifyCreds({ items: [fk] }, { 9999: 'MERGED' })[0].ok);
  const wr = Object.assign({}, CR.items[0], { text: CR.items[0].text.replace('judged=23', 'judged=24') }); red('CR a real PR with the wrong verdict (23/0 → 24/0)', !SRC.verifyCreds({ items: [wr] }, states)[0].ok);
  const lh = CR.items.find(i => i.lineHas); if (lh) red('CR a verdict line that does not carry its PR (' + lh.pr + ' claimed on the wrong line)', !SRC.verifyCreds({ items: [Object.assign({}, lh, { lineHas: 'bim-ootb #9999' })] }, states)[0].ok);
  const op = Object.assign({}, CR.items[0]); red('CR a real verdict with a PR that is not merged', !SRC.verifyCreds({ items: [op] }, Object.assign({}, states, { [op.pr]: 'OPEN' }))[0].ok); }
// ---- F: figures re-derived from other lines of the raw logs
{ const A = logOf('A'), B = logOf('B'), Cc = logOf('C'), S = logOf('S'), txt = J ? J.saw.join(' ') : '';
  const f = (name, want, has) => must('F ' + name + ' = ' + want + ' (raw log) and on the card', want != null && !!J && has(want, txt));
  f('clash matrix count of the picked pair (§CLASH_MATRIX_COUNT MEP|ARC)', g(Cc, /§CLASH_MATRIX_COUNT MEP\|ARC = (\d+)/), (w, t) => t.indexOf('<i>' + w + '</i> in the matrix') >= 0);
  f('overlap in m (§M1_SHARE overlap_mm / 1000)', (g(Cc, /overlap_mm=(\d+)/) / 1000).toFixed(3), (w, t) => t.indexOf('overlap <i>' + w + ' m</i>') >= 0);
  f('walk points (§M1_SCRUB labels count)', String((g(A, /§M1_SCRUB walk_events=\d+ labels=(.*)/) || '').split('","').length), (w, t) => t.indexOf('<i>' + w + '</i> points on the record') >= 0);
  f('walk steps (last §WALK_TRACE steps=)', String(Math.max(...(A.match(/§WALK_TRACE i=\d+ why=\w+ steps=(\d+)/g) || []).map(l => +g(l, /steps=(\d+)/)))), (w, t) => t.indexOf(w + ' steps (simulated') >= 0);
  f('replayed points (§M1_SYNC_REPLAY points=)', g(S, /§M1_SYNC_REPLAY points=(\d+)/), (w, t) => t.indexOf('replayed <i>' + w + '</i> points') >= 0);
  f('scrub max error (max of §M1_SYNC_SCRUB_DETAIL per_point_err_m)', (Math.max(...(g(S, /per_point_err_m=([\d.,]+)/) || '9').split(',').map(Number))).toFixed(4), (w, t) => t.indexOf('scrub max error <i>' + w + ' m</i>') >= 0);
  f('issues HQ got (§M1_SYNC rows / §HQ_GET issues_added)', g(S, /§HQ_GET drops=\d+ new=\d+ issues_added=(\d+)/), (w, t) => t.indexOf('HQ got <i>' + w + '</i> issue') >= 0);
  { const db = g(B, /db=buildings\/(\w+?)_extracted/), nm = db ? SRC.siteName(db) : null, row = J ? J.saw.find(s => s.indexOf('<b>5 Site B</b>') === 0) || '' : '', has = (n, r) => (r === undefined ? row : r).indexOf('<b>5 Site B</b><br>' + n + ' walk') === 0, raw = (db || '').replace(/_.*/, '');
    must('F site B name on the card = the captions\' name (m1_sources siteName, db=' + db + ' -> "' + nm + '")', !!nm && has(nm));
    red('F site B row rewritten with the raw db prefix ("' + raw + '", the rc3 card) must fail the name check', !!nm && nm !== raw && !has(nm, row.replace('<br>' + nm + ' walk', '<br>' + raw + ' walk'))); }
  { // offline (rc4, MOBILE_PERF §2026-11-28 point 2): the S log's order proves walk + snag + send happened offline and the send went out only after the signal came back
    const at = re => { const m = re.exec(S); return m ? m.index : -1; }, seq = [/§M1_OFFLINE on onLine=false badge="[^"]+"/, /§ISSUE_SAVED/, /§M1_OFFLINE_WORK onLine=false issues_saved=[1-9]\d* walk_trace_lines=[1-9]\d* folder_drops=0/, /§HQ_TEAM queued id=/, /§M1_OFFLINE off onLine=true folder_drops 0->[1-9]/, /§HQ_SEND via=team drop=/].map(at);
    const inOrder = seq.every((v, i) => v >= 0 && (i === 0 || v > seq[i - 1])), row = J ? J.saw.find(x => x.indexOf('<b>4 To HQ</b>') === 0) || '' : '';
    must('F offline order in the S log (offline -> snag -> work offline, folder 0 -> queued -> online -> sent) = ' + seq.join(','), inOrder);
    must('F the card says the To-HQ report was done offline only because the log proves it', inOrder === (row.indexOf('done offline') >= 0));
    const sw = seq.slice(); [sw[3], sw[5]] = [sw[5], sw[3]]; red('F a log where the send went out before the queue (positions swapped) must fail the order check', !sw.every((v, i) => v >= 0 && (i === 0 || v > sw[i - 1]))); }
  must('F site B snag class (§SNAP line) matches the card', !!g(B, /§SNAP (\w+) /) && !!J && J.saw.some(s => s.indexOf('<b>5 Site B</b>') === 0 && s.indexOf('saved: ' + g(B, /§SNAP (\w+) /)) >= 0)); }
// ---- G: guide link
{ cp.spawnSync('mkdir', ['-p', path.join(C, 'prior')]); const page = CR.guide.url.split('#')[0], anch = CR.guide.url.split('#')[1], f = path.join(C, 'prior', 'guide.html');
  const r = cp.spawnSync('curl', ['-sL', '-m', '60', '-A', 'film-prior-art-fetch', '-o', f, '-w', '%{http_code}', page], { encoding: 'utf8' }), http = r.stdout.trim(), an = R(f).indexOf('id="' + anch + '"') >= 0;
  const line = '§FILM_GUIDE url=' + CR.guide.url + ' http=' + http + ' anchor=' + (an ? 'Y' : 'N'); L(line); must('G ' + line + '; the card carries the link', http === '200' && an && !!J && J.text.some(t => t.indexOf(CR.guide.url) >= 0)); }
const verdict = judged === 0 || redN < 6 || redOk < redN ? (bad ? 'FAIL' : 'INCONCLUSIVE') : bad ? 'FAIL' : 'PASS';
L(`§GUARD_CARDS ${verdict} judged=${judged} fails=${bad} red_controls_detected=${redOk}/${redN}`); fs.writeFileSync(path.join(C, 'guard.log'), LOG.join('\n') + '\n'); process.exit(verdict === 'PASS' ? 0 : 1);
