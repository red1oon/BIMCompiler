#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-S3-SCENE-BUDGET scope (READ THE LOG after every run)
 * SCOPE: prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §STAKEHOLDER_STROLL S3 — replace the per-storey
 * room budget (`K = storeys>=4 ? 2 : storeys===3 ? 3 : 4`, plus up to 3 corridors, PER STOREY) with
 * a WHOLE-BUILDING scene checklist capped at SCENE_BUDGET. "The tour is a stroll, not a survey":
 * a 7-storey Hospital sweeping every floor into 22 stops is a survey. Storeys stop being the
 * iteration unit; scenes are.
 *
 * ISSUE IT PROVES/DISPROVES — the spec's own gate, plus the baseline it rests on:
 *   (G0) THE BASELINE IS MEASURED HERE, NOT QUOTED. The spec says "Hospital 22 stops → ≤10". A
 *        witness that only checks the ≤10 half proves nothing about the change — it would pass on a
 *        building that was already at 7. So this witness runs the SAME building twice in one go:
 *        once against the PRE-S3 tour.js (`git show HEAD~:…/tour.js`, served from a symlink farm so
 *        the repo tree is never mutated) and once against the working tree. Both numbers land in
 *        the log, from the same fixture, same run.
 *        ⚠ This gate exists because of a watchdog catch on S1: figures cited from terminal output
 *        with no §-line behind them are not evidence under this project's Log Mandate.
 *   (G1) Hospital: stop count DROPS and lands ≤10.
 *   (G2) The main hall is still FIRST — §FLY_HL_FIRST is re-asserted and its elected hall is the
 *        same measured area champion, and §HL-ORIGIN still starts the walk low. S3 was supposed to
 *        change SELECTION only, never ORDER; this is what would catch it changing order by accident.
 *   (G3) Clinic stays a coherent stroll (it was already inside budget — it must not be trimmed or
 *        inflated by the rewrite), and NO building's stop list becomes empty.
 *   (G5) THE BUDGET IS A CEILING, NOT A TARGET: post-S3 stops ≤ pre-S3 stops, on EVERY building.
 *        Added after the first run: the first cut filled every building to exactly 10, taking
 *        Clinic 7 → 10. It passed a "≤10 and non-empty" check while doing the opposite of what S3
 *        is for — trimming a survey, not padding a stroll. A one-sided cap check cannot see that.
 *   (G4) The election is auditable from the log, not asserted: §FLY_SCENE_BUDGET reports the
 *        budget, the pool size, the elected roles and how many storeys the stops actually span —
 *        so "it still climbs" is readable rather than assumed.
 *
 * ⚠ FIXTURE RULE (unchanged, measured 2026-07-26): room-bearing DBs are LOCAL, `~/bim-ootb/buildings/`
 * — never fetched from OCI. Symlinked in per run, removed after.
 *
 * RUN: node deploy/dev/tests/witness_s3_scene_budget.js   (serves deploy/dev itself on PORT)
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');

const REPO = '/home/red1/bim-compiler';
const DEV = path.resolve(__dirname, '..');
const PORT = +(process.env.PORT || 8435);
const LOCAL_SRC = process.env.LOCAL_DB_SRC || '/home/red1/bim-ootb/buildings';
let pass = 0, fail = 0;
const chk = (n, c, x) => { if (c) { pass++; console.log('  ✅ ' + n + (x ? '  ' + x : '')); } else { fail++; console.log('  ❌ ' + n + (x ? '  ' + x : '')); } };
const has = (logs, re) => logs.some(l => re.test(l));
const line = (logs, re) => logs.find(l => re.test(l)) || '';

// EVERY case measures its own pre-S3 baseline. The first cut of this witness only baselined
// Hospital and gated the others on "≤10 and non-empty" — which PASSED while the rewrite silently
// took Clinic 7 → 10, inflating a building that was already a stroll. A one-sided cap check cannot
// see that; a measured before/after on each building can. See G5.
// LTU_AHouse + JKR added 2026-07-26 (watchdog: S2 covered LTU but S3 never did, and JKR was in
// NEITHER witness despite being a real local fixture). Both matter here specifically because S3 is
// the storey-count gate: LTU_AHouse has 19 storeys and JKR has 21 — far past Hospital's 7, which was
// the tallest thing the cap had ever been tested against. JKR is also the fleet's unseen-convention
// case (different authoring firm, own naming prefix, 7 disciplines), so it tests whether the scene
// checklist generalises past our own modelling habits rather than just past our own buildings.
const CASES = [
  { key: 'Hospital', src: path.join(LOCAL_SRC, 'Hospital_extracted.db') },
  { key: 'Clinic', src: path.join(LOCAL_SRC, 'Clinic_extracted.db') },
  { key: 'Terminal', src: path.join(LOCAL_SRC, 'Terminal_extracted.db') },
  { key: 'LTU_AHouse', src: path.join(LOCAL_SRC, 'LTU_AHouse_extracted.db') },
  { key: 'JKR', src: path.join(LOCAL_SRC, 'JKR_extracted.db') },
];
// ⚠ SERVE UNDER THE REAL FILENAME — user directive 2026-07-26: "if it is the injection then we need
// not apply but simply pick up the raw DB and let the browser script handles that - this is the
// preferred path for newbies." The viewer's self-heal fetches `patches/<dbFileName>.sql` BY NAME, so
// an earlier `_ws3_`-prefixed symlink silently resolved to a 404 and the building loaded with NO
// patch — measured: JKR, Hospital and Terminal all ran without theirs. There is no error, just a
// quieter, worse graph (JKR: 75 components, §FLY_ROUTE_REJECT thin-path). Keeping the real name
// means the harness exercises the SAME path a new user gets, which is the whole point of the gate.
// See `/home/red1/Downloads/OPEN SOURCE BIM/JKR_README.md` §5.
const linkName = c => path.basename(c.src);

