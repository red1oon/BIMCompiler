#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the zh / th / ms versions of "How to escape from your Odoo" (owner 2026-11-09). Same beats, shots and facts as the English build (build.py, cards.sh); every
#   on-screen text translated (lang_text.py) except program output and the ERP's own UI; numbers filled from out/rec/facts.json. Voices = Microsoft Edge TTS (CLOUD: the script text
#   is sent to Microsoft — the house choice for zh/th/ms, FILM_NARRATION.md PLAYBOOK; clips cached by text). Captions: zh/th cut into short single lines; ms voice says E-R-P / A-I,
#   the caption keeps ERP / AI. READ out/build_<lang>.log; exit codes are not evidence.   Run: venv/bin/python build_lang.py zh|th|ms [out.mp4]
import os, sys, json, re, hashlib, asyncio, subprocess, numpy as np, soundfile as sf, edge_tts
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from lang_text import L as LT, SVG_EN
HERE = os.path.dirname(os.path.abspath(__file__)); LANG = sys.argv[1]; T = LT[LANG]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser('~/Videos/How_to_escape_from_your_Odoo_%s_rc1.mp4' % LANG.upper())
if os.path.exists(OUT): print('§BUILD_REFUSED %s exists' % OUT); sys.exit(5)
C = os.path.join(HERE, 'out/cards_' + LANG); W = os.path.join(HERE, 'out/build_' + LANG); R = os.path.join(HERE, 'out/rec'); os.makedirs(C, exist_ok=True); os.makedirs(W, exist_ok=True)
LOG = []
def say(s): print(s, flush=True); LOG.append(s)
F = json.load(open(os.path.join(R, 'facts.json'))); msg = F['form_msg']; mig = lambda t: int(re.search(t + r' (\d+)', msg).group(1))
assert F['offline_proven'] is True and F['verify_chain'] == 'ok' and F['offline_requests'] == 0, 'a voiced claim is not proven by the recording'
N = dict(bp=mig('C_BPartner'), pr=mig('M_Product'), ev=mig('C_ElementValue'), il=mig('M_InventoryLine'), ops=F['commit_ops'], req=F['offline_requests'], vc=F['verify_chain'])
say('§LANG %s facts %s' % (LANG, json.dumps(N)))
fill = lambda s: s.format(**N)
FB, FR = T['font_b'], T['font_r']; MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
BG, BG2, CO, OW, SK, GR = '#0b0f17', '#0f172a', '#FF6B78', '#F3EEE8', '#7dd3fc', '#9aa4b2'
def im(args): subprocess.run(['convert'] + [str(a) for a in args], check=True)
def card(k, i): return fill(T['cards'][k][i])
def chapter(out, k):
    im(['-size', '1920x1080', 'xc:' + BG, '-gravity', 'center', '-font', FB, '-pointsize', 34, '-fill', CO, '-annotate', '+0-210', card(k, 0), '-pointsize', 110, '-fill', OW, '-annotate', '+0-60', card(k, 1),
        '-fill', CO, '-annotate', '+0+90', card(k, 2), '-font', FR, '-pointsize', 40, '-fill', OW, '-annotate', '+0+220', card(k, 3), os.path.join(C, out)])
def shot(out, src, label):
    im([os.path.join(R, src), '-resize', '1340x754', os.path.join(C, '_s.png')])
    im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', label, os.path.join(C, '_s.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite', os.path.join(C, out)])
# ── cards ──
chapter('01_title.png', 'c01')
c = T['cards']['c02']
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 46, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', c[0], '-fill', 'none', '-stroke', '#475569', '-strokewidth', 4,
    '-draw', 'roundrectangle 150,300 610,560 24,24', '-draw', 'roundrectangle 730,300 1190,560 24,24', '-draw', 'roundrectangle 1310,300 1770,560 24,24', '-stroke', CO, '-strokewidth', 6,
    '-draw', 'line 610,430 730,430', '-draw', 'line 1190,430 1310,430', '-stroke', 'none', '-gravity', 'north',
    '-font', FB, '-pointsize', 42, '-fill', OW, '-annotate', '-580+340', c[1], '-annotate', '+0+340', c[2], '-annotate', '+580+340', c[3],
    '-font', FR, '-pointsize', 30, '-fill', GR, '-annotate', '-580+415', c[4], '-annotate', '+0+415', c[5], '-annotate', '+580+415', c[7], '-annotate', '+0+460', c[6], '-annotate', '+580+460', c[8],
    '-font', FB, '-pointsize', 40, '-fill', CO, '-annotate', '+0+640', c[9], os.path.join(C, '02_trap.png')])
