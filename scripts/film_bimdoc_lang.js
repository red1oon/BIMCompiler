// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — film_bimdoc_lang.js: the Chinese / Malay silent master of the BIM Document film (FILM_NARRATION.md §BIMDOC-FILM-ZH-MS). READ the §LANG lines after every run.
// THE ISSUE it proves/disproves: can a language version carry translated cards WITHOUT re-recording the app (the playbook: never re-bake the film), with the SAME cues as English?
//   The recorded app segments (before / after / main) are reused byte for byte; only the three card segments are re-rendered from scripts/film_bimdoc_cards.js in that language, each at
//   the English segment's own frame count, so every narration cue is unchanged. FAIL if a card's frame count or the total differs from the English master.
// Run: node scripts/film_bimdoc_lang.js <zh|ms> <english recorder out dir (has seg_*.mp4)> <out silent.mp4>
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require(process.env.PW || (require('os').homedir() + '/bim-ootb/tests/node_modules/playwright'));
const { build } = require('./film_bimdoc_cards.js');
const [LANG, EN, OUT] = process.argv.slice(2);
if (!LANG || !EN || !OUT) { console.log('usage: film_bimdoc_lang.js <lang> <enRecDir> <out.mp4>'); process.exit(2); }
if (fs.existsSync(OUT)) { console.log('§LANG-REFUSE exists ' + OUT); process.exit(2); }
const frames = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f]).toString().trim());
(async () => {
  const cards = build(LANG), work = path.join(path.dirname(OUT), 'lang_' + LANG); fs.mkdirSync(work, { recursive: true });
  const b = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] }), pg = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
  let bad = 0; const seg = {};
  for (const name of ['ch', 'card', 'end']) {
    const enSeg = path.join(EN, 'seg_' + name + '.mp4'), n = frames(enSeg), secs = n / 24;
    await pg.setContent(cards[name]); await pg.evaluate(() => document.fonts.ready);
    const png = path.join(work, 'card_' + name + '.png'), mp = path.join(work, 'seg_' + name + '.mp4'); await pg.screenshot({ path: png });
    // the recorder's own card encoding (scripts/film_bimdoc.js card()), so the parts join with -c copy
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-framerate', '24', '-t', secs.toFixed(4), '-i', png, '-vf', `scale=1920:1080:flags=lanczos,fade=t=in:st=0:d=0.4,fade=t=out:st=${(secs - 0.4).toFixed(3)}:d=0.4,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-r', '24', '-tune', 'stillimage', '-frames:v', String(n), mp]);
    const got = frames(mp); if (got !== n) bad++;
    console.log('§LANG-CARD lang=' + LANG + ' card=' + name + ' frames=' + got + ' english=' + n + (got === n ? ' OK' : ' MISMATCH'));
    seg[name] = mp;
  }
  await b.close();
  const order = [seg.ch, path.join(EN, 'seg_before.mp4'), seg.card, path.join(EN, 'seg_after.mp4'), path.join(EN, 'seg_main.mp4'), seg.end];
  const list = path.join(work, 'join.txt'); fs.writeFileSync(list, order.map((f) => `file '${f}'`).join('\n') + '\n');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', OUT]);
  const enTotal = ['ch', 'before', 'card', 'after', 'main', 'end'].reduce((a, s) => a + frames(path.join(EN, 'seg_' + s + '.mp4')), 0), total = frames(OUT);
  if (total !== enTotal) bad++;
  console.log('§LANG-MASTER lang=' + LANG + ' frames=' + total + ' english=' + enTotal + ' out=' + OUT);
  console.log('§LANG-VERDICT ' + (bad ? 'FAIL' : 'PASS') + ' lang=' + LANG);
  process.exit(bad ? 1 : 0);
})();
