// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" rc2 (prompts/FILM_LOD_UPGRADE_FIND.md §FILM rc2). READ THE LOG after every run.
// rc2 re-captures ONE beat (capture_viewer.js with BEATS=<id>) and merges it into a COPY of the rc1 capture folder: viewer.json's beat entry is replaced, and that beat's frames (v/<id>_*) are replaced by the new ones.
// Every other beat stays exactly as rc1 captured it. The base folder is never written. Usage: node merge_beat.js <base work dir (rc1)> <new capture dir> <out work dir (new)> <beat id>
'use strict';
const fs = require('fs'), path = require('path');
const [BASE, NEW, OUT, ID] = process.argv.slice(2).map((x, i) => (i < 3 ? path.resolve(x) : x));
if (!BASE || !NEW || !OUT || !ID) { console.log('§MERGE_FAIL usage'); process.exit(2); }
if (fs.existsSync(OUT)) { console.log('§MERGE_REFUSED ' + OUT + ' exists'); process.exit(5); }
fs.cpSync(BASE, OUT, { recursive: true });
const B = JSON.parse(fs.readFileSync(path.join(OUT, 'viewer.json'), 'utf8')), N = JSON.parse(fs.readFileSync(path.join(NEW, 'viewer.json'), 'utf8'));
if (!B.beats[ID] || !N.beats[ID]) { console.log('§MERGE_FAIL beat ' + ID + ' missing (base ' + !!B.beats[ID] + ', new ' + !!N.beats[ID] + ')'); process.exit(1); }
const vd = path.join(OUT, 'v'); let removed = 0, added = 0;
fs.readdirSync(vd).filter((f) => f.startsWith(ID + '_')).forEach((f) => { fs.unlinkSync(path.join(vd, f)); removed++; });
fs.readdirSync(path.join(NEW, 'v')).filter((f) => f.startsWith(ID + '_')).forEach((f) => { fs.copyFileSync(path.join(NEW, 'v', f), path.join(vd, f)); added++; });
const was = B.beats[ID].fly.miss_m; B.beats[ID] = N.beats[ID]; B.rc2_merged = { beat: ID, from: 'capture ' + N.made, replaced_miss_m: was, new_miss_m: N.beats[ID].fly.miss_m };
fs.writeFileSync(path.join(OUT, 'viewer.json'), JSON.stringify(B, null, 1));
console.log('§MERGE_BEAT beat=' + ID + ' frames removed=' + removed + ' added=' + added + ' fly miss ' + was + ' m -> ' + N.beats[ID].fly.miss_m + ' m; other beats untouched: ' + Object.keys(B.beats).filter((k) => k !== ID).join(','));
