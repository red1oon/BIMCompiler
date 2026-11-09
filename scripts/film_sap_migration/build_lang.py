#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the language versions of "How to escape from your SAP Business One" (owner 2026-11-10: "Do the Mandarin version"). Same beats, shots and facts as the
#   English rc1 (cards.py, build.py); every on-screen word from lang_text.py, numbers filled from out/rec/facts.json; program text (the agent's § lines, the guide-example rows, the
#   command, the ERP's UI) stays as shot. Voices = Microsoft Edge TTS (CLOUD: the script text is sent to Microsoft — the house choice for zh/th/ms, FILM_NARRATION.md PLAYBOOK; clips
#   cached by text, retried, a refused line spoken phrase by phrase). Derived from scripts/film_bc_migration/build_lang.py. READ out/build_<lang>.log; exit codes are not evidence.
# Run: ~/.local/share/film_narration/venv/bin/python build_lang.py zh [out.mp4]
import os, sys, json, re, hashlib, asyncio, subprocess, time, numpy as np, soundfile as sf, edge_tts
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from lang_text import L as LT
sys.path.insert(0, os.path.join(HERE, '../film_odoo_migration')); import importlib.util
_s = importlib.util.spec_from_file_location('odoo_lt', os.path.join(HERE, '../film_odoo_migration/lang_text.py')); OLT = importlib.util.module_from_spec(_s); _s.loader.exec_module(OLT)
LANG = sys.argv[1]; T = LT[LANG]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser('~/Videos/How_to_escape_from_your_SAP_Business_One_%s_rc1.mp4' % LANG.upper())
if os.path.exists(OUT): print('§BUILD_REFUSED %s exists' % OUT); sys.exit(5)
C = os.path.join(HERE, 'out/cards_' + LANG); W = os.path.join(HERE, 'out/build_' + LANG); R = os.path.join(HERE, 'out/rec'); os.makedirs(C, exist_ok=True); os.makedirs(W, exist_ok=True)
LOG = []
def say(s): print(s, flush=True); LOG.append(s)
F = json.load(open(os.path.join(R, 'facts.json'))); msg = F['form_msg']; mig = lambda t: int(re.search(t + r' (\d+)', msg).group(1))
for k, ok in [('offline_proven', F['offline_proven'] is True), ('agent_read_only', F['agent_read_only'] is True), ('warehouse_refusal_shown', F['warehouse_refusal_shown'] is True),
              ('witness PASS', F['witness_verdict'][0] == 'PASS'), ('verify_chain', F['verify_chain'] == 'ok'), ('no leak', F['alpha_values_leaked'] == 0), ('no page errors', F['page_errors'] == 0)]:
    if not ok: say('§LANG_REFUSED %s is not proven by the recording' % k); sys.exit(4)
N = dict(bp=mig('C_BPartner'), pr=mig('M_Product'), ev=mig('C_ElementValue'), ops=F['commit_ops'], req=F['offline_requests'], vc=F['verify_chain'], inc=int(F['inconclusive_rules'][0]),
         calls=F['agent_calls'], vals=F['alpha_values_checked'], leaked=F['alpha_values_leaked'])
say('§LANG %s facts %s' % (LANG, json.dumps(N)))
fill = lambda s: s.format(**N)
FB, FR = T['font_b'], T['font_r']; M = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
BG, BG2, CO, OW, SK, GR, GN = '#0b0f17', '#0f172a', '#FF6B78', '#F3EEE8', '#7dd3fc', '#9aa4b2', '#86efac'
def im(a): subprocess.run(['convert'] + [str(x) for x in a], check=True)
def c(k, i=0): return fill(T['cards'][k][i])
def chapter(out, k):
    im(['-size', '1920x1080', 'xc:' + BG, '-gravity', 'center', '-font', FB, '-pointsize', 34, '-fill', CO, '-annotate', '+0-210', c(k, 0), '-pointsize', 110, '-fill', OW, '-annotate', '+0-60', c(k, 1),
        '-fill', CO, '-annotate', '+0+90', c(k, 2), '-font', FR, '-pointsize', 40, '-fill', OW, '-annotate', '+0+220', c(k, 3), os.path.join(C, out)])
def shot(out, src, k):
    im([os.path.join(R, src), '-resize', '1340x754', os.path.join(C, '_s.png')])
    im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', c(k), os.path.join(C, '_s.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite', os.path.join(C, out)])
