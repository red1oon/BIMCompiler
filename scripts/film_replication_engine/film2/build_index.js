// ⚠ DO NOT REMOVE — Scope: build the two DERIVED indexes for Film 2 (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24):
//   film2_claims.json       = the verified claim cards (text, URLs, dates, status) + sha256 of the two source JSON files
//   film2_logos_index.json  = per project: official-file URL, sha256, terms line, local path (UNTRUSTED download, never copied into the repo, never opened) or PLAIN TEXT
// Downloaded files are read ONLY as bytes to hash. They are shown by the stage page through <img src> only. Read the log after every run.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const SCR = '/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad';
const CL = path.join(SCR, 'film2_claims'), LG = path.join(SCR, 'film2_logos');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const claims = [];
const srcHash = {};
['cards_1_6.json', 'cards_2_5.json'].forEach(f => { const p = path.join(CL, f); srcHash[f] = sha(p); JSON.parse(fs.readFileSync(p, 'utf8')).forEach(c => claims.push(c)); });
const ids = new Set(); claims.forEach(c => { if (ids.has(c.id)) throw new Error('duplicate claim id ' + c.id); ids.add(c.id); if (c.quote.split(/\s+/).length > 25) throw new Error('quote > 25 words: ' + c.id); });
fs.writeFileSync(path.join(__dirname, 'film2_claims.json'), JSON.stringify({ built: 'film2/build_index.js', accessed: '2026-10-25', source_files_sha256: srcHash, n: claims.length, claims }, null, 1));
console.log('§IDX_CLAIMS n=' + claims.length + ' all quotes <= 25 words; source sha256 ' + JSON.stringify(srcHash));
const idx = JSON.parse(fs.readFileSync(path.join(LG, 'index.json'), 'utf8')); let bad = 0;
const out = idx.map(e => { const r = { project: e.project, slug: e.slug, status: e.status, file_url: e.file_url || null, source_page: e.source_page, terms: e.licence_or_brand_terms, sha256: e.sha256 || null, local_path: e.file ? path.join(LG, e.file) : null, media_type: e.media_type || null, svg_flags: e.svg_flags || [], accessed: e.accessed };
  if (e.file) { const h = sha(r.local_path); r.sha256_on_disk = h; if (h !== e.sha256) { bad++; console.log('§IDX_LOGO_HASH_MISMATCH ' + e.project); } } return r; });
const ps = out.find(x => x.slug === 'powersync');                       // flagged file (empty <script>): use the clean alternate named in the index notes
const alt = path.join(LG, 'powersync', 'site-powersync-logo-dark.svg');
ps.use_instead = { local_path: alt, file_url: 'https://www.powersync.com/images/brand/powersync-logo-dark.svg', sha256: sha(alt), note: 'clean alternate named in index.md (white text, no script); sha256 computed here from the downloaded bytes, not listed in the original index' };
fs.writeFileSync(path.join(__dirname, 'film2_logos_index.json'), JSON.stringify({ built: 'film2/build_index.js', accessed: '2026-10-25', source_index_sha256: sha(path.join(LG, 'index.json')), entries: out }, null, 1));
console.log('§IDX_LOGOS n=' + out.length + ' files=' + out.filter(x => x.local_path).length + ' plain_text=' + out.filter(x => !x.local_path).map(x => x.project).join(',') + ' hash_mismatch=' + bad + ' ' + (bad ? 'FAIL' : 'PASS'));
