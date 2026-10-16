// multihost_core.js — the ONE hashing of the network core shared by the witness (records it) and the gate
// (compares it). BACKEND_SUBSTRATE_LANE.md §MH.3 / §MH.5. Duplicating this in both files is how they would drift
// into a false FAIL (or a false PASS); keep it here.
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
var HERE = path.join(__dirname, '..');
var OOTB = process.env.OOTB || path.join(process.env.HOME || '/home/red1', 'bim-ootb');
var CORE = JSON.parse(fs.readFileSync(path.join(__dirname, 'multihost_core.json'), 'utf8'));
function sha256(b) { return crypto.createHash('sha256').update(b).digest('hex'); }

// Staleness guard for the bim-ootb side (same lesson as check_erp_twins.js): fetch, report behind-count, hash the
// origin/main BLOB — never the working tree of a checkout that may be 28 commits behind (it was, 2026-09-03).
function ootbBase() {
  var behind = 'unknown';
  try {
    cp.execSync('git -C ' + OOTB + ' fetch -q origin', { timeout: 120000, stdio: 'ignore' });
    behind = cp.execSync('git -C ' + OOTB + ' rev-list --count HEAD..origin/main', { encoding: 'utf8' }).trim();
  } catch (e) { behind = 'fetch-failed(' + (e && e.message ? e.message.slice(0, 40) : '?') + ')'; }
  return { ootb: OOTB, behind: behind };
}

// hashCore() → { '<label>:<path>': sha256 | null }  (null = missing: a declared core file that is not there is a
// scope decay the gate must fail on, never silently skip)
function hashCore() {
  var out = {};
  (CORE.bim_compiler || []).concat(CORE.instrument || []).forEach(function (p) {
    var f = path.join(HERE, p);
    out['bim-compiler:' + p] = fs.existsSync(f) ? sha256(fs.readFileSync(f)) : null;
  });
  (CORE.bim_ootb_origin_main || []).forEach(function (p) {
    var h = null;
    try { h = sha256(cp.execSync('git -C ' + OOTB + ' show origin/main:' + p, { maxBuffer: 64 * 1024 * 1024 })); } catch (e) { h = null; }
    out['bim-ootb@origin/main:' + p] = h;
  });
  return out;
}

module.exports = { CORE: CORE, HERE: HERE, OOTB: OOTB, sha256: sha256, ootbBase: ootbBase, hashCore: hashCore };
