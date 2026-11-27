// ⚠ DO NOT REMOVE — Scope: the full-screen CARDS of Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24): opener (project wall + six challenge cards), Part 1 (dictionary),
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
  C.title = `<div class="pg tl"><div class="kick" style="margin-top:130px">AN EDUCATIONAL FILM · ENGLISH · SAMPLE DATA</div><h1>Keeping the bloat off</h1><h2 class="h2b">the dictionary, replication, and a serverless day</h2>` +
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
    ans(true, 'Part 3: the shelf has a stated contract (it stores named objects and reads none), a blind mirror keeps a copy, and the hub is a named role.', 0.82), 'c3');
  C.c4 = page(kk(4), 'History keeps growing, and first sync slows', grid([
    blk('2b2', { logos: [txt('Ink & Switch')], name: '2019 essay', f: 0.05 }),
    blk('4a', { logos: [logo('manyverse')], name: 'Manyverse / Scuttlebutt', f: 0.25, reading: CLAIM['4a'].our_reading, note: 'A problem that was reduced by engineering, not a growth measurement.' }),
    blk('4b1', { logos: [logo('automerge')], name: 'Automerge', f: 0.45 }),
    blk('4b3', { logos: [logo('automerge')], name: 'Automerge', f: 0.6, note: 'One example the post gives, for documents with large histories.' })], 2) +
    ans(true, 'Part 3: a lost device folds back from the shelf (built and witnessed in the sample run). Not tested here: years of growth.', 0.82), 'c4');
  C.c5 = page(kk(5), 'Pure peer-to-peer systems ended up adding an always-on helper', grid([
    blk('5e', { logos: [logo('radicle')], name: 'Radicle', f: 0.05 }),
    blk('5a', { logos: [logo('briar')], name: 'Briar', f: 0.25 }),
    blk('5b1', { logos: [txt('Secure Scuttlebutt')], name: 'handbook and spec', f: 0.45 }),
    blk('5b2', { logos: [txt('Secure Scuttlebutt')], name: 'handbook and spec', f: 0.6 })], 2) +
    ans(true, 'Part 3: the helper is an explicit role, the mailbox device. It keeps a blind copy of the shelf.', 0.8), 'c5');
  C.c6 = page(kk(6), 'Products change direction, so dependence is a risk', grid([
    blk('6-mongodb-a', { logos: [logo('mongodb')], name: 'MongoDB Atlas Device Sync', f: 0.05 }),
    blk('6-powersync-a', { logos: [logo('powersync')], name: 'PowerSync', f: 0.2 }),
    blk('6-electric-joining-a', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.35 }),
    blk('6-electric-joining-b', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.5, reading: CLAIM['6-electric-joining-b'].our_reading }),
    blk('6-triplit-a', { logos: [logo('supabase'), txt('Triplit')], name: 'announced by Supabase', f: 0.65, note: 'The post does not announce a shutdown of Triplit.' })], 2) +
    ans(true, 'Part 3: the data is local on every device; the shelf only has to store named objects.', 0.85), 'c6');
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
  C.d_honest = page(P1, 'An id is a pointer, not a secret', `<ul class="bul"><li class="rv" data-f="0.05">Ids are small integers and the seed is public: anyone holding the seed can decode them.</li><li class="rv" data-f="0.25">Volume and timing still show on the wire, so flows are sealed in a separate layer. <b>This run is not encrypted.</b></li>` +
    `<li class="rv" data-f="0.45">Integer keys collide across stations, so a record made on a device is addressed by its <code>&lt;table&gt;_uu</code> (spec §11.1).</li><li class="rv" data-f="0.65">An id keeps the payload small. It does not make it private.</li></ul>`);
  // ---------------- Part 2 ----------------
  const P2 = 'PART 2 · REPLICATION';
  C.r_strategy = page(P2, 'iDempiere already has the idea', `<div class="cols"><div>${term(Q.strategy100)}<div class="cap">Strategy 100 (POS), active tables only. R = Reference, M = Merge, L = Local.</div></div><div class="bigs">` +
    `<div class="bn"><b>${F.stratM}</b><span>Merge: both ways</span></div><div class="bn"><b>${F.stratR}</b><span>Reference: flows down</span></div><div class="bn"><b>${F.stratL}</b><span>Local: stays</span></div><div class="bn"><b>${F.stratUnlisted}</b><span>not yet classified</span></div></div></div>` +
    `<div class="say rv" data-f="0.5">Of ${fmt(F.adActive)} active tables. Each table is flowed down, shared both ways, or kept local. We use the classification and add the rows that say who, which columns, when.</div>`);
  const f1 = X.flows.find(r => /^F1/.test(r.name)), r1 = X.flows.find(r => /^R1/.test(r.name));
  const kinds = JSON.stringify({ FACT: 4, RULE: 2, SEED: 3, INSTRUMENT: 1 });
  C.r_row = page(P2, 'One flow row, read by one small engine', `<div class="term rowj"><div class="s">build/scriptor/flows.json · one row = one flow</div><div class="o">${esc(JSON.stringify(f1))}</div><div class="o">${esc(JSON.stringify(r1))}</div></div>` +
    `<div class="rowflow rv" data-f="0.3"><div class="bx">${F.rows} rows</div><div class="ar">→</div><div class="bx">compile.js (${F.lineEach['compile.js']} lines) checks every row against the dictionary</div><div class="ar">→</div><div class="bx">${F.treatments} handlers behind a registry:<br>FACT · RULE · SEED · INSTRUMENT</div></div>` +
    `<div class="say rv" data-f="0.55">Which table and columns, which direction, who may read, when: the row says it once. The engine has no table name in its code.</div>`);
  C.r_zero = page(P2, 'Adding by row, and a wrong row fails', `<div class="quad">` +
    logp([`new flows as rows only: ${F.zcList.split('; ').slice(0, 3).join('; ')} …`, `compiler code hash before and after: ${F.zcHash} (identical)`], 's1.log · W-FLOW-ZERO-CODE (2)(3)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.05"') +
    logp([`a new handler as a new file, named by one row: it ran end-to-end`, `core files sha256 before and after: ${F.regHash} (identical)`], 'registry.log · W-REG-ZEROCODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.25"') +
    logp([`bim_element declared as ONE virtual table row: ${F.virtCols} columns, payload ${F.virtPayload} (${F.virtCarried} carried + key)`, `a second virtual table, rows only: compiler hash unchanged`], 'virtual.log · W-VIRT-COMPILE, W-VIRT-ZEROCODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.45"') +
    logp([`a deliberately wrong row: declaredMissing=${F.zcTypo}`, `a typo in a virtual column: declaredMissing=${F.virtTypo}`], 'compile time, not run time · s1.log (4) · virtual.log W-VIRT-TYPO', 'rv bad').replace('class="term lg2 rv bad"', 'class="term lg2 rv bad" data-f="0.65"') + `</div>`);
  C.r_dry = page(P2, 'A dry run on the team tools: compile only', logp([
    `D1 the Modeller rows compile: ${F.dryVirtual} virtual table + ${F.dryRows} FACT row`, `D5 shared-by-rows (list values + the move) equals Object.keys(CLASS) — ${F.drySharedOps} vs ${F.drySharedOps}  (${F.dryValues} list values + the move)`,
    `D7 the ${F.dryLocalRows} declared-Local rows equal the adapter's STATION_LOCAL`, `D8b shared-by-default today = ${F.erpShared} of ${F.adActive} · by default-deny with the Merge rows = ${F.erpDeny} · would stop being shared = ${F.erpStop} (${F.erpStopPct}%)`], 'build/scriptor/dryrun.log · read against the adapters by git show; no adapter file touched') +
    logp([`OPEN G9 — ${F.g9Out} of ${F.g9Of} core trade-cycle sample tables are outside strategy-100 Merge: needs a team-ERP strategy and the every-window check`], 'dryrun.log · an open item, not a result', 'rv open').replace('class="term lg2 rv open"', 'class="term lg2 rv open" data-f="0.6"') +
    `<div class="say rv" data-f="0.4">The Modeller's ${F.drySharedOps} shared operation types are one virtual table, one row and ${F.dryValues} list values. Whether the team ERP should switch to default-deny is a separate decision.</div>`);
  C.r_bloat = page(P2, 'Where the bloat is kept off, in numbers we can count', `<div class="cols3"><div class="bn big3"><div class="l">PAYLOAD</div><b>${F.wire} of ${F.olCols}</b><span>columns of a sale line cross the shelf: ids and the quantity (s1.log, W-FLOW-MINIMAL)</span></div>` +
    `<div class="bn big3 rv" data-f="0.3"><div class="l">SCOPE CODE</div><b>${F.linesToolchain}</b><span>lines of toolchain read the rows; a new table is a row, and the compiler's hash does not change (${F.zcHash})</span></div>` +
    `<div class="bn big3 rv" data-f="0.6"><div class="l">NETWORK CHATTER</div><b>${F.salePipeCalls}</b><span>pipe calls made by a sale or a code scan; the control, one visit, made ${F.visitPipeCalls} (treat.log, W-TREAT-LOCAL)</span></div></div>` +
    `<div class="say rv" data-f="0.8">All three are measured on sample data. None of them is a claim about how much a real deployment would save.</div>`);
  C.r_ledger = page(P2, 'The honest ledger', `<div class="cols two"><div class="ledg"><div class="lr"><b>${F.linesToolchain}</b><span>compile toolchain: scope.js ${F.lineEach['scope.js']} + flow.js ${F.lineEach['flow.js']} + compile.js ${F.lineEach['compile.js']}</span></div>` +
    `<div class="lr"><b>${F.linesEngine}</b><span>whole engine: core ${F.linesCore} (treat.js ${F.lineEach['treat.js']} + sim.js ${F.lineEach['sim.js']}) + components ${F.linesComponents}</span></div>` +
    `<div class="lr"><b>${F.adapterStayPct}%</b><span>of the two team adapters (about ${F.adapterLines} lines, a grep-based estimate) is carriage, projection, pairing and UI: it stays</span></div></div>` +
    `<div class="ledg"><div class="lr rv" data-f="0.3"><b>more</b><span>The JSON rows are more lines than the two JS lists they replace: CLASS, 1 line, becomes 1 declaration, 1 row and ${F.dryValues} values; STATION_LOCAL, 1 line, becomes ${F.dryLocalRows} rows (spec §22.8).</span></div>` +
    `<div class="lr rv" data-f="0.55"><b>win</b><span>one default, checks at compile time, data instead of code, additions by row.</span></div></div></div>` +
    logp([`counting command (from build/scriptor/): ${F.lineCommand}`], 'how the line counts were taken', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.7"'));
  // ---------------- concept card (before the loyalty beats of the sample day) ----------------
  const TLg = fs.readFileSync(path.join(ROOT, 'build/scriptor/treat.log'), 'utf8'), wc = /W-TREAT-CODE — [^\n]*/.exec(TLg)[0];
  C.concept = page('PART 3 · A CONCEPT TO TEST, NOT A CLAIM ABOUT ANYONE\'S SYSTEM', 'Returns and loyalty on the buyer\'s phone', `<ul class="bul"><li class="rv" data-f="0.05"><b>Return:</b> a sale line with a negative quantity, through the same flow row. This is the hypothesis; the sample run did not send a return.</li>` +
    `<li class="rv" data-f="0.25"><b>Loyalty:</b> the credit lives on the phone. The cashier gives a signed code; the phone applies it once.</li><li class="rv" data-f="0.45"><b>Tested in the sample run:</b> the second scan does nothing; a forged code is rejected; a phone restored to an older state is flagged at settlement.</li></ul>` +
    logp([wc], 'build/scriptor/treat.log · W-TREAT-CODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.6"') + `<div class="say rv" data-f="0.8"><b>Detection, not prevention</b> (spec FL-7). It shows the rules hold in logic with sample data. It does not show real phones, real signatures or a real cashier.</div>`);
  // ---------------- limits ----------------
  const lim = ['Sample data: every quantity and price is made up for the run.', 'Not encrypted in the run: sealing is a separate layer, tested on its own.', 'Logic only: one in-memory hub, no real phone yet.', 'Process stubs stand in for the kernel\'s own Generate Replenishment and Apply Payment.',
    'The team adapters on main are unchanged (the dry run touched none): the multi-user hold stays.', 'The ERP\'s switch to default-deny still needs the every-window check (G9 is open).', 'Plan signing and real pipes are not built.', 'Event versioning is not solved (card 2).',
    'Outside statements are as their sources said them on 2026-10-25; those projects may have changed since.'];
  C.limits = `<div class="pg"><div class="kick">HONEST LIMITS</div><h2 class="ct">What this film does not show</h2><ul class="bul lim">${lim.map((x, i) => `<li class="rv" data-f="${(0.04 + i * 0.09).toFixed(2)}">${esc(x)}</li>`).join('')}</ul>` +
    `<div class="term lg2 rv" data-f="0.9"><div class="s">verdict lines read from the logs after this run</div><div class="o">s1 PASS judged=${F.v_s1} · treat PASS ${F.v_treat} · registry PASS ${F.v_reg} · virtual PASS ${F.v_virt} (vacuous ${F.virtVacuous}) · mesh PASS ${F.v_mesh} · dry run PASS ${F.v_dry} (open ${F.dryOpen}) · fails 0</div></div></div>`;
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
