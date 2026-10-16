#!/usr/bin/env node
// probe_s37_name_derived_ladders.js — DOES elements_meta.storey CARRY A DERIVABLE FLOOR LADDER?
// (2026-08-19). STUDY ONLY, READ-ONLY, nothing adopted, nothing wired. db.run() is never called.
//
// §S35/§S36 fell back to an INVENTED uniform 3m grid on LTU and Duplex because buildGrid() only
// looks for spatial_structure.center_z. It never asked the elements themselves. But
// elements_meta.storey carries name ladders (LTU: Plan 1..4, VÅN 1..5, VÅNING 1..4, Storey 1..3 —
// the nine federated buildings' own floor sequences), and deriving an elevation for each name FROM
// ITS OWN MEMBERS is the room-injection pattern §S32.1 rule 3 names as the required shape. The
// engine already does an adjacent version of this: viewer/schedule_author.js:298-317 computes a
// per-storey-name MEDIAN center_z and reassigns Unknown elements to the nearest one. So the
// statistic is a project precedent, not a new invention — but WHICH statistic is chosen is settled
// below by measurement (§S37.4), not by preference.
//
//   Q1  per storey NAME, derive an elevation from its own members; report the ladder per building.
//   Q2  group names into FAMILIES by prefix; is each family's ladder monotonic in derived elevation?
//   Q3  LTU: per-family grids vs the uniform 3m fallback — how many elements change level, and what
//       does the override rate do?
//   Q4  the other 6 buildings: does name-derived elevation agree with spatial_structure.center_z
//       where both exist? Disagreements are findings.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
// §S37_SELFTEST fixtures every pure function, each with a case that MUST come out negative.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));
const LD = require(path.join(__dirname, '..', 'build', 'level_deriver.js'));
const BLD = path.join(ROOT, 'buildings');
const FLEET = (process.env.ONLY || ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
  'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'].join(',')).split(',');
const MIN_MEMBERS = Number(process.env.MIN_MEMBERS || 1);   // a name with >= this many elements counts

// ── pure functions ────────────────────────────────────────────────────────────────────────────
function isUnknown(s) { return !s || s === '_UNKNOWN' || /^unknown$/i.test(s); }
// family = the name with every digit run stripped, whitespace collapsed, upper-cased.
// ordinal = the FIRST integer in the name (null when the name carries none).
function parseName(name) {
  const ordM = String(name).match(/\d+/);
  const ord = ordM ? parseInt(ordM[0], 10) : null;
  const fam = String(name).replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  return { fam: fam || '(numeric-only)', ord };
}
function quantile(sorted, q) {
  if (!sorted.length) return null;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))));
  return sorted[i];
}
// monotonic(ladder) — ladder = [{ord, z}] sorted by ord. Returns offenders (pairs going backwards).
function monotonic(ladder) {
  const bad = [];
  for (let i = 1; i < ladder.length; i++) {
    if (!(ladder[i].z > ladder[i - 1].z)) {
      bad.push(ladder[i - 1].name + '(' + ladder[i - 1].z.toFixed(2) + ') → ' +
               ladder[i].name + '(' + ladder[i].z.toFixed(2) + ')');
    }
  }
  return bad;
}
// partition disagreement, same metric as §S36 (grouping, not level values)
function partitionDisagreement(a, b) {
  const tally = {};
  for (let i = 0; i < a.length; i++) (tally[a[i]] || (tally[a[i]] = {}))[b[i]] = ((tally[a[i]] || {})[b[i]] || 0) + 1;
  const plur = {};
  Object.keys(tally).forEach(k => { plur[k] = Object.keys(tally[k]).reduce((x, y) => tally[k][x] >= tally[k][y] ? x : y); });
  let bad = 0;
  for (let i = 0; i < a.length; i++) if (String(b[i]) !== String(plur[a[i]])) bad++;
  return { disagree: bad, pct: 100 * bad / (a.length || 1), groups: Object.keys(tally).length };
}

