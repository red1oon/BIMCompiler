#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-DOCS-I18N: the translated guides and the language chooser (prompts/DOCS_I18N.md §5, §6b-§6d). READ THE LOG; an exit code is not evidence.
// Reads the SOURCES (docs/<Page>.md beside docs/<Page>.<lang>.md) and the BUILT site (mkdocs build -d DIR). No person looks at a page.
//   I1 ISSUE (English URLs move or shrink): the REAL deploy guard (scripts/safe_gh_deploy.sh GUARD_ONLY=1) on live gh-pages -> this build; the only offenders allowed
//      are the three files the deploy script itself adds after the build (.nojekyll, the printed <Name>.pdf, glassbowl_data.db, DOCS_DEPLOY_POLICY.md), named.
//   I2 ISSUE (a translator edits a command or a pasted result): the ordered fenced blocks and <!-- --> comments of each translated page equal English's, byte for byte.
//   I3 ISSUE (a verb name translated): the multiset of inline code spans and of § tags equals English's.
//   I4 ISSUE (a figure changes): the multiset of digit runs in the prose (code, link targets, anchors and comments removed; 1,000 = 1000) equals English's.
//   I5 ISSUE (a heading dropped, a link broken): same heading count per level; every link and #anchor of the BUILT translated page resolves in the built site.
//   I6 ISSUE (a translation passed off as the original, or silently out of date): front matter has review + source_sha; the built page shows the "translated" line,
//      or "out of date" when source_sha is not the English file's hash; every fallback copy shows "not translated yet", noindex and a canonical link to English.
//   I7 ISSUE (the chooser links to a page that is not there): each built page lists, as hreflang alternates, exactly the languages its source exists in (none when
//      only English), and every alternate href resolves to a built file.
//   I11 ISSUE (an English edit can no longer be carried into the translation line by line, §6f): the translated body has as many lines as the English, with
//      every fence, comment and blank line at the same position (scripts/guide/i18n_lines.js, the reader i18n_sync.js uses).
//   Falsifiers (DOCS_BREAK=): joinlines (I11) · blockdigit (I2) · codespan (I3) · swapdigits (I4) · dropheading (I5) · noreview (I6) · addalt (I7).
//   Run: node scripts/guide/witness_docs_i18n.js <built_site_dir> > build/witness_docs_i18n.log 2>&1
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const REPO = path.join(__dirname, '..', '..'), DOCS = path.join(REPO, 'docs'), SITE = path.resolve(process.argv[2] || ''), BRK = process.env.DOCS_BREAK || '';
let pass = 0, fail = 0, inc = 0;
const L = (m) => console.log('§W-DOCS-I18N ' + m);
const chk = (name, ok, info) => { ok ? pass++ : fail++; console.log('  ' + (ok ? '✅' : '❌') + ' ' + name + (info ? '  ' + info : '')); };
const incon = (id, why) => { inc++; L('INCONCLUSIVE ' + id + ' — ' + why); };
if (!SITE || !fs.existsSync(path.join(SITE, 'index.html'))) { console.log('usage: witness_docs_i18n.js <built_site_dir> (no index.html at ' + SITE + ')'); process.exit(2); }

// the languages: mkdocs.yml's i18n block (the default first)
const yml = fs.readFileSync(path.join(REPO, 'mkdocs.yml'), 'utf8'), LANGS = Array.from(yml.matchAll(/^\s*- locale: ([a-z]{2}(?:_[A-Z]{2})?)\s*$/mg)).map(m => m[1]);
const DEF = 'en', OTHER = LANGS.filter(l => l !== DEF);
const UI = {}; { let cur = null; fs.readFileSync(path.join(REPO, 'hooks/i18n_ui.yml'), 'utf8').split('\n').forEach(l => { let m = /^([a-z]{2}):/.exec(l); if (m) { cur = m[1]; UI[cur] = {}; return; } m = /^\s+(\w+): '(.*)'\s*$/.exec(l); if (m && cur) UI[cur][m[1]] = m[2].replace(/''/g, "'"); }); }   // YAML single-quoted: '' is one quote (French n''est)
L('languages=' + JSON.stringify(LANGS) + ' ui rows=' + JSON.stringify(Object.keys(UI)));

