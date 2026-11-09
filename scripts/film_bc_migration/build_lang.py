#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the language versions of "How to escape from your Business Central" (owner 2026-11-09: "Do the Mandarin version"). Same beats, shots and facts as the
#   English rc1 (cards.py, build.py); every on-screen word from lang_text.py, numbers filled from out/rec/facts.json; program text (code excerpt, §BC-ALPHA lines, demo rows, the ERP's
#   UI) stays as shot. Voices = Microsoft Edge TTS (CLOUD: the script text is sent to Microsoft — the house choice for zh/th/ms, FILM_NARRATION.md PLAYBOOK; clips cached by text,
#   retried, a refused line spoken phrase by phrase). zh captions cut at Chinese punctuation. READ out/build_<lang>.log; exit codes are not evidence.
# Run: ~/.local/share/film_narration/venv/bin/python build_lang.py zh [out.mp4]
import os, sys, json, re, hashlib, asyncio, subprocess, time, numpy as np, soundfile as sf, edge_tts
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from lang_text import L as LT
sys.path.insert(0, os.path.join(HERE, '../film_odoo_migration')); import importlib.util
_s = importlib.util.spec_from_file_location('odoo_lt', os.path.join(HERE, '../film_odoo_migration/lang_text.py')); OLT = importlib.util.module_from_spec(_s); _s.loader.exec_module(OLT)
LANG = sys.argv[1]; T = LT[LANG]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser('~/Videos/How_to_escape_from_your_Business_Central_%s_rc1.mp4' % LANG.upper())
if os.path.exists(OUT): print('§BUILD_REFUSED %s exists' % OUT); sys.exit(5)
C = os.path.join(HERE, 'out/cards_' + LANG); W = os.path.join(HERE, 'out/build_' + LANG); R = os.path.join(HERE, 'out/rec'); os.makedirs(C, exist_ok=True); os.makedirs(W, exist_ok=True)
LOG = []
def say(s): print(s, flush=True); LOG.append(s)
F = json.load(open(os.path.join(R, 'facts.json'))); msg = F['form_msg']; mig = lambda t: int(re.search(t + r' (\d+)', msg).group(1))
for k, ok in [('offline_proven', F['offline_proven'] is True), ('model_equals_source', F['model_equals_source'] is True), ('unit_suggested_pcs', F['unit_suggested_pcs'] == 'Each'),
              ('witness PASS', F['witness_verdict'][0] == 'PASS'), ('verify_chain', F['verify_chain'] == 'ok'), ('no leak', F['alpha_values_leaked'] == 0)]:
    if not ok: say('§LANG_REFUSED %s is not proven by the recording' % k); sys.exit(4)
dc = F['demo_counts']
N = dict(bp=mig('C_BPartner'), pr=mig('M_Product'), ev=mig('C_ElementValue'), il=mig('M_InventoryLine'), ops=F['commit_ops'], req=F['offline_requests'], vc=F['verify_chain'],
         tables=F['model_tables'], fields=F['model_fields'], rows=F['package_rows'], vals=F['alpha_values_checked'], leaked=F['alpha_values_leaked'],
         customers=dc['customers'], vendors=dc['vendors'], items=dc['items'], accounts=dc['accounts'])
say('§LANG %s facts %s' % (LANG, json.dumps(N)))
fill = lambda s: s.format(**N)
FB, FR = T['font_b'], T['font_r']; M = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'; BCAPPS = os.path.expanduser('~/.cache/bcapps/repo')
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
lic = open(os.path.join(BCAPPS, 'LICENSE')).read(); assert 'MIT License' in lic and 'Copyright (c) Microsoft Corporation' in lic
t = T['cards']['lic']
textcard('03_licence.png', t[0], [(M, 30, GR, 200, 130, 'MIT License  ·  Copyright (c) Microsoft Corporation'), (FB, 46, GN, 200, 220, t[1]), (FR, 40, OW, 240, 290, t[2]), (FR, 40, OW, 240, 350, t[3]),
  (FR, 40, OW, 240, 410, t[4]), (FB, 46, CO, 200, 510, t[5]), (FR, 40, OW, 240, 580, t[6]), (FR, 40, OW, 240, 640, t[7])])
src = open(os.path.join(BCAPPS, 'src/Layers/W1/BaseApp/Sales/Customer/Customer.Table.al')).read().split('\n')
ex = [l for l in src if re.match(r'^table 18 Customer', l)][:1] + [l for l in src if re.match(r'\s+field\((2|21|35); ', l)] + ['            ' + l.strip() for l in src if 'TableRelation = "Customer Posting Group"' in l][:1]
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', c('src', 0), '-fill', '#111827', '-stroke', '#334155', '-draw', 'roundrectangle 180,130 1740,420 14,14', '-stroke', 'none', os.path.join(C, '_code.png')])
a = [os.path.join(C, '_code.png'), '-gravity', 'northwest']
for i, l in enumerate(ex): a += ['-font', M, '-pointsize', 30, '-fill', '#e5e7eb', '-annotate', '+230+%d' % (170 + 48 * i), l.rstrip()[:90]]
im(a + ['-font', FB, '-pointsize', 62, '-fill', OW, '-gravity', 'north', '-annotate', '+0+500', c('src', 1), '-font', FR, '-pointsize', 40, '-fill', GR, '-annotate', '+0+600', c('src', 2),
        '-font', FB, '-pointsize', 40, '-fill', GN, '-annotate', '+0+670', c('src', 3), os.path.join(C, '04_source.png')])