function selftest() {
  let p = 0, n = 0;
  const t = (name, got, want, proves) => { n++; const ok = JSON.stringify(got) === JSON.stringify(want); if (ok) p++;
    console.log('§S37_SELFTEST ' + (ok ? 'PASS' : '✗ FAIL') + ' ' + name + ' want=' + JSON.stringify(want) +
      ' got=' + JSON.stringify(got) + ' | proves: ' + proves); };
  t('family_splits_van_vs_vaning', [parseName('VÅN 2').fam, parseName('VÅNING 2').fam], ['VÅN', 'VÅNING'],
    'VÅN and VÅNING are different families, not one prefix match');
  t('family_leading_digits', [parseName('02 FIRST FLOOR LEVEL').fam, parseName('02 FIRST FLOOR LEVEL').ord],
    ['FIRST FLOOR LEVEL', 2], 'a leading number is read as the ordinal, not as part of the family');
  t('family_no_ordinal', parseName('TAKPLAN').ord, null, 'a name with no number reports no ordinal (cannot be laddered)');
  t('monotonic_detects_inversion',
    monotonic([{ ord: 1, z: 0, name: 'A1' }, { ord: 2, z: 5, name: 'A2' }, { ord: 3, z: 3, name: 'A3' }]).length, 1,
    'the ladder check CAN go red — an inverted ladder is reported, not smoothed');
  t('monotonic_clean_is_empty',
    monotonic([{ ord: 1, z: 0, name: 'A1' }, { ord: 2, z: 3, name: 'A2' }]).length, 0,
    'and does not false-positive on a clean ladder');
  t('partition_identical_zero', partitionDisagreement([1, 1, 2, 2], [1, 1, 2, 2]).disagree, 0, 'metric reports 0 on identical groupings');
  t('partition_can_go_red', partitionDisagreement([1, 1, 2, 2], [1, 2, 2, 1]).disagree > 0, true, 'and non-zero when they differ');
  console.log('§S37_SELFTEST_VERDICT ' + p + '/' + n + (p === n ? ' ALL PASS — metrics falsifiable' : '  ⚠ VOID'));
  return p === n;
}

