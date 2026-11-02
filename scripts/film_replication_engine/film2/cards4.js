// ⚠ DO NOT REMOVE — Scope (v2 re-cut: no Film 1 content, no sample day): the full-screen CARDS of Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24): opener (project wall + six challenge cards), Part 1 (dictionary),
// Part 2 (replication), the concept card, the limits card and the Sources cards. Every number is read from facts2.js; every outside quote is read from film2_claims.json (the verified cards) and is placed
// in the DOM as exact text (no re-typing, no paraphrase); every logo is an <img src> of the file whose sha256 is in film2_logos_index.json (files are never inlined or opened). Read the recorder log after every run.
'use strict';
const fs = require('fs'), path = require('path');
const CL = JSON.parse(fs.readFileSync(path.join(__dirname, 'film2_claims.json'), 'utf8')).claims, LI = JSON.parse(fs.readFileSync(path.join(__dirname, 'film2_logos_index.json'), 'utf8')).entries;
const ROOT = path.resolve(__dirname, '..', '..', '..');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const CLAIM = {}; CL.forEach(c => { CLAIM[c.id] = c; });
const LOGO = {}; LI.forEach(e => { LOGO[e.slug] = e; });
const USED = { claims: [], logos: [] };
const WHITE_LOGO = { rocicorp: true };
function shortDate(d) {                                    // the date as the verified card gives it, minus parenthetical notes
  if (!d) return 'undated page';
  const m = /^'([^']+)'/.exec(d); if (m) return m[1];
  return d.replace(/\s*\(.*$/, '').replace(/;.*$/, '').trim();
}
function logo(slug, cls) {                                  // <img> only; PowerSync uses the clean alternate named in the index
  const e = LOGO[slug]; if (!e || !e.local_path) throw new Error('no logo file for ' + slug);
  const p = e.use_instead ? e.use_instead.local_path : e.local_path, sha = e.use_instead ? e.use_instead.sha256 : e.sha256; if (USED.logos.indexOf(slug) === -1) USED.logos.push(slug);
  const dk = e.use_instead || WHITE_LOGO[slug];                  // white-on-transparent files (PowerSync clean alternate, Rocicorp: fill="white") need a dark tile
  return `<span class="lgt ${dk ? 'dk' : ''} ${cls || ''}"><img class="lg" data-slug="${slug}" data-sha="${sha}" src="file://${p}" alt=""></span>`;
}
const txt = (name, cls) => `<span class="lgt tx ${cls || ''}"><span class="nmtxt">${esc(name)}</span></span>`;
// A claim block: who (logo/text + name), the exact quote, the citation bar, optional caveat / our reading.
function blk(id, o) {
  const c = CLAIM[id]; if (!c) throw new Error('unknown claim ' + id); if (USED.claims.indexOf(id) === -1) USED.claims.push(id); o = o || {};
  const host = new URL(c.source_url).host;
  const who = (o.logos || []).join('') + `<span class="pn">${esc(o.name || c.project)}</span>`;
  return `<div class="blk rv" data-f="${o.f === undefined ? 0 : o.f}" data-claim="${id}"><div class="who">${who}</div><div class="q" data-claim="${id}">${esc(c.quote)}</div>` +
    `<div class="cite" data-claim="${id}"><span class="pub">${esc(c.publisher)}</span> · <span class="ttl">${esc(c.title)}</span> · <span class="dt">${esc(shortDate(c.date_of_source))}</span> <span class="ac">· ${esc(host)} · accessed ${c.accessed}</span></div>` +
    (o.note ? `<div class="cv">${esc(o.note)}</div>` : '') + ((o.reading || c.our_reading && o.useReading) ? `<div class="rd"><b>our reading:</b> ${esc(o.reading || c.our_reading)}</div>` : '') + '</div>';
}
const page = (kick, title, body, cls) => `<div class="pg ${cls || ''}"><div class="kick">${esc(kick)}</div><h2 class="ct">${esc(title)}</h2>${body}</div>`;
const ans = (ok, html, f) => `<div class="ans rv ${ok ? 'ok' : 'no'}" data-f="${f === undefined ? 0.8 : f}"><b>${ok ? 'WHERE OUR DESIGN ANSWERS IT' : 'NOT SOLVED YET'}</b> ${html}</div>`;
const term = (q, extra) => `<div class="term${extra ? ' ' + extra : ''}"><div class="s">live read-only query · ${esc('build/erp/ad_full.db')}</div><div class="p">$ ${esc(q.cmd)}</div><div class="o">${esc(q.out)}</div></div>`;
const logp = (lines, src, extra) => `<div class="term lg2${extra ? ' ' + extra : ''}"><div class="s">${esc(src)}</div>${lines.map(l => `<div class="o">${esc(l)}</div>`).join('')}</div>`;