cust = [[x[0], x[1], x[3], x[4]] for x in F['demo_customers']]
textcard('05_demo.png', c('demo', 0), [(FB, 40, OW, 300, 150, c('demo', 1)), (FR, 30, GR, 300, 225, c('demo', 2))] + [(M, 30, '#e5e7eb', 300, 300 + 50 * i, '%-7s %-22s %-11s %s' % tuple(r)) for i, r in enumerate(cust)] +
  [(FR, 30, GR, 300, 300 + 50 * len(cust) + 30, c('demo', 3))])
chapter('06_act1.png', 'act1')
p = T['cards']['pkg']
textcard('07_package.png', p[0], [(FR, 30, CO, 230, 200, p[1]), (M, 30, OW, 420, 200, 'CONTOSO-ALPHA    Customer    18'), (FR, 26, GR, 1110, 204, p[4]), (FR, 30, CO, 230, 290, p[2]),
  (M, 30, SK, 420, 290, 'No.      Name                  Post Code   Country/Region Code'), (FR, 26, GR, 1690, 294, p[5]), (FR, 30, CO, 230, 360, p[3])] +
  [(M, 30, '#e5e7eb', 420, 360 + 46 * i, '%-8s %-21s %-11s %s' % tuple(r)) for i, r in enumerate(cust)] + [(FR, 32, GR, 260, 640, p[6])])
chapter('08_act2.png', 'act2'); shot('09_login.png', 'login_newco.png', 'login'); chapter('10_act3.png', 'act3')
shot('11_form.png', 'form_units.png', 'form'); shot('12_summary.png', 'form_summary.png', 'summary'); shot('13_done.png', 'form_done.png', 'done')
shot('14_bp.png', 'bp_window.png', 'bp'); shot('15_products.png', 'product_window.png', 'products')
f = T['cards']['found']
textcard('16_found.png', f[0], [(FB, 46, CO, 220, 170, '1'), (FB, 42, OW, 290, 170, f[1]), (FR, 34, GR, 290, 235, f[2]), (FR, 34, GR, 290, 285, f[3]),
  (FB, 46, CO, 220, 400, '2'), (FB, 42, OW, 290, 400, f[4]), (FR, 34, GR, 290, 465, f[5]), (FR, 34, GR, 290, 515, f[6])])
im([os.path.join(R, 'offline_saved.png'), '-resize', '1340x754', os.path.join(C, '_o.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', c('offline', 0), os.path.join(C, '_o.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite',
    '-fill', '#b91c1cdd', '-draw', 'roundrectangle 330,120 1010,190 14,14', '-font', FB, '-pointsize', 34, '-fill', 'white', '-gravity', 'northwest', '-annotate', '+350+133', c('offline', 1), os.path.join(C, '17_offline.png')])
textcard('18_proof.png', c('proof', 0), [(FB, 64, OW, 260, 200, c('proof', 1)), (FB, 64, OW, 260, 320, c('proof', 2)), (FB, 64, OW, 260, 440, c('proof', 3)), (FB, 64, OW, 260, 540, c('proof', 4)),
  (FR, 38, GR, 260, 680, c('proof', 5)), (FR, 38, GR, 260, 740, c('proof', 6))])
al = [l for l in F['alpha_lines'] if re.match(r'§BC-ALPHA (table=(18|23|27|15) |sheet=0[59]|refused|renamed|patch M_Product\.M_Product_Category)', l)][:10]
textcard('19_alpha.png', c('alpha', 0), [(M, 26, '#e5e7eb', 200, 130 + 44 * i, l[:105]) for i, l in enumerate(al)] + [(FB, 38, GN, 200, 130 + 44 * len(al) + 40, c('alpha', 1))])
n = T['cards']['notyet']
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 34, '-fill', CO, '-gravity', 'north', '-annotate', '+0+70', n[0], '-font', FB, '-pointsize', 64, '-fill', OW, '-annotate', '+0+140', n[1],
    '-font', FR, '-pointsize', 46, '-fill', OW, '-gravity', 'northwest', '-annotate', '+360+300', n[2], '-annotate', '+360+380', n[3], '-annotate', '+360+460', n[4], '-annotate', '+360+540', n[5],
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
    e[4] + '  red1oon.github.io/BIMCompiler/BusinessCentralMigrationGuide  ·  MIT', os.path.join(C, '21_end.png')])
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
ORDER = [('01_title.png', 5.0, None), ('02_trap.png', 0, '02'), ('03_licence.png', 0, '03'), ('04_source.png', 0, '04'), ('05_demo.png', 0, '05'), ('06_act1.png', 3.6, None), ('07_package.png', 0, '07'),
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
open(OUT[:-4] + '_narration.txt', 'w').write('How to escape from your Business Central — narration (%s). Numbers from scripts/film_bc_migration/out/rec/facts.json. Voices: Microsoft Edge TTS (cloud).\n\n' % LANG +
    '\n'.join('[%s] %s: %s' % (ts(a0), s, l) for a0, a1, s, l in events) + '\n')
open(os.path.join(HERE, 'out/build_%s.log' % LANG), 'w').write('\n'.join(LOG) + '\n')