c = T['cards']['c03']
im([os.path.join(R, 'odoo_contacts.png'), '-resize', '900x506', os.path.join(C, '_a.png')]); im([os.path.join(R, 'bp_window.png'), '-resize', '900x506', os.path.join(C, '_b.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', c[0], os.path.join(C, '_a.png'), '-gravity', 'northwest', '-geometry', '+40+200', '-composite',
    os.path.join(C, '_b.png'), '-gravity', 'northwest', '-geometry', '+980+200', '-composite', '-font', FB, '-pointsize', 36, '-fill', OW, '-gravity', 'northwest', '-annotate', '+40+140', c[1], '-annotate', '+980+140', c[2], os.path.join(C, '03_beforeafter.png')])
chapter('04_act1.png', 'c04')
lines = [l.rstrip('\n').replace('🟢 ', '').replace('§ODOO-EXPORT ', '') for l in open(os.path.join(HERE, 'out/export/term_lines.txt'))]
keep = [l for l in lines if l.startswith('sheet=')][:17] + [l for l in lines if l.strip().startswith('✓')] + [l for l in lines if 'PASS' in l]
a = ['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+30', card('c05', 0), '-fill', '#111827', '-stroke', '#334155',
     '-draw', 'roundrectangle 160,110 1760,845 14,14', '-stroke', 'none', '-gravity', 'northwest', '-font', MONO, '-pointsize', 28, '-fill', SK, '-annotate', '+190+128', '$ node export.js']
y = 172
for l in keep: a += ['-pointsize', 22, '-fill', '#86efac' if ('PASS' in l or l.strip().startswith('✓')) else '#e5e7eb', '-annotate', '+190+%d' % y, l[:118]]; y += 30
im(a + [os.path.join(C, '05_export.png')])
chapter('06_act2.png', 'c06'); shot('07_login.png', 'login_newco.png', card('c07', 0)); chapter('08_act3.png', 'c08')
shot('09_form.png', 'form_units.png', card('c09', 0)); shot('10_summary.png', 'form_summary.png', card('c10', 0)); shot('11_done.png', 'form_done.png', card('c11', 0))
shot('12_bp.png', 'bp_window.png', card('c12', 0)); shot('13_products.png', 'product_window.png', card('c13', 0)); chapter('14_local.png', 'c14')
im([os.path.join(R, 'offline_saved.png'), '-resize', '1340x754', os.path.join(C, '_o.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 42, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', card('c15', 0), os.path.join(C, '_o.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite',
    '-fill', '#b91c1cdd', '-draw', 'roundrectangle 330,120 1090,190 14,14', '-font', FB, '-pointsize', 32, '-fill', 'white', '-gravity', 'northwest', '-annotate', '+350+135', card('c15', 1), os.path.join(C, '15_offline.png')])
im([os.path.expanduser('~/bim-ootb/erp/guide_img/team_panel_before.png'), '-resize', 'x700', os.path.join(C, '_t.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 42, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', card('c16', 0), os.path.join(C, '_t.png'), '-gravity', 'north', '-geometry', '+0+110', '-composite',
    '-font', FR, '-pointsize', 30, '-fill', GR, '-gravity', 'northeast', '-annotate', '+60+380', card('c16', 1), '-annotate', '+60+420', 'youtu.be/-LQwoPuQ1QU', os.path.join(C, '16_team.png')])
c = [fill(x) for x in T['cards']['c17']]
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', c[0], '-font', FB, '-pointsize', 60, '-fill', OW, '-gravity', 'northwest',
    '-annotate', '+260+200', c[1], '-annotate', '+260+320', c[2], '-annotate', '+260+440', c[3], '-annotate', '+260+540', c[4], '-font', FR, '-pointsize', 36, '-fill', GR, '-annotate', '+260+680', c[5], '-annotate', '+260+740', c[6], os.path.join(C, '17_proof.png')])
c = T['cards']['c18']
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', c[0], '-font', FB, '-pointsize', 54, '-fill', OW, '-annotate', '+0+220', c[1],
    '-annotate', '+0+320', c[2], '-annotate', '+0+420', c[3], '-font', FR, '-pointsize', 34, '-fill', GR, '-annotate', '+0+560', c[4], os.path.join(C, '18_anyerp.png')])