function build(X) {                                          // X = facts2.build() result
  const F = X.F, Q = {}; X.Q.forEach(q => { Q[q.id] = q; }); USED.claims = []; USED.logos = [];
  const K = {}; const C = {};
  // ---------------- title ----------------
  C.title = `<div class="pg tl"><div class="kick" style="margin-top:130px">AN EDUCATIONAL FILM · ENGLISH · SAMPLE DATA</div><h1>Keeping the bloat off</h1><h2 class="h2b">the dictionary, replication, and what is under the hood</h2>` +
    `<div class="sub">Every number on screen is read from a live query of our own dictionary or from a log. Statements about other projects are quoted, with their source.</div></div>`;
  // ---------------- wall ----------------
  const tile = (inner, label) => `<div class="tile rv" data-f="0">${inner}<div class="tl">${esc(label)}</div></div>`;
  const wall = [
    tile(logo('rocicorp'), 'Rocicorp Zero'), tile(logo('electricsql'), 'ElectricSQL'), tile(logo('powersync'), 'PowerSync'), tile(logo('couchbase'), 'Couchbase'), tile(logo('ditto'), 'Ditto'), tile(logo('mongodb'), 'MongoDB'),
    tile(logo('supabase'), 'Supabase'), tile(txt('Triplit'), 'Triplit (name only)'), tile(logo('anytype'), 'Anytype'), tile(txt('Nostr'), 'Nostr (name only)'), tile(logo('deltachat') + '<span class="pn">Delta Chat</span>', 'icon'), tile(logo('automerge'), 'Automerge'),
    tile(logo('manyverse') + '<span class="pn">Manyverse</span>', 'icon'), tile(txt('Secure Scuttlebutt'), 'Scuttlebutt (name only)'), tile(logo('briar'), 'Briar'), tile(logo('radicle') + '<span class="pn">Radicle</span>', 'icon'), tile(txt('Ink & Switch'), 'local-first essay (name only)')];
  C.wall = `<div class="pg"><div class="kick">THE OTHER PROJECTS</div><h2 class="ct" style="font-size:44px;line-height:1.1">We looked at similar projects and learned from the challenges they report. Among them:</h2><div class="wallg">${wall.join('')}</div>` +
    `<div class="fine">Logos and names are trademarks of their owners, shown to identify the projects discussed. Manyverse icon © 2019 The Manyverse Authors, CC BY-SA 4.0.</div></div>`;
  // ---------------- six challenge cards ----------------
  const grid = (items, cols) => `<div class="cg c${cols || 2}">${items.join('')}</div>`;
  const kk = n => `WHAT OTHERS REPORT · ${n} of 6`;
  C.c1 = page(kk(1), 'The sync scope is written by hand, app by app', grid([
    blk('1-zero-b', { logos: [logo('rocicorp')], name: 'Rocicorp Zero', f: 0.05 }),
    blk('1-electric-b', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.2 }),
    blk('1-powersync-b', { logos: [logo('powersync')], name: 'PowerSync', f: 0.35, reading: CLAIM['1-powersync-b'].our_reading }),
    blk('1-couchbase-a', { logos: [logo('couchbase')], name: 'Couchbase Sync Gateway', f: 0.5 }),
    blk('1-ditto-b', { logos: [logo('ditto')], name: 'Ditto', f: 0.65 })]) +
    `<div class="rd card-rd rv" data-f="0.75"><b>our reading:</b> in each of these, a developer writes what a device receives.</div>` + ans(true, 'Part 2: scope is rows read by one small engine, one default, checked when the plan is compiled.'), 'c1');
  C.c2 = page(kk(2), 'Different versions on different devices', grid([
    blk('2a2', { logos: [logo('anytype')], name: 'Anytype', f: 0.05, note: 'A user\'s report on the community forum, not a statement by Anytype.' }),
    blk('2a1', { logos: [logo('anytype')], name: 'Anytype', f: 0.25, note: 'A user\'s report on the community forum, not a statement by Anytype.', reading: CLAIM['2a1'].our_reading.replace(/^Film may say: a/, 'A') }),
    blk('2b1', { logos: [txt('Ink & Switch')], name: '2019 essay', f: 0.45, note: 'The essay poses this as an open question.' })], 2) + ans(false, 'Event versioning is a design on paper (spec §13.12.J.2): nothing built, nothing tested. This film does not claim it.', 0.75), 'c2');
  C.c3 = page(kk(3), 'A "dumb" relay turns out not to be', grid([
    blk('3a1', { logos: [txt('Nostr')], name: 'measurement study', f: 0.05, note: 'Data: 1 July to 31 December 2023.' }),
    blk('3a3', { logos: [txt('Nostr')], name: 'measurement study', f: 0.2, note: 'The authors\' estimate, computed over the follower graph.' }),
    blk('3a8', { logos: [txt('Nostr')], name: 'measurement study', f: 0.35, note: 'The authors\' estimate; "this alone" means donations only.' }),
    blk('3b1', { logos: [logo('deltachat')], name: 'Delta Chat / chatmail', f: 0.5 }),
    blk('3b2', { logos: [logo('deltachat')], name: 'Delta Chat', f: 0.62, reading: CLAIM['3b2'].our_reading })], 2) +
    ans(true, 'Our design: the shelf has a stated contract (it stores named objects and reads none), a blind mirror keeps a copy, and the hub is a named role.', 0.82), 'c3');
  C.c4 = page(kk(4), 'History keeps growing, and first sync slows', grid([
    blk('2b2', { logos: [txt('Ink & Switch')], name: '2019 essay', f: 0.05 }),
    blk('4a', { logos: [logo('manyverse')], name: 'Manyverse / Scuttlebutt', f: 0.25, reading: CLAIM['4a'].our_reading, note: 'A problem that was reduced by engineering, not a growth measurement.' }),
    blk('4b1', { logos: [logo('automerge')], name: 'Automerge', f: 0.45 }),
    blk('4b3', { logos: [logo('automerge')], name: 'Automerge', f: 0.6, note: 'One example the post gives, for documents with large histories.' })], 2) +
    ans(true, 'Our design: a lost device folds back from the shelf (built and witnessed in the sample run). Not tested here: years of growth.', 0.82), 'c4');
  C.c5 = page(kk(5), 'Pure peer-to-peer systems ended up adding an always-on helper', grid([
    blk('5e', { logos: [logo('radicle')], name: 'Radicle', f: 0.05 }),
    blk('5a', { logos: [logo('briar')], name: 'Briar', f: 0.25 }),
    blk('5b1', { logos: [txt('Secure Scuttlebutt')], name: 'handbook and spec', f: 0.45 }),
    blk('5b2', { logos: [txt('Secure Scuttlebutt')], name: 'handbook and spec', f: 0.6 })], 2) +
    ans(true, 'Our design: the helper is an explicit role, the mailbox device. It keeps a blind copy of the shelf.', 0.8), 'c5');
  C.c6 = page(kk(6), 'Products change direction, so dependence is a risk', grid([
    blk('6-mongodb-a', { logos: [logo('mongodb')], name: 'MongoDB Atlas Device Sync', f: 0.05 }),
    blk('6-powersync-a', { logos: [logo('powersync')], name: 'PowerSync', f: 0.2 }),
    blk('6-electric-joining-a', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.35 }),
    blk('6-electric-joining-b', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.5, reading: CLAIM['6-electric-joining-b'].our_reading }),
    blk('6-triplit-a', { logos: [logo('supabase'), txt('Triplit')], name: 'announced by Supabase', f: 0.65, note: 'The post does not announce a shutdown of Triplit.' })], 2) +
    ans(true, 'Our design: the data is local on every device; the shelf only has to store named objects.', 0.85), 'c6');
  // ---------------- Part 1 ----------------
  const P1 = 'PART 1 · THE DICTIONARY AND IDS AS THE PAYLOAD';
  C.d_tables = page(P1, 'The system describes itself in tables', `<div class="cols"><div>${term(Q.tables)}<div class="cap">Three counts, one read-only query.</div></div><div class="bigs">` +
    `<div class="bn"><b>${fmt(F.adTables)}</b><span>tables (${fmt(F.adActive)} active)</span></div><div class="bn"><b>${fmt(F.adColumns)}</b><span>columns</span></div></div></div>` +
    `<div class="say rv" data-f="0.4">A column whose name ends <code>_ID</code> usually points at another table. That is the whole idea of an id as payload: a record carries pointers, not content.</div>`);
  const srcLines = (file, a, b) => fs.readFileSync(path.join(process.env.HOME, 'idempiere-dev-setup/idempiere', file), 'utf8').split('\n').slice(a - 1, b).map(l => l.replace(/\r$/, '').replace(/\t/g, '    '));
  const dedent = ls => { const m = Math.min.apply(null, ls.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)); return ls.map(l => l.slice(m)); };
  const MLF = 'org.adempiere.base/src/org/compiere/model/MLookupFactory.java', MQ = 'org.adempiere.base/src/org/compiere/model/MQuery.java';
  const ml = dedent(srcLines(MLF, 192, 214)), mq = dedent(srcLines(MQ, 420, 430));
  F.srcMLF = { file: 'MLookupFactory.java', a: 192, b: 214, lines: ml }; F.srcMQ = { file: 'MQuery.java', a: 420, b: 430, lines: mq };
  const code = (file, a, ls, extra) => `<div class="term code ${extra || ''}"><div class="s">iDempiere source · ${esc(file)}:${a}-${a + ls.length - 1} (read from ~/idempiere-dev-setup/idempiere, tabs shown as 4 spaces, common indent trimmed)</div>${ls.map((l, i) => `<div class="o"><i>${a + i}</i> ${esc(l)}</div>`).join('')}</div>`;
  C.d_source = page(P1, 'The pointer rule is iDempiere\'s own', `<div class="cols src">${code('MLookupFactory.java', 192, ml)}${code('MQuery.java (getZoomTableName)', 420, mq)}</div>` +
    `<div class="say rv" data-f="0.45">A list is a list. A Table or Search column with a reference value reads that table. Any other id column names its table: drop <code>_ID</code> or <code>_UU</code>. We copy the rule, not invent one.</div>`, 'tight');
  C.d_edges = page(P1, `${fmt(F.edges)} pointers, counted two ways`, `<div class="eq">${term(Q.er1, 'sm')}${term(Q.er2, 'sm')}${term(Q.er4, 'sm')}</div>` +
    logp([`W-FLOW-REFS — ER-1 js=${F.er1} sql=${F.er1} (js-only 0, sql-only 0); ER-2 js=${F.er2} sql=${F.er2} (js-only 0, sql-only 0); ER-4 js=${F.er4} sql=${F.er4} (js-only 0, sql-only 0)`, `${fmt(F.er1)} + ${fmt(F.er2)} + ${fmt(F.er4)} = ${fmt(F.er1 + F.er2 + F.er4)}   §S1_UNRESOLVED global edges=${F.edges}`], 'build/scriptor/s1.log · the compiler\'s own count, set equal to the SQL above', 'rv') .replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.5"'), 'tight');
  const chipCls = n => (F.payloadList.some(p => p.split(':')[0] === n) ? 'k1' : F.implicitList.indexOf(n) !== -1 ? 'k2' : F.mandList.indexOf(n) !== -1 ? 'k3' : 'k0');
  const chips = F.olNames.map(a => `<span class="chip ${chipCls(a[0])}">${esc(a[0])}</span>`).join('');
  C.d_orderline = page(P1, `A record is mostly ids: ${F.olCols} columns, ${F.wire} on the wire`, `<div class="cols ol"><div><div class="chips">${chips}</div><div class="leg"><span class="chip k1">carried (${F.payloadList.length})</span> <span class="chip k2">identity and partition (${F.implicitList.length})</span> <span class="chip k3">mandatory, left for the receiver (${F.mand})</span> <span class="chip k0">stays on the device</span></div></div>` +
    `<div>${term(Q.orderline_types, 'sm')}${logp([`payload: ${F.payloadList.join(', ')}`, `implicit: ${F.implicitList.join(', ')}`, `F1 ${F.wire}/${F.olCols} cols (W-FLOW-MINIMAL)`], 'build/scriptor/s1.log §S1_FLOW F1', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.4"')}</div></div>`, 'tight');
  C.d_computed = page(P1, 'What is typed crosses; what is computed does not', `<div class="cols two">${logp([F.derivedLine], 's1.log · W-FLOW-NO-DERIVED')}${logp([F.mandLine], 's1.log · W-FLOW-MANDATORY')}</div>` +
    `<div class="say rv" data-f="0.35">The dictionary marks which fields a person types and which the system computes. A flow that tries to carry a computed field is flagged: the control that declared <code>MovementQty</code> was caught. The ${F.mand} mandatory fields the line does not carry are the receiver's to supply, including the order header <code>C_Order_ID</code>.</div>` +
    `<div class="mandl rv" data-f="0.6">${F.mandList.map(x => `<span class="chip k3">${esc(x)}</span>`).join('')}</div>`);
  C.d_honest = page(P1, 'An id is a pointer, not a secret', `<ul class="bul"><li class="rv" data-f="0.05">Ids are small integers and the seed is public: anyone holding the seed can decode them.</li><li class="rv" data-f="0.25">Volume and timing still show on the wire. Sealing a flow for its audience is built in the engine\'s simulator (§29, witness PASS ${F.sealJudged}), not in the real comm layer. <b>This run is not encrypted.</b></li>` +
    `<li class="rv" data-f="0.45">Integer keys collide across stations, so a record made on a device is addressed by its <code>&lt;table&gt;_uu</code> (spec §11.1).</li><li class="rv" data-f="0.65">An id keeps the payload small. It does not make it private.</li></ul>`);
  // ---------------- Part 2 ----------------
  const P2 = 'PART 2 · REPLICATION';
  C.r_strategy = page(P2, 'iDempiere already has the idea', `<div class="cols"><div>${term(Q.strategy100)}<div class="cap">One replication strategy, active tables only. R = Reference, M = Merge, L = Local.</div></div><div class="bigs">` +
    `<div class="bn"><b>${F.stratM}</b><span>Merge: both ways</span></div><div class="bn"><b>${F.stratR}</b><span>Reference: flows down</span></div><div class="bn"><b>${F.stratL}</b><span>Local: stays</span></div><div class="bn"><b>${F.stratUnlisted}</b><span>not yet classified</span></div></div></div>` +
    `<div class="say rv" data-f="0.5">Of ${fmt(F.adActive)} active tables. Each table is flowed down, shared both ways, or kept local. We use the classification and add the rows that say who, which columns, when.</div>`);
  const fmD = X.flowsModeller[0], fmR = X.flowsModeller[1];
  C.r_row = page(P2, 'One flow row, read by one small engine', `<div class="term rowj"><div class="s">build/scriptor/flows_modeller.json · the real Modeller list: one declaration and one row</div><div class="o">${esc(JSON.stringify(fmR))}</div><div class="o">${esc('{"virtualTable":"' + fmD.virtualTable + '","columns":[' + fmD.columns.map(c => c.name + ':' + c.cls + (c.values ? '(' + c.values.length + ' values)' : '')).join(', ') + ']}')}</div></div>` +
    `<div class="rowflow rv" data-f="0.3"><div class="bx">${F.dryVirtual} declaration + ${F.dryRows} row</div><div class="ar">→</div><div class="bx">the engine checks every row before it emits a plan</div><div class="ar">→</div><div class="bx">${F.nComponents} components behind a registry:<br>FACT · INSTRUMENT · SEED · RULE · LOCAL</div></div>` +
    `<div class="say rv" data-f="0.55">Which table and columns, which direction, who may read, when: the row says it once. The engine names no table.</div>`);
  C.r_zero = page(P2, 'Adding by row, and a wrong row fails', `<div class="quad">` +
    logp([`new flows as rows only: ${F.zcList.split('; ').slice(0, 3).join('; ')} …`, `compiler code hash before and after: ${F.zcHash} (identical)`], 's1.log · W-FLOW-ZERO-CODE (2)(3)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.05"') +
    logp([`a new handler as a new file, named by one row: it ran end-to-end`, `core files sha256 before and after: ${F.regHash} (identical)`], 'registry.log · W-REG-ZEROCODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.25"') +
    logp([`bim_element declared as ONE virtual table row: ${F.virtCols} columns, payload ${F.virtPayload} (${F.virtCarried} carried + key)`, `a second virtual table, rows only: compiler hash unchanged`], 'virtual.log · W-VIRT-COMPILE, W-VIRT-ZEROCODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.45"') +
    logp([`a deliberately wrong row: declaredMissing=${F.zcTypo}`, `a typo in a virtual column: declaredMissing=${F.virtTypo}`], 'compile time, not run time · s1.log (4) · virtual.log W-VIRT-TYPO', 'rv bad').replace('class="term lg2 rv bad"', 'class="term lg2 rv bad" data-f="0.65"') + `</div>`);
  C.r_bloat = page(P2, 'Where the bloat is kept off, in numbers we can count', `<div class="cols3"><div class="bn big3"><div class="l">PAYLOAD</div><b>${F.wire} of ${F.olCols}</b><span>columns of an order line cross the shelf: ids and the quantity (s1.log, W-FLOW-MINIMAL)</span></div>` +
    `<div class="bn big3 rv" data-f="0.3"><div class="l">SCOPE CODE</div><b>${F.linesToolchain}</b><span>lines of toolchain read the rows; a new table is a row, and the compiler's hash does not change (${F.zcHash})</span></div>` +
    `<div class="bn big3 rv" data-f="0.6"><div class="l">NETWORK CHATTER</div><b>${F.localCalls}</b><span>shelf calls made by a local action; the control, one visit, made ${F.visitCalls} (treat.log, W-TREAT-LOCAL)</span></div></div>` +
    `<div class="say rv" data-f="0.8">All three are measured on sample data. None of them is a claim about how much a real deployment would save.</div>`);
  // ---------------- Part 3: UNDER THE HOOD (real adapters, recorded facts only) ----------------
  const P3 = 'PART 3 · UNDER THE HOOD: WHERE THE BLOAT GOES, AND HOW IT IS MANAGED';
  const M = X.mod, qc = id => Q[id];
  const codeBlk = (q, extra, label) => `<div class="term code wrapc ${extra || ''}"><div class="s">${label}</div><div class="p">$ ${esc(q.cmd)}</div>${q.out.split('\n').map(l => `<div class="o">${esc(l)}</div>`).join('')}</div>`;
  const rvf = (h, f) => h.replace(/class="term code wrapc rv"/, `class="term code wrapc rv" data-f="${f}"`);
  C.u_code = page(P3, 'The code: literal, derivation, shared reader', codeBlk(qc('mod_before'), '', 'BEFORE · a literal list, written in code') +
    rvf(codeBlk(qc('mod_after'), 'rv', `AFTER, PR #2369 (${M.prState.toLowerCase()}) · derived from the compiled plan, by the adapter itself`), 0.3) +
    rvf(codeBlk(qc('mod_after2'), 'rv', `NOW, PR #2370 (${M.pr2State.toLowerCase()}) · the same list, asked of a shared reader (TeamScope)`), 0.6) +
    `<div class="say rv" data-f="0.8" style="font-size:22px;margin-top:6px">The number at the start of each line is the line of the file. Same behaviour each time; the list is no longer code.</div>`, 'tight');
  const box = (h, b, f) => `<div class="bx2 rv" data-f="${f}"><div class="bh">${h}</div><div class="bb">${b}</div></div>`;
  C.u_chain = page(P3, 'The chain: a row, a plan, a reader, the adapters', `<div class="chain">` +
    box('1 · FLOW ROW', `flows_modeller.json<br>${F.dryVirtual} declaration + ${F.dryRows} row + ${F.dryValues} list values`, 0.05) + '<div class="ar2 rv" data-f="0.2">→</div>' +
    box('2 · COMPILED PLAN', `modeller/team_plan.js<br>${F.planBytes} bytes (wc -c), hash ${F.planHash12}<br>generated, unsigned`, 0.25) + '<div class="ar2 rv" data-f="0.4">→</div>' +
    box('3 · ONE SMALL READER', `common/comm/team_scope.js (TeamScope)<br>${F.scopeLines} lines · ${F.scopeOnMainBytes} bytes, as merged in PR #2370`, 0.45) + '<div class="ar2 rv" data-f="0.6">→</div>' +
    box('4 · THE ADAPTERS', `Modeller and ERP<br>both ask the reader what is shared`, 0.65) + `</div>` +
    `<div class="cols two">${term(qc('mod_plan_head')).replace('live read-only query · build/erp/ad_full.db', 'live read-only command · the generated plan, first line')}` +
    `<div class="term code wrapc rv" data-f="0.8"><div class="s">the pattern we copy · iDempiere MTable.java:257-261 (the service locator behind IModelFactory)</div>${M.mtable.map((l, i) => `<div class="o"><i>${257 + i}</i> ${esc(l)}</div>`).join('')}</div></div>`, 'tight');
  C.u_probes = page(P3, 'The probes: the Modeller, from the real witnesses', `<div class="cols two"><div>` +
    logp([`§W-TEAM-MODELLER PASS judged=${F.tmJudged} — before the change, and after: the same`, `P1  the plan yields exactly the old list: ${F.p1Keys} keys, equal`, `P2  one more value in the plan is shared (${F.p2Keys} keys); team_sync.js is served byte-identical (${F.adapterHash})`, `P3  no plan: nothing is shared, and a visible line says so`, `P4  a plan without pos_x shares no move (${F.p4Creates} creates stay); a hub-audience flow shares nothing`, `P5  the logged hash equals the file header (${F.planHash12})`], 'modeller_baseline_before.log, modeller_after.log, modeller_plan_witness.log (lines shortened)') +
    logp([`mutants: literal list back -> P2, P3, P4 red · audience ignored -> P4 red · hash not logged -> P5 red`, `${F.mwMutants} of ${F.mwMutants} killed · §W-PLAN-MODELLER PASS judged=${F.planJudged} fails=0`, F.modplanLine + ' (compiler side)'], 'modeller_plan_witness.log §MUTANTS · logs/modplan_run.log (witness_scriptor_modeller_plan.js, run for this film)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.5"') + `</div><div>` +
    logp(F.noplanLines, 'fail closed, end to end · modeller_noplan_failclosed.log: the UNCHANGED full witness with the plan file absent', 'rv bad').replace('class="term lg2 rv bad"', 'class="term lg2 rv bad" data-f="0.3"') + `</div></div>`, 'tight');
  C.u_erp = page(P3, 'The same chain on the ERP, and the shared reader', `<div class="cols two"><div>` +
    logp(F.erpLines, 'logs/erp_plan_witness.log · W-PLAN-ERP, run in the ERP worktree for this film (lines shortened)') + `</div><div>` +
    logp([`compiler side: §ERPPLAN_VERDICT PASS judged=${F.erpPlanCompiler} · the shared reader §SCOPE_VERDICT PASS judged=${F.scopeJudged} · ${F.scopeMutants} reader mutants killed`], 'logs/erpplan_run.log, logs/teamscope_run.log (run for this film)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.45"') +
    logp([`OPEN — ${F.erpOutside} sqlite tables outside the live dictionary were shared by the old default and are now local-only; ${F.erpOutsideInDict} of them has a row in the dictionary, so no window can reach them`], 'logs/erp_plan_witness.log · an open finding, stated as recorded', 'rv open').replace('class="term lg2 rv open"', 'class="term lg2 rv open" data-f="0.7"') + `</div></div>`, 'tight');
  C.u_ledger = page(P3, 'The ledger, said plainly', `<div class="cols two"><div>${term({ cmd: qc('mod_numstat').cmd, out: qc('mod_numstat').out }).replace('live read-only query · build/erp/ad_full.db', 'live read-only command · PR #2369').replace('term"', 'term sm"')}${term({ cmd: qc('mod_numstat2').cmd, out: qc('mod_numstat2').out }).replace('live read-only query · build/erp/ad_full.db', 'live read-only command · PR #2370').replace('term"', 'term sm"')}</div><ul class="bul led">` +
    `<li class="rv" data-f="0.1"><b>The Modeller adapter did not shrink:</b> +${F.adapterAdded} / −${F.adapterRemoved} lines in team_sync.js.</li>` +
    `<li class="rv" data-f="0.25"><b>The shared reader</b> is +${F.scopeLines} lines, once (+${F.scopeSignAdded} more later for signature checks, PR #2371). Net change: ERP +${F.erpNet}, Modeller ${F.modNet}. Custom code did not fall; the duplication did.</li>` +
    `<li class="rv" data-f="0.4"><b>The list moved</b> to the rows: ${F.dryVirtual} declaration + ${F.dryRows} row + ${F.dryValues} values. A third host needs a plan file and a few reader calls.</li>` +
    `<li class="rv" data-f="0.55"><b>About ${F.adapterStayPct} % stays in the adapters:</b> carriage, projection, guards and UI (§20, a grep-based estimate).</li>` +
    `<li class="rv" data-f="0.7"><b>The plans on main are unsigned</b> (§16.13 Q1): a user can edit one locally. The reader can verify a signature (PR #2371 ${M.pr3State.toLowerCase()}); ${F.adaptersCallVerify} adapters ask it to.</li>` +
    `<li class="rv" data-f="0.85"><b>State:</b> both changes are merged (PR #2369 ${M.prState}, PR #2370 ${M.pr2State}); §24.1 had recorded the first as not committed.</li></ul></div>`, 'tight');
  const bar = (n, c) => `<span class="bar" style="width:${Math.round(n * 5.2)}px;background:${c}"></span>`;
  C.u_engine = page(P3, 'The engine\'s own shape', `<div class="eng"><div class="er"><b>${F.linesCore}</b> core ${bar(F.linesCore, '#14213d')} <span>treat.js ${F.lineEach['treat.js']} + sim.js ${F.lineEach['sim.js']}</span></div>` +
    `<div class="er"><b>${F.linesComponents}</b> components ${bar(F.compFact, '#15803d')}${bar(F.compInstrument, '#2563eb')}${bar(F.compSeed, '#b45309')}${bar(F.compRule, '#7c3aed')}${bar(F.compLocal, '#dc2626')} <span>fact ${F.compFact} · instrument ${F.compInstrument} · seed ${F.compSeed} · rule ${F.compRule} · local ${F.compLocal}</span></div>` +
    `<div class="er"><b>${F.linesEngine}</b> whole engine <span>the compile toolchain, separately: ${F.linesToolchain} lines</span></div></div>` +
    `<div class="rv" data-f="0.35">${logp([`a new handler is a new file; the core files' hash before and after: ${F.regHash} (identical)`], 'registry.log · W-REG-ZEROCODE')}</div>` +
    `<div class="rv" data-f="0.6">${logp([`tests with teeth: ${F.mutantsTotal} deliberate breakages across ${F.witnessCount} witnesses, each turned at least one arm red (${Object.keys(F.mutantsBy).map(k => k + ' ' + F.mutantsBy[k]).join(' · ')})`, `verdicts: s1 ${F.v_s1} · treat ${F.v_treat} · registry ${F.v_reg} · virtual ${F.v_virt} · mesh ${F.v_mesh} · dry run ${F.v_dry} · modeller plan ${F.planJudged} — fails 0`], 'the seven logs under build/scriptor/ · counts of arms judged')}</div>`, 'tight');
  C.u_why = page(P3, 'Why most transfers need no live connection', `<div class="chain why"><div class="bx2 rv" data-f="0.1"><div class="bh">FACTS ONLY APPEND</div><div class="bb">A resend changes nothing: facts are idempotent.</div></div><div class="ar2 rv" data-f="0.25">+</div>` +
    `<div class="bx2 rv" data-f="0.3"><div class="bh">IDS RESOLVE ON THE DEVICE</div><div class="bb">The reference data is already there; a fact carries ids.</div></div><div class="ar2 rv" data-f="0.45">+</div>` +
    `<div class="bx2 rv" data-f="0.5"><div class="bh">A LATE ARRIVAL CHANGES NOTHING</div><div class="bb">The same facts give the same result in any order.</div></div></div>` +
    `<div class="say rv" data-f="0.75">So a visit now and then is enough, and nothing waits for a server. The mesh witness checks the last point: ${esc(F.meshLines.filter(l => /W-MESH-FOLD/.test(l))[0].slice(0, 150))}</div>`, 'tight');
  C.u_next = page(P3, 'What is next, and what is not done', `<ul class="bul nxt"><li class="rv" data-f="0.05"><b>Narrowing the ERP scope</b> to a team strategy (G9) is a data change now, but it needs the every-window twin check first: default-deny with the Merge rows would share ${F.erpDeny} of ${fmt(F.adActive)} tables and stop sharing ${F.erpStop} (${F.erpStopPct} %); ${F.g9Out} of ${F.g9Of} sample tables are outside it.</li>` +
    `<li class="rv" data-f="0.3"><b>Plan signing</b> works as a mechanism (§28, witness PASS ${F.signJudged}) and the shared reader on main can verify it; ${F.adaptersCallVerify} adapters ask it to, until the key-custody question (Q1) is answered. <b>Sealing</b> works in the simulator (§29, PASS ${F.sealJudged}); <b>real pipes</b> are not built.</li>` +
    `<li class="rv" data-f="0.5"><b>Event versioning</b> is a design on paper (§13.12.J.2): nothing built.</li>` +
    `<li class="rv" data-f="0.7"><b>Today the ERP scope is unchanged:</b> ${F.erpSharedE1} tables shared under the old rule and under the plan, ${F.erpDiffer} differ (E1, over all ${fmt(F.erpN)}).</li></ul>` +
    logp([`D8b shared-by-default today = ${F.erpShared} of ${F.adActive} · by default-deny with the Merge rows = ${F.erpDeny} · would stop being shared = ${F.erpStop} (${F.erpStopPct}%)`], 'build/scriptor/dryrun.log · read against the adapters by git show', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.85"'), 'tight');
  // ---------------- limits ----------------
  const lim = [`The runs shown are not encrypted. Sealing a flow for its audience is witnessed in the simulator only (§29, PASS ${F.sealJudged}); the real comm layer is not touched.`, `The plans on main are unsigned (§16.13 Q1): a user can edit one locally. Signature checking is in the shared reader (§28, PASS ${F.signJudged}) and ${F.adaptersCallVerify} adapters use it yet.`, `The adapters did not shrink (Modeller +${F.adapterAdded} / −${F.adapterRemoved}; reader +${F.scopeLines}); about ${F.adapterStayPct} % of them stays.`,
    'Narrowing the ERP scope (G9) needs the every-window check; real pipes are not built.', 'Event versioning is not solved (card 2).',
    'Logic runs only: one in-memory shelf and a mirror, process stubs for the kernel; no real devices.', 'Outside statements are as their sources said them on 2026-10-25; those projects may have changed since.'];
  C.limits = `<div class="pg"><div class="kick">HONEST LIMITS</div><h2 class="ct">What this film does not show</h2><ul class="bul lim">${lim.map((x, i) => `<li class="rv" data-f="${(0.04 + i * 0.09).toFixed(2)}">${esc(x)}</li>`).join('')}</ul>` +
    `<div class="term lg2 rv" data-f="0.8"><div class="s">verdict lines read from the logs after this run</div><div class="o">s1 PASS judged=${F.v_s1} · registry PASS ${F.v_reg} · virtual PASS ${F.v_virt} (vacuous ${F.virtVacuous}) · mesh PASS ${F.v_mesh} · dry run PASS ${F.v_dry} (open ${F.dryOpen}) · modeller plan PASS ${F.planJudged} · ERP plan PASS ${F.erpJudged} (open ${F.erpOpen}) · fails 0</div></div>` +
    `<div class="ptr rv" data-f="0.9">A full working day on a real case is shown in the first film.</div></div>`;
  // ---------------- sources (built from what was actually cited) ----------------
  return { C, USED, finish: finishSources.bind(null, C, F) };
}
function finishSources(C, F) {                               // called after all claim blocks exist: lists every cited URL
  const byUrl = {}; USED.claims.forEach(id => { const c = CLAIM[id]; (byUrl[c.source_url] = byUrl[c.source_url] || { c, ids: [] }).ids.push(id); });
  const urls = Object.keys(byUrl); const half = Math.ceil(urls.length / 2);
  const row = (u, i) => { const o = byUrl[u], c = o.c; return `<div class="sr" data-url="${esc(u)}"><span class="no">${i + 1}</span><div><b>${esc(c.publisher)}</b> · ${esc(c.title)} · ${esc(shortDate(c.date_of_source))} · accessed ${c.accessed} · read: ${esc(c.read_depth)}<br><span class="u">${esc(u)}</span></div></div>`; };
  const mk = (n, from, to) => `<div class="pg src"><div class="kick">SOURCES · ${n} of 2</div><h2 class="ct" style="font-size:40px">Every outside statement in this film</h2><div class="srcg">${urls.slice(from, to).map((u, i) => row(u, from + i)).join('')}</div>` +
    (n === 2 ? `<div class="fine2">Our own sources: iDempiere source MLookupFactory.java:192-214 and MQuery.java:420-430 (idempiere repository, read locally); build/erp/ad_full.db (read-only); build/scriptor/*.log; prompts/TEAMWORK_FRAMEWORK.md §16, §20, §22.<br>` +
      `Logos and names are trademarks of their owners, shown to identify the projects discussed. Manyverse icon © 2019 The Manyverse Authors, CC BY-SA 4.0. Quotes are exact and at most 25 words; access date 2026-10-25.</div>` : '') + '</div>';
  C.src1 = mk(1, 0, half); C.src2 = mk(2, half, urls.length); return { urls, half };
}
module.exports = { build, CLAIM, LOGO, shortDate };
