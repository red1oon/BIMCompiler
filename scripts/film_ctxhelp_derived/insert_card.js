// ⚠ DO NOT REMOVE — film v2b (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20; owner 2026-11-24: "The film is not that clear what belongs to legacy, and what is added to it
//   from the Kernel. Can u just add a card with table, after opening card, 'CtxHelp Content Added to Legacy from Kernel ERP'. Thus need not redo film. Just insert that card
//   in table also shows pending"). ONE silent still (1920x1080), every figure read from out/facts.json (the film's own run), spliced after the cover beat (t = 4.5 s, the cover
//   is silent: measured -91 dB at the cut). The v2 file is never overwritten. READ out/insert_card.log.
// Usage: node insert_card.js <v2.mp4> <out.mp4> [seconds=12]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const [IN, DST, SEC0] = process.argv.slice(2), SEC = Number(SEC0 || 12), CUT = 4.5, LOG = [];
const L = (m) => { LOG.push(m); console.log(m); };
if (!IN || !DST) throw new Error('usage: node insert_card.js <v2.mp4> <out.mp4> [seconds]');
if (fs.existsSync(DST)) { L('§REFUSED ' + DST + ' exists (never overwritten)'); process.exit(5); }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const st = F.script.statements, lg = F.legacy, d = F.derived, r = F.rules;
// the figures, each from the film's facts (no number typed here)
const N = { legacyHelps: lg.before.helps, added: st['INSERT INTO AD_CTXHELP'], tabs: st['UPDATE AD_TAB'], procs: st['UPDATE AD_PROCESS'], ddl: F.script.ddl, windows: d.windows, of: d.of, effects: r.effects, cited: d.cited, citedOf: d.citedOf, applied: lg.applied.helps };
const rows = [
  ['The How To panel and its tables (AD_CtxHelp, AD_CtxHelpMsg)', 'legacy\'s own', 'used as they are: <b>' + N.ddl + '</b> table changes, no code'],
  ['Help topics', '<b>' + N.legacyHelps + '</b> (the Home welcome)', '<b>+' + N.added + '</b>, linked from ' + N.tabs + ' tabs and ' + N.procs + ' processes (' + N.applied + ' in all after the script)'],
  ['A tab\'s and a field\'s own Help text', 'legacy\'s dictionary, shown first', 'unchanged'],
  ['Before you start · Do it', '—', 'on <b>' + N.windows + ' of ' + N.of + '</b> core windows, read from legacy\'s dictionary'],
  ['What Complete does', 'the rules, inside legacy\'s DocAction code', '<b>' + N.effects + '</b> effects read from that code, each cited by file and line (' + N.cited + ' of ' + N.citedOf + ' lines hold)'],
  ['When it refuses', 'the messages, inside legacy\'s code', 'listed per window, in legacy\'s own words'],
  ['✓ seen in a legacy run', '—', 'only where a recorded run of real iDempiere, on the same side, did it'],
  ['How-to steps from our user guides', '—', 'whole paragraphs, then a link to the guide'],
  ['How it reaches a legacy site', '—', 'one migration script: rows only'],
];
const pending = ['✓ for the rest: more recorded runs (purchase side, confirmations)', 'Translations of the new text (English only for now)', 'A guide page for this panel', 'The VS Code link: an idea only'];
const css = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.w{margin:44px 70px 0} h1{font-size:44px} h1 span{color:#FF6B78} .sub{color:#94a3b8;font-size:20px;margin-top:8px}
table{border-collapse:collapse;margin-top:22px;width:1780px;font-size:21px} th{color:#94a3b8;font-size:18px;letter-spacing:2px;text-transform:uppercase;text-align:left;padding:8px 14px;border-bottom:2px solid #334155}
td{padding:9px 14px;border-bottom:1px solid #334155;vertical-align:top;line-height:1.3} td:first-child{width:520px;color:#F3EEE8} td:nth-child(2){width:470px;color:#cbd5e1} td:nth-child(3){color:#4ade80} td b{color:#7dd3fc}
.p{margin-top:18px;font-size:20px} .p h2{font-size:18px;color:#fbbf24;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px} .p span{display:inline-block;margin-right:34px;color:#fbbf24}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="w"><h1>CtxHelp Content Added to Legacy <span>from Kernel ERP</span></h1>
<div class="sub">What legacy iDempiere already has, and what the Kernel adds to it</div>
<table><tr><th></th><th>Legacy iDempiere</th><th>Added from Kernel ERP</th></tr>${rows.map((x) => '<tr><td>' + esc(x[0]) + '</td><td>' + x[1] + '</td><td>' + x[2] + '</td></tr>').join('')}</table>
<div class="p"><h2>Pending (not built yet)</h2>${pending.map((x) => '<span>· ' + esc(x) + '</span>').join('')}</div></div></body></html>`;
const sh = (cmd, args) => { const r2 = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 26 }); if (r2.status !== 0) throw new Error(cmd + ' ' + args.slice(0, 4).join(' ') + ': ' + (r2.stderr || '').slice(-400)); return r2.stdout; };
const probe = (f, e, s) => sh('ffprobe', ['-v', 'error', '-select_streams', s || 'v:0', '-count_frames', '-show_entries', e, '-of', 'csv=p=0', f]).trim();
(async () => {
  const work = path.join(OUT, 'card'), png = path.join(work, 'legacy_vs_kernel.png'); fs.mkdirSync(work, { recursive: true });
  const br = await puppeteer.launch({ headless: 'new', args: ['--disable-gpu', '--no-sandbox'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  await pg.setContent(html, { waitUntil: 'load' }); const tall = await pg.evaluate(() => document.querySelector('.w').getBoundingClientRect().bottom);
  await pg.screenshot({ path: png }); await br.close();
  L('§CARD figures=' + JSON.stringify(N) + ' content_bottom=' + Math.round(tall) + 'px (frame 1080) ' + (tall > 1080 - 20 ? 'TOO-TALL' : 'fits'));
  if (tall > 1060) process.exit(3);
  // the cut: the cover beat ends at 4.5 s (record.log §FILM_CUE beat=before t=4.500); the sound there is silent (measured before the splice, logged)
  const vol = (ss, t, f) => (/max_volume: (-?[\d.]+) dB/.exec(spawnSync('ffmpeg', ['-v', 'info', '-ss', String(ss), '-t', String(t), '-i', f || IN, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr) || [])[1];
  const v0 = vol(CUT - 0.3, 0.6); L('§CUT t=' + CUT + ' max_volume_around=' + v0 + ' dB');
  if (!(Number(v0) <= -60)) { L('§CUT_REFUSED the cut is not silent'); process.exit(4); }
  const fps = 24, fc = '[0:v]trim=0:' + CUT + ',setpts=PTS-STARTPTS[a];[1:v]fps=' + fps + ',trim=0:' + SEC + ',setpts=PTS-STARTPTS,format=yuv420p[c];[0:v]trim=' + CUT + ',setpts=PTS-STARTPTS[b];[a][c][b]concat=n=3:v=1:a=0[v];' +
    '[0:a]atrim=0:' + CUT + ',asetpts=PTS-STARTPTS[x];[2:a]atrim=0:' + SEC + ',asetpts=PTS-STARTPTS[s];[0:a]atrim=' + CUT + ',asetpts=PTS-STARTPTS[y];[x][s][y]concat=n=3:v=0:a=1[au]';
  sh('ffmpeg', ['-v', 'error', '-i', IN, '-loop', '1', '-framerate', String(fps), '-i', png, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-filter_complex', fc, '-map', '[v]', '-map', '[au]', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', DST]);
  const fIn = Number(probe(IN, 'stream=nb_read_frames')), fOut = Number(probe(DST, 'stream=nb_read_frames')), dIn = Number(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', IN])), dOut = Number(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', DST]));
  const aOut = Number(sh('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', DST]));
  L('§SPLICE frames_in=' + fIn + ' card_frames=' + SEC * fps + ' frames_out=' + fOut + ' planned=' + (fIn + SEC * fps) + ' dur_in=' + dIn.toFixed(3) + ' dur_out=' + dOut.toFixed(3) + ' audio_out=' + aOut.toFixed(3));
  // the card is silent, and what follows it is the v2 film shifted by SEC: the voice level of a later window equals the original's at t - SEC
  // the card is silent; what follows is the v2 film shifted by SEC: at three windows the peak AND mean level equal the original's at t - SEC (within 0.5 dB: the sound is re-encoded)
  const lev = (ss, t, f) => { const e = spawnSync('ffmpeg', ['-v', 'info', '-ss', String(ss), '-t', String(t), '-i', f, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    return [Number((/max_volume: (-?[\d.]+) dB/.exec(e) || [])[1]), Number((/mean_volume: (-?[\d.]+) dB/.exec(e) || [])[1])]; };
  const card = lev(CUT + 0.5, SEC - 1, DST)[0], wins = [30, 80, 150].map((t) => { const o = lev(t, 5, IN), n = lev(t + SEC, 5, DST); return { t, o, n, ok: Math.abs(o[0] - n[0]) <= 0.5 && Math.abs(o[1] - n[1]) <= 0.5 }; });
  L('§CHECK card_max_volume=' + card + ' dB · ' + wins.map((w) => 'orig ' + w.t + 's max/mean ' + w.o.join('/') + ' vs new ' + (w.t + SEC) + 's ' + w.n.join('/') + (w.ok ? ' same' : ' DIFFERS')).join(' · '));
  const ok = fOut === fIn + SEC * fps && Math.abs(aOut - dOut) < 0.2 && card <= -60 && wins.every((w) => w.ok);
  L('§INSERT_CARD_VERDICT ' + (ok ? 'PASS' : 'FAIL') + ' ' + DST);
  fs.writeFileSync(path.join(OUT, 'insert_card.log'), LOG.join('\n') + '\n'); process.exit(ok ? 0 : 1);
})().catch((e) => { L('§INSERT_CARD_ERROR ' + e.message); fs.writeFileSync(path.join(OUT, 'insert_card.log'), LOG.join('\n') + '\n'); process.exit(1); });