def textcard(out, title, lines):
    a = ['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', title, '-gravity', 'northwest']
    for f, s, col, x, y, t in lines: a += ['-font', f, '-pointsize', s, '-fill', col, '-annotate', '+%d+%d' % (x, y), t]
    im(a + [os.path.join(C, out)])
# ── cards ──
chapter('01_title.png', 'title')
t = T['cards']['trap']
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 46, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', t[0],
    '-fill', 'none', '-stroke', '#475569', '-strokewidth', 4, '-draw', 'roundrectangle 150,300 610,560 24,24', '-draw', 'roundrectangle 730,300 1190,560 24,24', '-draw', 'roundrectangle 1310,300 1770,560 24,24',
    '-stroke', CO, '-strokewidth', 6, '-draw', 'line 610,430 730,430', '-draw', 'line 1190,430 1310,430', '-stroke', 'none', '-gravity', 'north',
    '-font', FB, '-pointsize', 42, '-fill', OW, '-annotate', '-580+340', t[1], '-annotate', '+0+340', t[2], '-annotate', '+580+340', t[3],
    '-font', FR, '-pointsize', 30, '-fill', GR, '-annotate', '-580+415', t[4], '-annotate', '+0+415', t[5], '-annotate', '+580+415', t[6],
    '-font', FB, '-pointsize', 40, '-fill', CO, '-annotate', '+0+640', t[7], os.path.join(C, '02_trap.png')])
o = T['cards']['open']
textcard('03_open.png', o[0], [(FB, 44, GN, 200, 150, o[1]), (FR, 36, OW, 240, 215, o[2]), (FB, 44, CO, 200, 320, o[3]), (FR, 36, OW, 240, 385, o[4]), (FR, 36, OW, 240, 445, o[5]),
  (FR, 36, OW, 290, 500, o[6]), (FR, 24, GR, 200, 640, o[7])])
AL = F['agent_lines']; pick = [l for l in AL if re.match(r'§SAP-AGENT (login|metadata|done)', l)] + [l for l in AL if l.startswith('§SAP-FIELD set=Items')][:1]
textcard('04_server.png', c('server', 0), [(M, 26, '#e5e7eb', 160, 150 + 56 * i, l if len(l) <= 100 else l[:99] + '…') for i, l in enumerate(pick)] +
  [(FB, 40, GN, 160, 150 + 56 * len(pick) + 50, c('server', 1)), (FR, 34, GR, 160, 150 + 56 * len(pick) + 120, c('server', 2))])
fl = []
for setname, rows in F['fixture_rows']:
    for key, name, src in rows: fl.append('%-17s %-17s %-12s %s' % (setname, key, (name or '')[:12], src[:44]))
textcard('05_guide.png', c('guide', 0), [(M, 27, '#e5e7eb', 150, 160 + 52 * i, l) for i, l in enumerate(fl)] +
  [(FR, 32, GR, 150, 160 + 52 * len(fl) + 40, c('guide', 1)), (FB, 36, CO, 150, 160 + 52 * len(fl) + 100, c('guide', 2))])
chapter('06_act1.png', 'act1')
SL = [l for l in AL if re.match(r'§SAP-AGENT set=', l)]
textcard('07_agent.png', c('agent', 0), [(M, 28, GN, 150, 140, '$ node agent.js --url https://<server>:50000 --company <db> --user <user>')] +
  [(M, 25, '#e5e7eb', 150, 210 + 48 * i, re.sub(r'^§SAP-AGENT ', '', l)[:115]) for i, l in enumerate(SL)])
chapter('08_act2.png', 'act2'); shot('09_login.png', 'login_newco.png', 'login'); chapter('10_act3.png', 'act3')
shot('11_form.png', 'form_file.png', 'form'); shot('12_summary.png', 'form_summary.png', 'summary'); shot('13_done.png', 'form_done.png', 'done')
shot('14_bp.png', 'bp_window.png', 'bp'); shot('15_products.png', 'product_window.png', 'products')
f = T['cards']['found']
textcard('16_found.png', f[0], [(FB, 46, CO, 220, 170, '1'), (FB, 42, OW, 290, 170, f[1]), (FR, 34, GR, 290, 235, f[2]), (FR, 34, GR, 290, 285, f[3]),
  (FB, 46, CO, 220, 400, '2'), (FB, 42, OW, 290, 400, f[4]), (FR, 34, GR, 290, 465, f[5]), (FR, 34, GR, 290, 515, f[6])])
