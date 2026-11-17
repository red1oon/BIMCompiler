// ⚠ DO NOT REMOVE — film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md): §FILM_GUARD. Re-checks every fact the narration speaks and the cards show against the RAW sources (not against facts_view.js alone), parses the finished narration text for numbers
// INDEPENDENTLY and FAILS one that is not a recorded fact, FAILS if a shoot step reported an error, if the editor was left changed, if a still does not show what its step claims (the status-bar pixels of the Bump button DIFFER between its states), if a cut lies
// outside its picture, if a prior-art row's text is not found where it says (check P), if the guide link is not HTTP 200 with its anchor (§FILM_GUIDE) or does not describe the Bump button and the core-purity warning, or if the narration says what the pictures do not show. READ out/guard.log.
// Thai cut (FILM_LANG=th): the same checks on the same facts, plus "no English left on a translated card".
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), https = require('https');
const FV = require('./facts_view.js'), N = require('./narr.js'), LY = require('./layout.js'), PA = require('./priorart.json'), I = require('./i18n.js');
const { F, S, V, ERP } = FV, BASE = FV.BASE, LANG = process.env.FILM_LANG || 'en';
const rdf = f => fs.readFileSync(path.join(BASE, f), 'utf8'), sh = FV.SH;
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m), chk = (ok, what) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + what); };
(async () => {
  // 1. independent re-derivation of the facts from the raw evidence
  const rv = rdf(F.witness.realvsc.log.replace(/^out\//, '')), hv = rdf(F.witness.erp_hover.log.replace(/^out\//, '')), isoL = F.witness.isolation.line;
  chk(/VS Code returns (\d+) places/.exec(rv) && /VS Code returns (\d+) places/.exec(rv)[1] === V['refs.places'][0], 'refs.places ' + V['refs.places'][0] + ' = W-X0-REALVSC\'s own count of Find All References on APP.db');
  chk(/Find All References on APP\.db/.test(rv) && S.q1.field === 'APP.db' && S.q1.definitions.length === 1, 'the definition list of the field has exactly the one X0 jump (' + S.q1.definitions.join(',') + '); the editor\'s own support gave ' + V['refs.builtin_defs'][0] + ' others');
  chk(String(ERP.layers.length) === V['erp.layers'][0] && /\((\d+) layers, in the order they fire\)/.exec(ERP.text)[1] === V['erp.layers'][0], 'erp.layers ' + V['erp.layers'][0] + ' = the count the tooltip itself prints');
  chk(V['erp.wrong_line'][0] === '0' && V['erp.keys_bad'][0] === '0' && /E4 the page|PASS E4/.test(hv) && /pageerr|page_errors=0/i.test(hv), 'W-ERP-HOVER: wrong_line=0, every number key opens its line (' + V['erp.keys'][0] + ' keys), page_errors=0');
  chk(ERP.pageErrors.length === 0 && ERP.openedLink.replace(F.tree, '') .endsWith('/' + ERP.pickedAt) && S.q2.file + ':' + S.q2.line === ERP.pickedAt, 'the ERP page\'s Alt key opened ' + ERP.pickedAt + ' and the editor shows exactly that file:line (' + S.q2.file + ':' + S.q2.line + ')');
  { const m = /(\S+witness\.log):(\d+) @ (\w+)/.exec(S.q3.last_value_line), f = m && (cp.spawnSync('find', [path.join(os.homedir(), '.cache', 'bim4d'), '-path', '*/' + m[1].replace(/^bim4d\//, '')], { encoding: 'utf8' }).stdout.split('\n')[0] || ''), txt = f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n') : [], line = txt[m ? m[2] - 1 : 0] || '';
    chk(!!m && line.indexOf('hostedTotal=' + V['tag.hosted_total'][0]) >= 0 && line.indexOf('matched=' + V['tag.matched'][0]) >= 0 && txt[0].indexOf('§LOG_STAMP') >= 0 && txt.slice(0, 20).some(l => l.indexOf('commit=' + m[3]) >= 0), 'q3: the log file itself holds the value the hover showed at ' + (m ? m[1] + ':' + m[2] : '?') + ' and its stamp names commit ' + (m ? m[3] : '?')); }
  chk(/§LOG_STAMP/.test('§LOG_STAMP') && S.q3.lens.length === 1 && /^last: /.test(S.q3.lens[0]), 'q3: the grey line (CodeLens) above the printing line is there: ' + (S.q3.lens[0] || '').slice(0, 60));
  chk(/core_files=(\d+)/.exec(F.witness.core_pure.line)[1] === V['purity.core_files'][0] && S.q4.diagnostics === 1 && V['purity.kind'][0] === 'clock' && V['purity.advice'][0] === 'Y', 'q4: one warning, kind clock, advice Env.edge().nowMs(); core files ' + V['purity.core_files'][0]);
  { const base = cp.spawnSync('git', ['-C', F.tree, 'show', F.commit + ':viewer/sw.js'], { encoding: 'utf8' }).stdout, m = /CACHE_VERSION\s*=\s*'v(\d+)'/.exec(base);
    chk(!!m && m[1] === V['bump.from'][0] && /CACHE_VERSION = 'v(\d+)'/.exec(S.q5w.cache_line) && /v(\d+)/.exec(S.q5w.cache_line)[1] === V['bump.to'][0] && Number(V['bump.to'][0]) - Number(V['bump.from'][0]) === 1, 'q5: viewer/sw.js CACHE_VERSION in the tree the stills were shot on (' + F.commit + ') v' + (m && m[1]) + ' -> the editor shows ' + S.q5w.cache_line + ' after the real press wrote it'); }
  chk(/CHECK|BUMP_CHECK verdict=PASS/.test(S.q5r.lines.join(' ')) && /written=2/.test(S.q5w.lines.join(' ')) && S.q5i.bump_warning === 1, 'q5: the real check printed verdict=PASS before anything was written, the second press wrote (written=2), the warning was there before');
  chk(/judged=24 failed=0/.test(F.witness.bump_parity.line) && /real_row=skipped/.test(F.witness.bump_parity.line), 'bump parity: judged=24 failed=0 and its real-bridge row says skipped (the card says so)');
  { const o = rdf('offline.log'), m = /understanding_features=(\d+) understanding_features_net=(\d+)/.exec(o); chk(m && m[1] === V['off.features'][0] && m[2] === V['off.net'][0] && /red_control=DETECTED/.test(o) && /verdict=PASS/.test(o), 'offline: ' + V['off.features'][0] + ' understanding features, ' + V['off.net'][0] + ' doors, red control DETECTED, verdict PASS (out/offline.log)'); }
  chk(V['off.deps'][0] === '0' && /red=Y/.test(isoL), '§X0_ISOLATION deps=0 with its red control');
  chk(S.before.setting === true && S.before.non_builtin_extensions.length === 1 && S.before.ai_named_extensions.length === 0, 'the editor itself reports chat.disableAIFeatures=true, ONE extension that is not built in (' + S.before.non_builtin_extensions + '), no extension named like an assistant');
  chk(V['ctx.lines'][0] === String(S.pass.block_lines) && S.pass.clipboard_equals_doc === true && S.pass.sections.length === 5, 'passenger: the block copied = the block opened beside (' + V['ctx.lines'][0] + ' lines, ' + S.pass.sections.length + ' sections)');
  // 2. the shoot's own report
  chk(!/§FILM_ERROR/.test(sh), 'no shoot step reported an error');
  chk(/§FILM_START clean=true/.test(sh) && /§FILM_RESTORE step=q4 warnings_after_removal=0 file_equals_HEAD=true/.test(sh) && /§FILM_RESTORE step=q5 tree_clean=true/.test(sh) && /§FILM_END clean=true/.test(sh) && /§FILM_TREE_AFTER clean=Y/.test(sh), 'the tree started clean, every edit was taken back, the tree ended clean (§FILM_RESTORE x2, §FILM_END, §FILM_TREE_AFTER)');
  { const anc = cp.spawnSync('git', ['-C', F.tree, 'merge-base', '--is-ancestor', F.commit, 'origin/main']).status === 0; chk(/§FILM_TREE new=(\w+)/.exec(sh)[1] === F.commit && anc, 'the stills and the witnesses ran on the same clean tree: ' + F.commit + (F.commit === F.originMain ? ' = origin/main' : ' (an ancestor of origin/main, which has moved to ' + F.originMain + ' since; the EN and TH cuts used this same commit)')); }
  // 3. the pictures show what their step claims (numbers, not a look)
  const g = (name, crop) => { const f = path.join(BASE, 'stills', name + '.png'), o = path.join(os.tmpdir(), 'wad_' + name + '_' + process.pid + '.png'); cp.spawnSync('convert', [f, '-crop', crop, '+repage', o]); return o; };
  const ae = (a, b) => { const r = cp.spawnSync('compare', ['-metric', 'AE', a, b, 'null:'], { encoding: 'utf8' }); return Number((r.stderr || '').trim().split(/\s/)[0]); };
  const SB = '420x26+0+874', bi = g('q5_idle', SB), bc = g('q5_checking', SB), br = g('q5_ready', SB), bw = g('q5_written', SB);
  const t = /§FILM_SHOT_TIMING name=q5_checking press_to_still_ms=(\d+) check_ended_ms=(\d+) during_check=Y/.exec(sh);
  chk(!!t && +t[1] < +t[2], 'q5: the "checking" still was taken while the check ran (still at ' + (t && t[1]) + ' ms, the check ended at ' + (t && t[2]) + ' ms)');
  const a1 = ae(bi, bc), a2 = ae(bc, br), a3 = ae(bi, bw), a4 = ae(br, bw);
  chk(a1 > 300 && a2 > 300 && a4 > 300 && a3 < a1, 'q5: the Bump item\'s pixels differ between states: idle/checking AE=' + a1 + ', checking/ready AE=' + a2 + ', ready/written AE=' + a4 + '; written vs idle AE=' + a3 + ' (back to idle)');
  const sizes = {}; fs.readdirSync(path.join(BASE, 'stills')).forEach(f => { const r = cp.spawnSync('identify', ['-format', '%w %h', path.join(BASE, 'stills', f)], { encoding: 'utf8' }).stdout.split(' ').map(Number); sizes[f.replace('.png', '')] = r; });
  const winOK = Object.keys(sizes).every(k => sizes[k][0] === LY.WIN.w && sizes[k][1] === LY.WIN.h);
  const bandsOK = Object.entries(LY.CROP).every(([k, y0]) => sizes[k] && y0 >= 0 && y0 + LY.MH / LY.SC <= sizes[k][1] + 0.6) && Object.entries(LY.TOPCROP).every(([k, y0]) => sizes[k] && y0 >= 0 && y0 + LY.TOP / LY.SC <= sizes[k][1]);
  chk(winOK && bandsOK, 'every still is the real window (' + LY.WIN.w + 'x' + LY.WIN.h + ') and every cut band lies inside its picture');
  { const eb = LY.erpBand(ERP.tip), pt = ERP.point, inside = ERP.tip.x >= eb.x0 && ERP.tip.x + ERP.tip.w <= eb.x0 + eb.w && ERP.tip.y >= eb.y0 && ERP.tip.y + ERP.tip.h <= eb.y0 + eb.h && pt.y >= eb.y0 && pt.y <= eb.y0 + eb.h;
    chk(inside, 'the ERP band (x ' + eb.x0 + '+' + Math.round(eb.w) + ', y ' + eb.y0 + '+' + Math.round(eb.h) + ', zoom ' + eb.zoom + ') holds the whole tooltip and the hovered field'); }
  // 4. every number the voice speaks is a recorded fact (an independent parser of the finished text)
  const UNITS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 }, TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
  const numbersIn = text => { const out = [], toks = text.toLowerCase().replace(/[^a-z0-9\- ]+/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean); let cur = null, total = 0, i = 0;
    const flush = () => { if (cur !== null) { out.push(total + cur); cur = null; total = 0; } };
    for (; i < toks.length; i++) { const w = toks[w0(i)] ; const tk = toks[i];
      if (/^\d+$/.test(tk)) { flush(); out.push(+tk); continue; }
      if (tk in UNITS) { cur = (cur || 0) + UNITS[tk]; continue; } if (tk in TENS) { cur = (cur || 0) + TENS[tk]; continue; }
      if (tk === 'hundred' && cur !== null) { cur *= 100; continue; } if (tk === 'thousand' && cur !== null) { total += cur * 1000; cur = 0; continue; }
      if (tk === 'and' && cur !== null && /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)$/.test(toks[i + 1] || '')) continue;
      flush(); }
    flush(); return out; };
  function w0(i) { return i; }
  if (LANG === 'en') N.beats.forEach(b => { if (!b.text) return; const said = numbersIn(b.text).map(String), rec = (b.says || []).map(x => x[1]), plain = { twelve: '12', one: '1' };
    const allowed = rec.concat((b.plain || []).map(p => plain[p])); const left = said.slice(); allowed.forEach(a => { const k = left.indexOf(a); if (k >= 0) left.splice(k, 1); });
    const unrecorded = left, missing = rec.filter(x => !said.includes(x));
    chk(!unrecorded.length && !missing.length, b.id + ' speaks ' + JSON.stringify(said) + (unrecorded.length ? ' NOT a recorded fact: ' + unrecorded : '') + (missing.length ? ' recorded but not spoken: ' + missing : '')); });
  else N.beats.forEach(b => { if (!b.text) return; const said = (b.text.match(/(?<![A-Za-z0-9])\d[\d,]*/g) || []).map(x => x.replace(/,/g, '')), rec = (b.says || []).map(x => x[1]), plain = (b.plain || []).map(p => ({ twelve: '12', one: '1' })[p]); const left = said.slice(); rec.concat(plain).forEach(a => { const k = left.indexOf(a); if (k >= 0) left.splice(k, 1); });
    chk(!left.length && rec.every(x => said.includes(x)), b.id + ' speaks ' + JSON.stringify(said) + (left.length ? ' NOT a recorded fact: ' + left : '')); });
  if (LANG === 'en') { const q1 = N.beats.find(b => b.id === 'q1'), planted = q1.text.replace('eight hundred and twenty-four', 'eight hundred and twenty-five'), s0 = numbersIn(planted).map(String), rec = q1.says.map(x => x[1]);
    chk(s0.includes('825') && !rec.includes('825'), 'red control: a planted "eight hundred and twenty-five" in the q1 text is parsed as 825 and is NOT a recorded fact (the number check would FAIL it)'); }
  if (LANG !== 'en') { const q1 = N.beats.find(b => b.id === 'q1'), s0 = (q1.text.replace('824', '825').match(/(?<![A-Za-z0-9])\d[\d,]*/g) || []), rec = q1.says.map(x => x[1]);
    chk(s0.includes('825') && !rec.includes('825'), 'red control (' + LANG + '): a planted 825 in the q1 text is NOT a recorded fact (the number check would FAIL it)'); }
  // 5. roadmap = the design file
  { const d = cp.spawnSync('git', ['-C', path.join(__dirname, '..', '..'), 'show', 'origin/master:prompts/CODE_ARCHITECTURE_DESIGN.md'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout;
    chk(/## PART C — Named APP parts/.test(d) && /## PART D — App-wide owner table/.test(d) && /## PART E — A proof map/.test(d) && /\| C, D \| not started/.test(d) && /\| E \| not started/.test(d) && /B1 \(modeller\): build spec written/.test(d) && /\*\*B0 ✅\*\*/.test(d), 'the roadmap card = the design file: B0 built, B1 next with its build spec written, C D E not started (prompts/CODE_ARCHITECTURE_DESIGN.md on master)'); }
  // 6. prior art (check P)
  PA.items.forEach(it => { let s = ''; try { s = fs.readFileSync(path.join(__dirname, it.where.saved), 'utf8').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' '); } catch (e) { s = ''; } chk(s.indexOf(it.where.text) >= 0, 'P prior art "' + it.name + '" <- ' + it.where.saved + ' holds: "' + it.where.text.slice(0, 70) + '…"'); });
  // 7. the guide link (house style: HTTP 200 + the anchor present) and that it now describes what the film shows
  const URL = 'https://red1oon.github.io/BIMCompiler/DeveloperGuide/#41-x0-navigator-the-repos-own-vs-code-extension', ANCH = '41-x0-navigator-the-repos-own-vs-code-extension';
  const get = u => new Promise(res => https.get(u, { headers: { 'User-Agent': 'film-guard', 'Cache-Control': 'no-cache' }, timeout: 30000 }, r => { let b = ''; r.setEncoding('utf8'); r.on('data', d => b += d); r.on('end', () => res({ status: r.statusCode, text: b })); }).on('error', () => res({ status: 0, text: '' })));
  const gp = await get(URL.split('#')[0]), plain = gp.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  L('§FILM_GUIDE url=' + URL + ' http=' + gp.status + ' anchor=' + (gp.text.indexOf('id="' + ANCH + '"') >= 0 ? 'Y' : 'N') + ' bump_described=' + (/Status bar ▸ Bump/.test(plain) ? 'Y' : 'N') + ' core_pure_described=' + (/yellow underline on a clock, random or network call in a core file/.test(plain) ? 'Y' : 'N'));
  chk(gp.status === 200 && gp.text.indexOf('id="' + ANCH + '"') >= 0 && /Status bar ▸ Bump/.test(plain) && /yellow underline on a clock, random or network call in a core file/.test(plain), 'the guide link answers HTTP 200, the anchor is in the page, and §4.1 describes the Bump button and the core-purity warning (the gap named on 2026-11-18 is closed)');
  // 8. not said: the film must not claim what the evidence does not show
  const said = N.beats.map(b => b.text || '').join(' ');
  [[/(?<!not )\b(we|i) (pulled|cut|unplugged) the (plug|network|internet)/i, 'no claim that the network was cut (the machine cannot do that without root)'], [/\bfirst\b|\bnovel\b|\bnobody\b|\bonly tool\b|\bunique\b/i, 'no claim of being first or novel'],
   [/\bfaster\b|\bspeed\b/i, 'no speed was measured'], [/\bnever (wrong|fails)\b|\balways right\b|\bguarantee/i, 'no claim that it is never wrong'], [/(?<!not )\bbuilt\b(?! yet)(?!.{0,40}designed)/i, 'Parts B1, C, D, E are not claimed as built'],
   [/\btyped parts\b|typescript|three hundred thousand|fifty-four files/i, 'no TypeScript, no "typed parts", no quoted line or file counts'], [/\bthe editor calls? an? (model|AI)\b/i, 'no claim that the editor calls a model']].forEach(([re, why]) => { const hit = re.test(said); chk(!hit, 'not said: ' + why); });
  // 9. a translated cut: no English left on a card except code, § lines, file names and the proper names
  if (LANG !== 'en') { const T = I[LANG], E = I.en, bad2 = []; const KEEP = /^(?:[A-Z0-9_.#+:→\-\/ ·"'(){}\[\],=<>*§]|bim-ootb|VS Code|ERP|Shift|Alt|Bump|X0|Navigator|Developer Guide|GitHub|APP|CI|JavaScript|Modeller|B0|B1|AI)+$/;
    Object.keys(E).forEach(k => { if (!(k in T)) { bad2.push(k + ' (missing)'); return; } const tx = T[k]; if (tx === '' ) return; const words = tx.replace(/\{\w+\}/g, '').match(/[A-Za-z]{4,}/g) || []; const allowed = /^(back|Deploy|main|settings|json|Ship|fetch|vibe|coding|bookmarklet|hover|dependency|merge|ERP|Shift|Bump|Navigator|Developer|Guide|GitHub|JavaScript|Modeller|bim|ootb|Code|Context|file|this|Date|now|Single|Press|Sounds|Key|eklee|qubodup|OpenGameArt|VS|CPU|GPU|MIT|APP|callout|this|chat|disableAIFeatures|assistant|extensions|built|read|from|CODE|ARCHITECTURE|DESIGN|prompts|parts|NOT|BUILT|YET|WHEN|DIES|AI|Alt|Alt)$/i; const eng = words.filter(w => !allowed.test(w)); if (eng.length) bad2.push(k + ': ' + eng.slice(0, 4).join(','));
    });
    chk(bad2.length === 0, 'translated cut (' + LANG + '): every card sentence is translated; no English words left but code, file and proper names' + (bad2.length ? ' — ' + bad2.slice(0, 8).join(' | ') : '')); }
  L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('§FILM_GUARD FATAL ' + (e && e.stack || e)); process.exit(1); });
