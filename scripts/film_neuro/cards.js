// ⚠ DO NOT REMOVE — Scope: the cards of "Think Global, Act Local" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §16). NO NUMBER IS TYPED: every figure is
// V('<fact>') from facts.resolved.json (guard.js enforces it). Stills are the real captures in FILM_ASSETS (sha256 in assets.sha256). Icons are drawn
// here as plain SVG (no third-party icon licence). Title/chapter cards follow FILM_NARRATION.md PLAYBOOK C (plain dark, coral kicker, no persistent tags).
'use strict';
const fs = require('fs'), path = require('path');
const { CSS } = require('../film_terms/cards_v3.js');
const ASSETS = process.env.FILM_ASSETS || path.join(require('os').homedir(), 'bim-compiler', 'build', 'film_neuro', 'assets');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = f => 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS, f)).toString('base64');
const CORAL = '#FF6B78', OFF = '#F3EEE8', BL = '#3987e5', OR = '#d95926';
const CSSN = CSS + `.plain{position:absolute;inset:0;background:#0b0f17;display:flex;flex-direction:column;justify-content:center;padding:0 140px}
.kick{font:700 34px/1.2 'DejaVu Sans';color:${CORAL};letter-spacing:3px}.l1{font:800 120px/1.08 'DejaVu Sans';color:${OFF};margin-top:18px}.l2{font:800 120px/1.08 'DejaVu Sans';color:${CORAL}}
.pl{font:400 40px/1.35 'DejaVu Sans';color:#C3C2B7;margin-top:30px}.node{border:3px solid var(--line);border-radius:16px;padding:18px 26px;font:700 30px/1.25 'Noto Sans';text-align:center}
.flow{display:flex;align-items:center;gap:22px}.ar{font:700 46px/1 'Noto Sans';color:var(--ink2)}.num{font:800 76px/1.05 'Noto Sans'}.lbl{font:400 28px/1.3 'Noto Sans';color:var(--ink2);margin-top:8px}
.term{background:#0d1117;border:2px solid #30363d;border-radius:12px;padding:18px 22px;font:400 25px/1.45 'DejaVu Sans Mono',monospace;color:#c9d1d9;white-space:pre-wrap;word-break:break-word}
.term .p{color:#7ee787}.term .st{color:#ff7b72;font-weight:700}.quote{font:italic 400 38px/1.4 'DejaVu Serif',serif;color:${OFF};border-left:8px solid var(--am);padding-left:30px}
.cap{font:400 24px/1.3 'Noto Sans';color:var(--ink2);margin-top:10px}.ot{border-collapse:collapse;width:1728px;font:400 23px/1.3 'Noto Sans'}.ot th{text-align:left;color:var(--ink2);font-weight:700;padding:6px 12px;border-bottom:2px solid var(--line)}
.ot td{padding:7px 12px;border-bottom:1px solid #2a2a28;vertical-align:top}.ot tr.us td{color:#fff;font-weight:700;border-top:2px solid var(--cy)}`;
// icons (plain SVG, house colours)
const ICON = {
  person: (c = OFF) => `<svg width="120" height="150" viewBox="0 0 120 150"><circle cx="60" cy="28" r="20" fill="none" stroke="${c}" stroke-width="7"/><path d="M60 50 V100 M60 64 L28 86 M60 64 L92 86 M60 100 L34 142 M60 100 L86 142" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`,
  globe: (c = '#4FC3F7') => `<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" fill="none" stroke="${c}" stroke-width="7"/><ellipse cx="75" cy="75" rx="27" ry="62" fill="none" stroke="${c}" stroke-width="5"/><path d="M13 75 H137 M24 44 H126 M24 106 H126" stroke="${c}" stroke-width="5" fill="none"/></svg>`,
  laptop: (c = '#0CA30C') => `<svg width="170" height="130" viewBox="0 0 170 130"><rect x="28" y="12" width="114" height="78" rx="8" fill="none" stroke="${c}" stroke-width="7"/><path d="M8 104 H162 L150 120 H20 Z" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/></svg>`
};
module.exports = { CSS: CSSN, build(F) {
  const V = id => { if (!(id in F)) throw new Error('fact not resolved: ' + id); return esc(F[id]); };
  const Sx = (k, h, st) => `<div data-s="${k}" style="${st || ''}">${h}</div>`;
  const page = (inner, src) => `<div class="pg">${inner}${src ? `<div class="src">${esc(src)}</div>` : ''}</div>`;
  const hd = (k, t, s, c) => `<div class="hd ${c || ''}"><div class="k">${k}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const bx = (cls, w, inner, st) => `<div class="bx ${cls}" style="width:${w}px;flex:none;${st || ''}">${inner}</div>`;
  const plain = (kick, a, b, line) => `<div class="plain">${Sx(1, `<div class="kick">${kick}</div><div class="l1">${a}</div>${b ? `<div class="l2">${b}</div>` : ''}${line ? `<div class="pl">${line}</div>` : ''}`)}</div>`;
  const C = {};
  C.title = { n: 1, html: plain('AI PROPOSES · THE COMPILER JUDGES', 'Think Global,', 'Act Local', 'an open layer any AI can propose on') };
  C.problem = { n: 3, html: page(hd('THE PROBLEM', 'A beautiful render', '') + `<div style="display:flex;gap:44px;margin-top:10px">` +
    `<div style="width:780px">` + Sx(1, bx('cy', 780, `<div class="lbl">typed to a free AI video demo</div><div class="q" style="font-size:36px">“${V('wan_prompt')}”</div>`)) +
    Sx(3, `<div style="font:800 72px/1.1 'Noto Sans';color:var(--ye);margin-top:60px">But is it accurate?</div>`) + `</div>` +
    Sx(2, `<img src="${img('wan_f1.png')}" style="width:900px;border-radius:12px;border:2px solid var(--line)"><div class="cap">what came back: an AI clip of our own Hospital, after a ${V('wan_wait1')} s wait</div>`) + `</div>`,
    'free demo run, logged in FILM_VS_AI_SLOP.md §DUEL_LEDGER') };
  // the repeat chart: cost to date per day, two independent runs (evidence/overlay_series.json, the shipped A.costOdometerAt)
  const ser = JSON.parse(fs.readFileSync(path.join(__dirname, 'evidence', 'overlay_series.json'), 'utf8'));
  const chart2 = () => { const W = 1000, H = 380, x0 = 60, y0 = 20, mx = Math.max(...ser.A), n = ser.A.length;
    const pts = a => a.map((v, i) => `${(x0 + i / (n - 1) * W).toFixed(1)},${(y0 + H - v / mx * H).toFixed(1)}`).join(' ');
    return `<svg width="1120" height="470" font-family="Noto Sans, DejaVu Sans"><line x1="${x0}" y1="${y0 + H}" x2="${x0 + W}" y2="${y0 + H}" stroke="#6B6A63" stroke-width="2"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + H}" stroke="#6B6A63" stroke-width="2"/>
      <polyline points="${pts(ser.A)}" fill="none" stroke="${BL}" stroke-width="12" stroke-linejoin="round"/><polyline points="${pts(ser.B)}" fill="none" stroke="#FF8C1A" stroke-width="5" stroke-dasharray="18 12"/>
      <rect x="${x0 + 20}" y="${y0 + 8}" width="18" height="18" rx="3" fill="${BL}"/><text x="${x0 + 46}" y="${y0 + 24}" font-size="24" fill="#C3C2B7">run A</text><rect x="${x0 + 160}" y="${y0 + 8}" width="18" height="18" rx="3" fill="${OR}"/><text x="${x0 + 186}" y="${y0 + 24}" font-size="24" fill="#C3C2B7">run B, on top of it</text>
      <text x="${x0 + W}" y="${y0 + 26}" font-size="24" fill="#FFFFFF" text-anchor="end">${V('rep_cost')}</text><text x="${x0}" y="${y0 + H + 40}" font-size="24" fill="#C3C2B7">day by day, all ${V('rep_days')} days</text>
      <text x="${x0 + W}" y="${y0 + H + 40}" font-size="24" fill="#C3C2B7" text-anchor="end">labour cost to date, example rates</text></svg>`; };
  C.repeat = { n: 3, html: page(hd('CAN IT BE REPEATED?', 'Ask it twice', '') +
    Sx(1, `<div class="flow"><div class="node">Claude</div><span class="ar">→</span><div class="node">the Blender connector</div><span class="ar">→</span><div class="node">Bonsai opens the IFC</div><span class="lbl" style="margin-left:20px">and Bonsai has its own schedules</span></div>`) +
    `<div style="display:flex;gap:40px;margin-top:26px;align-items:flex-start">` + Sx(2, chart2()) +
    Sx(3, bx('gd', 560, `<h3>Our Hospital, run twice</h3><div class="q">${V('rep_n')} parts, each on the same day</div><div class="q">${V('rep_tasks')} tasks, the same</div><div class="q">the same cost, every day</div>`)) + `</div>`,
    'Blender connector announced ' + F.blender_date + ' · the two runs: the film’s repeat witness') };
  C.clash = { n: 3, html: page(hd('CLASHES', 'If the boxes touch, is it a clash?', '') + `<div style="display:flex;gap:44px;margin-top:10px;align-items:flex-start">` +
    Sx(1, `<img src="${img('clash_inset.png')}" style="width:760px;border-radius:12px;border:2px solid var(--line)"><div class="cap">our Hospital film: the clash pass</div>`) +
    `<div style="width:900px">` + Sx(2, `<svg width="900" height="250" font-family="Noto Sans, DejaVu Sans"><text x="0" y="40" font-size="30" fill="#FFFFFF">boxes touching</text><path d="M330 14 h526 a4 4 0 0 1 4 4 v28 a4 4 0 0 1 -4 4 h-526 z" fill="${OR}"/><text x="330" y="90" font-size="30" fill="#C3C2B7">${V('clash_broad')}</text>
      <text x="0" y="170" font-size="30" fill="#FFFFFF">real shapes overlap</text><path d="M330 144 h${(530 * +F.clash_true / +String(F.clash_broad).replace(/,/g, '') - 4).toFixed(1)} a4 4 0 0 1 4 4 v28 a4 4 0 0 1 -4 4 h-${(530 * +F.clash_true / +String(F.clash_broad).replace(/,/g, '') - 4).toFixed(1)} z" fill="${BL}"/><text x="330" y="220" font-size="30" fill="#C3C2B7">${V('clash_true')}</text></svg>`) +
    Sx(3, bx('am', 900, `<div class="q">${V('clash_fp')}% of the box clashes were not real. The rest of a box-only answer is guesswork.</div>`, 'margin-top:20px')) + `</div></div>`,
    'the Hospital bake log, §CLASH_NARROWPHASE') };
  const tag = (t, c) => `<div style="font:700 26px/1.3 'Noto Sans';color:${c || '#C3C2B7'};text-align:center;margin-top:8px">${t}</div>`;
  C.idea = { n: 4, html: page(hd('THE IDEA', 'Think global, act local', '') + `<div class="flow" style="margin-top:50px;gap:30px;align-items:flex-start">` +
    Sx(1, `<div style="width:200px;text-align:center">${ICON.person()}${tag('you')}</div>`) + Sx(1, `<span class="ar" style="margin-top:60px;display:block">→</span>`) +
    Sx(2, `<div style="width:330px;text-align:center">${ICON.globe()}${tag('your own AI', '#4FC3F7')}${tag('over the internet · $ per call')}${tag('ideas, fast', '#C3C2B7')}</div>`) + Sx(2, `<span class="ar" style="margin-top:60px;display:block">→ one edit →</span>`) +
    Sx(3, `<div style="width:380px;text-align:center">${ICON.laptop()}${tag('the check', '#0CA30C')}${tag('on your own computer · $' + V('check_cost'))}${tag('no AI inside · exact')}</div>`) + `</div>` +
    Sx(4, bx('cy', 1728, `<div class="q">The report goes back to the AI: what changed, the limit, the bay, and what was not checked.</div>`, 'margin-top:40px')),
    'the AI is outside, its answer is untrusted; the check is a deterministic compiler') };
  C.words = { n: 3, html: page(hd('THE AI’S OWN WORDS', 'A real proposal', V('model') + ' · run of ' + V('run_date') + ' · quoted, not edited') +
    Sx(1, `<div class="quote" style="margin-top:30px">“${V('ai_quote')}”</div>`) + Sx(2, `<div class="quote" style="margin-top:26px">“${V('ai_forecast')}”</div>`) +
    Sx(3, bx('or', 1728, `<div class="q">Its answer: go ahead (decline: ${V('ai_decline')}). The sums are right. It was never told the building’s span limit.</div>`, 'margin-top:36px')),
    'the proposer test, results file of that run') };
  C.stopped = { n: 3, html: page(hd('THE CHECK', 'The same edit, judged by the building', '') + `<div style="display:flex;gap:40px;margin-top:6px;align-items:flex-start">` +
    `<div style="width:1150px">` + Sx(1, `<div class="term"><span class="p">$</span> ${V('g4_cmd')}\n<span class="st">STOPPED</span> ${V('g4_reason')}</div>`) +
    Sx(3, bx('gd', 1150, `<div class="q">Undone. The building is back where it was, and the reason goes back to the AI.</div>`, 'margin-top:26px')) + `</div>` +
    Sx(2, `<img src="${img('panel_only.png')}" style="height:660px;border-radius:10px;border:2px solid var(--line)">`) + `</div>`,
    'edit_cli run today; the panel is the Modeller’s own report for the same edit, byte-identical') };
  C.ch_global = { n: 1, html: plain('CHAPTER ONE', 'Think global', '', 'the AI proposes') };
  C.chart = { n: 2, html: page(hd('DOES THE REASON HELP?', 'Right outcomes, out of ' + V('n_runs'), '') + `<div style="display:flex;gap:50px;margin-top:30px;align-items:center">` +
    Sx(1, `<svg width="1100" height="300" font-family="Noto Sans, DejaVu Sans"><text x="0" y="62" font-size="30" fill="#FFFFFF">first try</text><path d="M330 30 h${(700 * F.a_right / F.n_runs - 4).toFixed(1)} a4 4 0 0 1 4 4 v44 a4 4 0 0 1 -4 4 h-${(700 * F.a_right / F.n_runs - 4).toFixed(1)} z" fill="${OR}"/><text x="${340 + 700 * F.a_right / F.n_runs}" y="66" font-size="34" fill="#FFFFFF">${V('a_right')}</text>
      <text x="0" y="192" font-size="30" fill="#FFFFFF">with the report</text><path d="M330 160 h${(700 * F.b_right / F.n_runs - 4).toFixed(1)} a4 4 0 0 1 4 4 v44 a4 4 0 0 1 -4 4 h-${(700 * F.b_right / F.n_runs - 4).toFixed(1)} z" fill="${BL}"/><text x="${340 + 700 * F.b_right / F.n_runs}" y="196" font-size="34" fill="#FFFFFF">${V('b_right')}</text>
      <line x1="330" y1="16" x2="330" y2="230" stroke="#6B6A63" stroke-width="2"/></svg>`) +
    Sx(1, `<div style="text-align:center">${ICON.globe()}${tag('model calls for that run', '#4FC3F7')}${tag('about $' + V('cost_v3') + ', an estimate')}</div>`) + `</div>` +
    Sx(2, bx('am', 1728, `<div class="q">A small test: our own requests, one model, ${V('n_runs')} runs. A direction, not a proof.</div>`, 'margin-top:30px')),
    'the proposer test, results file; cost = Claude Code estimate, not a charge') };
  C.ch_local = { n: 1, html: plain('CHAPTER TWO', 'Act local', '', 'the check runs on your own computer') };
  C.terminal = { n: 3, html: page(hd('ON YOUR OWN MACHINE', 'One file, a fresh copy of the building', '') +
    Sx(1, `<div class="term" style="width:1728px"><span class="p">$</span> ${V('cmd_lines')}\n  grid from: ${V('lines_src')} · ${V('lines_n')} grid lines · ${V('lines_first')} …</div>`) +
    Sx(2, `<div class="term" style="width:1728px;margin-top:22px"><span class="p">$</span> ${V('g4_cmd')}\n  <span class="st">stopped</span> · ${V('g4_secs')} s</div>`) +
    Sx(3, bx('cy', 1728, `<div class="q">Nothing is saved. Every call opens the building fresh, so the same question gets the same answer.</div>`, 'margin-top:26px')),
    'edit_cli, run today') };
  const shiftSvg = () => { let s = `<svg width="900" height="380" font-family="Noto Sans, DejaVu Sans"><line x1="430" y1="20" x2="430" y2="340" stroke="#FAB219" stroke-width="5" stroke-dasharray="12 8"/><text x="440" y="368" font-size="24" fill="#FAB219">the line</text>`;
    for (let i = 0; i < 6; i++) { const y = 50 + i * 52; s += `<circle cx="${120 + (i % 3) * 90}" cy="${y}" r="11" fill="#C3C2B7"/><circle cx="${520 + (i % 3) * 80}" cy="${y}" r="11" fill="${BL}" opacity=".35"/><line x1="${532 + (i % 3) * 80}" y1="${y}" x2="${612 + (i % 3) * 80}" y2="${y}" stroke="${BL}" stroke-width="4"/><circle cx="${620 + (i % 3) * 80}" cy="${y}" r="11" fill="${BL}"/>`; }
    return s + `<text x="80" y="368" font-size="24" fill="#C3C2B7">before it: stays</text><text x="600" y="368" font-size="24" fill="#C3C2B7">beyond it: moves exactly</text></svg>`; };
  C.exact = { n: 3, html: page(hd('HOW CLOSE IS CLOSE?', 'A shift: one line, one rule', '') + `<div style="display:flex;gap:60px;margin-top:20px;align-items:center">` + Sx(1, shiftSvg()) +
    `<div>` + Sx(2, `<div class="num cy">${V('bs_vertices')}</div><div class="lbl">points checked, across ${V('bs_elements')} parts that cross the line</div>`) +
    Sx(3, `<div class="num gdc" style="margin-top:30px">${V('bs_off')} off</div><div class="lbl">no tolerance applied</div>`) + `</div></div>`,
    'W-BLOCK-SHIFT, run today: ' + F.bs_pass) };
  C.report = { n: 2, html: page(hd('THE REPORT', 'It says what it did not check', '') + `<div style="display:flex;gap:60px;margin-top:0;align-items:flex-start">` +
    Sx(1, `<img src="${img('panel_nc_list.png')}" style="width:640px;border-radius:10px;border:2px solid var(--line)">`) +
    `<div style="width:1000px">` + Sx(1, bx('am', 1000, `<h3>${V('nc_n')} things it says it did not check</h3><div class="q">including load capacity, and floating or unsupported elements</div>`)) +
    Sx(2, bx('or', 1000, `<div class="q" style="font-size:44px;font-weight:700">So a pass never means safe.</div>`, 'margin-top:30px')) + `</div></div>`,
    'the Modeller’s own report panel, same edit') };
  C.ch_rule = { n: 1, html: plain('CHAPTER THREE', 'How far from the rule', '', 'every stop says why') };
  C.g2 = { n: 2, html: page(hd('NOT ONLY SPANS', 'A narrower bay', '') +
    Sx(1, `<div class="term" style="width:1728px;margin-top:20px"><span class="p">$</span> ${V('g2_cmd')}\n<span class="st">STOPPED</span> ${V('g2_reason')}</div>`) +
    Sx(2, bx('gd', 1728, `<div class="q">Box overlaps ${V('g2_ov_before')} → ${V('g2_ov_after')}. Undone, with the reason, so the next try starts from a clean building.</div>`, 'margin-top:30px')),
    'edit_cli, run today') };
  const rows = [
    ['A free AI video demo', 'a clip: pixels', 'nothing', 'no: a picture has no parts list'],
    ['Autodesk Assistant', 'answers and changes', 'you: “' + V('autodesk_q') + '”', 'not stated'],
    ['Autodesk, as the trade press reads it', 'AI geometry', 'a deterministic engine that brings it “into tolerance”', 'not published in that source'],
    ['TestFit', 'no outside AI: its rules generate', 'the rules (zoning, setbacks, unit mix)', 'not published'],
    ['LLM code checking (research)', 'checking scripts for Revit', '“semi-automated”', 'not stated'],
    ['Claude + the Blender connector', 'Python commands in Blender', 'you', 'a repeat: not measured here'],
    ['AlphaGeometry (maths)', 'a construction line', 'a proof engine', 'proof or no proof · ' + V('ag_solved') + ' of ' + V('ag_of') + ' problems'],
    ['This film', 'one edit, from any AI', 'a check on your own computer, no AI inside', 'yes: before → after, the limit, what was not checked']];
  C.others = { n: rows.length, html: page(hd('HOW OTHERS DO IT', 'AI with a check', '') + `<table class="ot"><tr><th style="width:420px">who</th><th>what the AI proposes</th><th>what checks it</th><th>how far off, reported?</th></tr>` +
    rows.map((r, i) => `<tr data-s="${i + 1}" class="${i === rows.length - 1 ? 'us' : ''}">${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') + `</table>`,
    'sources: the film’s web-source file, each page fetched this week; vendor rows are vendor pages') };
  C.limits = { n: 4, html: page(hd('HONESTLY', 'What this does not do', '', 'am') +
    Sx(1, bx('am', 1728, `<div class="q">Overlaps are still counted with boxes, not the real shapes.</div>`, 'margin-top:20px')) +
    Sx(2, bx('am', 1728, `<div class="q">Strength and loads: not checked.</div>`, 'margin-top:18px')) +
    Sx(3, bx('am', 1728, `<div class="q">In the separate compile path, ${V('cp_none')} of ${V('cp_total')} planted mistakes went unnoticed.</div>`, 'margin-top:18px')) +
    Sx(4, bx('am', 1728, `<div class="q">Grid moves and shifts only, on the app’s own buildings.</div>`, 'margin-top:18px')), 'the contract file, its own coverage tests') };
  C.roadmap = { n: 1, html: page(hd('NOT BUILT YET', 'Next', '') + Sx(1, `<div style="margin-top:30px"><span class="chip open">NOT BUILT YET</span></div>` +
    bx('cy', 1728, `<div class="q">the real-shape check behind every report</div><div class="q">a gate on the compile path, for outside orders</div><div class="q">a measured run of an AI with the stop</div>`, 'margin-top:26px')), '') };
  C.promise = { n: 1, html: plain('THINK GLOBAL, ACT LOCAL', 'Let your AI do the beautiful rendering,', 'but let its data be grounded.', '').replace(/class="l1"/, 'class="l1" style="font-size:64px"').replace(/class="l2"/, 'class="l2" style="font-size:64px"') };
  C.howto = { n: 4, html: page(hd('TRY IT WITH YOUR OWN AI', V('guide_url'), 'the AI Proposer Guide') +
    Sx(1, `<div class="term" style="width:1728px;margin-top:20px"><span class="p">$</span> ${V('cmd_install')}</div>`) +
    Sx(2, `<div class="term" style="width:1728px;margin-top:16px"><span class="p">$</span> ${V('cmd_get')}</div>`) +
    Sx(3, `<div class="term" style="width:1728px;margin-top:16px"><span class="p">$</span> ${V('cmd_lines')}</div>`) +
    Sx(4, bx('gd', 1728, `<div class="q">Then paste the guide’s “Instructions to give your AI”, and send it each report.</div>`, 'margin-top:24px')), 'the guide’s own Getting started') };
  C.end = { n: 1, html: plain('NO AI INSIDE', 'Think Global,', 'Act Local', V('guide_url')) };
  return C;
} };