im([os.path.join(R, 'offline_saved.png'), '-resize', '1340x754', os.path.join(C, '_o.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', c('offline', 0), os.path.join(C, '_o.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite',
    '-fill', '#b91c1cdd', '-draw', 'roundrectangle 330,120 1010,190 14,14', '-font', FB, '-pointsize', 34, '-fill', 'white', '-gravity', 'northwest', '-annotate', '+350+133', c('offline', 1), os.path.join(C, '17_offline.png')])
textcard('18_proof.png', c('proof', 0), [(FB, 64, OW, 260, 200, c('proof', 1)), (FB, 64, OW, 260, 320, c('proof', 2)), (FB, 64, OW, 260, 440, c('proof', 3)),
  (FR, 38, GR, 260, 580, c('proof', 4)), (FR, 38, GR, 260, 640, c('proof', 5))])
al = [l for l in F['alpha_lines'] if re.match(r'§SAP-ALPHA (set=(BusinessPartners|Items|Warehouses) |sheet=(05|09|14)|patch M_Product\.C_UOM)', l)][:8]
textcard('19_alpha.png', c('alpha', 0), [(M, 24, '#e5e7eb', 150, 130 + 44 * i, l if len(l) <= 108 else l[:107] + '…') for i, l in enumerate(al)] +
  [(FB, 38, CO, 150, 130 + 44 * len(al) + 40, c('alpha', 1)), (FB, 34, GN, 150, 130 + 44 * len(al) + 100, c('alpha', 2))])
n = T['cards']['notyet']
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 34, '-fill', CO, '-gravity', 'north', '-annotate', '+0+70', n[0], '-font', FB, '-pointsize', 64, '-fill', OW, '-annotate', '+0+140', n[1],
    '-font', FR, '-pointsize', 44, '-fill', OW, '-gravity', 'northwest', '-annotate', '+330+290', n[2], '-annotate', '+330+365', n[3], '-annotate', '+330+440', n[4], '-annotate', '+330+515', n[5],
    '-font', FR, '-pointsize', 34, '-fill', GR, '-gravity', 'north', '-annotate', '+0+650', n[6], os.path.join(C, '20_notyet.png')])
# the end card: the NEURO one-door diagram — for a non-English film its 26 labels translated (the Odoo film's set), drawn by a browser
e = T['cards']['end']; ODO = os.path.join(HERE, '../film_odoo_migration')
if LANG == 'en': dpng = os.path.join(ODO, 'cards/src/actor_layer_one_door.png')
else:
    svg = open(os.path.join(ODO, 'cards/src/actor_layer_one_door.svg')).read(); k = 0
    for en, tr in zip(OLT.SVG_EN, OLT.L[LANG]['svg']):
        svg, j = re.subn(r'(<text[^>]*>)' + re.escape(en) + r'(</text>)', lambda m: m.group(1) + tr + m.group(2), svg, count=1); k += j
    fam = T['ass_font']; svg = re.sub(r'font-family="[^"]*"', 'font-family="%s"' % fam, svg); svg = re.sub(r"font-family:[^;\"']*", 'font-family:' + fam, svg)
    open(os.path.join(W, 'diagram.svg'), 'w').write(svg); say('§LANG diagram labels translated=%d/%d font=%s' % (k, len(OLT.SVG_EN), fam))
    subprocess.run(['node', os.path.join(ODO, 'svg2png.js'), os.path.join(W, 'diagram.svg'), os.path.join(W, 'diagram.png'), '1900'], check=True); dpng = os.path.join(W, 'diagram.png')
im([dpng, '-resize', '1180x', '-bordercolor', 'white', '-border', 24, os.path.join(C, '_d.png')])
im(['-size', '1920x1080', 'xc:' + BG, '-font', FB, '-pointsize', 32, '-fill', CO, '-gravity', 'north', '-annotate', '+0+52', e[0], '-font', FB, '-pointsize', 60, '-fill', OW, '-annotate', '+0+96', e[1],
    os.path.join(C, '_d.png'), '-gravity', 'north', '-geometry', '+0+190', '-composite', '-font', FR, '-pointsize', 32, '-fill', OW, '-gravity', 'north', '-annotate', '+0+880', e[2],
    '-font', FB, '-pointsize', 30, '-fill', CO, '-annotate', '+0+932', e[3], '-font', FR, '-pointsize', 28, '-fill', SK, '-gravity', 'south', '-annotate', '+0+40',
    e[4] + '  red1oon.github.io/bim-ootb/erp/sap_agent.zip  ·  MIT', os.path.join(C, '21_end.png')])
for x in os.listdir(C):
    if x.startswith('_'): os.remove(os.path.join(C, x))
