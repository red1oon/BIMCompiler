#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "Remember The Name - red1" (prompts/CLI_ERP_IVR.md §22.13; prompts/FILM_COMMAND_LINE_ERP.md "CH red1"): reads THIS build's own recording (out/rec/frames.json + out/rec/red1.err, made by rec.py from the real `red1` shell on the Duplex model)
// and writes out/facts.json: every number the film speaks or shows. Sources, in order of trust: the shell's own §RED1 log lines (red1.err: the funnel's value, the glob's rows, the held line), then the screens the shell drew (frames.json).
// Checks, each printed: C1 each typed line drew its `→` door line · C2 the funnel on the screen equals the funnel in the §RED1 log (both clashes) · C3 the menu offers exactly the disciplines `count` listed · C4 `ls *Bath*` was served from the held answer and
// its row total is the funnel's box overlaps · C5 the element list's shown/total and the rows drawn agree · C6 the storey groups add up to the element total · C7 `exit` ended on the bash prompt · C8 no building but Duplex, no private name, no refused `cd` on any screen ·
// C9 no wide answer wrapped (no line as wide as the terminal). Verdict PASS / FAIL / INCONCLUSIVE (a missing figure is INCONCLUSIVE, never PASS). READ out/facts.log. Usage: node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const OD = process.env.OUTD || 'out', REC = path.join(__dirname, OD, 'rec'), rec = JSON.parse(fs.readFileSync(path.join(REC, 'frames.json'), 'utf8')), err = fs.readFileSync(path.join(REC, 'red1.err'), 'utf8').split('\n');
const L = (m) => console.log('§FACTS ' + m); let bad = 0, missing = 0; const chk = (id, ok, what) => { if (!ok) bad++; L('check ' + id + ' ' + (ok ? 'OK  ' : 'FAIL') + ' ' + what); };
const last = {}; rec.frames.forEach(f => { if (f.kind === 'a') last[f.step] = f; });
const T = (s) => (last[s] ? last[s].text : []), need = (v, what) => { if (v == null || (typeof v === 'number' && isNaN(v))) { missing++; L('MISSING ' + what); } return v; };
const grab = (lines, re) => { for (let i = lines.length - 1; i >= 0; i--) { const m = re.exec(lines[i]); if (m) return m; } return null; };
const F = { made: new Date().toISOString(), ootb: require('child_process').spawnSync('git', ['-C', process.env.OOTB || path.join(os.homedir(), 'bim-ootb'), 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim() };
// the funnels from the §RED1 log
const funnels = err.map(l => /§RED1 draw funnel lines=\d+ value=(\{.*\})$/.exec(l)).filter(Boolean).map(m => JSON.parse(m[1]));
F.session = { words: +(grab(err, /§RED1 session tty=(\w+) .* words=(\d+)/) || [])[2] }; need(F.session.words, 'session words');
const helpLines = T('help').filter(l => /^  \S+\s+.*\[.*\]\s*$/.test(l)); F.help = { listed: helpLines.length };
const ct = T('count'), cm = grab(ct, /^ok · viewer\.counts · (\d+) ms/), ce = grab(ct, /^(\d+) elements: (.*)$/);
F.count = { ms: cm && +cm[1], total: ce && +ce[1], rows: ct.map(l => /^([A-Z]+)\s+(\d+)$/.exec(l)).filter(Boolean).map(m => ({ disc: m[1], n: +m[2] })) };
F.count.sec = F.count.ms != null ? Math.round(F.count.ms / 1000) : null; need(F.count.ms, 'count ms'); need(F.count.total, 'count total');
const c1 = T('clash'), c1m = grab(c1, /^ok · viewer\.clashes · (\d+) ms/); F.clash1 = Object.assign({ ms: c1m && +c1m[1], sec: c1m && Math.round(+c1m[1] / 1000) }, funnels[0] || {}); need(funnels[0], 'funnel 1 in the §RED1 log');
const c1s = c1.join('\n'), n1 = (re) => { const m = re.exec(c1s); return m ? +m[1] : null; };
F.clash1.screen = { box: n1(/(\d+) box overlaps  ARC x MEP/), mesh: n1(/├─\s*(\d+) clash at mesh level/), contained: n1(/└─\s*(\d+) of them one inside/), cleared: n1(/├─\s*(\d+) cleared by the shape tests/), obb: n1(/├─\s*(\d+) turned boxes/), tri: n1(/└─\s*(\d+) triangles/), unknown: n1(/└─\s*(\d+) not judged/) };
const lsT = T('ls'), lm = grab(err, /§RED1 match glob="(.*)" rows=(\d+) of=(\d+)/), lrow = grab(lsT, /^\((\d+) of (\d+) rows match (\S+)\)/);
F.ls = { glob: lm && JSON.parse('"' + lm[1] + '"'), matched: lm && +lm[2], of: lm && +lm[3], held: lsT.some(l => /^\(answer of the line above, not re-run\)/.test(l)), heldLog: err.some(l => /^§RED1 held line=.*viewer\.clashes/.test(l)), screenMatched: lrow && +lrow[1], screenOf: lrow && +lrow[2], widest: Math.max.apply(null, lsT.map(l => l.length)) }; need(lm, 'glob match line');
const mT = T('menu'), items = mT.map(l => /^[> ]\s+(\d+)\s{4}(\S+)$/.exec(l)).filter(Boolean).map(m => m[2]); F.menu = { items, n: items.length, title: (grab(mT, /^clash: pick (\w+) \((\d+)\)/) || [])[1] };
const pT = T('pick'), pl = grab(pT, /^→ viewer\.clashes building=Duplex discA=(\w+) discB=(\w+) rows=all/), pm = grab(pT, /^ok · viewer\.clashes · (\d+) ms/);
F.pick = Object.assign({ discA: pl && pl[1], discB: pl && pl[2], ms: pm && +pm[1], sec: pm && Math.round(+pm[1] / 1000) }, funnels[1] || {}); need(funnels[1], 'funnel 2 in the §RED1 log'); const pS = pT.join('\n');
F.pick.screen = { box: (/(\d+) box overlaps  (\w+) x (\w+)/.exec(pS) || [])[1] && +(/(\d+) box overlaps/.exec(pS)[1]), mesh: +((/├─\s*(\d+) clash at mesh level/.exec(pS) || [])[1]) };
const eT = T('element'), ep = grab(eT, /^Duplex\/Element: (\d+) properties/); F.element = { props: ep && +ep[1], prompt: eT[eT.length - 1].trim() }; need(ep, 'element properties');
const sT = T('lsel'), sh = grab(sT, /^shown (\d+) of (\d+) Element/), srows = sT.map(l => /^\S+\s+\S+\s+(Ifc\w+)\s+(.+)$/.exec(l)).filter(Boolean).map(m => ({ cls: m[1], name: m[2] }));
F.lsel = { shown: sh && +sh[1], of: sh && +sh[2], rows: srows.length, spaces: srows.filter(r => r.cls === 'IfcSpace').length, tubs: srows.filter(r => /Bath Tub/.test(r.name)).length, ms: +((grab(sT, /^ok · object\.list · (\d+) ms/) || [])[1]) }; need(sh, 'lsel shown');
const gT = T('group'), gh = grab(gT, /^(\d+) groups over (\d+) Element/), gi = gT.findIndex(l => /^storey\s+count/.test(l)), grows = gi < 0 ? [] : gT.slice(gi + 1).map(l => /^(.+?)\s+(\d+)$/.exec(l)).filter(Boolean).map(m => ({ storey: m[1].trim(), n: +m[2] }));
F.group = { groups: gh && +gh[1], total: gh && +gh[2], rows: grows, sum: grows.reduce((a, r) => a + r.n, 0), unknown: (grows.find(r => r.storey === 'Unknown') || {}).n, level2: (grows.find(r => r.storey === 'Level 2') || {}).n }; need(gh, 'group groups');
const wT = T('pwd'), wm = grab(wT, /^building=(\S+) kind=(\S+)/); F.pwd = { building: wm && wm[1], kind: wm && wm[2] };
// C1
const want = { count: /^→ viewer\.counts building=Duplex by=discipline/, clash: /^→ viewer\.clashes building=Duplex discA=ARC discB=MEP rows=all/, ls: /^→ viewer\.clashes building=Duplex discA=ARC discB=MEP rows=all \| \*Bath\*/, element: /^→ object\.describe building=Duplex kind=Element/, lsel: /^→ object\.list building=Duplex kind=Element .*element_name=\*bath\*/, group: /^→ object\.group building=Duplex kind=Element by=storey/ };
Object.keys(want).forEach(s => chk('C1 ' + s, T(s).some(l => want[s].test(l)), 'the screen holds the → line of ' + s));
chk('C1 pick', !!pl && pl[1] === 'ARC' && pl[2] === 'STR', 'the picked line says discA=' + (pl && pl[1]) + ' discB=' + (pl && pl[2]));
// C2
[['clash1', F.clash1, F.clash1.screen], ['pick', F.pick, F.pick.screen]].forEach(([n, v, s]) => { const ok = v.bboxOverlaps != null && s.box === v.bboxOverlaps && s.mesh === v.meshClashes && (n !== 'clash1' || (s.contained === v.contained && s.cleared === v.cleared && s.obb === v.obbRejected && s.tri === v.triangleClear && s.unknown === v.unknown)); chk('C2 ' + n, ok, 'screen box/mesh' + (n === 'clash1' ? '/contained/cleared/turned/triangles/unjudged' : '') + ' = the §RED1 funnel value (' + v.bboxOverlaps + '/' + v.meshClashes + ')'); });
// C3
const discs = F.count.rows.map(r => r.disc).sort().join(','); chk('C3', F.menu.n > 1 && items.slice().sort().join(',') === discs, 'the menu offers [' + items.join(',') + '], `count` listed [' + discs + ']');
// C4
chk('C4', F.ls.held && F.ls.heldLog && F.ls.matched === F.ls.screenMatched && F.ls.of === F.ls.screenOf && F.ls.of === F.clash1.bboxOverlaps && F.ls.glob === '*Bath*', 'ls served from the held answer (screen + log), ' + F.ls.matched + ' of ' + F.ls.of + ' rows, the funnel said ' + F.clash1.bboxOverlaps + ' box overlaps');
// C5 C6
chk('C5', F.lsel.shown === F.lsel.rows && F.lsel.shown === F.lsel.of && F.lsel.spaces + F.lsel.tubs === F.lsel.rows, 'shown ' + F.lsel.shown + ' of ' + F.lsel.of + ', rows drawn ' + F.lsel.rows + ' (' + F.lsel.spaces + ' IfcSpace + ' + F.lsel.tubs + ' bath tubs)');
chk('C6', F.group.sum === F.group.total && F.group.total === F.count.total && F.group.rows.length === F.group.groups, 'the ' + F.group.groups + ' storey groups add to ' + F.group.sum + ', the element total ' + F.group.total + ', `count` said ' + F.count.total);
// C7
const ex = last.exit; chk('C7', !!ex && /^\$\s*$/.test(ex.text[ex.cy]) && /exit/.test(ex.text.join('\n')), 'the last screen ends on the bash prompt');
// C8
const buildings = []; ['buildings'].forEach(d => { const dir = path.join(process.env.OOTB || path.join(os.homedir(), 'bim-ootb'), d); try { fs.readdirSync(dir).forEach(n => { const m = /^(.+)_extracted\.db$/.exec(n); if (m && m[1] !== 'Duplex') buildings.push(m[1]); }); } catch (e) { /* none */ } });
const all = rec.frames.map(f => f.text.join('\n')).join('\n'), hit = buildings.filter(b => b.length > 2 && new RegExp('(?<![A-Za-z])' + b.replace(/[^A-Za-z0-9]/g, '.') + '(?![A-Za-z])', 'i').test(all));   // a name as a word: IfcFlowTerminal is not the building Terminal
chk('C8', buildings.length > 0 && !hit.length && !/jelapang|jebel/i.test(all) && !/unknown building|no such building|refus/i.test(all), 'screens checked against ' + buildings.length + ' other local building names + the private-name list: hits=' + JSON.stringify(hit));
// C9
const widest = Math.max.apply(null, rec.frames.map(f => Math.max.apply(null, f.text.map(l => l.length)))); chk('C9', widest < rec.cols, 'the widest line on any screen is ' + widest + ' of ' + rec.cols + ' columns (nothing wrapped)');
F.checks = { bad, missing, widest, cols: rec.cols, rows: rec.rows, frames: rec.frames.length, buildingsChecked: buildings.length };
fs.writeFileSync(path.join(__dirname, OD, 'facts.json'), JSON.stringify(F, null, 1));
L('wrote facts.json ' + JSON.stringify({ words: F.session.words, count: F.count.total, countMs: F.count.ms, clash1: [F.clash1.bboxOverlaps, F.clash1.meshClashes, F.clash1.cleared, F.clash1.ms], pick: [F.pick.discA, F.pick.discB, F.pick.bboxOverlaps, F.pick.meshClashes, F.pick.ms], ls: [F.ls.matched, F.ls.of], lsel: F.lsel.shown, group: F.group.groups }));
const verdict = missing ? 'INCONCLUSIVE' : (bad ? 'FAIL' : 'PASS'); L('FACTS_VERDICT ' + verdict + ' bad=' + bad + ' missing=' + missing); process.exit(verdict === 'PASS' ? 0 : (verdict === 'FAIL' ? 1 : 2));
