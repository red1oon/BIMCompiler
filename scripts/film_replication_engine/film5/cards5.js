// ⚠ DO NOT REMOVE — Scope: the cards (HTML) of Film 5 "Trust and the thin pipe". Every number is read from the facts object X (facts5.js: extracted from the frozen logs and prompt lines); no number is typed here.
// Plain words only. Colours are the Civil Works chapter-card palette (see stage5.html :root). `rv(f, html, ..., u)` = element visible from fraction f of its beat (until u).
'use strict';
const nf = n => Number(n).toLocaleString('en-US');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SERIES = 'THE TEAM FEATURE · TRUST AND THE THIN PIPE';
const CH = { 1: 'A RULE THAT CATCHES OLD APPS UP', 2: 'CHANGING WHO THE TEAM TRUSTS', 3: 'THE THIN PIPE', 4: 'WHERE THIS LEAVES US' };
function build(X) {
  const F = X.F, D = X.D, S = X.SRC;
  const sl = k => String(S[k]).replace(/^TEAMWORK_FRAMEWORK\.md:/, 'TEAMWORK_FRAMEWORK.md line ').replace(/^build\/(comm\/logs|scriptor)\//, '').replace(/:(\d+)$/, ' line $1');
  const C = {}, FADE = {}, SRCTAG = {}, TITLES = {};
  const rv = (f, html, o) => { o = o || {}; return `<div class="rv ${o.cls || ''}" data-f="${f}"${o.u !== undefined ? ` data-u="${o.u}"` : ''} style="${o.st || ''}">${html}</div>`; };
  const bx = (x, y, w, h, html, cls, f, u) => rv(f === undefined ? 0 : f, html, { cls: 'bx ' + (cls || ''), st: `left:${x}px;top:${y}px;width:${w}px;height:${h}px`, u });
  const pos = (x, y, html, f, o) => rv(f === undefined ? 0 : f, html, Object.assign({ cls: 'pos ' + ((o && o.cls) || ''), st: `left:${x}px;top:${y}px;` + ((o && o.st) || '') }, o && o.u !== undefined ? { u: o.u } : {}));
  const chip = (t, c) => `<span class="chip ${c || ''}">${esc(t)}</span>`;
  const page = (n, title, lead, body, src, id) => { src = String(src).replace(/build\/(comm\/logs|scriptor)\//g, '').replace(/\.(log|md|java):(\d+)/g, '.$1 line $2'); SRCTAG[id] = src; TITLES[id] = title; return `<div class="pg"><div class="tag">CHAPTER ${n} · ${CH[n]}</div><div class="ser">${SERIES}</div><h2 class="ct">${esc(title)}</h2>${lead ? `<div class="lead">${lead}</div>` : ''}<div class="body">${body}</div><div class="src">source: ${esc(src)}</div></div>`; };
  const card = (id, kick, title, sub, note) => { FADE[id] = 1; TITLES[id] = title; C[id] = `<div class="pg"><div class="cardblk"><div class="k">${esc(kick)}</div><div class="t">${esc(title)}</div><div class="s">${esc(sub)}</div>${note ? `<div class="n">${esc(note)}</div>` : ''}</div></div>`; };

  // ---------- title ----------
  card('title', 'THE TEAM FEATURE · 25 AND 26 OCTOBER 2026', 'Trust and the thin pipe', 'Pieces of work on the Team feature, each measured by automatic checks.', 'A proof of concept. Every number on screen is read from a check log or from the project notes.');

  // ---------- chapter 1 ----------
  card('ch1_card', 'Chapter 1', 'A rule that catches old apps up', 'An admin publishes a signed translation rule. Devices on an older version adopt it on their next visit.');
  C.ch1_problem = page(1, 'An older app parks what it cannot read', 'A change written in a newer shape arrives at a device that does not know that shape yet.',
    bx(0, 0, 760, 300, `<h3>Newer app</h3><div class="sb">The admin's device</div><div class="tx">Writes a change in the newer shape.</div><div style="margin-top:18px">${chip('SENT', 'cy')}</div>`, 'cy', 0.05) +
    pos(790, 100, '→', 0.2, { cls: 'arr' }) +
    bx(968, 0, 760, 140, `<h3>Older app</h3><div class="sb">A device that has not been updated: the change is set aside. ${chip('PARKED', 'am')}</div>`, 'am', 0.2) +
    bx(968, 160, 760, 140, `<div class="tx" style="margin-top:0;color:#FAB219">“N changes wait for a translation rule from the team admin”</div><div class="sb">What the older app tells its user.</div>`, 'am dash', 0.35) +
    bx(0, 340, 1728, 190, `<h3>How a rule used to arrive</h3><div class="tx">Only through the app's own settings, which means a new app build.</div><div class="tx" style="color:#FFEB3B">An admin had no way to hand a waiting device the rule.</div>`, 'or', 0.55),
    D.L.issue16 + ' (Issue)', 'ch1_problem');
  C.ch1_how = page(1, 'The admin publishes the rule, devices adopt it', 'The signed rule rides inside the team policy message that devices already exchange.',
    [['The owner signs the rule', 'offline, with the owner’s key'], ['An admin device publishes it', 'inside the team’s policy message'], ['Other devices pick it up', 'on their next visit, no new app build'], ['The waiting change is read', 'the parked change is folded in']].map((b, i) =>
      bx(i * 444, 30, 396, 250, `<div class="mono">STEP ${i + 1}</div><h3 style="margin-top:12px">${esc(b[0])}</h3><div class="sb">${esc(b[1])}</div>`, 'cy', 0.08 + i * 0.2) + (i < 3 ? pos(i * 444 + 396, 100, '→', 0.18 + i * 0.2, { cls: 'arr' }) : '')).join('') +
    bx(0, 330, 1728, 190, `<h3>Nothing new is fetched</h3><div class="tx">The rule travels in the bundles the devices already exchange, so it needs no fetch protocol and no new object names.</div>`, 'gd', 0.85),
    D.L.design16 + ' (Design decision)', 'ch1_how');
  C.ch1_keys = page(1, 'Two signatures, not one', 'A stolen admin device alone is not enough to introduce a rule.',
    bx(0, 0, 820, 180, `<h3>Gate 1: the policy message</h3><div class="tx">Proves that an enrolled admin device sent it.</div>`, 'cy', 0.05) +
    pos(836, 40, '+', 0.15, { cls: 'arr' }) +
    bx(908, 0, 820, 180, `<h3>Gate 2: the rule itself</h3><div class="tx">Must carry the owner’s signature, checked against the key list pinned when the team was founded.</div>`, 'cy', 0.15) +
    [['Unsigned rule', 'refused outright', 'unsigned'], ['Rule edited after signing', 'refused', 'bad-signature'], ['Signed by a key that is not on the list', 'refused', 'untrusted-signer'], ['Sent by a device that is not an admin', 'refused', 'not-admin']].map((r, i) =>
      bx((i % 2) * 908, 220 + Math.floor(i / 2) * 140, 820, 118, `<div>${chip('REFUSED', 'or')}  <span class="mono" style="margin-left:10px">${esc(r[2])}</span></div><div class="tx">${esc(r[0])}: ${esc(r[1])}.</div>`, 'or', 0.3 + i * 0.15)).join(''),
    D.L.host16 + ' (refusals); ' + D.L.design16 + ' (two keys)', 'ch1_keys');
  C.ch1_tested = page(1, `Tested with ${F.devices} real browsers`, 'One admin, one joiner on an older shape, and a late joiner.',
    bx(0, 0, 360, 330, `<h3>A</h3><div class="sb">Admin</div>` + rv(0.38, `<div style="margin-top:22px">${chip('PUBLISHES THE SIGNED RULE', 'cy wr')}</div>`), 'cy', 0.05) +
    bx(380, 0, 360, 330, `<h3>B</h3><div class="sb">Joiner, older shape</div>` + pos(22, 110, chip('PARKED: WAITING FOR A RULE', 'am wr'), 0.12, { u: 0.58, st: 'width:316px' }) + pos(22, 110, chip('CHANGE READ AFTER A SINGLE VISIT', 'gd wr'), 0.58, { st: 'width:316px' }), 'am', 0.05) +
    bx(760, 0, 360, 330, `<h3>C</h3><div class="sb">Late joiner</div>` + rv(0.8, `<div style="margin-top:22px">${chip('ADOPTS THE RULE ON ITS FIRST VISITS', 'gd wr')}</div>`), 'gd', 0.05) +
    bx(0, 360, 1120, 160, `<h3>${F.devices} real browsers (Chromium), one shared folder</h3><div class="tx">A single visit by the joiner is enough: the rule is loaded and the parked change is folded in straight away.</div>`, 'cy', 0.45) +
    bx(1160, 0, 568, 520, `<div class="mono">EACH OF THE TWO HOSTS (ERP, MODELLER)</div><div class="big" style="margin-top:14px">${F.pubJudged} · 0</div><div class="lab">checks passed · failed</div><div class="big" style="margin-top:30px">${F.pubMut} of ${F.pubMut}</div><div class="lab">deliberately broken copies caught</div>`, 'gd', 0.6),
    D.L.host16, 'ch1_tested');
  C.ch1_ledger = page(1, 'Merged, with stated limits', 'Merged into the ERP and the Modeller (bim-ootb pull request #' + F.pr1 + ').',
    bx(0, 0, 840, 520, `<div>${chip('MERGED', 'gd')}</div><div class="big" style="margin-top:18px">${F.verJudged} · ${F.verFails}</div><div class="lab">engine checks passed · failed, and ${F.verMut} of ${F.verMut} broken copies caught</div><div class="big" style="margin-top:26px">${F.suite2382} · 0</div><div class="lab">browser test suites passed · failed, with 0 page errors</div>`, 'gd', 0.05) +
    bx(888, 0, 840, 520, `<div>${chip('NOT BUILT', 'am')}</div><div class="tx" style="margin-top:20px">An admin screen to publish a rule: today it is a call in code.</div><div class="tx">A tool to sign a rule: the owner’s key signs offline.</div><div class="tx">A way to withdraw a published rule: it stays for good, and a team can hold at most ${F.maxSets}.</div>`, 'am', 0.5),
    sl('pr1') + '; ' + sl('suite2382') + '; ' + D.L.open16 + ' (open items a, b)', 'ch1_ledger');

  // ---------- chapter 2 ----------
  card('ch2_card', 'Chapter 2', 'Changing who the team trusts', 'A signed statement adds a key, or lets the backup key replace a lost one.');
  const kc = (n, role, cls) => `<span class="k0 ${cls || ''}">${n}<small>${role}</small></span>`;
  C.ch2_keys = page(2, 'The trusted keys were fixed at founding', 'Until now, a lost or leaked primary key meant founding a new team.',
    bx(0, 0, 840, 300, `<h3>Trusted keys, pinned when the team was founded</h3><div style="margin-top:26px">${kc('K0', 'primary')}${kc('K1', 'backup')}</div>` + rv(0.3, `<div class="tx" style="color:#FF8C1A;margin-top:30px">Primary lost or leaked: the only way out was to found a new team.</div>`), 'cy', 0.05) +
    bx(888, 0, 840, 520, `<h3>Now: a signed statement</h3><div class="tx">The new list: ${F.keysMin} to ${F.keysMax} keys.</div>` + rv(0.45, `<div class="tx">A fingerprint of the list in force, so an old statement cannot be replayed.</div>`) + rv(0.6, `<div class="tx">A signature from a key that is already on that list.</div>`) + rv(0.75, `<div class="tx">Sent by an admin device: the same two-signature idea as for rules.</div>`), 'cy', 0.4),
    sl('keysMax') + ' (design); ' + D.L.s35issue + ' (issue)', 'ch2_keys');
  const lst = (a, cls) => a.map(x => kc(x[0], x[1], x[2])).join('');
  C.ch2_rotate = page(2, 'A rotation, step by step', 'The primary adds a key. Later the backup replaces a lost primary.',
    bx(0, 0, 1728, 230, `<h3>The list in force</h3>` +
      pos(22, 80, lst([['K0', 'primary'], ['K1', 'backup']]), 0.04, { u: 0.3 }) +
      pos(22, 80, lst([['K0', 'primary'], ['K1', 'backup'], ['K2', 'added', 'new']]), 0.3, { u: 0.55 }) +
      pos(22, 80, lst([['K0', 'dropped', 'gone'], ['K1', 'backup'], ['K3', 'new', 'new']]), 0.55), 'cy', 0) +
    rv(0.04, `<div class="tx" style="position:absolute;left:0;top:262px;width:1728px">At founding: the primary and the backup.</div>`, { u: 0.3 }) +
    rv(0.3, `<div class="tx" style="position:absolute;left:0;top:262px;width:1728px">The primary signs a statement that adds another key.</div>`, { u: 0.55 }) +
    rv(0.55, `<div class="tx" style="position:absolute;left:0;top:262px;width:1728px">The primary is lost: the backup signs a new list that leaves it out.</div>`) +
    bx(0, 340, 840, 180, `<div class="mono">A PLAN SIGNED BY THE OLD PRIMARY</div><div style="margin-top:14px">${chip('UNTRUSTED', 'or')}</div>`, 'or', 0.75) +
    bx(888, 340, 840, 180, `<div class="mono">A PLAN SIGNED BY THE NEW KEY</div><div style="margin-top:14px">${chip('OK', 'gd')}</div>`, 'gd', 0.85),
    D.t6reader + ' (T6 rotate)', 'ch2_rotate');
  const plain = { 'plan-trust-untrusted-signer': 'Signed by a key that is not on the list', 'plan-trust-signature': 'Keys edited after signing', 'plan-trust-stale': 'An old statement replayed after a newer one', 'bad-policy:planTrust': 'A private key hidden in the key list', 'not-admin': 'A valid statement sent by a device that is not an admin', 'epoch-stale': 'A valid statement inside an out-of-date policy', 'plan-trust-unpinned': 'A team founded with no list cannot gain one' };
  D.refusals.forEach(r => { if (!plain[r.code]) throw new Error('§CARD_FAIL no plain label for refusal code ' + r.code); });
  C.ch2_refuse = page(2, `${F.refusals} refusals, each on both devices`, 'Every one of these was refused on both devices.',
    D.refusals.map((r, i) => bx((i % 4) * 436, Math.floor(i / 4) * 210, 400, 190, `<div>${chip('REFUSED', 'or')}</div><div class="tx" style="font-size:23px">${esc(plain[r.code])}</div><div class="mono" style="margin-top:6px;font-size:17px">${esc(r.code)}</div>`, 'or', 0.06 + i * 0.1)).join('') +
    bx(1308, 210, 400, 190, `<div class="big" style="font-size:90px">${F.refusals}</div><div class="lab">of ${F.refusals} refused</div>`, 'gd', 0.8),
    S.refusals.replace(/^build\/comm\/logs\//, '') + ' (T7 refuse)', 'ch2_refuse');
  C.ch2_proof = page(2, `${F.ptJudged} checks, none failed`, 'The checks were written first, and they failed before the build.',
    bx(0, 0, 560, 520, `<div class="big" style="font-size:150px">${F.ptJudged}</div><div class="lab">checks passed · ${F.ptFails} failed</div>` + rv(0.4, `<div class="tx" style="margin-top:34px">${F.redArms} checks failed before the build, as they should.</div>`), 'gd', 0.05) +
    bx(600, 0, 1128, 280, `<h3>${F.plantrustMut} of ${F.plantrustMut} deliberately broken copies caught</h3><div style="margin-top:22px">` + Array.from({ length: F.plantrustMut }, (_, i) => `<span class="chip gd" style="margin:0 8px 8px 0;width:70px;text-align:center">${i + 1}</span>`).join('') + `</div><div class="sb">Each broken copy turned at least one check red.</div>`, 'gd', 0.5) +
    bx(600, 310, 1128, 210, `<h3>Order does not matter</h3><div class="tx">A third device that receives the same ${F.reverseOps} messages in reverse order ends with the same list.</div>`, 'cy', 0.75),
    S.ptJudged.replace(/^build\/comm\/logs\//, '') + '; ' + D.L.s351red, 'ch2_proof');
  C.ch2_hosts = page(2, 'The apps follow, with no code change', 'Each app re-checks the plan after every visit, using the list now in force.',
    ['ERP host', 'Modeller host'].map((nm, i) => bx(i * 600, 0, 560, 520,
      `<h3>${nm}</h3>` + rv(0.1, `<div class="tx">Open under the founding key K1: plan accepted.</div>`) + rv(0.3, `<div class="tx">An owner-signed policy moves the list to K2.</div>`) +
      rv(0.5, `<div class="tx">A plan signed by K1: ${chip('UNTRUSTED', 'or')} the scope closes.</div>`) + rv(0.7, `<div class="tx">A plan signed by K2: ${chip('OK', 'gd')}</div>`), 'cy', 0.05)).join('') +
    bx(1200, 0, 528, 250, `<div class="big" style="font-size:100px">${F.hostsJudged} · ${F.hostsFails}</div><div class="lab">host checks passed · failed (was ${F.hostsWas})</div>`, 'gd', 0.8) +
    bx(1200, 270, 528, 250, `<div class="tx" style="margin-top:0">${F.regression} older engine checks unchanged.</div><div class="tx">${F.suiteN} browser test suites, 0 failed, 0 page errors.</div><div style="margin-top:14px">${chip('MERGED · PULL REQUEST #' + F.pr2, 'gd')}</div>`, 'gd', 0.9),
    D.hostsRotateSrc.replace(/^build\/scriptor\//, '') + '; ' + sl('hostsNow'), 'ch2_hosts');
  C.ch2_limits = page(2, 'What is still open', 'Stated in the project notes at the time of the merge.',
    bx(0, 0, 560, 520, `<div>${chip('OPEN', 'am')}</div><div class="tx" style="margin-top:16px">A rule signed by a key that a rotation later drops stays loaded on devices that already loaded it. A fresh device refuses it, so the two read that change differently.</div>`, 'am', 0.06) +
    bx(584, 0, 560, 520, `<div>${chip('OPEN', 'am')}</div><div class="tx" style="margin-top:16px">No tool yet to build and sign the statement, and no admin screen.</div>`, 'am', 0.4) +
    bx(1168, 0, 560, 520, `<div>${chip('BY DESIGN', 'cy')}</div><div class="tx" style="margin-top:16px">A team founded with no list cannot gain one: an admin device could pin its own key. It must be founded again.</div>`, 'cy', 0.65),
    D.L.s35limits + ' (limits); ' + D.L.s35resid + ' (residuals)', 'ch2_limits');

  // ---------- chapter 3 ----------
  card('ch3_card', 'Chapter 3', 'The thin pipe', 'Can a second device work out what Complete does, instead of being sent it?');
  const W1 = 1380, scale = W1 / F.orderToday;
  C.ch3_ask = page(3, 'Send the document and the words “complete it”', `Sample order: today the whole group of consequences travels with it, ${F.orderOps} operations.`,
    bx(0, 0, 1728, 250, `<div class="mono">TODAY · ${nf(F.orderToday)} BYTES</div>` + `<div class="bar cy" style="left:22px;top:70px;width:${Math.round(F.orderDoc * scale)}px"></div><div class="bar or" style="left:${22 + Math.round(F.orderDoc * scale)}px;top:70px;width:${Math.round(F.orderGroup * scale)}px"></div>` +
      `<div class="lab" style="position:absolute;left:22px;top:130px">document ${nf(F.orderDoc)} bytes + the Complete group ${nf(F.orderGroup)} bytes (${F.orderOps} operations)</div>`, 'or', 0.1) +
    bx(0, 280, 1728, 250, `<div class="mono">THIN · ${nf(F.orderThin)} BYTES</div>` + rv(0.45, `<div class="bar cy" style="left:22px;top:70px;width:${Math.round(F.orderDoc * scale)}px"></div><div class="bar cy" style="left:${22 + Math.round(F.orderDoc * scale)}px;top:70px;width:${Math.max(3, Math.round(F.orderIntent * scale))}px"></div>` +
      `<div class="lab" style="position:absolute;left:22px;top:130px">document ${nf(F.orderDoc)} bytes + a note of ${F.orderIntent} bytes: which table, which record, “complete”, and the time</div><div class="big" style="position:absolute;right:30px;top:60px;font-size:84px;color:#4FC3F7">−${F.orderSaving}%</div>`), 'cy', 0.35),
    sl('orderToday'), 'ch3_ask');
  const NAME = { c_order: 'Order', m_inout: 'Shipment', c_invoice: 'Invoice', c_payment: 'Payment', m_movement: 'Movement', m_inventory: 'Inventory', m_rma: 'RMA' };
  const INC = { c_allocationhdr: 'Allocation', m_movementconfirm: 'Movement confirm', dd_order: 'dd_order' };
  const classOrder = ['c_order', 'm_inout', 'c_invoice', 'c_payment', 'm_movement', 'm_inventory', 'm_rma'];
  const tiles = classOrder.map((k, i) => bx((i % 5) * 346, Math.floor(i / 5) * 215, 322, i < 5 ? 195 : 250, `<h3>${NAME[k]}</h3><div class="mono" style="margin-top:4px">${k}</div><div style="margin-top:14px">${chip('SAME, OP FOR OP', 'gd')}</div><div class="sb">${D.classes[k].ops} operations</div>`, 'gd', 0.04 + i * 0.07)).join('');
  const incs = D.inconclusive.map((k, j) => { const i = 7 + j; return bx((i % 5) * 346, Math.floor(i / 5) * 215, 322, 250, `<h3>${INC[k]}</h3><div class="mono" style="margin-top:4px">${k}</div><div style="margin-top:12px">${chip('NOT JUDGED', 'na')}</div><div class="sb" style="font-size:19px;line-height:1.25">${esc(D.incReasons[k][0])}</div>`, 'dash', 0.6 + j * 0.1); }).join('');
  C.ch3_result = page(3, `${F.thinDerivable} of ${F.thinN} kinds of document came out identical`, 'The second device used its own local ids and still produced the same operations.',
    tiles + incs + bx(0, 490, 1728, 80, `<div class="tx" style="margin-top:0">None was found not derivable. ${F.thinInconclusive} could not be judged.</div>`, 'cy', 0.9),
    S.thinDerivable.replace(/^build\/scriptor\//, '') + ' (verdict); ' + D.incReasons.c_allocationhdr[1].replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ' (reasons)', 'ch3_result');
  const rows7 = classOrder; const maxb = Math.max.apply(null, rows7.map(k => D.classes[k].today)); const BW = 1000;
  C.ch3_bytes = page(3, 'Bytes on the wire', `Document rows plus the Complete group today, against document rows plus the note.`,
    rows7.map((k, i) => { const c = D.classes[k], y = i * 64; return bx(0, y, 1728, 60, '', 'cy', 0.04 + i * 0.09).replace('></div>', `><div class="lab" style="position:absolute;left:18px;top:11px;width:180px;color:#fff">${NAME[k]}</div><div class="bar or" style="left:200px;top:5px;height:20px;width:${Math.max(3, Math.round(c.today / maxb * BW))}px"></div><div class="bar cy" style="left:200px;top:29px;height:20px;width:${Math.max(3, Math.round(c.thin / maxb * BW))}px"></div><div class="mono" style="position:absolute;left:${1230}px;top:2px;font-size:20px">today ${nf(c.today)}</div><div class="mono" style="position:absolute;left:${1230}px;top:29px;font-size:20px;color:#4FC3F7">thin  ${nf(c.thin)}</div></div>`); }).join('') +
    bx(0, 462, 1728, 100, `<div style="display:flex;align-items:center;gap:40px"><div class="big" style="font-size:64px;color:#FF8C1A">${nf(F.bytesToday)}</div><div class="lab" style="font-size:40px">→</div><div class="big" style="font-size:64px;color:#4FC3F7">${nf(F.bytesThin)}</div><div class="lab" style="font-size:30px">bytes across the ${F.thinDerivable} · <b style="color:#FFEB3B">${F.bytesSaving}% less</b></div></div>`, 'gd', 0.8),
    S.bytesSaving.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ' (totals); the seven per-type figures: witness_thin_derive.log T2 lines', 'ch3_bytes');
  const sq = (n, of) => Array.from({ length: of }, (_, i) => `<span class="chip ${i < n ? 'gd' : 'na'}" style="width:46px;margin-right:6px;text-align:center;padding:6px 0">&nbsp;</span>`).join('');
  C.ch3_check = page(3, 'Could the comparison itself be wrong?', `${F.cmpMutantsOf} deliberate faults were put into the second device’s list.`,
    [['Drop one operation', F.mutDrop, 'every kind flagged'], ['Change one value', F.mutAlter, 'every kind flagged'], ['Shift its clock without telling the comparer', F.mutClock, 'flagged only where a result records a processed time']].map((r, i) =>
      bx(0, i * 150, 1728, 134, `<div style="display:flex;align-items:center;justify-content:space-between"><div style="width:760px"><h3>${esc(r[0])}</h3><div class="sb">${esc(r[2])}</div></div><div>${sq(r[1], F.mutOf)}</div><div class="big" style="font-size:54px;width:190px;text-align:right">${r[1]} of ${F.mutOf}</div></div>`, 'cy', 0.08 + i * 0.22)).join('') +
    bx(0, 470, 1728, 90, `<div class="tx" style="margin-top:0">The three kinds that write a processed time: ${D.clockClasses.map(k => NAME[k]).join(', ')}.  The log calls this <span style="color:#FFEB3B">EVIDENCE</span>, not a pass.</div>`, 'am', 0.8),
    S.mutDrop.replace(/^build\/scriptor\//, '').replace(/:(\d+)$/, ' lines 66-69'), 'ch3_check');
  const clockRows = classOrder.map(k => `<tr><td>${NAME[k]}</td><td>${D.classes[k].clock ? esc(D.classes[k].clock.replace(/^.*\./, '')) : '—'}</td></tr>`).join('');
  C.ch3_m1 = page(3, 'To ship it, the message carries the time and the numbers', `Evidence only: ${F.mustBuild} things must be built first. The first is the message itself.`,
    bx(0, 0, 840, 520, `<h3>The clock</h3><div class="sb">Only one column depends on the device clock.</div><table class="tb" style="margin-top:12px"><tr><th>TYPE</th><th>COLUMN WRITTEN (AS IN THE LOG)</th></tr>${clockRows}</table>`, 'cy', 0.06) +
    bx(888, 0, 840, 300, `<h3>Document numbers</h3><div class="sb">Documents made by a Complete take their numbers from the device’s own sequence.</div><div class="tx"><b>Order:</b> the shipment, invoice, payment and allocation numbers.</div><div class="tx"><b>Invoice:</b> the payment and allocation numbers.</div>`, 'cy', 0.45) +
    bx(888, 330, 840, 190, `<h3 style="color:#FFEB3B">So the message must carry</h3><div class="tx">the time the first device used, and the numbers it allocated.</div>`, 'am', 0.8),
    D.classes.c_order.clockSrc.replace('build/scriptor/', '') + ' (CLOCK) and ' + D.classes.c_order.docnoSrc.replace('build/scriptor/', '').replace(/^.*:/, 'line ') + ' (DOCNO)', 'ch3_m1');
  const rerunTxt = k => { const c = D.classes[k]; return c.rerun === 'refused' ? ['REFUSED', 'or', 'a second Complete is refused'] : /docstatus":"CL"/.test(c.rerunDetail) ? ['CLOSED', 'am', 'the document is closed'] : ['NEXT ACTION CHANGED', 'am', 'the document’s next action becomes “--”']; };
  C.ch3_m2 = page(3, 'Only from draft: a second Complete closes the document', 'Completing a completed document does not simply do nothing.',
    bx(0, 0, 1060, 520, `<table class="tb"><tr><th>TYPE</th><th>A SECOND COMPLETE</th></tr>${classOrder.map(k => { const r = rerunTxt(k); return `<tr><td>${NAME[k]}</td><td>${chip(r[0], r[1])}</td></tr>`; }).join('')}</table>`, 'cy', 0.06) +
    bx(1100, 0, 628, 310, `<h3>Real iDempiere does the same</h3><div class="tx">When the asked action is not valid, it falls back to the document’s own next action.</div><div class="mono" style="margin-top:10px">DocumentEngine.java:272-276</div>`, 'gd', 0.5) +
    bx(1100, 340, 628, 180, `<h3 style="color:#FFEB3B">So the message needs a guard</h3><div class="tx">Draft to complete, and nothing else.</div>`, 'am', 0.8),
    D.classes.c_order.rerunSrc.replace('build/scriptor/', '').replace(/:\d+$/, ' RERUN lines') + '; ' + D.docEngineSrc.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line '), 'ch3_m2');
  const uuRows = classOrder.slice().sort((a, b) => D.classes[b].uu - D.classes[a].uu).map(k => `<span class="k0" style="margin-bottom:10px;font-size:22px">${NAME[k]}<small>${D.classes[k].uu}</small></span>`).join('');
  C.ch3_m3 = page(3, 'The same ids, and the same code, on every device', `More to build, and ${F.thinInconclusive} kinds still to judge.`,
    bx(0, 0, 800, 520, `<h3>Generated ids</h3><div class="sb">A Complete makes up to ${F.uuMax} identifiers per document. Each device would mint its own at random.</div><div style="margin-top:14px">${uuRows}</div><div class="tx" style="color:#FFEB3B">They must become deterministic, or a later edit to a generated record could not find it.</div>`, 'cy', 0.06) +
    bx(824, 0, 460, 520, `<div>${chip('OPEN · NOT BUILT', 'am')}</div><h3 style="margin-top:14px">Version check</h3><div class="tx">The note carries no model version. A device on different code would derive silently.</div>`, 'am', 0.45) +
    bx(1308, 0, 420, 520, `<div>${chip('TO JUDGE', 'na')}</div><h3 style="margin-top:14px">${F.thinInconclusive} kinds</h3><div class="tx">${D.inconclusive.map(k => INC[k]).join(', ')}.</div>`, 'dash', 0.75),
    D.classes.c_order.uuSrc.replace('build/scriptor/', '').replace(/:\d+$/, ' UU lines') + '; ' + D.skewSrc.replace('build/scriptor/', ''), 'ch3_m3');

  // ---------- chapter 4 ----------
  card('ch4_card', 'Chapter 4', 'Where this leaves us', 'Merged and checked on real devices, and one piece that is evidence only.');
  C.ch4_ledger = page(4, 'The ledger', 'What is merged, and what is not.',
    bx(0, 0, 1728, 150, `<div style="display:flex;align-items:center;gap:26px"><div style="width:520px"><h3>Publish signed rules</h3><div class="sb">${F.verJudged} engine checks, ${F.pubJudged} + ${F.pubJudged} host checks</div></div>${chip('MERGED', 'gd')}<div class="lab">pull request #${F.pr1}</div></div>`, 'gd', 0.06) +
    bx(0, 170, 1728, 150, `<div style="display:flex;align-items:center;gap:26px"><div style="width:520px"><h3>Change the trusted keys</h3><div class="sb">${F.ptJudged} engine checks, ${F.hostsJudged} host checks</div></div>${chip('MERGED', 'gd')}<div class="lab">pull request #${F.pr2}</div></div>`, 'gd', 0.3) +
    bx(0, 340, 1728, 180, `<div style="display:flex;align-items:center;gap:26px"><div style="width:520px"><h3>The thin pipe</h3><div class="sb">${F.thinDerivable} of ${F.thinN} kinds identical · ${F.bytesSaving}% fewer bytes · ${F.mustBuild} things to build first</div></div>${chip('EVIDENCE ONLY · NOTHING SHIPPED', 'am')}<div class="lab" style="color:#FFEB3B">Whether to go thin is the owner’s decision.</div></div>`, 'am', 0.6),
    S.pr1.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ', ' + S.pr2.replace(/^.*:/, 'line ') + '; ' + D.g9Src.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ' (not decided)', 'ch4_ledger');
  C.ch4_src = page(4, 'Where every number comes from', 'The frozen copies read for this film, and whether the live file has changed since.',
    X.INPUTS.map((i, k) => bx(0, k * 130, 1728, 114, `<div style="display:flex;align-items:center;gap:30px"><div style="width:1080px"><h3 style="font-size:26px">${esc(i.source)}<span data-ref="1">${i.key === 'tf' ? ' (lines 4018 to 4068)' : ''}</span></h3><div class="mono" data-ref="1">frozen copy sha256 ${i.sha16}…</div></div>${chip(i.liveNow === 'same' ? 'LIVE FILE UNCHANGED' : 'LIVE FILE CHANGED', i.liveNow === 'same' ? 'gd' : 'am')}</div>`, 'cy', 0.05 + k * 0.15)).join('') +
    bx(0, 540 - 10, 1728, 60, `<div class="tx" style="margin-top:0;font-size:22px">Reading only: no engine, host or prompt file was changed to make this film.</div>`, 'cy', 0.8),
    'film5/inputs (checksums), film5/logs/facts.log (every number with its source line)', 'ch4_src');
  return { C, FADE, SRCTAG, TITLES };
}
module.exports = { build, NAMES: { NAME: null } };
