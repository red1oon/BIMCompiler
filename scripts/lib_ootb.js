// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// lib_ootb.js — gives a witness the bim-ootb files it needs WITHOUT a worktree: an explicit directory if the caller passes one, else the files are read with `git show origin/main:<path>`
// (read-only, no checkout, no edit) into a temp directory. Run `git -C ~/bim-ootb fetch origin` first if origin/main may be stale.
'use strict';
var fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
function ootbDir(arg, files) {
  if (arg) return arg;
  var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ootb_main_')), root = path.join(os.homedir(), 'bim-ootb');
  files.forEach(function (f) {
    var r = cp.spawnSync('git', ['-C', root, 'show', 'origin/main:' + f], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if (r.status !== 0) return;
    fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.writeFileSync(path.join(tmp, f), r.stdout);
  });
  return tmp;
}
module.exports = { ootbDir: ootbDir };