// ── The BASELINE tree: a directory of symlinks to every deploy/dev entry, with ONE real file —
// the pre-S3 tour.js extracted from git. Serving that gives the old selection code against the
// identical fixtures and identical everything-else, which is what makes the before/after honest.
// Nothing in the repo working tree is written to at any point.
// ⚠ The baseline blob is found by CONTENT, never `HEAD:` — this witness outlives the commit that
// adds S3, and once S3 is committed `HEAD:deploy/dev/tour.js` IS the post-S3 file. The witness would
// then compare S3 against itself: before == after, G5 passes trivially, G1's trim check never fires,
// and the whole before/after would silently stop testing anything while still printing green.
// So: walk tour.js's own history and take the newest revision that does NOT carry the §R6-SCENE-BUDGET
// marker. That is the last pre-S3 tour.js by definition, at any point in the future.
const S3_MARKER = '\u00a7R6-SCENE-BUDGET';
function baselineBlob() {
  const shas = execFileSync('git', ['-C', REPO, 'log', '--format=%H', '--', 'deploy/dev/tour.js'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n').filter(Boolean);
  for (const sha of shas) {
    let blob;
    try { blob = execFileSync('git', ['-C', REPO, 'show', sha + ':deploy/dev/tour.js'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }); }
    catch (e) { continue; }
    if (blob.indexOf(S3_MARKER) < 0) return { sha: sha, blob: blob };
  }
  throw new Error('no pre-S3 tour.js revision found in history (every revision carries ' + S3_MARKER + ')');
}
function baselineTree(blob) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws3-baseline-'));
  for (const e of fs.readdirSync(DEV)) {
    if (e === 'tour.js') continue;
    fs.symlinkSync(path.join(DEV, e), path.join(dir, e));
  }
  fs.writeFileSync(path.join(dir, 'tour.js'), blob);
  return dir;
}

function serve(cwd, port) {
  return new Promise(resolve => {
    const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd, stdio: 'ignore' });
    setTimeout(() => resolve(srv), 1200);
  });
}

