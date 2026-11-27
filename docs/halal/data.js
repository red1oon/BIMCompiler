// ⚠ DO NOT REMOVE — Implements HALAL_TRACE_SPEC.md §3 identifiers, §4 events, §5 rules. Witness: W-HT-CHAIN, W-HT-AGG, W-HT-R1, W-HT-R3R4.
// Every entity is fictional. All derived numbers are computed here and printed as §HT_FACT; the film speaks only those.
'use strict';
const HT = (() => {
  const gs1 = d => { let s = 0; const r = String(d).split('').reverse(); r.forEach((c, i) => s += (+c) * (i % 2 ? 1 : 3)); return String((10 - s % 10) % 10); };
  const gtin13 = b12 => b12 + gs1(b12), gln = b12 => b12 + gs1(b12);
  const iso6346 = (own, ser) => { const L = '0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ'; const s = own + 'U' + ser; let t = 0; s.split('').forEach((c, i) => t += L.indexOf(c) * Math.pow(2, i)); let k = t - Math.floor(t / 11) * 11; if (k === 10) k = 0; return own + 'U ' + ser + ' ' + k; };
  const D = (s) => new Date(s + 'T00:00:00Z'); const iso = d => d.toISOString().slice(0, 10);
  const addDays = (s, n) => iso(new Date(D(s).getTime() + n * 864e5));
  const NOW = '2026-10-21';

  const places = {
    farm: [['F01', 'Boa Vista Ranch', 'Campo Grande'], ['F02', 'Santa Rita Ranch', 'Dourados'], ['F03', 'Água Clara Ranch', 'Três Lagoas'], ['F04', 'Pedra Branca Ranch', 'Rio Brilhante'], ['F05', 'Lagoa Azul Ranch', 'Aquidauana'], ['F06', 'Cerrado Alto Ranch', 'Naviraí']],
    plant: { id: 'P1', name: 'Rio Verde Meat Plant', city: 'Mato Grosso do Sul' },
    plant2: { id: 'P2', name: 'Serra Norte Pork Plant', city: 'Santa Catarina' },
    port: 'Laem Chabang Port', dc: 'Bangkok Cold Hub DC',
    shops: [['S01', 'Mega Fresh Rama 9'], ['S02', 'Halal Mart Minburi'], ['S03', 'City Grocer Silom'], ['S04', 'Family Fresh Pattani'], ['S05', 'Super Save Hat Yai']]
  };
  places.farm.forEach((f, i) => f[3] = gln('78912340' + String(100 + i).padStart(4, '0')));
  places.plant.gln = gln('789123400200'); places.plant2.gln = gln('789123400300');
  places.shops.forEach((s, i) => s[2] = gln('885000100' + String(10 + i).padStart(3, '0')));

  const certs = [
    { no: 'HC-26-001843', issuer: 'Southern Cone Halal Certification Board', recognisedBy: 'Thai halal import verification desk', holder: places.plant.name, plants: [places.plant.gln], cats: ['Beef - frozen'], from: '2025-11-01', to: '2027-10-31' },
    { no: 'HC-26-001844', issuer: 'Southern Cone Halal Certification Board', recognisedBy: 'Thai halal import verification desk', holder: places.plant.name, plants: [places.plant.gln], cats: ['Beef - frozen'], from: '2025-11-01', to: '2027-10-31' },
    { no: 'HC-24-000917', issuer: 'Southern Cone Halal Certification Board', recognisedBy: 'Thai halal import verification desk', holder: 'Old Valley Meats', plants: ['0000000000000'], cats: ['Beef - frozen'], from: '2024-01-01', to: '2025-12-31' }
  ];
  const slaughterers = [{ id: 'S-0417', cert: 'MS-0417-25', from: '2025-03-01', to: '2027-02-28' }];

  // lots: halal beef striploin (A), halal mince being loaded (B), halal beef shin with a temperature excursion (C), conventional pork (P)
  const lotDefs = [
    { id: 'A', lot: 'B26233', product: 'Frozen Beef Striploin 1 kg', cat: 'Beef - frozen', cls: 'halal', cert: 'HC-26-001843', plant: 'P1', packs: 2400, animals: 48, farms: 6, slaughter: '2026-08-19', pack: '2026-08-20', cont: 1, shops: [60, 50, 50, 40, 40], scans: 137 },
    { id: 'B', lot: 'B26241', product: 'Frozen Beef Mince 1 kg', cat: 'Beef - frozen', cls: 'halal', cert: 'HC-26-001844', plant: 'P1', packs: 1200, animals: 30, farms: 4, slaughter: '2026-09-24', pack: '2026-09-25', cont: 2, shops: [], scans: 0 },
    { id: 'C', lot: 'B26236', product: 'Frozen Beef Shin 1 kg', cat: 'Beef - frozen', cls: 'halal', cert: 'HC-26-001843', plant: 'P1', packs: 600, animals: 18, farms: 3, slaughter: '2026-08-27', pack: '2026-08-28', cont: 3, shops: [30, 30], scans: 12, excursion: true },
    { id: 'P', lot: 'P26240', product: 'Frozen Pork Belly 1 kg', cat: 'Pork - frozen', cls: 'conventional', cert: null, plant: 'P2', packs: 1000, animals: 25, farms: 2, slaughter: '2026-09-02', pack: '2026-09-03', cont: 4, shops: [40, 30, 30], scans: 9 }
  ];
  const conts = [
    null,
    { n: 1, no: iso6346('MSK', '481236'), seal: 'HT-0048213', prev: 'Frozen fish (conventional)', clean: { id: 'CL-26-0914', date: '2026-08-27', how: 'Steam wash, inspected by halal auditor' }, type: '40 ft reefer', lots: ['A'], stuffed: '2026-08-29', open: false },
    { n: 2, no: iso6346('MSK', '517402'), seal: 'HT-0049377', prev: 'Frozen beef (halal)', clean: null, type: '40 ft reefer', lots: ['B'], stuffed: null, open: true, declaredCartons: 120, loaded: 96 },
    { n: 3, no: iso6346('TGH', '602115'), seal: 'HT-0047950', prev: 'Frozen beef (halal)', clean: null, type: '40 ft reefer', lots: ['C'], stuffed: '2026-08-31', open: false },
    { n: 4, no: iso6346('MSK', '739058'), seal: 'HT-0048866', prev: 'Frozen pork (conventional)', clean: null, type: '40 ft reefer', lots: ['P'], stuffed: '2026-09-05', open: false }
  ];
  const rnd = (() => { let a = 20261021; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();

  const lots = {}; lotDefs.forEach((d, k) => {
    const L = Object.assign({}, d); L.gtin = gtin13('78912340' + String(1010 + k).padStart(4, '0'));
    L.cartons = L.packs / 10; L.pallets = Math.ceil(L.cartons / 20);
    L.hold = null; L.sscc = []; for (let p = 0; p < L.pallets; p++) L.sscc.push('00' + '078912340' + String(k * 100 + p + 1).padStart(8, '0') + '0');
    L.sscc = L.sscc.map(s => { const b = s.slice(0, 17); return b + gs1(b); });
    // animals -> farms (round-robin by block), tags 12 digits
    L.animalList = []; for (let a = 0; a < L.animals; a++) { const farm = places.farm[Math.floor(a * L.farms / L.animals)]; L.animalList.push({ tag: String(76000000000 + k * 1000000 + a * 37 + 11).padStart(12, '0'), farm: farm[0] }); }
    // events (spec §4)
    const e = []; const add = (n, date, type, where, who, evidence) => e.push({ n, date, type, where, who, evidence });
    const slaughterCert = slaughterers[0];
    add(1, addDays(L.slaughter, -34), 'Animals registered and moved', L.farms + ' farms', 'Farm owners', L.animals + ' ear tags, movement permits');
    add(2, addDays(L.slaughter, -1), 'Veterinary inspection before slaughter', L.plant === 'P1' ? places.plant.name : places.plant2.name, 'Veterinary officer', 'Health certificate; ' + L.animals + ' animals passed');
    if (L.cls === 'halal') add(3, L.slaughter, 'Halal slaughter', places.plant.name + ', line 2', 'Slaughterer ' + slaughterCert.id, 'Slaughterer certificate ' + slaughterCert.cert + ', valid ' + slaughterCert.from + ' to ' + slaughterCert.to);
    else add(3, L.slaughter, 'Slaughter', places.plant2.name + ', line 1', 'Plant staff', 'Plant slaughter record');
    add(4, L.slaughter, 'Inspection after slaughter', L.plant === 'P1' ? places.plant.name : places.plant2.name, 'Veterinary officer', L.animals + ' carcasses passed');
    add(5, L.pack, 'Cut, debone and pack - lot created', L.plant === 'P1' ? places.plant.name : places.plant2.name, 'Plant', 'Lot ' + L.lot + ': ' + L.packs + ' packs, ' + L.cartons + ' cartons, ' + L.pallets + ' pallets');
    L.events = e;
    L.temps = [];
    lots[L.id] = L;
  });
  // later events + temperature legs
  const leg = (L, name, from, hours, base, bad) => { const pts = []; for (let h = 0; h <= hours; h += 6) pts.push(+(base + (rnd() - 0.5) * 1.2 + (bad && h >= bad[0] && h < bad[1] ? 6.4 : 0)).toFixed(1)); L.temps.push({ leg: name, from, hours, pts }); };
  Object.values(lots).forEach(L => {
    const C = conts[L.cont], st = C.stuffed || '2026-10-20';
    leg(L, 'Plant cold store', L.pack, 216, -18.4);
    if (!C.open) {
      const sail = addDays(st, 1), arr = addDays(st, 19);
      L.events.push({ n: 6, date: st, type: 'Container stuffed and sealed', where: L.plant === 'P1' ? places.plant.name : places.plant2.name, who: 'Plant + halal auditor', evidence: 'Container ' + C.no + ', seal ' + C.seal + ', content listing ' + L.cartons + ' cartons' });
      L.events.push({ n: 7, date: sail, type: 'Export clearance', where: 'Exporting port customs and veterinary border control', who: 'Customs; veterinary officer', evidence: 'Declaration, health certificate, halal certificate ' + (L.cert || 'none') });
      leg(L, 'Reefer at sea', sail, 432, -18.1);
      L.events.push({ n: 8, date: arr, type: 'Import clearance', where: places.port, who: 'Customs; veterinary border control', evidence: 'Declaration matched to container ' + C.no + (L.cert ? '; halal certificate verified' : '') });
      leg(L, 'Port waiting', arr, 12, -18, L.excursion ? [0, 12] : null);
      L.events.push({ n: 9, date: addDays(arr, 1), type: 'Received at distribution centre', where: places.dc, who: 'Distributor', evidence: L.pallets + ' pallets scanned by SSCC' });
      leg(L, 'Distribution centre', addDays(arr, 1), 288, -18.3);
      if (L.shops.length) L.events.push({ n: 10, date: addDays(arr, 15), type: 'Received at shops', where: L.shops.length + ' shops', who: 'Retailers', evidence: L.shops.reduce((a, b) => a + b, 0) + ' cartons scanned' });
    }
  });
  // lot C excursion: >limit for consecutive readings
  const LIMIT = -15;
  Object.values(lots).forEach(L => { L.excess = []; L.temps.forEach(t => t.pts.forEach((v, i) => { if (v > LIMIT) L.excess.push({ leg: t.leg, hour: i * 6, v }); })); });

  // ---- rule engine (spec §5) ----
  const certOf = n => certs.find(c => c.no === n);
  const lotRules = L => {
    const R = []; const C = conts[L.cont];
    if (L.cls !== 'halal') return [{ id: 'NA', st: 'na', text: 'Not sold as halal; halal rules not applied' }];
    const c = certOf(L.cert);
    const plantG = L.plant === 'P1' ? places.plant.gln : places.plant2.gln;
    R.push({ id: 'R3', st: c && c.plants.includes(plantG) && c.cats.includes(L.cat) ? 'ok' : 'fail', text: 'Certificate covers plant and product' });
    R.push({ id: 'R4', st: c && L.pack >= c.from && L.pack <= c.to ? 'ok' : 'fail', text: 'Certificate valid on production date ' + L.pack });
    const s = slaughterers[0]; R.push({ id: 'R6', st: L.slaughter >= s.from && L.slaughter <= s.to ? 'ok' : 'fail', text: 'Named slaughterer certified on ' + L.slaughter });
    const clean = C.prev.includes('conventional') ? (C.clean ? 'ok' : 'fail') : 'ok';
    R.push({ id: 'R5', st: clean, text: C.prev.includes('conventional') ? 'Cleaning record after non-halal cargo' : 'Previous cargo was halal' });
    const mixed = C.lots.some(x => lots[x].cls !== 'halal'); R.push({ id: 'R2', st: mixed ? 'fail' : 'ok', text: 'Container listing is halal only' });
    R.push({ id: 'R7', st: L.excess.length ? 'warn' : 'ok', text: L.excess.length ? 'Cold chain above ' + LIMIT + ' °C: ' + L.excess.length + ' readings' : 'Cold chain within ' + LIMIT + ' °C' });
    R.push({ id: 'R8', st: L.hold ? 'fail' : 'ok', text: L.hold ? 'On hold: ' + L.hold : 'No hold' });
    return R;
  };
  const verdictOf = L => {
    if (L.cls !== 'halal') return { key: 'conv', title: 'NOT A HALAL PRODUCT', note: 'Fully traceable. Halal rules do not apply.' };
    const R = lotRules(L); if (L.hold) return { key: 'hold', title: 'ON HOLD', note: L.hold };
    if (R.some(r => r.st === 'fail')) return { key: 'bad', title: 'NOT VERIFIED', note: R.filter(r => r.st === 'fail').map(r => r.text).join('; ') };
    return { key: 'ok', title: 'HALAL VERIFIED', note: 'Certificate, plant, dates, slaughter and container all checked' };
  };
  // ---- packs ----
  const serialStr = i => String(i + 1).padStart(6, '0');
  const packUrl = (L, i) => 'https://ht.example/01/' + L.gtin + '/10/' + L.lot + '/21/' + serialStr(i);
  const parse = url => { const m = /\/01\/(\d{14}|\d{13})\/10\/([A-Z0-9]+)\/21\/(\d+)/.exec(url); if (!m) return null; const L = Object.values(lots).find(x => x.gtin === m[1] && x.lot === m[2]); return L ? { L, i: +m[3] - 1 } : null; };
  const lineage = (L, i) => { const carton = Math.floor(i / 10), pallet = Math.floor(carton / 20), a = L.animalList[Math.floor(i * L.animals / L.packs)]; return { pack: serialStr(i), carton: L.lot + '-C' + String(carton + 1).padStart(4, '0'), pallet: L.sscc[pallet], container: conts[L.cont].no, lot: L.lot, animal: a.tag, farm: places.farm.find(f => f[0] === a.farm) }; };
  const back = L => { const farms = new Set(L.animalList.map(a => a.farm)); return { animals: L.animals, farms: farms.size }; };
  const fwd = L => { const sum = L.shops.reduce((a, b) => a + b, 0); return { shops: L.shops.length, cartons: sum, packs: sum * 10 }; };
  // worker: scan a carton into a container (R1)
  const log = [];
  const loadScan = (cn, cartonLot) => {
    const C = conts[cn], L = lots[cartonLot];
    const cont = lots[C.lots[0]];
    if (cont.cls === 'halal' && L.cls !== 'halal') { const ev = { t: '10:42', kind: 'BLOCK', text: 'R1: ' + L.product + ' (' + L.cat + ') has no halal certificate; refused into container ' + C.no, cont: C.no, lot: L.lot }; log.unshift(ev); return { ok: false, rule: 'R1', ev }; }
    C.loaded++; const ev = { t: '10:41', kind: 'OK', text: 'Carton of ' + L.product + ' loaded into ' + C.no, cont: C.no, lot: L.lot }; log.unshift(ev); return { ok: true, loaded: C.loaded, of: C.declaredCartons };
  };
  const facts = () => {
    const A = lots.A, V = verdictOf(A), c = certOf(A.cert), ln = lineage(A, 1203), b = back(A), f = fwd(A), cc = conts[1], Cc = lots.C;
    return { lotA: { lot: A.lot, packs: A.packs, cartons: A.cartons, pallets: A.pallets, animals: A.animals, farms: A.farms, cert: c.no, from: c.from, to: c.to, verdict: V.title, scans: A.scans, events: A.events.length }, container1: { no: cc.no, seal: cc.seal, cartons: A.cartons, clean: cc.clean.id }, lin: ln, back: b, fwd: f, shopsA: A.shops, lotC: { excess: Cc.excess.length, max: Math.max(...Cc.excess.map(x => x.v)), limit: LIMIT, lot: Cc.lot }, lotB: { loaded: conts[2].loaded, of: conts[2].declaredCartons, lot: lots.B.lot }, pork: { lot: lots.P.lot, packs: lots.P.packs, shops: lots.P.shops.length }, lots: Object.keys(lots).length, certs: certs.length };
  };
  return { gs1, gtin13, places, certs, certOf, lots, conts, lotRules, verdictOf, packUrl, parse, lineage, back, fwd, loadScan, log, facts, LIMIT, NOW, serialStr, slaughterers };
})();
if (typeof module !== 'undefined') module.exports = HT;