c = T['cards']['c19']
im(['-size', '1920x1080', 'xc:' + BG2, '-font', FB, '-pointsize', 34, '-fill', CO, '-gravity', 'north', '-annotate', '+0+70', c[0], '-font', FB, '-pointsize', 62, '-fill', OW, '-annotate', '+0+140', c[1],
    '-font', FR, '-pointsize', 44, '-fill', OW, '-gravity', 'northwest', '-annotate', '+360+320', c[2], '-annotate', '+360+410', c[3], '-annotate', '+360+500', c[4], '-font', FR, '-pointsize', 32, '-fill', GR,
    '-gravity', 'north', '-annotate', '+0+640', c[5], os.path.join(C, '19_notyet.png')])
# the closing card: the NEURO §21.1 diagram with its 26 labels translated (font swapped to the language's), then the card
svg = open(os.path.join(HERE, 'cards/src/actor_layer_one_door.svg')).read(); n = 0
for en, tr in zip(SVG_EN, T['svg']):
    svg, k = re.subn(r'(<text[^>]*>)' + re.escape(en) + r'(</text>)', lambda m: m.group(1) + tr + m.group(2), svg, count=1); n += k
fam = T['ass_font']; svg = re.sub(r'font-family="[^"]*"', 'font-family="%s"' % fam, svg); svg = re.sub(r"font-family:[^;\"']*", 'font-family:' + fam, svg)
open(os.path.join(W, 'diagram.svg'), 'w').write(svg); say('§LANG diagram labels translated=%d/%d font=%s' % (n, len(SVG_EN), fam))
subprocess.run(['node', os.path.join(HERE, 'svg2png.js'), os.path.join(W, 'diagram.svg'), os.path.join(W, 'diagram.png'), '1900'], check=True)   # a browser draws it (ImageMagick's MSVG dropped the fills)
im([os.path.join(W, 'diagram.png'), '-resize', '1180x', '-bordercolor', 'white', '-border', 24, os.path.join(C, '_d.png')])
c = T['cards']['c20']
im(['-size', '1920x1080', 'xc:' + BG, '-font', FB, '-pointsize', 32, '-fill', CO, '-gravity', 'north', '-annotate', '+0+52', c[0], '-font', FB, '-pointsize', 60, '-fill', OW, '-annotate', '+0+96', c[1],
    os.path.join(C, '_d.png'), '-gravity', 'north', '-geometry', '+0+190', '-composite', '-font', FR, '-pointsize', 32, '-fill', OW, '-gravity', 'north', '-annotate', '+0+880', c[2],
    '-font', FB, '-pointsize', 30, '-fill', CO, '-annotate', '+0+932', c[3], '-font', FR, '-pointsize', 28, '-fill', SK, '-gravity', 'south', '-annotate', '+0+40',
    c[4] + '  ·  red1oon.github.io/BIMCompiler/OdooMigrationGuide  ·  MIT', os.path.join(C, '20_end.png')])
for f in os.listdir(C):
    if f.startswith('_'): os.remove(os.path.join(C, f))
bg = subprocess.run(['convert', '-size', '10x10', 'xc:' + BG2, '-format', '%[fx:mean]', 'info:'], capture_output=True, text=True).stdout; bad = []
for f in ['02', '03', '05', '07', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19']:
    p = [x for x in os.listdir(C) if x.startswith(f + '_')][0]; m = subprocess.run(['convert', os.path.join(C, p), '-crop', '1920x230+0+850', '-format', '%[fx:mean]', 'info:'], capture_output=True, text=True).stdout
    if m != bg: bad.append(p + ':' + m)
say('§LANG cards=%d caption band %s' % (len(os.listdir(C)), 'OK (14 narrated cards empty)' if not bad else 'FAIL ' + str(bad)))
if bad: sys.exit(3)
# ── voice (Edge, cached) ──
VOX = {'zh': {'F': 'zh-CN-XiaoxiaoNeural', 'M': 'zh-CN-YunxiNeural'}, 'th': {'F': 'th-TH-PremwadeeNeural', 'M': 'th-TH-NiwatNeural'}, 'ms': {'F': 'ms-MY-YasminNeural', 'M': 'ms-MY-OsmanNeural'}}[LANG]
CACHE = os.path.expanduser('~/.local/share/film_narration/cache_edge'); SR = 24000
def tts(txt, voice):
    h = hashlib.sha1(('%s|%s|+0%%' % (txt, voice)).encode()).hexdigest(); w = os.path.join(CACHE, h + '.wav')
    if not os.path.exists(w):
        mp = w[:-4] + '.mp3'; ok = False
        for k in range(8):   # Premwadee answers "No audio" intermittently (same text ok one call, refused the next) — retry with backoff
            try: asyncio.run(asyncio.wait_for(edge_tts.Communicate(txt, voice, rate='+0%').save(mp), 40)); ok = True; break
            except Exception as e: say('§EDGE retry %d %s' % (k + 1, str(e)[:60])); __import__('time').sleep(1.5 * (k + 1))
        if ok:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp, '-ar', str(SR), '-ac', '1', w], check=True); os.remove(mp); say('§EDGE_CALL voice=%s chars=%d -> %s' % (voice, len(txt), h[:10]))
        else:
            # measured 2026-11-09: th-TH-PremwadeeNeural returns "No audio" for one whole line 3/3 times (and intermittently for short ones), yet voices each of its space-separated
            # phrases (Niwat voices the whole line). Same voice, same words: say the phrases one by one with a short pause where the text has its space.
            if os.path.exists(mp): os.remove(mp)
            parts = txt.split(' ')
            if len(parts) < 2: raise RuntimeError('§EDGE_FAIL voice=%s no audio for an unsplittable line: %r' % (voice, txt))
            gap = np.zeros(int(0.18 * SR), dtype=np.float32); out = []
            for i, ph in enumerate(parts):
                out.append(tts(ph, voice))
                if i < len(parts) - 1: out.append(gap)
            sf.write(w, np.concatenate(out), SR); say('§EDGE_SPLIT voice=%s phrases=%d (whole line gave no audio) -> %s' % (voice, len(parts), h[:10]))
    a, _ = sf.read(w, dtype='float32'); idx = np.where(np.abs(a) > 0.004)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a
