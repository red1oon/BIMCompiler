// witness_xss_filename.js — W-XSS-FILENAME (prompts/CODEBASE_QUALITY_AUDIT_2026-07-02.md §5)
//
// ISSUE PROVED: a maliciously-named local file (e.g. `<img src=x onerror=alert(1)>.xlsx`)
// dropped on the Ninja-pill file input used to render as LIVE HTML
// (`out.innerHTML = 'reading ' + f.name`), plus the download-link sink the audit missed.
// Proves the fix in this repo's mirror (build/erp/ninja_pill.js): the shipped _escHtml
// neutralizes tag characters (computed-value check, not a source-string check), benign
// names survive readable, and no filename innerHTML sink is left unescaped.
// bim-ootb's erp/ninja_pill.js + erp/migrate_showme.js carry the same fix + witness (PR #618).

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var FILE = path.resolve(__dirname, '..', 'ninja_pill.js');

var pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('§W-XSS-FILENAME PASS  ' + name + (detail ? '  ' + detail : '')); }
  else { fail++; console.log('§W-XSS-FILENAME FAIL  ' + name + (detail ? '  ' + detail : '')); }
}

var sandbox = { console: console, setTimeout: setTimeout, URL: {}, Blob: function () {} };
sandbox.self = sandbox; sandbox.window = sandbox; sandbox.global = sandbox;
vm.runInNewContext(fs.readFileSync(FILE, 'utf8'), sandbox, { filename: 'ninja_pill.js' });
var np = sandbox.NinjaPill;

var EVIL = '<img src=x onerror=alert(1)>.xlsx';
check('NinjaPill exposes _escHtml', np && typeof np._escHtml === 'function');
if (np && np._escHtml) {
  var out = np._escHtml(EVIL);
  check('evil name has NO raw tag chars', out.indexOf('<') < 0 && out.indexOf('>') < 0, out);
  check('evil name escaped, not dropped', out.indexOf('&lt;img') === 0, out);
  check('benign name survives readable', np._escHtml('Q3 report & summary.xlsx') === 'Q3 report &amp; summary.xlsx');
}

var offenders = fs.readFileSync(FILE, 'utf8').split('\n').filter(function (l) {
  return l.indexOf('.innerHTML') >= 0 && (/\bf\.name\b|\bfname\b/.test(l)) && l.indexOf('_escHtml(') < 0;
});
check('no unescaped filename innerHTML sink', offenders.length === 0, offenders.join(' | '));

console.log('§W-XSS-FILENAME ' + pass + '/' + (pass + fail) + (fail ? ' FAIL' : ' PASS'));
process.exit(fail ? 1 : 0);