async function main() {
  const ok = selftest();
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();
  const statErr = { medBase: [], p10Base: [], medCenter: [] };   // Q4 — which statistic tracks declared?

  for (const bld of FLEET) {
    const p = path.join(BLD, bld + '.db');
    if (!fs.existsSync(p)) { console.log('§S37_SKIP ' + bld); continue; }
    const db = new SQL.Database(fs.readFileSync(p));
    const elements = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
      laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
      nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
    const L = LD.readLookups(db);   // gives rawStorey + declared storeyNameCenterZ

    // ── Q1: derive an elevation per storey NAME from its own members ─────────────────────────
    const byName = {};
    elements.forEach(el => {
      const nm = L.rawStorey[el.guid];
      if (isUnknown(nm)) return;
      (byName[nm] || (byName[nm] = [])).push(el);
    });
    const names = Object.keys(byName).filter(nm => byName[nm].length >= MIN_MEMBERS);
    const derived = {};
    names.forEach(nm => {
      const bases = byName[nm].map(e => e.base_z).filter(Number.isFinite).sort((a, b) => a - b);
      const cents = byName[nm].map(e => (e.base_z + e.top_z) / 2).filter(Number.isFinite).sort((a, b) => a - b);
      derived[nm] = { n: byName[nm].length, medBase: quantile(bases, 0.5), p10Base: quantile(bases, 0.10),
                      medCenter: quantile(cents, 0.5), declared: L.storeyNameCenterZ[nm] };
    });
    const unknownN = elements.filter(e => isUnknown(L.rawStorey[e.guid])).length;
    console.log('§S37_NAMES ' + bld + ' n=' + elements.length + ' distinctStoreyNames=' + names.length +
      ' namedElements=' + (elements.length - unknownN) + ' (' + (100 * (elements.length - unknownN) / elements.length).toFixed(2) + '%)' +
      ' unknownElements=' + unknownN + ' (' + (100 * unknownN / elements.length).toFixed(2) + '%)' +
      ' declaredCenterZAvailable=' + Object.keys(L.storeyNameCenterZ).length);

    // ── Q2: families and ladder monotonicity ─────────────────────────────────────────────────
    const fams = {};
    names.forEach(nm => {
      const { fam, ord } = parseName(nm);
      (fams[fam] || (fams[fam] = [])).push({ name: nm, ord, z: derived[nm].medBase, n: derived[nm].n });
    });
    const famKeys = Object.keys(fams).sort();
    famKeys.forEach(f => {
      const rows = fams[f].filter(r => r.ord != null).sort((a, b) => a.ord - b.ord);
      const bad = monotonic(rows);
      console.log('§S37_FAMILY ' + bld + ' family="' + f + '" k=' + fams[f].length +
        ' laddered=' + rows.length + ' elements=' + fams[f].reduce((s, r) => s + r.n, 0) +
        ' ladder=[' + rows.map(r => r.name + ':' + (r.z == null ? 'null' : r.z.toFixed(2))).join(' · ') + ']' +
        (rows.length >= 2 ? ' monotonic=' + (bad.length === 0 ? 'YES' : 'NO — ' + bad.join(' ; ')) : ' monotonic=n/a(k<2)'));
    });

    // ── Q4: derived vs declared, where both exist ────────────────────────────────────────────
    const cmp = names.filter(nm => derived[nm].declared != null);
    if (cmp.length) {
      const rows = cmp.map(nm => {
        const d = derived[nm];
        return { nm, decl: d.declared, medBase: d.medBase, p10Base: d.p10Base, medCenter: d.medCenter, n: d.n };
      }).sort((a, b) => a.decl - b.decl);
      rows.forEach(r => {
        statErr.medBase.push(Math.abs(r.medBase - r.decl));
        statErr.p10Base.push(Math.abs(r.p10Base - r.decl));
        statErr.medCenter.push(Math.abs(r.medCenter - r.decl));
        console.log('§S37_AGREE ' + bld + ' name="' + r.nm + '" nEl=' + r.n +
          ' declared=' + r.decl.toFixed(2) + ' medBase=' + r.medBase.toFixed(2) + ' (Δ' + (r.medBase - r.decl).toFixed(2) + ')' +
          ' p10Base=' + r.p10Base.toFixed(2) + ' (Δ' + (r.p10Base - r.decl).toFixed(2) + ')' +
          ' medCenter=' + r.medCenter.toFixed(2) + ' (Δ' + (r.medCenter - r.decl).toFixed(2) + ')');
      });
      const mae = k => (rows.reduce((s, r) => s + Math.abs(r[k] - r.decl), 0) / rows.length).toFixed(2);
      const ordOk = k => {   // does the derived statistic preserve the DECLARED ordering of levels?
        const byDecl = rows.slice().sort((a, b) => a.decl - b.decl).map(r => r[k]);
        for (let i = 1; i < byDecl.length; i++) if (!(byDecl[i] > byDecl[i - 1])) return false;
        return true;
      };
      console.log('§S37_AGREE_SUM ' + bld + ' names=' + rows.length +
        ' MAE medBase=' + mae('medBase') + 'm p10Base=' + mae('p10Base') + 'm medCenter=' + mae('medCenter') + 'm' +
        ' preservesDeclaredOrder: medBase=' + ordOk('medBase') + ' p10Base=' + ordOk('p10Base') + ' medCenter=' + ordOk('medCenter'));
    }

    // ── Q3: per-family grids vs the uniform fallback (only where the fallback is what ships) ──
    const G = LD.buildGrid(L, elements); G.medGap = LD.medianGap(G.grid);
    if (G.source !== 'declared') {
      // per-family grid: each family's own sorted derived elevations
      const famGrid = {};
      famKeys.forEach(f => {
        famGrid[f] = Array.from(new Set(fams[f].map(r => r.z).filter(Number.isFinite)))
          .sort((a, b) => a - b);
      });
      const named = elements.filter(e => !isUnknown(L.rawStorey[e.guid]));
      const uni = named.map(e => { let i = 0; for (let k = 0; k < G.grid.length; k++) if (e.base_z >= G.grid[k] - LD.EPS) i = k; return G.grid[i]; });
      const fam = named.map(e => { const nm = L.rawStorey[e.guid]; const f = parseName(nm).fam; return f + '@' + derived[nm].medBase.toFixed(2); });
      const d = partitionDisagreement(uni, fam), dRev = partitionDisagreement(fam, uni);
      const self = partitionDisagreement(uni, uni.slice());
      const shifted = partitionDisagreement(uni, named.map(e => { const g = G.grid.map(z => z + 1.5); let i = 0; for (let k = 0; k < g.length; k++) if (e.base_z >= g[k] - LD.EPS) i = k; return g[i]; }));
      console.log('§S37_Q3_COST ' + bld + ' namedElements=' + named.length +
        ' uniformGroups=' + d.groups + ' perFamilyGroups=' + dRev.groups +
        ' elementsInDifferentLevel=' + d.disagree + ' (' + d.pct.toFixed(2) + '%)' +
        ' reverse=' + dRev.disagree + ' (' + dRev.pct.toFixed(2) + '%)');
      console.log('§S37_Q3_CONTROL ' + bld + ' selfVsSelf=' + self.disagree + ' (must be 0)' +
        ' halfBandShift=' + shifted.disagree + ' (' + shifted.pct.toFixed(2) + '%)' +
        ' metricResponds=' + (self.disagree === 0 && shifted.pct > 5 ? 'YES' : 'NO — ⚠ void'));

      // override rate under per-family grids, using the §S34.3 rule verbatim (local gap down-tol)
      let ov = 0; const ovCls = {};
      named.forEach(e => {
        const nm = L.rawStorey[e.guid], f = parseName(nm).fam, g = famGrid[f];
        const z = derived[nm].medBase;
        const i = g.indexOf(z) >= 0 ? g.indexOf(z) : LD.nearestIdx(g, z);
        const medGapF = LD.medianGap(g);
        const down = i > 0 ? (g[i] - g[i - 1]) : medGapF;
        const lo = g[i] - down, hi = (i === g.length - 1) ? Infinity : g[i + 1];
        if (!((e.base_z - LD.EPS) < hi && (e.top_z + LD.EPS) > lo)) { ov++; ovCls[e.cls] = (ovCls[e.cls] || 0) + 1; }
      });
      console.log('§S37_Q3_OVERRIDE ' + bld + ' perFamilyOverrides=' + ov + '/' + named.length +
        ' (' + (100 * ov / Math.max(1, named.length)).toFixed(2) + '% of named elements)' +
        ' topClasses=' + JSON.stringify(Object.keys(ovCls).sort((a, b) => ovCls[b] - ovCls[a]).slice(0, 5)
          .reduce((o, k) => { o[k] = ovCls[k]; return o; }, {})) +
        ' STILL_UNCOVERED_unknownName=' + unknownN + ' (' + (100 * unknownN / elements.length).toFixed(2) + '% — these have NO family and no declared value)');
    }
    db.close();
  }
  const mae = a => a.length ? (a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : 'n/a';
  console.log('§S37_STATISTIC fleetMAE_vs_declared medBase=' + mae(statErr.medBase) + 'm' +
    ' p10Base=' + mae(statErr.p10Base) + 'm medCenter=' + mae(statErr.medCenter) + 'm n=' + statErr.medBase.length + ' names');
  console.log('§S37_VERDICT selftestOk=' + ok + ' — READ-ONLY PROBE, nothing adopted, buildings/*.db untouched');
}
main().catch(e => { console.error('§S37_ERROR ' + (e && e.stack || e)); process.exit(2); });
