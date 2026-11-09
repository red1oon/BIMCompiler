// ⚠ DO NOT REMOVE — Scope: the cards of "CLI for OOTB Kernel Trilogy, Part II" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §22.8). NO NUMBER IS TYPED: every figure is V('<fact>') from
// facts.resolved.json (guard.js enforces it). Terminal shots are rendered from the saved stdout of the demo runs (evidence/), never retyped. The one picture is the actor-layer
// diagram (assets/, sha256 in assets.sha256). Style follows FILM_NARRATION.md PLAYBOOK C (plain dark, coral kicker, no persistent tags).
'use strict';
const fs = require('fs'), path = require('path');
const { CSS } = require('../film_terms/cards_v3.js');
const ASSETS = process.env.FILM_ASSETS || path.join(__dirname, 'assets'), EV = path.join(__dirname, 'evidence');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = f => 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS, f)).toString('base64');
const last = f => { const s = fs.readFileSync(path.join(EV, f), 'utf8').trim(); try { return JSON.parse(s); } catch (e) { return JSON.parse(s.split('\n').pop()); } };
const CORAL = '#FF6B78', OFF = '#F3EEE8', BL = '#3987e5', OR = '#d95926';
const CSSN = CSS + `.plain{position:absolute;inset:0;background:#0b0f17;display:flex;flex-direction:column;justify-content:center;padding:0 140px}
.kick{font:700 34px/1.2 'DejaVu Sans';color:${CORAL};letter-spacing:3px}.l1{font:800 120px/1.08 'DejaVu Sans';color:${OFF};margin-top:18px}.l2{font:800 120px/1.08 'DejaVu Sans';color:${CORAL}}
.pl{font:400 40px/1.35 'DejaVu Sans';color:#C3C2B7;margin-top:30px}.node{border:3px solid var(--line);border-radius:16px;padding:18px 26px;font:700 30px/1.25 'Noto Sans';text-align:center}
.num{font:800 76px/1.05 'Noto Sans'}.lbl{font:400 28px/1.3 'Noto Sans';color:var(--ink2);margin-top:8px}
.term{background:#0d1117;border:2px solid #30363d;border-radius:12px;padding:16px 22px;font:400 24px/1.45 'DejaVu Sans Mono',monospace;color:#c9d1d9;white-space:pre-wrap;word-break:break-word}
.term .p{color:#7ee787}.term .st{color:#ff7b72;font-weight:700}.term .ok{color:#7ee787;font-weight:700}.term .dim{color:#8b949e}.cap{font:400 24px/1.3 'Noto Sans';color:var(--ink2);margin-top:10px}
.meter{height:56px;border-radius:10px;background:#1c2330;border:2px solid var(--line);width:1000px;position:relative;overflow:hidden}.meter i{display:block;height:100%;background:${BL}}`;
module.exports = { CSS: CSSN, build(F) {
  const V = id => { if (!(id in F)) throw new Error('fact not resolved: ' + id); return esc(F[id]); };
  const Sx = (k, h, st) => `<div data-s="${k}" style="${st || ''}">${h}</div>`;
  const page = (inner, src) => `<div class="pg">${inner}${src ? `<div class="src">${esc(src)}</div>` : ''}</div>`;
  const hd = (k, t, s, c) => `<div class="hd ${c || ''}"><div class="k">${k}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const bx = (cls, w, inner, st) => `<div class="bx ${cls}" style="width:${w}px;flex:none;${st || ''}">${inner}</div>`;
  const plain = (kick, a, b, line) => `<div class="plain">${Sx(1, `<div class="kick">${kick}</div><div class="l1">${a}</div>${b ? `<div class="l2">${b}</div>` : ''}${line ? `<div class="pl">${line}</div>` : ''}`)}</div>`;
  const term = (cmd, body, w) => `<div class="term" style="width:${w || 1728}px;margin-top:12px"><span class="p">$</span> ${cmd}\n${body}</div>`;
  const C = {};
  C.title = { n: 1, html: `<div class="plain">${Sx(1, `<div class="kick">CLI FOR OOTB KERNEL TRILOGY</div><div class="l1" style="font-size:150px">Part II</div><div class="l2" style="font-size:76px;margin-top:6px">More commands for your AI to be right</div>`)}</div>` };
  C.recap = { n: 2, html: page(hd('PART I, IN ONE SHOT', 'The AI was stopped', '') +
    Sx(1, term(`<span class="dim">edit, judged by the building’s own rule</span>`, `<span class="st">STOPPED</span> ${V('g4_reason')}`), '') +
    Sx(2, bx('gd', 1728, `<div class="q">A bay of ${V('g4_bay')} m against a limit of ${V('g4_limit')} m. Undone, with the reason. This film: only what is new.</div>`, 'margin-top:30px')),
    'the first film’s stop, the same run') };
  C.menu = { n: 5, html: page(hd('THE MENU, NOW ' + V('menu_n') + ' ITEMS', 'What your AI is handed', 'asked by a scripted client, no AI · the connector’s own reply') +
    [0, 1, 2, 3].map(i => Sx(i + 1, bx(i < 2 ? 'am' : 'cy', 1728, `<div class="mono" style="color:${i < 2 ? '#FAB219' : '#4FC3F7'}">${V('menu' + i + '_name')}(${V('menu' + i + '_inputs')})</div><div class="sb" style="font-size:22px">${V('menu' + i + '_desc')}</div>`, 'margin-top:12px'))).join('') +
    Sx(5, `<div class="cap">the Modeller’s two, then the Viewer’s two · each says what it does, in plain words</div>`),
    'the connector, tools/list, from the live site') };
  const D1 = last('d1_counts.stdout');
  C.counts = { n: 3, html: page(hd('A NEW COMMAND', 'Ask the Viewer from the command line', '') +
    Sx(1, term(V('d1_cmd'), `${esc(D1.summary)}\n` + D1.rows.map(r => `  ${esc(r[0]).padEnd(6)} ${V('c_' + r[0].toLowerCase())}`).join('\n') + ``)) +
    Sx(2, `<div class="cap" style="font-size:20px">the Viewer’s own line: ${esc(D1.viewerLine)}</div>`) +
    Sx(3, bx('gd', 1728, `<div class="q">A separate count on the file itself gives the same numbers.</div>`, 'margin-top:18px')),
    'the saved run, from an empty folder; the Duplex is a public example house') };
  const D2 = last("d2_clashes.stdout"), W = 800, sc = n => (W * n / F.k_box).toFixed(0);
  C.clashes = { n: 3, html: page(hd('BOXES ARE NOT CLASHES', 'Architecture against services', '') +
    Sx(1, term(V('d2_cmd'), `${esc(D2.summary)}`)) +
    Sx(2, `<svg width="1400" height="260" font-family="Noto Sans, DejaVu Sans" style="margin-top:14px"><text x="0" y="42" font-size="30" fill="#FFFFFF">box overlaps</text><rect x="360" y="14" width="${sc(F.k_box)}" height="42" rx="6" fill="${OR}"/><text x="${380 + +sc(F.k_box)}" y="46" font-size="30" fill="#C3C2B7">${V('k_box')}</text>
      <text x="0" y="122" font-size="30" fill="#FFFFFF">real shapes cross</text><rect x="360" y="94" width="${sc(F.k_clash)}" height="42" rx="6" fill="${BL}"/><text x="${380 + +sc(F.k_clash)}" y="126" font-size="30" fill="#C3C2B7">${V('k_clash')}</text>
      <text x="0" y="202" font-size="30" fill="#FFFFFF">cleared by the shape test</text><rect x="360" y="174" width="${sc(F.k_cleared)}" height="42" rx="6" fill="#0CA30C"/><text x="${380 + +sc(F.k_cleared)}" y="206" font-size="30" fill="#C3C2B7">${V('k_cleared')}</text></svg>`) +
    Sx(3, bx('am', 1728, `<div class="q">A clash is real shapes crossing beyond ${V('k_tol')} mm. Boxes are only where to look. ${V('k_unj')} left unjudged.</div>`, 'margin-top:8px')),
    'the saved run; the Viewer’s own answer') };
  C.shape = { n: 3, html: page(hd('THE EDIT REPORT, NEW WORDS', 'Overlaps, shapes checked', '') +
    Sx(1, term(V('d3_cmd'), `<span class="st">STOPPED</span> ${V('e_reason')}\n<span class="dim">stopped, nothing saved</span>`)) +
    Sx(2, `<div style="display:flex;gap:30px;margin-top:26px">` + [['REAL CLASHES', V('e_clash'), 'bl'], ['BOX PAIRS', V('e_pairs'), 'am'], ['CLEARED, BOX ONLY', V('e_boxonly'), 'gd']].map(x => bx('cy', 540, `<div class="num">${x[1]}</div><div class="lbl">${x[0]}</div>`)).join('') + `</div>`) +
    Sx(3, bx('gd', 1728, `<div class="q">The report used to count boxes. Now it checks the shapes, and says what it could not judge.</div>`, 'margin-top:26px')),
    'the saved run, against the live Modeller') };
  C.bug = { n: 3, html: page(hd('AN HONEST BUG', 'The Viewer’s own answer was wrong', 'on our test copy of the Duplex') +
    Sx(1, bx('or', 1728, `<div class="lbl">before the fix</div><div class="q">${V('bug_box')} box overlaps · ${V('bug_clash')} clashes · cleared −${V('bug_neg')}</div>`, 'margin-top:20px')) +
    Sx(2, bx('gd', 1728, `<div class="lbl">after the fix, the same copy</div><div class="q">${V('fix_box')} box overlaps · ${V('fix_clash')} clashes · ${V('fix_cleared')} cleared</div>`, 'margin-top:20px')) +
    Sx(3, bx('am', 1728, `<div class="q">The verb repeated the app; the test caught the app.</div>`, 'margin-top:20px')),
    'the Viewer clash fix and its witness') };
  const P = { f: last('d4_path_fwd.stdout'), r: last('d4_path_rev.stdout') };
  const pline = k => `band 0 · lines in view ${V('p_lines_' + k)} of ${V('p_lines_t')} · markers in view ${V('p_markers_' + k)} of ${V('p_markers_t')}`;
  C.path = { n: 3, html: page(hd('CHECK A FILM BEFORE YOU BAKE IT', 'What does the camera see?', 'on a public test house · ' + V('p_gl') + ', no graphics card') +
    Sx(1, term(V('d4_cmd'), `forward:  ${pline('f')}`)) +
    Sx(2, term(V('d4_cmd'), `reversed: ${pline('r')}`)) +
    Sx(3, bx('gd', 1728, `<div class="q">Turned around, the same stretch must go blind. It does.</div>`, 'margin-top:22px')),
    'the saved runs; two test tables written into a copy of the public house') };
  const meter = (lbl, x, n, id) => `<div style="margin-top:34px"><div class="lbl" style="font-size:36px;color:#fff">${lbl}</div><div style="display:flex;align-items:center;gap:30px;margin-top:10px"><div class="meter"><i style="width:${Math.max(4, 1000 * Number(String(x).replace(/,/g, '')) / Number(String(n).replace(/,/g, '')))}px"></i></div><div class="num">${V(id[0])} of ${V(id[1])}</div></div></div>`;
  C.meters = { n: 2, html: page(hd('HOW MUCH OF THE APP IS A COMMAND?', 'Counted from the app’s own tables', '') +
    Sx(1, meter('Viewer actions', F.va_x, F.va_n, ['va_x', 'va_n'])) + Sx(2, meter('ERP actions', F.ev_x, F.ev_n, ['ev_x', 'ev_n'])),
    'two generators, each reading the app’s own tables; an independent recount equals each') };
  C.door = { n: 2, html: page(hd('PEOPLE, EMAIL, DEVICES', 'The same menu, the same judge', '') +
    Sx(1, `<div style="background:#fff;border-radius:14px;padding:10px;width:1140px;margin-top:6px"><img src="${img('actor_layer_one_door.png')}" style="width:1120px;display:block"></div>`, 'position:absolute;left:60px;top:200px') +
    Sx(2, `<div style="position:absolute;left:1260px;top:260px;width:540px"><span class="chip open">SPECIFIED, NOT BUILT YET</span>` + bx('am', 520, `<div class="q">Designed, not built. Nothing on this card works today.</div>`, 'margin-top:26px') + `</div>`),
    'the actor-layer design') };
  const rungs = ['The first commands, witnessed', 'One dictionary file for every list', 'Modeller edit commands', 'Viewer read-only commands', 'Scripts that chain the commands', 'Checker commands for your own IFC', 'ERP commands from the dictionary', 'More channels: email, phone, device', 'Graphics-card commands, last, on the owner’s go'];
  C.ladder = { n: 3, html: page(hd('THE DICTIONARY TO COME', V('rungs_n') + ' steps', '') +
    Sx(1, `<div style="margin-top:6px">` + rungs.map((r, i) => `<div style="font:${i === 0 ? 700 : 400} 31px/1.5 'Noto Sans';color:${i === 0 ? '#7ee787' : '#C3C2B7'}">${i === 0 ? '●' : '○'} ${esc(r)}${i === 0 ? ' · ' + V('rung_state0') : ''}</div>`).join('') + `</div>`) +
    Sx(2, `<div style="position:absolute;left:1180px;top:210px;width:600px"><span class="chip open">PLANNED, IN THIS ORDER · NOT BUILT</span></div>`) +
    Sx(3, bx('cy', 1728, `<div class="q">Today: Viewer ${V('va_x')} of ${V('va_n')} · ERP ${V('ev_x')} of ${V('ev_n')}. Each step needs its own proof first.</div>`, 'margin-top:14px')),
    'the roadmap section of the contract; no dates') };
  C.limits = { n: 4, html: page(hd('HONESTLY', 'What this does not do', '', 'am') +
    Sx(1, bx('am', 1728, `<div class="q">The Viewer commands need the Viewer’s page files beside them: ${V('tree_n')} files and one model. Not yet a single file.</div>`, 'margin-top:20px')) +
    Sx(2, bx('am', 1728, `<div class="q">Strength and loads: not checked.</div>`, 'margin-top:18px')) +
    Sx(3, bx('am', 1728, `<div class="q">Whether this helps an AI: not yet measured.</div>`, 'margin-top:18px')) +
    Sx(4, bx('am', 1728, `<div class="q">The email, phone and ERP commands: designed, not built.</div>`, 'margin-top:18px')), 'the contract and the saved runs') };
  C.promise = { n: 1, html: plain('CLI FOR OOTB KERNEL TRILOGY · PART II', 'Any AI may propose.', 'Only the building decides.', '').replace(/class="l1"/, 'class="l1" style="font-size:96px"').replace(/class="l2"/, 'class="l2" style="font-size:96px"') };
  C.howto = { n: 4, html: page(hd('TRY IT', V('guide_url'), 'the AI Proposer Guide') +
    Sx(1, term(V('cmd_install'), '')) + Sx(2, term(V('cmd_get_mcp'), '')) + Sx(3, term(V('cmd_mcp'), `<span class="dim">your AI now has the menu</span>`)) +
    Sx(4, bx('gd', 1728, `<div class="q">Then ask your AI in plain words. The guide shows every step.</div>`, 'margin-top:20px')), 'the guide’s own steps') };
  C.end = { n: 1, html: plain('NO AI INSIDE', 'Part II', 'More commands for your AI to be right', V('guide_url')).replace(/class="l1"/, 'class="l1" style="font-size:110px"').replace(/class="l2"/, 'class="l2" style="font-size:64px"') };
  return C;
} };
