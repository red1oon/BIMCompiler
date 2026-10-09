// Parallel-run reconcile (M3). App-agnostic. Compares two NORMALISED result objects (legacy vs SQLite) for the same facts, key by key,
// under a spec of "same result" keys (§21), and classifies every difference (§23): MATCH | SQLITE-GAP | LEGACY-QUIRK.
//   scenario  = { id, facts, legacy: async facts → result, local: async facts → result }
//   result    = flat { key: scalar|string } (the adapters decide what is comparable; the layer never interprets a key)
//   spec      = { keys:[…], notCompared:{ key: 'reason' } }   // keys we cannot compare yet are LISTED, never silently skipped
//   quirks    = [{ scenario, key, evidence }]                 // accepted LEGACY-QUIRK exclusions, evidence mandatory
'use strict';

// A side may report a key as 'INCONCLUSIVE:<reason>' when its own reference result cannot be obtained (e.g. legacy posting errored).
// That is neither MATCH nor a gap — it is listed, never silently passed (witness law: INCONCLUSIVE, not PASS).
const isInc = v => typeof v === 'string' && v.startsWith('INCONCLUSIVE:');
function diff(a, b, spec) {
  const out = [];
  for (const k of spec.keys) {
    const x = a == null ? undefined : a[k], y = b == null ? undefined : b[k];
    if (isInc(x) || isInc(y)) { out.push({ key: k, legacy: x, sqlite: y, inconclusive: true }); continue; }
    if (String(x) !== String(y)) out.push({ key: k, legacy: x, sqlite: y });
  }
  return out;
}

function classify(scenarioId, diffs, quirks) {
  return diffs.map(d => {
    if (d.inconclusive) return { ...d, verdict: 'INCONCLUSIVE' };
    const q = (quirks || []).find(q => q.scenario === scenarioId && q.key === d.key);
    if (q && !q.evidence) throw new Error(`§RECON quirk ${scenarioId}/${d.key} has no evidence — refused`);
    return { ...d, verdict: q ? 'LEGACY-QUIRK' : 'SQLITE-GAP', evidence: q && q.evidence };
  });
}

async function run(scenarios, spec, quirks, opts = {}) {
  const log = opts.log || (() => {});
  const rows = [];
  for (const sc of scenarios) {
    let L, S;
    try { L = await sc.legacy(sc.facts); } catch (e) { L = { outcome: 'ERROR', error: e.message }; }
    try { S = await sc.local(sc.facts); } catch (e) { S = { outcome: 'ERROR', error: e.message }; }
    if (L.outcome === 'ERROR' || S.outcome === 'ERROR') {          // a side crashed: that is a HARNESS fault, never a verdict about SQLite
      log(`§SCN_ERROR ${sc.id} legacy=${JSON.stringify(L.error || null)} sqlite=${JSON.stringify(S.error || null)}`);
      rows.push({ id: sc.id, verdict: 'ERROR', gaps: [], inconclusive: [], legacy: L, sqlite: S }); continue;
    }
    const gaps = classify(sc.id, diff(L, S, spec), quirks);
    const real = gaps.filter(g => g.verdict !== 'INCONCLUSIVE'), inc = gaps.filter(g => g.verdict === 'INCONCLUSIVE');
    const verdict = real.length === 0 ? 'MATCH' : real.every(g => g.verdict === 'LEGACY-QUIRK') ? 'LEGACY-QUIRK' : 'SQLITE-GAP';
    for (const g of gaps.filter(g => g.verdict !== 'INCONCLUSIVE')) log(`§GAP scenario=${sc.id} key=${g.key} legacy=${JSON.stringify(g.legacy)} sqlite=${JSON.stringify(g.sqlite)} verdict=${g.verdict}${g.evidence ? ' evidence="' + g.evidence + '"' : ''}`);
    for (const g of inc) log(`§SCN_INCONCLUSIVE scenario=${sc.id} key=${g.key} legacy=${JSON.stringify(g.legacy)} sqlite=${JSON.stringify(g.sqlite)}`);
    log(`§SCN ${sc.id} ${verdict}${inc.length ? " PARTIAL" : ""} compared=${spec.keys.length - inc.length} inconclusive=${inc.length}`);
    rows.push({ id: sc.id, verdict, gaps: real, inconclusive: inc, legacy: L, sqlite: S });
  }
  for (const [k, why] of Object.entries(spec.notCompared || {})) log(`§SCN_NOT_COMPARED key=${k} reason="${why}"`);
  const n = v => rows.filter(r => r.verdict === v).length;
  log(`§RECON_SUMMARY scenarios=${rows.length} MATCH=${n('MATCH')} LEGACY-QUIRK=${n('LEGACY-QUIRK')} SQLITE-GAP=${n('SQLITE-GAP')} errors=${n('ERROR')} inconclusive_keys=${rows.reduce((a, r) => a + r.inconclusive.length, 0)} notCompared=${Object.keys(spec.notCompared || {}).length}`);
  return rows;
}
module.exports = { diff, classify, run };