NARR = ['02', '03', '04', '05', '07', '09', '11', '12', '13', '14', '16', '17', '18', '19', '20']
bg = subprocess.run(['convert', '-size', '10x10', 'xc:' + BG2, '-format', '%[fx:mean]', 'info:'], capture_output=True, text=True).stdout; bad = []
for x in NARR:
    pth = [y for y in os.listdir(C) if y.startswith(x + '_')][0]; m = subprocess.run(['convert', os.path.join(C, pth), '-crop', '1920x230+0+850', '-format', '%[fx:mean]', 'info:'], capture_output=True, text=True).stdout
    if m != bg: bad.append(pth + ':' + m)
say('§LANG cards=%d caption band %s' % (len(os.listdir(C)), 'OK (%d narrated cards empty)' % len(NARR) if not bad else 'FAIL ' + str(bad)))
if bad: sys.exit(3)
# ── voice (Edge, cached, retried; a refused line spoken phrase by phrase) ──
VOX = {'zh': {'F': 'zh-CN-XiaoxiaoNeural', 'M': 'zh-CN-YunxiNeural'}, 'th': {'F': 'th-TH-PremwadeeNeural', 'M': 'th-TH-NiwatNeural'}, 'ms': {'F': 'ms-MY-YasminNeural', 'M': 'ms-MY-OsmanNeural'}}[LANG]
CACHE = os.path.expanduser('~/.local/share/film_narration/cache_edge'); SR = 24000; os.makedirs(CACHE, exist_ok=True)
def tts(txt, voice):
    h = hashlib.sha1(('%s|%s|+0%%' % (txt, voice)).encode()).hexdigest(); w = os.path.join(CACHE, h + '.wav')
    if not os.path.exists(w):
        mp = w[:-4] + '.mp3'; ok = False
        for k in range(8):
            try: asyncio.run(asyncio.wait_for(edge_tts.Communicate(txt, voice, rate='+0%').save(mp), 40)); ok = True; break
            except Exception as ex: say('§EDGE retry %d %s' % (k + 1, str(ex)[:60])); time.sleep(1.5 * (k + 1))
        if ok:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp, '-ar', str(SR), '-ac', '1', w], check=True); os.remove(mp); say('§EDGE_CALL voice=%s chars=%d -> %s' % (voice, len(txt), h[:10]))
        else:
            if os.path.exists(mp): os.remove(mp)
            parts = [x for x in re.split(r'(?<=[。，！？；：])', txt) if x] if LANG == 'zh' else txt.split(' ')
            if len(parts) < 2: raise RuntimeError('§EDGE_FAIL voice=%s no audio for an unsplittable line: %r' % (voice, txt))
            gap = np.zeros(int(0.18 * SR), dtype=np.float32); out = []
            for i, ph in enumerate(parts):
                out.append(tts(ph, voice)); out.append(gap) if i < len(parts) - 1 else None
            sf.write(w, np.concatenate(out), SR); say('§EDGE_SPLIT voice=%s phrases=%d -> %s' % (voice, len(parts), h[:10]))
    a, _ = sf.read(w, dtype='float32'); idx = np.where(np.abs(a) > 0.004)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a
def voiced(t):
    for x, y in T.get('voice_sub', []): t = re.sub(r'\b%s\b' % re.escape(x), y, t)
    return t
ORDER = [('01_title.png', 5.0, None), ('02_trap.png', 0, '02'), ('03_open.png', 0, '03'), ('04_server.png', 0, '04'), ('05_guide.png', 0, '05'), ('06_act1.png', 3.6, None), ('07_agent.png', 0, '07'),
         ('08_act2.png', 3.6, None), ('09_login.png', 0, '09'), ('10_act3.png', 3.6, None), ('11_form.png', 0, '11'), ('12_summary.png', 0, '12'), ('13_done.png', 0, '13'), ('14_bp.png', 0, '14'),
         ('15_products.png', 3.0, None), ('16_found.png', 0, '16'), ('17_offline.png', 0, '17'), ('18_proof.png', 0, '18'), ('19_alpha.png', 0, '19'), ('20_notyet.png', 0, '20'), ('21_end.png', 7.0, None)]
LEAD, GAP, TAIL = 0.45, 0.38, 1.1; timeline, events, segs, t = [], [], [], 0.0
for cardf, hold, key in ORDER:
    if not key: segs.append((cardf, hold)); t += hold; continue
    pos = LEAD
    for spk, line in T['turns'][key]:
        cap = fill(line); a = tts(voiced(cap), VOX[spk])
        timeline.append((t + pos, a)); events.append((t + pos, t + pos + len(a) / SR, spk, cap)); pos += len(a) / SR + GAP
    dur = pos - GAP + TAIL; segs.append((cardf, dur)); t += dur
