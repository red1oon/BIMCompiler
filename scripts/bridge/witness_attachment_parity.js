// ⚠ DO NOT REMOVE — W-ATTACH-PARITY. Scope: bim-ootb prompts ERP_IDEMPIERE_UX_PARITY.md §ATT item 5 (bim-compiler copy): one attachment made on each side (legacy iDempiere, SQLite kernel) must
//   be the same attachment: entry NAMES, SIZES and BYTES (sha256) equal, from AD_Attachment.BinaryData (the AttachmentDBSystem zip). READ THE LOG after every run; an exit code is not evidence.
// Data comparison only: ad_attachment is rightly a RUNTIME table in the dictionary census (dict_census_stage2.js RUNTIME) and stays there; client_template.js no longer denies it.
// Modes:  (default) SELFTEST only — proves the comparator can PASS, FAIL on a changed byte, FAIL on a changed name, INCONCLUSIVE on two empty sides, using python-built zips (no pilot needed).
//         ATT_TABLE_ID=<ad_table_id> ATT_RECORD_ID=<id> ATT_KERNEL_ZIP=<file>  — LIVE: legacy side read from the pilot postgres (idempiere_pilot, docker exec psql, same lane as client_template.js);
//         kernel side = the zip file (the kernel stores base64 of the same zip in ad_attachment.binarydata; decode it to a file first).
// Verdict line: §ATTACH_PARITY_VERDICT W-ATTACH-PARITY PASS|FAIL|INCONCLUSIVE|NOT-RUN
'use strict';
const cp = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const PY = 'import zipfile,sys,json,hashlib\nz=zipfile.ZipFile(sys.argv[1])\nprint(json.dumps({"bad":z.testzip(),"entries":[[i.filename,i.file_size,hashlib.sha256(z.read(i)).hexdigest()] for i in z.infolist()]}))';
function entries(buf) {
  const f = path.join(os.tmpdir(), 'attpar_' + process.pid + '_' + crypto.randomBytes(4).toString('hex') + '.zip'); fs.writeFileSync(f, buf);
  try { const r = cp.spawnSync('python3', ['-I', '-c', PY, f], { encoding: 'utf8' }); if (r.status !== 0) return { err: (r.stderr || '').split('\n').slice(-2)[0] }; return JSON.parse(r.stdout); } finally { fs.unlinkSync(f); }
}
function compare(a, b) {   // a, b = zip Buffers or null (no attachment); -> {v, why}
  if (!a && !b) return { v: 'INCONCLUSIVE', why: 'neither side has an attachment' };
  if (!a || !b) return { v: 'FAIL', why: (a ? 'kernel' : 'legacy') + ' side has no attachment' };
  const x = entries(a), y = entries(b);
  if (x.err || y.err || x.bad !== null || y.bad !== null) return { v: 'FAIL', why: 'a side is not a clean zip: ' + (x.err || y.err || 'testzip') };
  const key = e => e.slice().sort((p, q) => p[0] < q[0] ? -1 : 1).map(r => r.join('|')).join(';');
  return key(x.entries) === key(y.entries) ? { v: 'PASS', why: x.entries.length + ' entries, names/sizes/bytes equal: ' + x.entries.map(e => e[0] + ':' + e[1]).join(',') } : { v: 'FAIL', why: 'legacy=' + key(x.entries) + ' kernel=' + key(y.entries) };
}
function pyZip(files, tag) {   // build a zip with python (a producer other than the kernel's)
  const f = path.join(os.tmpdir(), 'attmk_' + process.pid + '_' + tag + '.zip');
  cp.spawnSync('python3', ['-I', '-c', 'import zipfile,sys,json\nd=json.loads(sys.argv[2])\nz=zipfile.ZipFile(sys.argv[1],"w",zipfile.ZIP_DEFLATED)\nz.comment=b"iDempiere"\n[z.writestr(n,bytes(v)) for n,v in d]\nz.close()', f, JSON.stringify(files)]);
  const b = fs.readFileSync(f); fs.unlinkSync(f); return b;
}
let fail = 0;
const A = [['a.bin', Array.from({ length: 300 }, (_, i) => (i * 7) & 255)], ['b.txt', Array.from(Buffer.from('hello'))]];
const st = [['same entries, other zip producer', compare(pyZip(A, 'l'), pyZip(A.slice().reverse(), 'k')), 'PASS'],
  ['one byte differs (red control)', compare(pyZip(A, 'l'), pyZip([['a.bin', A[0][1].map((v, i) => i === 5 ? v ^ 1 : v)], A[1]], 'k')), 'FAIL'],
  ['one name differs (red control)', compare(pyZip(A, 'l'), pyZip([['A.bin', A[0][1]], A[1]], 'k')), 'FAIL'],
  ['both empty', compare(null, null), 'INCONCLUSIVE']];
for (const [n, r, want] of st) { const ok = r.v === want; if (!ok) fail++; console.log('§ATTACH_PARITY_SELFTEST ' + n + ' → ' + r.v + ' (want ' + want + ') ' + (ok ? 'ok' : 'WRONG') + ' — ' + r.why.slice(0, 120)); }
if (process.env.ATT_TABLE_ID && process.env.ATT_RECORD_ID && process.env.ATT_KERNEL_ZIP) {
  const q = `set search_path=adempiere;\nselect encode(binarydata,'hex') from ad_attachment where ad_table_id=${Number(process.env.ATT_TABLE_ID)} and record_id=${Number(process.env.ATT_RECORD_ID)} and title='zip' order by ad_attachment_id limit 1;`;
  const r = cp.spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', process.env.PILOT_PG_DB || 'idempiere_pilot', '-At', '-v', 'ON_ERROR_STOP=1'], { input: q, encoding: 'utf8', maxBuffer: 1 << 29 });
  if (r.status !== 0) { console.log('§ATTACH_PARITY_VERDICT W-ATTACH-PARITY NOT-RUN pilot postgres unreachable: ' + (r.stderr || '').slice(0, 100)); process.exitCode = fail ? 1 : 0; }
  else {
    const hex = r.stdout.split('\n').filter(l => l && l !== 'SET')[0] || '', legacy = hex ? Buffer.from(hex, 'hex') : null, kernel = fs.readFileSync(process.env.ATT_KERNEL_ZIP);
    const c = compare(legacy, kernel); console.log('§ATTACH_PARITY_VERDICT W-ATTACH-PARITY ' + c.v + ' table=' + process.env.ATT_TABLE_ID + ' record=' + process.env.ATT_RECORD_ID + ' — ' + c.why); process.exitCode = (fail || c.v === 'FAIL') ? 1 : 0;
  }
} else { console.log('§ATTACH_PARITY_VERDICT W-ATTACH-PARITY ' + (fail ? 'FAIL' : 'NOT-RUN') + ' live pair not given (set ATT_TABLE_ID, ATT_RECORD_ID, ATT_KERNEL_ZIP); selftest ' + (fail ? 'FAILED' : 'passed')); process.exitCode = fail ? 1 : 0; }
