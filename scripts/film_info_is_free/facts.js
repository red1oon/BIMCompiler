#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "Information is Free" (prompts/FILM_INFORMATION_IS_FREE.md §2, CH 0): re-measures at build time EVERY number the voice or the terminal strip shows, and merges the real page captures (capture.js -> out/shots/shots.json).
// Measured on the two repositories' remote heads (git ls-tree / git show, nothing checked out) and by `gh repo view`; the first line of a real `git clone` is kept as its answer. Nothing is typed by hand.
// Usage: BC=/home/red1/bim-compiler OOTB=/home/red1/bim-ootb node facts.js      READ out/facts.log; writes out/facts.json
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const BC = process.env.BC || path.join(os.homedir(), 'bim-compiler'), OOTB = process.env.OOTB || path.join(os.homedir(), 'bim-ootb'), OUT = path.join(__dirname, process.env.OUTD || 'out');
const run = (cmd, args, opt) => { const r = spawnSync(cmd, args, Object.assign({ encoding: 'utf8', maxBuffer: 1 << 28 }, opt || {})); if (r.status !== 0) throw new Error(cmd + ' ' + args.join(' ') + ' failed: ' + (r.stderr || '').slice(0, 200)); return r.stdout; };
const L = (m) => console.log('§FACTS ' + m);
run('git', ['-C', BC, 'fetch', 'origin', '-q']); run('git', ['-C', OOTB, 'fetch', 'origin', '-q']);   // refs only: neither shared tree is edited or checked out
const repo = (dir, ref, slug) => {
  const sha = run('git', ['-C', dir, 'rev-parse', '--short', ref]).trim(), all = run('git', ['-C', dir, 'ls-tree', '-r', '--name-only', ref]).split('\n').filter(Boolean), top = (d) => run('git', ['-C', dir, 'ls-tree', '--name-only', ref, d + '/']).split('\n').filter(Boolean);
  const gh = JSON.parse(run('gh', ['repo', 'view', slug, '--json', 'visibility,licenseInfo,url'])), lic = run('git', ['-C', dir, 'show', ref + ':LICENSE']).split('\n');
  return { slug, ref, sha, visibility: gh.visibility, license: gh.licenseInfo.name, licenseFirstLine: lic[0], copyright: lic.filter(l => /^Copyright/.test(l))[0], url: gh.url,
    prompts: top('prompts').filter(f => /\.md$/.test(f)).length, witnessFiles: all.filter(f => /(^|\/)witness_[^/]*$/.test(f)).length, docsMd: all.filter(f => /^docs\/.*\.md$/.test(f)).length,   // = find docs -name '*.md' | wc -l (the whole docs tree, translations included)
   
    fsgFiles: top('docs').filter(f => /FastScriptGuide\.[a-z]{2}\.md$/.test(f)).map(f => path.basename(f)) };
};
const bc = repo(BC, 'origin/master', 'red1oon/BIMCompiler'), oo = repo(OOTB, 'origin/main', 'red1oon/bim-ootb');
const yml = run('git', ['-C', BC, 'show', 'origin/master:mkdocs.yml']), i18n = yml.slice(yml.indexOf('- i18n:')), langs = Array.from(i18n.matchAll(/- locale: (\w+)\n(?:\s+default: true\n)?\s+name: ([^\n]+)\n\s+build: true/g)).map(m => ({ locale: m[1], name: m[2].trim() }));
const nonDefault = langs.filter(x => x.locale !== 'en'); bc.i18nLocales = langs; bc.guideLanguagesBesidesEnglish = nonDefault.length;
const fsgLoc = bc.fsgFiles.map(f => f.split('.')[1]).sort(), same = JSON.stringify(fsgLoc) === JSON.stringify(nonDefault.map(x => x.locale).sort());
// the first line of a REAL clone of the project (a shallow, blob-less, no-checkout clone into a temp folder: the same first line as the full command)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'iif_')), cl = spawnSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout', 'https://github.com/red1oon/BIMCompiler'], { cwd: tmp, encoding: 'utf8', env: Object.assign({}, process.env, { GIT_LFS_SKIP_SMUDGE: '1' }), timeout: 120000 });
const cloneFirst = ((cl.stderr || '') + (cl.stdout || '')).split('\n')[0]; fs.rmSync(tmp, { recursive: true, force: true });
const shots = JSON.parse(fs.readFileSync(path.join(OUT, 'shots', 'shots.json'), 'utf8'));
const out = { made: new Date().toISOString(), bc, oo, cloneExit: cl.status, cloneFirstLine: cloneFirst, shotsMade: shots.made, shots: shots.shots, shotsPageErrors: shots.pageErrors.length,
  // the terminal strip: each typed line and the answer it shows (every answer is one of the measured values above)
  lines: {
    clone: { cmd: 'git clone https://github.com/red1oon/BIMCompiler', answer: [cloneFirst] },
    prompts: { cmd: 'ls prompts/*.md | wc -l', answer: [String(bc.prompts)] },
    docs: { cmd: "find docs -name '*.md' | wc -l", answer: [String(bc.docsMd)] },
    fsg: { cmd: 'ls docs/FastScriptGuide.*.md', answer: bc.fsgFiles.slice() },
    license: { cmd: 'head -1 LICENSE', answer: [bc.licenseFirstLine] } },
  sum: { promptsBoth: bc.prompts + oo.prompts, witnessBoth: bc.witnessFiles + oo.witnessFiles } };
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
L('bc ' + bc.slug + ' ' + bc.ref + '@' + bc.sha + ' ' + bc.visibility + ' ' + bc.license + ' first_line="' + bc.licenseFirstLine + '" "' + bc.copyright + '" prompts=' + bc.prompts + ' witness_files=' + bc.witnessFiles + ' docs_md=' + bc.docsMd);
L('oo ' + oo.slug + ' ' + oo.ref + '@' + oo.sha + ' ' + oo.visibility + ' ' + oo.license + ' first_line="' + oo.licenseFirstLine + '" "' + oo.copyright + '" prompts=' + oo.prompts + ' witness_files=' + oo.witnessFiles);
L('guide languages (mkdocs.yml i18n, build:true) ' + langs.map(x => x.locale + '=' + x.name).join(' | ') + ' -> besides English: ' + nonDefault.length + '; docs/FastScriptGuide.<lang>.md: ' + fsgLoc.join(',') + ' same_as_mkdocs=' + same);
L('clone exit=' + cl.status + ' first line="' + cloneFirst + '"'); L('totals prompts_both=' + out.sum.promptsBoth + ' witness_files_both=' + out.sum.witnessBoth);
const bad = [bc.visibility !== 'PUBLIC', oo.visibility !== 'PUBLIC', bc.license !== 'MIT License', oo.license !== 'MIT License', !/^MIT License$/.test(bc.licenseFirstLine), !same, !nonDefault.length, cl.status !== 0, !/^Cloning into 'BIMCompiler'/.test(cloneFirst), shots.fails.length > 0, !bc.prompts, !oo.prompts, !bc.docsMd].filter(Boolean).length;
L('VERDICT ' + (bad ? 'FAIL' : 'PASS') + ' bad=' + bad); process.exit(bad ? 1 : 0);
