// film_server_dead_modeller/lib.js — static server + dumb folder pipe + fake-GitHub stand-in for the UNMODIFIED phone page (copied from bim-ootb modeller/tests/witness_team_modeller.js, not edited there).
// ROOT must be a checkout of bim-ootb main that contains modeller/team_sync.js (a /tmp/wt-* worktree; the shared ~/bim-ootb checkout is edit-blocked). Run order: see TEAMWORK_FRAMEWORK §15.12.
// film lib: static server + dumb folder pipe + fake-GitHub stand-in (copied from modeller/tests/witness_team_modeller.js, not edited there)
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), os = require('os'), crypto = require('crypto');
var ROOT = '/tmp/wt-film-hhs';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.css': 'text/css' };
function walk(d, rel, out) { if (!fs.existsSync(d)) return out; fs.readdirSync(d).forEach(function (n) { var p = path.join(d, n), r = rel ? rel + '/' + n : n;
  if (fs.statSync(p).isDirectory()) walk(p, r, out); else out.push(r); }); return out; }
function sha1(b) { return crypto.createHash('sha1').update(b).digest('hex'); }
function kidOfName(n) { var p = n.split('/'); return (p.length >= 4 && p[0] === 's' && /^[0-9a-f]{64}$/.test(p[1]) && (p[2] === 'o' || p[2] === 'h' || p[2] === 'r')) ? p[3] : null; }
exports.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
exports.start = async function () {
  var FOLDER = fs.mkdtempSync(path.join(os.tmpdir(), 'film-modeller-'));
  var server = http.createServer(function (req, res) {
    var u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
    if (p === '/pipe/list') { var pre = u.searchParams.get('prefix') || ''; res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(walk(FOLDER, '', []).filter(function (n) { return n.indexOf(pre) === 0; }))); return; }
    if (p.indexOf('/pipe/f/') === 0) { var fp = path.join(FOLDER, p.slice(8)); if (fp.indexOf(FOLDER) !== 0) { res.writeHead(400); res.end(); return; }
      if (req.method === 'PUT') { var ch = []; req.on('data', function (c) { ch.push(c); }); req.on('end', function () { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, Buffer.concat(ch)); res.writeHead(200); res.end('ok'); }); return; }
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' }); fs.createReadStream(fp).pipe(res); return; }
    var f = path.join(ROOT, p === '/' ? '/modeller/modeller.html' : p);
    if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, '127.0.0.1', r); });
  var base = 'http://127.0.0.1:' + server.address().port;
  var blobs = {}, trees = {}, commits = {}, commitKid = {};
  function namesByKid() { var m = {}; walk(FOLDER, '', []).forEach(function (n) { var k = kidOfName(n); if (k) (m[k] = m[k] || []).push(n); }); return m; }
  function commitOf(kid) { var ns = (namesByKid()[kid] || []).sort(), h = crypto.createHash('sha1'); ns.forEach(function (n) { h.update(n); h.update(fs.readFileSync(path.join(FOLDER, n))); }); var c = h.digest('hex'); commitKid[c] = kid; return c; }
  async function fakeGh(route) {
    var rq = route.request(), u = new URL(rq.url()), m = rq.method(), p = u.pathname.replace('/repos/red1oon/bim-teams-pipe', '');
    var cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS', 'access-control-expose-headers': '*' };
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    function J(st, b) { return route.fulfill({ status: st, headers: Object.assign({ 'content-type': 'application/json' }, cors), body: JSON.stringify(b) }); }
    var body = rq.postData() ? JSON.parse(rq.postData()) : null, mm;
    if (m === 'GET' && p === '/git/matching-refs/heads/dev/') { var nk = namesByKid(); return J(200, Object.keys(nk).map(function (k) { return { ref: 'refs/heads/dev/' + k, object: { sha: commitOf(k) } }; })); }
    if (m === 'GET' && (mm = /^\/git\/trees\/([0-9a-f]{40})$/.exec(p))) { var kid = commitKid[mm[1]]; if (!kid) return J(404, {});
      return J(200, { tree: (namesByKid()[kid] || []).map(function (n) { var b = fs.readFileSync(path.join(FOLDER, n)), s = sha1(b); blobs[s] = b; return { path: n, type: 'blob', sha: s, size: b.length }; }) }); }
    if (m === 'GET' && (mm = /^\/git\/blobs\/([0-9a-f]{40})$/.exec(p))) { var bb = blobs[mm[1]]; return bb ? J(200, { content: bb.toString('base64'), encoding: 'base64' }) : J(404, {}); }
    if (m === 'GET' && (mm = /^\/git\/ref\/heads\/dev\/(.+)$/.exec(p))) { return (namesByKid()[mm[1]] ? J(200, { object: { sha: commitOf(mm[1]) } }) : J(404, {})); }
    if (m === 'GET' && (mm = /^\/git\/commits\/([0-9a-f]{40})$/.exec(p))) return J(200, { tree: { sha: 'f'.repeat(40) } });
    if (m === 'POST' && p === '/git/blobs') { var buf = Buffer.from(body.content, 'base64'), s2 = sha1(buf); blobs[s2] = buf; return J(201, { sha: s2 }); }
    if (m === 'POST' && p === '/git/trees') { var id = crypto.randomBytes(20).toString('hex'); trees[id] = body.tree; return J(201, { sha: id }); }
    if (m === 'POST' && p === '/git/commits') { var cid = crypto.randomBytes(20).toString('hex'); commits[cid] = body.tree; return J(201, { sha: cid }); }
    if ((m === 'PATCH' && /^\/git\/refs\/heads\/dev\//.test(p)) || (m === 'POST' && p === '/git/refs')) {
      (trees[commits[body.sha]] || []).forEach(function (e) { var fp = path.join(FOLDER, e.path); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, blobs[e.sha]); });
      return J(m === 'POST' ? 201 : 200, { object: { sha: body.sha } }); }
    return J(404, { message: 'fake-gh: unhandled ' + m + ' ' + p });
  }
  return { base: base, PIPE: base + '/pipe', FOLDER: FOLDER, fakeGh: fakeGh, close: function () { server.close(); try { fs.rmSync(FOLDER, { recursive: true, force: true }); } catch (e) {} } };
};