TOTAL = t; audio = np.zeros(int(TOTAL * SR) + SR, dtype=np.float32)
for t0, a in timeline: i = int(t0 * SR); audio[i:i + len(a)] += a
sf.write(os.path.join(W, 'voice.wav'), audio, SR)
lst = open(os.path.join(W, 'list.txt'), 'w')
for i, (cardf, dur) in enumerate(segs):
    o = os.path.join(W, 'seg%02d.mp4' % i)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-framerate', '30', '-t', '%.3f' % dur, '-i', os.path.join(C, cardf), '-vf', 'fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4,format=yuv420p' % max(0, dur - 0.4),
                    '-c:v', 'libx264', '-tune', 'stillimage', '-r', '30', o], check=True); lst.write("file '%s'\n" % o)
lst.close(); subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(W, 'list.txt'), '-c', 'copy', os.path.join(W, 'silent.mp4')], check=True)
def pieces(s):   # zh: cut at Chinese punctuation, then pack to <= 19 display units; a Latin word is ONE token (never split), a line never starts with closing punctuation
    if T['split'] != 'zh': return [s]
    wid = lambda x: sum(0.55 if ord(ch) < 0x2E80 else 1.0 for ch in x)
    toks = re.findall(r"[A-Za-z0-9][A-Za-z0-9.\-/_']*|\s+|.", s)
    CLOSE = '”’）》，。！？；：、'
    out, cur = [], ''
    for tk in toks:
        if cur and wid(cur) + wid(tk) > 19 and tk[0] not in CLOSE:
            out.append(cur.strip()); cur = ''
        cur += tk
        if tk in '。！？；' and wid(cur) >= 6: out.append(cur.strip()); cur = ''
    if cur.strip(): out.append(cur.strip())
    merged = []
    for p in out:
        if merged and wid(merged[-1]) + wid(p) <= 19 and not re.search('[。！？；]$', merged[-1]): merged[-1] += p
        else: merged.append(p)
    return merged
def ts(x): return '%d:%02d:%05.2f' % (int(x // 3600), int(x % 3600 // 60), x % 60)
head = open(os.path.join(HERE, '../../prompts/film_narration_ass_head.txt')).read().rstrip('\n').replace('DejaVu Sans', T['ass_font']) + '\n'
ass, npieces = head, 0
for a0, a1, spk, line in events:
    ps = pieces(line); tot = sum(len(p) for p in ps); cur = a0
    for p in ps:
        d = (a1 - a0) * len(p) / tot; ass += 'Dialogue: 0,%s,%s,%s,,0,0,0,,%s\n' % (ts(cur), ts(cur + d + (0.25 if p is ps[-1] else 0)), spk, p); cur += d; npieces += 1
open(os.path.join(W, 'captions.ass'), 'w').write(ass)
RAW = os.path.join(W, 'raw.mp4')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(W, 'silent.mp4'), '-i', os.path.join(W, 'voice.wav'), '-vf', 'ass=' + os.path.join(W, 'captions.ass'),
                '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-shortest', RAW], check=True)
def lufs(fn):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', fn, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
i0, _ = lufs(RAW); g = round(-16.0 - i0, 2)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', RAW, '-c:v', 'copy', '-af', 'volume=%sdB,alimiter=limit=0.84:level=false' % g, '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', OUT], check=True)
I, P = lufs(OUT); dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT], capture_output=True, text=True).stdout)
gaps = [round(events[i + 1][0] - events[i][1], 2) for i in range(len(events) - 1)]
say('§BUILD_DONE %s lang=%s duration=%.1fs integrated=%.1f LUFS peak=%.1f dBFS turns=%d caption_pieces=%d longest_silence_between_turns=%.1fs' % (OUT, LANG, dur, I, P, len(events), npieces, max(gaps)))
open(OUT[:-4] + '_narration.txt', 'w').write('How to escape from your SAP Business One — narration (%s). Numbers from scripts/film_sap_migration/out/rec/facts.json. Voices: Microsoft Edge TTS (cloud).\n\n' % LANG +
    '\n'.join('[%s] %s: %s' % (ts(a0), s, l) for a0, a1, s, l in events) + '\n')
open(os.path.join(HERE, 'out/build_%s.log' % LANG), 'w').write('\n'.join(LOG) + '\n')
