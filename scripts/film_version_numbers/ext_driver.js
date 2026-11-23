// ⚠ DO NOT REMOVE — SCOPE: film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6). The extension-host half of shoot.js: it runs INSIDE the real VS Code (started with --extensionTestsPath=this file, as film 4's shots_suite.js was) and
// serves ONE tiny local HTTP endpoint on 127.0.0.1:$FILM_DRIVER_PORT: POST /do {code} runs `code` (async function body, with `vscode`, `require`, `sleep`) and answers {ok, r} or {ok:false, err}; POST /quit ends the run. shoot.js decides WHAT to do and WHEN to take a still;
// this file only does what VS Code's own API lets an extension do (open a file, move the caret, edit, save, run a command, send text to the terminal). Nothing here knows the film. READ out/shoot.log.
'use strict';
const http = require('http'), vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms));
exports.run = function () {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => { let b = ''; req.on('data', d => { b += d; }); req.on('end', async () => {
      if (req.url === '/quit') { res.end('{"ok":true}'); srv.close(); return resolve(); }
      try { const { code } = JSON.parse(b), fn = new Function('vscode', 'require', 'sleep', 'return (async () => {' + code + '\n})()'); const r = await fn(vscode, require, sleep); res.end(JSON.stringify({ ok: true, r: r === undefined ? null : r })); }
      catch (e) { res.end(JSON.stringify({ ok: false, err: String((e && e.stack) || e) })); } }); });
    srv.listen(+process.env.FILM_DRIVER_PORT, '127.0.0.1');
  });
};
