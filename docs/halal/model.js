// ⚠ DO NOT REMOVE — implements HALAL_TRACE_DATA_MODEL.md §1 players, §4 manifest, HALAL_TRACE_SPEC.md §11 (commitments, federated trace). Fictional data.
'use strict';
(function (H) {
  function sha256(s) { // compact sync SHA-256 (hex) for the mockup; UTF-8 input
    const b = unescape(encodeURIComponent(s)), K = [], h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    for (let i = 2, n = 0; n < 64; i++) { let p = 1; for (let j = 2; j * j <= i; j++) if (i % j === 0) { p = 0; break; } if (p) K[n++] = (Math.pow(i, 1 / 3) % 1) * 4294967296 | 0; }
    const w = [], L = b.length * 8; let m = b + '\x80'; while (m.length % 64 !== 56) m += '\0'; m += '\0\0\0\0' + String.fromCharCode(L >>> 24 & 255, L >>> 16 & 255, L >>> 8 & 255, L & 255);
    for (let o = 0; o < m.length; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = m.charCodeAt(o + 4 * i) << 24 | m.charCodeAt(o + 4 * i + 1) << 16 | m.charCodeAt(o + 4 * i + 2) << 8 | m.charCodeAt(o + 4 * i + 3);
      for (let i = 16; i < 64; i++) { const a = w[i - 15], c = w[i - 2]; w[i] = (w[i - 16] + ((a >>> 7 | a << 25) ^ (a >>> 18 | a << 14) ^ a >>> 3) + w[i - 7] + ((c >>> 17 | c << 15) ^ (c >>> 19 | c << 13) ^ c >>> 10)) | 0; }
      let [a, b2, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) { const t1 = hh + ((e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7)) + (e & f ^ ~e & g) + K[i] + w[i], t2 = ((a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10)) + (a & b2 ^ a & c ^ b2 & c); hh = g; g = f; f = e; e = d + t1 | 0; d = c; c = b2; b2 = a; a = t1 + t2 | 0; }
      h[0] = h[0] + a | 0; h[1] = h[1] + b2 | 0; h[2] = h[2] + c | 0; h[3] = h[3] + d | 0; h[4] = h[4] + e | 0; h[5] = h[5] + f | 0; h[6] = h[6] + g | 0; h[7] = h[7] + hh | 0;
    }
    return h.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const salt = L => 'salt-' + L.id + '-' + sha256('fictional-' + L.lot).slice(0, 10);
  const commit = (v, s) => sha256(v + '|' + s);
  const kid = n => sha256(n).slice(0, 8);
  const P = H.places;
  const players = [
    { k: 'farm', n: 'Farm', kind: 'player', ic: 'farm', hold: ['Ear tags and movement permits', 'Feed, treatment and barn records'], share: ['Animal count per consignment (hash only)', 'Husbandry score: nutrition, health, barn (attested summary)'], see: ['Nothing from others'], ad: ['C_BPartner', 'HT_Event'], rules: [] },
    { k: 'vet', n: 'Veterinary service', kind: 'authority', ic: 'vet', hold: ['Inspection results', 'Health certificates'], share: ['Certificate reference and result'], see: ['Lot hash, on reveal'], ad: ['HT_Certificate', 'HT_Hold'], rules: ['R8'] },
    { k: 'plant', n: 'Abattoir and packing plant', kind: 'player', ic: 'plant', hold: ['Slaughter log, line, slaughterer', 'Recipes, prices, customers', 'Every lot it makes'], share: ['Product types and volume', 'Certificate reference', 'Lot as a hash'], see: ['Farm hash', 'Health certificate'], ad: ['M_Lot', 'M_ProductionLine', 'M_InOut', 'HT_Event'], rules: ['R3', 'R4', 'R6'] },
    { k: 'cert', n: 'Halal certifying body', kind: 'authority', ic: 'cert', hold: ['Certificate file', 'Audit reports'], share: ['Certificate no., scope, dates, status'], see: ['Plant and product types'], ad: ['HT_Certificate', 'HT_CertificatePlant'], rules: ['R3', 'R4'] },
    { k: 'cold', n: 'Cold store', kind: 'player', ic: 'snow', hold: ['Room and rack positions', 'Full temperature log'], share: ['Temperature summary per leg'], see: ['What enters (manifest)'], ad: ['M_Warehouse', 'M_Locator X,Y,Z', 'HT_Reading'], rules: ['R7'] },
    { k: 'box', n: 'Container and seal', kind: 'part', ic: 'box', hold: ['Previous cargo', 'Cleaning record'], share: ['Container no., seal no., content listing'], see: ['Every carton scanned onto it'], ad: ['M_Package', 'M_PackageLine'], rules: ['R1', 'R2', 'R5'] },
    { k: 'cust', n: 'Customs and border vet', kind: 'authority', ic: 'cust', hold: ['Declarations', 'Inspection files'], share: ['Clearance reference and release'], see: ['Manifest, certificate reference'], ad: ['HT_Manifest', 'HT_Hold'], rules: ['R8'] },
    { k: 'port', n: 'Port and carrier', kind: 'player', ic: 'ship', hold: ['Voyage and waiting time'], share: ['Arrival, dwell, reefer readings'], see: ['Manifest'], ad: ['HT_Event', 'HT_Reading'], rules: ['R7'] },
    { k: 'dc', n: 'Distribution centre', kind: 'player', ic: 'truck', hold: ['Stock, orders, prices'], share: ['Pallets in and out'], see: ['Manifest'], ad: ['M_InOut', 'M_Locator X,Y,Z'], rules: [] },
    { k: 'shop', n: 'Shop', kind: 'player', ic: 'shop', hold: ['Sales and prices'], share: ['Cartons received'], see: ['Manifest'], ad: ['M_InOut', 'C_BPartner_Location'], rules: [] },
    { k: 'me', n: 'Shopper', kind: 'consumer', ic: 'person', hold: ['Their scans, photos and reviews'], share: ['Their own report, only if they send it'], see: ['Signed public record'], ad: ['HT_Scan', 'HT_Review'], rules: [] }
  ];
  const contacts = { shop: { n: 'Mega Fresh Rama 9, customer care', mail: 'care@megafresh.example', wa: '66800000001' }, brand: { n: 'Rio Verde, quality desk', mail: 'quality@rioverde.example', wa: '66800000002' }, cert: { n: 'Halal certifying body, complaints', mail: 'complaints@halal-body.example', wa: '66800000003' }, vet: { n: 'Veterinary service, food safety', mail: 'foodsafety@vet-service.example', wa: '66800000004' } };
  // manifest chain for a lot: plant -> carrier -> customs -> DC -> shop (spec 11.2)
  const manifests = L => {
    const C = H.conts[L.cont], c = H.certOf(L.cert), s = salt(L), steps = [['Rio Verde Meat Plant', 'Port and carrier', C.stuffed || '2026-10-20'], ['Port and carrier', 'Customs and border vet', ''], ['Customs and border vet', 'Distribution centre', ''], ['Distribution centre', 'Shop', '']];
    let prev = '0'.repeat(64), arr = L.events.filter(e => e.n >= 6).map(e => e.date); const out = [];
    steps.forEach((st, i) => {
      const body = { v: 1, container: C.no, seal: C.seal, lines: [{ type: L.cat, class: L.cls, cartons: L.cartons, kg: L.packs }], cert: c ? { no: c.no, issuer: c.issuer } : null, lot: 'sha256:' + commit(L.lot, s), prev: 'sha256:' + prev, from: st[0], to: st[1], at: arr[i] || arr[arr.length - 1] || HT_NOW };
      const hash = sha256(JSON.stringify(body)); out.push({ body, hash, kid: kid(st[0]) }); prev = hash;
    });
    return out;
  };
  const HT_NOW = H.NOW;
  // federated trace from a shop back to the farms (spec 11.1 #5). off = player key that does not answer.
  const fed = (L, off) => {
    const f = H.fwd(L), b = H.back(L), C = H.conts[L.cont], s = salt(L), M = manifests(L);
    const hops = [
      { k: 'shop', n: 'Shop', says: `Received ${L.shops[0] || 0} cartons of manifest ${M[3].hash.slice(0, 10)}…`, hides: 'sales, prices, shoppers' },
      { k: 'dc', n: 'Distribution centre', says: `${L.pallets} pallets in; ${f.shops} shop deliveries out`, hides: 'other customers, stock, prices' },
      { k: 'cust', n: 'Customs and border vet', says: `Declaration matches container ${C.no}: ${L.cartons} cartons`, hides: 'other consignments' },
      { k: 'port', n: 'Port and carrier', says: `Container ${C.no} arrived ${L.events.find(e => e.n === 8).date}; ${L.excess.length ? L.excess.length + ' readings above ' + H.LIMIT + ' °C' : 'cold chain within limit'}`, hides: 'voyage and other cargo' },
      { k: 'plant', n: 'Abattoir and packing plant', says: `Reveals lot ${L.lot}: commitment matches ✓. ${b.animals} animals, ${b.farms} farms`, hides: 'recipes, prices, other lots', reveal: true },
      { k: 'farm', n: 'Farm', says: `${b.farms} farms; ear tags for ${b.animals} animals`, hides: 'feed and treatment records' }
    ];
    const out = []; let stopped = null;
    for (const h of hops) { if (stopped) { out.push({ k: h.k, n: h.n, st: 'notreached' }); continue; } if (h.k === off) { out.push({ k: h.k, n: h.n, st: 'silent' }); stopped = h.k; continue; } out.push(Object.assign({ st: 'answered' }, h)); }
    return out;
  };
  // Thayiban (goodness): wholesome checks beyond the halal rules. Proposal; criteria need scholars' review (spec §12).
  const good = L => { const C = H.conts[L.cont], out = [{ t: 'Veterinary inspection before slaughter', st: 'ok', d: L.events[1].date }, { t: 'Veterinary inspection after slaughter', st: 'ok', d: L.events[3].date }, { t: L.excess.length ? 'Cold chain above ' + H.LIMIT + ' °C: ' + L.excess.length + ' readings' : 'Cold chain within ' + H.LIMIT + ' °C on every leg', st: L.excess.length ? 'warn' : 'ok' }];
    if (L.cls === 'halal') out.push({ t: C.prev.includes('conventional') ? 'Container cleaned after conventional cargo (' + C.clean.id + ')' : 'Container previous cargo: ' + C.prev, st: C.prev.includes('conventional') && !C.clean ? 'fail' : 'ok' });
    out.push({ t: L.hold ? 'On hold: ' + L.hold : 'No veterinary or customs hold', st: L.hold ? 'fail' : 'ok' }); return out; };

  // ---- Thayiban score (nutrition, health, barn, cold chain, container hygiene). PROPOSAL: equal weights, equal checks; criteria need vets', scholars' and standards bodies' review.
  const CRIT = { nutrition: ['Feed ration recorded', 'No unauthorised growth promoters declared', 'Clean water always available', 'Feed supplier traceable', 'Finishing diet logged'],
    health: ['Vaccinations current', 'Treatment withdrawal periods honoured', 'Veterinary visit in the last 90 days', 'Mortality within the herd norm', 'Pre-slaughter inspection passed'],
    barn: ['Space per head meets the minimum', 'Ventilation and bedding adequate', 'Shade and shelter provided', 'Cleaning log kept', 'Welfare audit within 12 months'] };
  const farmChecks = {}; P.farm.forEach((f, i) => { farmChecks[f[0]] = {}; Object.keys(CRIT).forEach((k, kk) => { farmChecks[f[0]][k] = CRIT[k].map((_, j) => ((i + 1) * (j + 2 + kk)) % 9 !== 0 && !(f[0] === 'F03' && k === 'barn' && j < 2)); }); });
  const pct = a => Math.round(100 * a.filter(Boolean).length / a.length);
  const farmScore = (fid, k) => pct(farmChecks[fid][k]);
  const thayiban = L => {
    const cnt = {}; L.animalList.forEach(a => cnt[a.farm] = (cnt[a.farm] || 0) + 1);
    const wavg = k => Math.round(Object.keys(cnt).reduce((s, f) => s + cnt[f] * farmScore(f, k), 0) / L.animals);
    const C = H.conts[L.cont], tot = L.temps.length, ok = L.temps.filter(t => t.pts.every(v => v <= H.LIMIT)).length;
    const comps = [{ k: 'nutrition', n: 'Nutrition', s: wavg('nutrition') }, { k: 'health', n: 'Animal health', s: wavg('health') }, { k: 'barn', n: 'Barn conditions', s: wavg('barn') }, { k: 'cold', n: 'Cold chain (legs within limit)', s: Math.round(100 * ok / tot) }];
    if (L.cls === 'halal') comps.push({ k: 'box', n: 'Container hygiene', s: C.prev.includes('conventional') && !C.clean ? 0 : 100 });
    const overall = Math.round(comps.reduce((a, c) => a + c.s, 0) / comps.length);
    return { comps, overall, farms: Object.keys(cnt).map(f => ({ id: f, name: P.farm.find(x => x[0] === f)[1], animals: cnt[f], nutrition: farmScore(f, 'nutrition'), health: farmScore(f, 'health'), barn: farmScore(f, 'barn') })), crit: CRIT };
  };
  Object.assign(H, { thayiban, farmChecks, good, sha256, salt, commit, kid, players, contacts, manifests, fed });
  if (typeof module !== 'undefined') module.exports = H;
})(typeof HT !== 'undefined' ? HT : require('./data.js'));