// ── source parsing (fences toggle on a line whose first non-space characters are ``` ) ──
function split(md) {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(md), meta = {}; let body = md;
  if (fm) { fm[1].split('\n').forEach(l => { const m = /^(\w+):\s*(.*)$/.exec(l); if (m) meta[m[1]] = m[2].trim(); }); body = md.slice(fm[0].length); }
  const lines = body.split('\n'), blocks = [], prose = []; let inF = false, cur = [];
  lines.forEach(l => { if (/^\s*```/.test(l)) { cur.push(l); if (inF) { blocks.push(cur.join('\n')); cur = []; } inF = !inF; return; } if (inF) cur.push(l); else prose.push(l); });
  const pt = prose.join('\n'), comments = (pt.match(/<!--[\s\S]*?-->/g) || []);
  const noC = pt.replace(/<!--[\s\S]*?-->/g, ' ');
  const spans = (noC.match(/`[^`\n]+`/g) || []), tags = (body.match(/§[A-Z0-9_]+/g) || []);
  const heads = {}; prose.forEach(l => { const m = /^(#{1,6}) /.exec(l); if (m) heads[m[1].length] = (heads[m[1].length] || 0) + 1; });
  const digitsText = noC.replace(/`[^`\n]+`/g, ' ').replace(/\]\([^)]*\)/g, '] ').replace(/\{#[^}]*\}/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/(\d)[,.](?=\d{3}\b)/g, '$1');
  const digits = (digitsText.match(/\d+/g) || []);
  return { meta, blocks, comments, spans, tags, heads, digits };
}
const bag = (a) => { const m = {}; a.forEach(x => { m[x] = (m[x] || 0) + 1; }); return m; };
const bagDiff = (a, b) => { const A = bag(a), B = bag(b), out = []; new Set(Object.keys(A).concat(Object.keys(B))).forEach(k => { if ((A[k] || 0) !== (B[k] || 0)) out.push(JSON.stringify(k).slice(0, 40) + ' en=' + (A[k] || 0) + ' tr=' + (B[k] || 0)); }); return out; };
const sha16 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);

// the translated sources
const pairs = [];
fs.readdirSync(DOCS).forEach(f => { const m = /^(.+)\.([a-z]{2})\.md$/.exec(f); if (m && OTHER.indexOf(m[2]) >= 0 && fs.existsSync(path.join(DOCS, m[1] + '.md'))) pairs.push({ page: m[1], lang: m[2], en: path.join(DOCS, m[1] + '.md'), tr: path.join(DOCS, f) }); });
L('translated pages=' + pairs.length + ' ' + JSON.stringify(pairs.map(p => p.page + '.' + p.lang)));

// ── I1: the real guard, live gh-pages -> this build ──
(function () {
  const live = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n_live_'));
  const ar = cp.spawnSync('bash', ['-c', 'git -C "' + REPO + '" archive origin/gh-pages | tar -x -C "' + live + '"'], { encoding: 'utf8' });
  if (ar.status !== 0) { incon('I1', 'no origin/gh-pages to compare: ' + (ar.stderr || '').slice(0, 120)); return; }
  const g = cp.spawnSync('bash', [path.join(REPO, 'scripts/safe_gh_deploy.sh')], { encoding: 'utf8', env: Object.assign({}, process.env, { GUARD_ONLY: '1', GUARD_LIVE_DIR: live, GUARD_NEW_DIR: SITE }) });
  const out = (g.stdout || '') + (g.stderr || ''), off = out.split('\n').filter(l => /§GUARD-(DELETE|SHRINK)/.test(l)).map(l => (/: (\S+) \(/.exec(l) || [])[1]);
  const ADDED_BY_DEPLOY = ['.nojekyll', 'glassbowl_data.db'].concat(fs.readdirSync(DOCS).filter(f => /\.md$/.test(f) && /window\.print\(\)/.test(fs.readFileSync(path.join(DOCS, f), 'utf8'))).map(f => f.replace(/\.md$/, '.pdf')));
  const other = off.filter(p => ADDED_BY_DEPLOY.indexOf(p) < 0);
  L('I1 guard exit=' + g.status + ' offenders=' + JSON.stringify(off) + ' added-by-the-deploy=' + JSON.stringify(ADDED_BY_DEPLOY) + ' other=' + JSON.stringify(other) + ' ' + (out.match(/§STEP4 GUARD:[^\n]*/) || [''])[0]);
  chk('I1 no English path moves or shrinks: the real guard\'s only offenders are files the deploy itself adds (' + off.length + ', named)', other.length === 0, other.join(', '));
  fs.rmSync(live, { recursive: true, force: true });
})();

// ── I2-I6 per translated page ──
if (!pairs.length) { ['I2', 'I3', 'I4', 'I5', 'I6'].forEach(i => incon(i, 'VACUOUS: no translated page')); }
const bad = { I2: [], I3: [], I4: [], I5: [], I6: [], I11: [] };
const LN = require('./i18n_lines.js');
pairs.forEach(p => {
  const id = p.page + '.' + p.lang;
  let trText = fs.readFileSync(p.tr, 'utf8');
  if (BRK === 'blockdigit') trText = trText.replace(/(```[^\n]*\n[^`]*?)(\d)/, (a, b, d) => b + ((+d + 1) % 10));
  if (BRK === 'codespan') trText = trText.replace(/`mis\.list`/, '`mis.lista`');
  if (BRK === 'swapdigits') trText = trText.replace(/(^|[^`\d])(\d)(\d)([^`\d])/m, (a, b, x, y, c) => b + y + x + c);
  if (BRK === 'dropheading') trText = trText.replace(/\n## [^\n]*\n/, '\n');
  if (BRK === 'noreview') trText = trText.replace(/^review: .*\n/m, '');
  const E = split(fs.readFileSync(p.en, 'utf8')), T = split(trText);
  if (BRK === 'joinlines') trText = trText.replace(/([^\n])\n([^\n])/, '$1 $2');
  { const eb = LN.parse(fs.readFileSync(p.en, 'utf8')).body, tb = LN.parse(trText).body, ek = LN.kinds(eb), tk = LN.kinds(tb); let at = -1;
    for (let q = 0; q < Math.max(ek.length, tk.length); q++) { const a1 = ek[q] === 'prose' ? 'p' : ek[q], b1 = tk[q] === 'prose' ? 'p' : tk[q]; if (a1 !== b1) { at = q; break; } }
    L('I11 ' + id + ' body lines en=' + eb.length + ' tr=' + tb.length + (at >= 0 ? ' first structural difference at body line ' + (at + 1) + ' (en ' + ek[at] + ', tr ' + tk[at] + ')' : ' same structure'));
    if (eb.length !== tb.length || at >= 0) bad.I11.push(id + ' en=' + eb.length + ' tr=' + tb.length + (at >= 0 ? ' at line ' + (at + 1) : '')); }
  // I2
  const nB = Math.max(E.blocks.length, T.blocks.length); let firstB = -1;
  for (let i = 0; i < nB; i++) if (E.blocks[i] !== T.blocks[i]) { firstB = i; break; }
  if (firstB >= 0) bad.I2.push(id + ' block #' + (firstB + 1) + ' of ' + E.blocks.length + '/' + T.blocks.length + ': ' + JSON.stringify(String(T.blocks[firstB]).slice(0, 80)));
  if (E.comments.join('\n') !== T.comments.join('\n')) bad.I2.push(id + ' comments ' + E.comments.length + '/' + T.comments.length + ' ' + bagDiff(E.comments, T.comments).slice(0, 3).join('; '));
  L('I2 ' + id + ' blocks en=' + E.blocks.length + ' tr=' + T.blocks.length + ' comments en=' + E.comments.length + ' tr=' + T.comments.length);
  // I3
  const d3 = bagDiff(E.spans, T.spans).concat(bagDiff(E.tags, T.tags));
  if (d3.length) bad.I3.push(id + ' ' + d3.slice(0, 4).join('; '));
  L('I3 ' + id + ' code spans en=' + E.spans.length + ' tr=' + T.spans.length + ' § tags en=' + E.tags.length + ' tr=' + T.tags.length + ' diff=' + d3.length);
  // I4
  const d4 = bagDiff(E.digits, T.digits); if (d4.length) bad.I4.push(id + ' ' + d4.slice(0, 5).join('; '));
  L('I4 ' + id + ' digit runs en=' + E.digits.length + ' tr=' + T.digits.length + ' diff=' + JSON.stringify(d4.slice(0, 8)));
  // I5 headings + the built page's links
  if (JSON.stringify(E.heads) !== JSON.stringify(T.heads)) bad.I5.push(id + ' headings en=' + JSON.stringify(E.heads) + ' tr=' + JSON.stringify(T.heads));
  const built = p.page === 'index' ? path.join(SITE, p.lang, 'index.html') : path.join(SITE, p.lang, p.page, 'index.html');   // the home page builds to <lang>/index.html
  if (!fs.existsSync(built)) bad.I5.push(id + ' not built at ' + path.relative(SITE, built));
  else {
    const html = fs.readFileSync(built, 'utf8'), ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g)).map(m => m[1])), main = (/<article[\s\S]*?<\/article>/.exec(html) || [html])[0];
    let nLinks = 0; const broken = [];
    Array.from(main.matchAll(/href="([^"]+)"/g)).map(m => m[1]).forEach(h => {
      if (/^(https?:|mailto:|javascript:)/.test(h)) return; nLinks++;
      const [u, frag] = h.split('#');
      if (!u) { if (frag && !ids.has(decodeURIComponent(frag))) broken.push(h); return; }
      let t = path.resolve(path.dirname(built), u); if (fs.existsSync(t) && fs.statSync(t).isDirectory()) t = path.join(t, 'index.html');
      if (!fs.existsSync(t)) broken.push(h);
    });
    L('I5 ' + id + ' headings en=' + JSON.stringify(E.heads) + ' tr=' + JSON.stringify(T.heads) + ' links judged=' + nLinks + ' broken=' + JSON.stringify(broken.slice(0, 6)));
    if (broken.length) bad.I5.push(id + ' ' + broken.length + ' broken: ' + broken.slice(0, 4).join(' '));
    // I6 the line on the page
    const ui = UI[p.lang] || {}, want = sha16(p.en), stale = T.meta.source_sha !== want, line = (stale ? ui.stale : ui.translated) || '';
    const lineText = line.replace(/<a [^>]*>.*$/, '').trim();
    if (!T.meta.review || !T.meta.source_sha) bad.I6.push(id + ' front matter review=' + T.meta.review + ' source_sha=' + T.meta.source_sha);
    if (!lineText || html.indexOf(lineText) < 0) bad.I6.push(id + ' the ' + (stale ? 'out-of-date' : 'translated') + ' line is not on the built page');
    L('I6 ' + id + ' review=' + T.meta.review + ' source_sha=' + T.meta.source_sha + ' english=' + want + ' stale=' + stale + ' line shown=' + (html.indexOf(lineText) >= 0));
  }
});
// I6 the front matter of every translated page parses as YAML (python3 yaml, the parser MkDocs uses)
{ const yr = cp.spawnSync('python3', ['-c', 'import sys,re,yaml\nfor p in sys.argv[1:]:\n s=open(p,encoding="utf-8").read(); m=re.match(r"^---\\n(.*?)\\n---\\n",s,re.S)\n try:\n  d=yaml.safe_load(m.group(1)); assert isinstance(d,dict) and d.get("review") and d.get("source_sha")\n except Exception as e: print(p, str(e).splitlines()[0][:80])'].concat(pairs.map(x => x.tr)), { encoding: 'utf8' });
  const ybad = (yr.stdout || '').trim().split('\n').filter(Boolean); L('I6 front matter YAML judged=' + pairs.length + ' bad=' + JSON.stringify(ybad)); ybad.forEach(b => bad.I6.push('front matter not valid YAML: ' + path.basename(b.split(' ')[0])));
  if (yr.status !== 0 && !ybad.length) incon('I6', 'python3 yaml unavailable: ' + (yr.stderr || '').slice(0, 80)); }
// I6 the fallback copies
let nFb = 0; const badFb = [];
OTHER.forEach(lang => {
  const root = path.join(SITE, lang); if (!fs.existsSync(root)) return;
  const ui = UI[lang] || {}, line = (ui.not_translated || '').replace(/<a [^>]*>.*$/, '').trim();
  (function walk(d) { fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) return walk(p); if (f !== 'index.html') return;
    const rel = path.relative(root, path.dirname(p)), page = rel || 'index';
    if (pairs.some(x => x.lang === lang && x.page === page)) return;
    if (!fs.existsSync(path.join(DOCS, page + '.md')) && !fs.existsSync(path.join(DOCS, page, 'index.md'))) return;   // not a page of docs/ (a raw html asset copied as is)
    nFb++; const h = fs.readFileSync(p, 'utf8'), canon = (/rel="canonical" href="([^"]+)"/.exec(h) || [])[1] || '';
    if (h.indexOf(line) < 0 || !/content="noindex"/.test(h) || /\/(es|fr|de|id|ja|zh)\//.test(canon)) badFb.push(lang + '/' + page + (h.indexOf(line) < 0 ? ' no-line' : '') + (/content="noindex"/.test(h) ? '' : ' no-noindex') + ' canonical=' + canon.slice(-40)); }); })(root);
});
L('I6 fallback copies judged=' + nFb + ' bad=' + JSON.stringify(badFb.slice(0, 5)));
if (badFb.length) bad.I6.push(badFb.length + ' fallback copies: ' + badFb.slice(0, 3).join('; '));
if (pairs.length) {
  chk('I2 every translated page keeps every fenced block and comment byte for byte (' + pairs.length + ' pages)', !bad.I2.length, bad.I2.slice(0, 2).join(' | '));
  chk('I3 every inline code span and § tag is kept (' + pairs.length + ' pages)', !bad.I3.length, bad.I3.slice(0, 2).join(' | '));
  chk('I4 every number in the prose is kept (' + pairs.length + ' pages)', !bad.I4.length, bad.I4.slice(0, 2).join(' | '));
  chk('I11 every translated page keeps the English line structure, so an English edit can be carried line by line (' + pairs.length + ' pages)', !bad.I11.length, bad.I11.slice(0, 3).join(' | '));
  chk('I5 same headings per level, and every link and #anchor of the built page resolves (' + pairs.length + ' pages)', !bad.I5.length, bad.I5.slice(0, 2).join(' | '));
}
if (!pairs.length && !nFb) incon('I6', 'VACUOUS: no translated page and no fallback copy');
else chk('I6 translated pages carry review + source_sha and show their line; ' + nFb + ' fallback copies show "not translated yet", noindex and an English canonical', !bad.I6.length, bad.I6.slice(0, 2).join(' | '));

// ── I7 the chooser on every built page ──
let n7 = 0, withAlt = 0; const bad7 = [];
(function walk(d) { fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) return walk(p); if (f !== 'index.html') return;
  let rel = path.relative(SITE, path.dirname(p)); let lang = DEF; const seg = rel.split(path.sep)[0]; if (OTHER.indexOf(seg) >= 0) { lang = seg; rel = rel.split(path.sep).slice(1).join('/'); }
  const page = rel || 'index'; if (!fs.existsSync(path.join(DOCS, page + '.md'))) return;
  n7++; let h = fs.readFileSync(p, 'utf8');
  if (BRK === 'addalt' && page === 'MANIFESTO' && lang === DEF) h = h.replace('</head>', '<link rel="alternate" href="../zz/MANIFESTO/" hreflang="zz"></head>');
  const alts = Array.from(h.matchAll(/<link rel="alternate" href="([^"]*)" hreflang="([^"]*)"/g)).map(m => ({ href: m[1], lang: m[2] }));
  const want = [DEF].concat(OTHER.filter(l => fs.existsSync(path.join(DOCS, page + '.' + l + '.md')))), got = Array.from(new Set(alts.map(a => a.lang))).sort();
  const wantShown = want.length > 1 ? want.slice().sort() : [];
  if (JSON.stringify(got) !== JSON.stringify(wantShown)) bad7.push((lang === DEF ? '' : lang + '/') + page + ' got=' + got.join(',') + ' want=' + wantShown.join(','));
  if (alts.length) withAlt++;
  alts.forEach(a => { let t = path.resolve(path.dirname(p), a.href.replace(/^(https?:\/\/[^/]+)?\/BIMCompiler\//, (path.relative(path.dirname(p), SITE) || '.') + '/')); if (fs.existsSync(t) && fs.statSync(t).isDirectory()) t = path.join(t, 'index.html'); if (!fs.existsSync(t)) bad7.push(page + ' alternate ' + a.href + ' is not built'); });
}); })(SITE);
L('I7 pages judged=' + n7 + ' with a chooser=' + withAlt + ' bad=' + JSON.stringify(bad7.slice(0, 6)));
if (!n7) incon('I7', 'VACUOUS: no built page of docs/'); else chk('I7 every page lists exactly the languages it exists in, and every alternate link is built (' + n7 + ' pages, ' + withAlt + ' with a chooser)', !bad7.length, bad7.slice(0, 3).join(' | '));
console.log('§WITNESS_DOCS_I18N pass=' + pass + ' fail=' + fail + ' inconclusive=' + inc + ' verdict=' + (fail ? 'FAIL' : inc ? 'INCONCLUSIVE' : 'PASS') + (BRK ? ' (DOCS_BREAK=' + BRK + ')' : ''));
process.exit(fail ? 1 : inc ? 2 : 0);
