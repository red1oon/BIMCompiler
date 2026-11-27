#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-TEAM-USAGE, prompts/TEAMWORK_FRAMEWORK.md §13.8 T5. READ THE LOG after every run.
// Usage report for the TRIAL pipe (red1oon/bim-teams-trial): what the repository itself shows — devices, spaces, bundles, bytes, first/last activity.
// It CANNOT show a network address: GitHub's API gives the owner counts, never client addresses, and the Apps Script post box is not given the caller's
// address either. This script says so on every run. An empty repo prints INCONCLUSIVE, never "0 users: pass".
// Run: node scripts/team_trial_usage.js [owner/repo]   (needs `gh auth login`; read-only)
'use strict';
var cp = require('child_process'), repo = process.argv[2] || 'red1oon/bim-teams-trial';
function gh(p) { return JSON.parse(cp.execFileSync('gh', ['api', '--paginate', 'repos/' + repo + p], { encoding: 'utf8', maxBuffer: 1 << 26 }).replace(/\]\s*\[/g, ',')); }
var refs = []; try { refs = gh('/git/matching-refs/heads/dev/'); } catch (e) { console.log('🔴 §USAGE cannot read ' + repo + ': ' + String(e.message).split('\n')[0]); process.exit(2); }
var spaces = {}, devices = {}, first = null, last = null;
refs.forEach(function (r) {
  var kid = r.ref.replace('refs/heads/dev/', ''), commits = gh('/commits?sha=' + encodeURIComponent('dev/' + kid) + '&per_page=100');
  var tree = gh('/git/trees/' + r.object.sha + '?recursive=1').tree || [], t0 = commits[commits.length - 1].commit.committer.date, t1 = commits[0].commit.committer.date;
  devices[kid] = { commits: commits.length, first: t0, last: t1 }; if (!first || t0 < first) first = t0; if (!last || t1 > last) last = t1;
  tree.filter(function (n) { return n.type === 'blob'; }).forEach(function (n) {
    var m = /^s\/([0-9a-f]{64})\/(o|h|r)\//.exec(n.path); if (!m) return;
    var s = spaces[m[1]] = spaces[m[1]] || { devices: {}, bundles: 0, bytes: 0, requests: 0 };
    s.devices[kid] = 1; if (m[2] === 'o') { s.bundles++; s.bytes += n.size || 0; } if (m[2] === 'r') s.requests++; }); });
console.log('═══ W-TEAM-USAGE — ' + repo + ' ═══');
console.log('§USAGE note: no network addresses are available from GitHub or the post box; this report shows only what the pipe holds.');
console.log('§USAGE devices=' + Object.keys(devices).length + ' spaces=' + Object.keys(spaces).length + ' first=' + (first || '-') + ' last=' + (last || '-'));
Object.keys(spaces).forEach(function (sp) { var s = spaces[sp]; console.log('§USAGE space=' + sp.slice(0, 12) + ' devices=' + Object.keys(s.devices).length + ' bundles=' + s.bundles + ' bytes=' + s.bytes + ' joinRequests=' + s.requests); });
if (!refs.length) { console.log('§W-TEAM-USAGE INCONCLUSIVE — no device branches in ' + repo + ' yet (nobody has used the trial, or the key is not installed)'); process.exit(3); }
console.log('§W-TEAM-USAGE OK devices=' + Object.keys(devices).length + ' spaces=' + Object.keys(spaces).length);