def voiced(t):
    for a, b in T.get('voice_sub', []): t = re.sub(r'\b%s\b' % a, b, t)
    return t
ORDER = [('01_title.png', 5.0, None), ('02_trap.png', 0, '02'), ('03_beforeafter.png', 0, '03'), ('04_act1.png', 3.6, None), ('05_export.png', 0, '05'), ('06_act2.png', 3.6, None),
         ('07_login.png', 0, '07'), ('08_act3.png', 3.6, None), ('09_form.png', 0, '09'), ('10_summary.png', 0, '10'), ('11_done.png', 0, '11'), ('12_bp.png', 0, '12'), ('13_products.png', 0, '13'),
         ('14_local.png', 3.6, None), ('15_offline.png', 0, '15'), ('16_team.png', 0, '16'), ('17_proof.png', 0, '17'), ('18_anyerp.png', 0, '18'), ('19_notyet.png', 0, '19'), ('20_end.png', 7.0, None)]
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
# captions: zh cut at Chinese punctuation (<= 20 chars), th at spaces (<= 34 chars); each piece gets its share of the turn's time by length
def pieces(s):
    if T['split'] == 'zh':
        parts, cur = [], ''
        for ch in s:
            cur += ch
            if ch in '。！？；，：、' and len(cur) >= 6: parts.append(cur); cur = ''
        if cur: parts.append(cur)
        out = []
        for p in parts:
            while len(p) > 20: out.append(p[:20]); p = p[20:]
            if out and len(out[-1]) + len(p) <= 20 and not re.search('[。！？]$', out[-1]): out[-1] += p
            else: out.append(p)
        return out
    if T['split'] == 'th':
        out, cur = [], ''
        for wd in s.split(' '):
            if cur and len(cur) + 1 + len(wd) > 34: out.append(cur); cur = wd
            else: cur = (cur + ' ' + wd).strip()
        if cur: out.append(cur)
        return out
    return [s]
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
def lufs(f):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
i0, _ = lufs(RAW); g = round(-16.0 - i0, 2)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', RAW, '-c:v', 'copy', '-af', 'volume=%sdB,alimiter=limit=0.84:level=false' % g, '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', OUT], check=True)
I, P = lufs(OUT); dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT], capture_output=True, text=True).stdout)
gaps = [round(events[i + 1][0] - events[i][1], 2) for i in range(len(events) - 1)]
say('§BUILD_DONE %s lang=%s duration=%.1fs integrated=%.1f LUFS peak=%.1f dBFS turns=%d caption_pieces=%d longest_silence_between_turns=%.1fs' % (OUT, LANG, dur, I, P, len(events), npieces, max(gaps)))
open(OUT[:-4] + '_narration.txt', 'w').write('How to escape from your Odoo — narration (%s). Numbers from scripts/film_odoo_migration/out/rec/facts.json. Voices: Microsoft Edge TTS (cloud).\n\n' % LANG +
    '\n'.join('[%s] %s: %s' % (ts(a0), s, l) for a0, a1, s, l in events) + '\n')
open(os.path.join(HERE, 'out/build_%s.log' % LANG), 'w').write('\n'.join(LOG) + '\n')