async function flyAndRead(browser, port, dbRel) {
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.text()));
  page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
  await page.goto(`http://localhost:${port}/index.html?db=${dbRel}`, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForFunction(() => window.APP && window.APP.camera, { timeout: 180000 });
  await page.waitForFunction(() => { try { const r = window.APP.dbQuery('SELECT COUNT(*) FROM element_transforms'); return r && r.length && r[0][0] > 0; } catch (e) { return false; } },
    { timeout: 300000, polling: 2000 }).catch(() => {});
  for (let i = 0; i < 120; i++) { if (!(await page.evaluate(() => !!window.APP.streaming))) break; await new Promise(r => setTimeout(r, 1000)); }
  // §TOUR_CACHE: a cached route from an earlier run would replay the OLD stop set and make this
  // witness measure nothing at all. Bust it before pressing ✈.
  await page.evaluate(() => { try { if (window.APP._tourCacheBust) window.APP._tourCacheBust(); } catch (e) {} });
  await page.evaluate(() => window.APP.toggleFlyAround());
  for (let i = 0; i < 420; i++) { if (has(logs, /§FLY_ROUTE |§FLY_ROUTE_REJECT/)) break; await new Promise(r => setTimeout(r, 1000)); }
  await new Promise(r => setTimeout(r, 3000));
  const fly = line(logs, /§FLY_ROUTE /), hl = line(logs, /§FLY_HL_FIRST/), sb = line(logs, /§FLY_SCENE_BUDGET/);
  const m = fly.match(/stops=(\d+)\/(\d+)/);
  const out = {
    stops: m ? +m[2] : -1, visited: m ? +m[1] : -1,
    hallName: (hl.match(/mainHall="([^"]*)"/) || [])[1],
    hallArea: (hl.match(/area=([\d.]+)/) || [])[1],
    ascent: (hl.match(/ascent=("[^"]*"\/\S+|-)/) || [])[1],
    roles: (sb.match(/roles=(\S+)/) || [])[1],
    storeysVisited: (sb.match(/storeysVisited=(\d+)/) || [])[1],
    pool: (sb.match(/pool=(\d+)/) || [])[1],
    comps: (line(logs, /§FLY_SCENE_COMPONENT/).match(/§FLY_SCENE_COMPONENT (.*)$/) || [])[1],
    reject: line(logs, /§FLY_ROUTE_REJECT/),
    patch: (line(logs, /§S1_PATCH_APPLY|§S1_PATCH_NONE/).match(/§S1_PATCH_(APPLY|NONE)[^\n]*/) || ['none'])[0].slice(0, 90),
    raster: (line(logs, /§PATH_LEGAL_RASTER/).match(/§PATH_LEGAL_RASTER (.*)$/) || [])[1],
    actions: await page.evaluate(() => (window.APP.walkActions || []).length),
    err: line(logs, /PAGEERROR|§LOAD_FAIL/),
    fly, hl, sb,
  };
  await page.close();
  return out;
}

(async () => {
  console.log('══ W-S3-SCENE-BUDGET — a stroll, not a survey: whole-building scene checklist replaces the per-storey budget ══\n');

  for (const c of CASES) { if (!fs.existsSync(c.src)) { console.log('⚠ fixture absent: ' + c.src); } }
  // Link the DB under its real name, AND link the patches/ directory beside it so the loader's
  // `patches/<dbFileName>.sql` fetch resolves exactly as it does for a real user.
  const PATCH_SRC = path.join(LOCAL_SRC, 'patches');
  const patchDest = path.join(DEV, 'buildings', 'patches');
  let patchLinked = false;
  const preExisting = new Set();
  for (const c of CASES) {
    const dest = path.join(DEV, 'buildings', linkName(c));
    // Never clobber a REAL file that lives in the repo tree under the same name (deploy/dev/buildings
    // holds its own stale mirrors) — record it, move it aside, restore it after.
    if (fs.existsSync(dest) && !fs.lstatSync(dest).isSymbolicLink()) { fs.renameSync(dest, dest + '.ws3bak'); preExisting.add(dest); }
    try { fs.unlinkSync(dest); } catch (e) {}
    if (fs.existsSync(c.src)) { fs.symlinkSync(c.src, dest); c.db = 'buildings/' + linkName(c); }
  }
  if (!fs.existsSync(patchDest) && fs.existsSync(PATCH_SRC)) { fs.symlinkSync(PATCH_SRC, patchDest); patchLinked = true; }
  console.log('   patches/ ' + (patchLinked ? 'symlinked from ' + PATCH_SRC : (fs.existsSync(patchDest) ? 'already present' : 'ABSENT — patches will 404')));
  const cleanup = () => {
    for (const c of CASES) {
      const dest = path.join(DEV, 'buildings', linkName(c));
      try { if (fs.lstatSync(dest).isSymbolicLink()) fs.unlinkSync(dest); } catch (e) {}
      if (preExisting.has(dest)) { try { fs.renameSync(dest + '.ws3bak', dest); } catch (e) {} }
    }
    if (patchLinked) { try { fs.unlinkSync(patchDest); } catch (e) {} }
  };
  process.on('exit', cleanup);

  const base = baselineBlob();
  console.log('   baseline tour.js = newest revision without ' + S3_MARKER + ': ' + base.sha.slice(0, 9) + '\n');
  const baseDir = baselineTree(base.blob);
  const srvNew = await serve(DEV, PORT);
  const srvOld = await serve(baseDir, PORT + 1);
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox', '--enable-unsafe-swiftshader'] });

  const results = {};
  for (const c of CASES) {
    if (!c.db) { chk(c.key + ': fixture present', false, 'ABSENT ' + c.src); continue; }
    console.log('── ' + c.key);
    const before = await flyAndRead(browser, PORT + 1, c.db);
    const after = await flyAndRead(browser, PORT, c.db);
    results[c.key] = { before, after };
    if (before) {
      console.log('   PRE-S3  (HEAD tour.js) ' + before.fly.slice(0, 160));
      console.log('   PRE-S3  ' + before.hl.slice(0, 160));
    }
    if (after.sb) console.log('   POST-S3 ' + after.sb.slice(0, 220));
    console.log('   POST-S3 ' + after.fly.slice(0, 160));
    console.log('   POST-S3 ' + after.hl.slice(0, 160));
    console.log('   MEASURED: stops ' + (before ? before.stops + ' → ' : '') + after.stops +
      '   mainHall=' + (after.hallName || '?') + ' area=' + (after.hallArea || '?') +
      '   ascent=' + (after.ascent || '?') + '   storeysVisited=' + (after.storeysVisited || '?'));

    chk('G0 ' + c.key + ': baseline measured from the PRE-S3 tour.js, same fixture, same run', before.stops > 0, 'pre-S3 stops=' + before.stops);
    chk('G1 ' + c.key + ': stop count ≤10 (the spec\'s ceiling)', after.stops <= 10 && after.stops > 0, 'stops=' + after.stops);
    // G5 — the budget is a CEILING, not a target. A building already inside budget must not be
    // INFLATED toward 10 by the rewrite: S3 exists to trim a survey, and padding a stroll is the
    // same error mirrored. This is the gate the first cut lacked (Clinic 7 → 10 passed silently).
    chk('G5 ' + c.key + ': not inflated — post-S3 stops ≤ pre-S3 stops', after.stops <= before.stops,
      before.stops + ' → ' + after.stops + (after.stops > before.stops ? '  INFLATED by ' + (after.stops - before.stops) : ''));
    if (before.stops > 10) {
      chk('G1 ' + c.key + ': an over-budget survey was actually TRIMMED', after.stops < before.stops, before.stops + ' → ' + after.stops);
    }
    chk('G2 ' + c.key + ': §FLY_HL_FIRST re-asserted (main hall still elected first)', !!after.hallArea,
      after.hallName ? after.hallName + ' area=' + after.hallArea : 'MISSING');
    chk('G3 ' + c.key + ': stop list not empty, tour produced actions', after.stops > 0 && after.actions > 0,
      'stops=' + after.stops + ' actions=' + after.actions + (after.reject ? ' REJECT:' + after.reject.slice(0, 60) : ''));
    // G6 — A GRAPH ROUTE THAT EXISTED BEFORE MUST NOT BE LOST. Added 2026-07-26 after JKR: S3's
    // whole-building area ranking elected 4 mutually-unreachable scenes on a 75-component graph, so
    // §FLY_ROUTE became §FLY_ROUTE_REJECT reason=thin-path and the building silently dropped to the
    // LEGACY tour — strictly worse than before S3, on the one fixture nobody had gated. Stop COUNT
    // gates cannot see this: the count just goes to -1/absent and every "≤10" style check passes.
    // The thing to assert is the ROUTE's continued existence, per building.
    chk('G6 ' + c.key + ': graph route not lost (had one pre-S3 ⇒ still has one)',
      !(before.stops > 0 && after.stops <= 0),
      'pre-S3 ' + (before.stops > 0 ? 'ROUTED' : 'no-route') + ' → post-S3 ' +
      (after.stops > 0 ? 'ROUTED' : 'REJECTED (' + (after.reject.replace(/^.*§FLY_ROUTE_REJECT /, '').slice(0, 50) || 'no §FLY_ROUTE') + ')'));
    chk('G6 ' + c.key + ': scene election reported its component choice (§FLY_SCENE_COMPONENT)',
      !!after.comps, after.comps || 'MISSING');
    chk('G4 ' + c.key + ': election auditable (§FLY_SCENE_BUDGET roles + storeysVisited)',
      !!after.roles && !!after.storeysVisited, after.roles ? 'roles=' + after.roles + ' storeysVisited=' + after.storeysVisited : 'MISSING');
    chk('G4 ' + c.key + ': a main hall scene was elected by the checklist', /(^|,)hall(,|$)/.test(after.roles || ''), 'roles=' + (after.roles || '-'));
    chk(c.key + ': no page error', !after.err, after.err ? after.err.slice(0, 120) : 'clean');
  }

  // The vertical-move claim, checked where it is actually testable: a multi-storey building must
  // still reach more than one storey under the cap. This is the failure mode a naive area-sorted
  // cap introduces (all 10 scenes off the ground floor), so it gets its own gate rather than a
  // comment saying it was considered.
  const H = results.Hospital && results.Hospital.after;
  if (H) {
    chk('G2 Hospital: the capped tour still spans multiple storeys (the vertical move survives)',
      +H.storeysVisited > 1, 'storeysVisited=' + H.storeysVisited);
    chk('G2 Hospital: an ascent highlight was still elected', !!H.ascent && H.ascent !== '-', 'ascent=' + H.ascent);
  }

  await browser.close();
  try { srvNew.kill(); } catch (e) {}
  try { srvOld.kill(); } catch (e) {}
  cleanup();
  try { fs.rmSync(baseDir, { recursive: true, force: true }); } catch (e) {}
  console.log('\n' + (fail ? '❌ FAIL ' : '✅ PASS ') + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR ' + (e && e.stack || e)); process.exit(1); });
