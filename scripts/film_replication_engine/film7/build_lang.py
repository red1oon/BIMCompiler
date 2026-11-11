#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film7 v2 LANGUAGE builder (zh|th|ms): reuses build7.py with the translated beat table (beats_v2_lang.py); video timings are the EN v2 plan (same beats, same frames); Edge TTS fit. READ every §FILM-MA-LANG log line.
# usage: build_lang.py <lang> <prep|assets|video|fit|mux> <builddir>     (CPU only; Edge TTS sends the narration text — no private data — to Microsoft; clips cached)
import sys, os, json, re, shutil, types, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
LANG, STAGE, B = sys.argv[1], sys.argv[2], sys.argv[3].rstrip('/')
EN = '/home/red1/bim-compiler/build/film_migrating_accounting'; ENB = f'{EN}/v2b'
import beats_v2_lang as BL
ALPHA, ITEMS, CLOSING, CFG = BL.build(LANG)
ad = types.ModuleType('beats7'); ad.ALPHA = ALPHA; ad.ITEMS = [i for i in ITEMS if not i[2].get('waits')]; sys.modules['beats7'] = ad
sys.argv = ['build7.py', STAGE, B]
import build7
build7.FONT, build7.FONTB = CFG['font'], CFG['fontb']
_label = build7.label
def label(text, out, size, color, bold=True, width=None):   # CJK/Thai glyph lines are wider than Latin: shrink the pointsize until the line fits the 1760 px safe width
    if out.endswith('_st.png') and LANG != 'ms': size = int(size * 0.88)   # CJK/Thai glyph boxes are taller: keep the strip clear of the subtitle band
    _label(text, out, size, color, bold, width)
    if width is None:
        w = int(build7.sh('identify', '-format', '%w', out))
        if w > 1760: _label(text, out, int(size * 1760 / w), color, bold, width); print(f'§FILM-MA-LANG label shrunk {size}->{int(size*1760/w)} for "{text[:20]}"')
build7.label = label
build7.spoken = BL.make_spoken(LANG, build7.FACTS)
PLAN = json.load(open(f'{ENB}/plan_video.json'))
def plan_frames():   # EN v2 frame counts, beat by beat: the SAME recorded beats
    out = []
    for kind, name, d in ad.ITEMS:
        fr = round(d['dur'] * build7.FPS) if kind == 'card' else round((PLAN['windows'][name][1] - PLAN['windows'][name][0]) * build7.FPS)
        out.append((name, fr, kind))
    return out
build7.plan_frames = plan_frames
def prep():
    os.makedirs(B, exist_ok=True)
    if not os.path.exists(f'{B}/rec'): os.symlink(f'{ENB}/rec', f'{B}/rec')
    for f in ('facts7.resolved.json', 'record.log', 'twin2.log', 'trade.log', 'order.log', 'forbidden.txt'): shutil.copy(f'{ENB}/{f}', B)
    print(f'§FILM-MA-LANG prep {LANG} ok')
def fit():
    W = f'{B}/fit1'; os.makedirs(W, exist_ok=True); shutil.copy(f'{build7.PROMPTS}/film_narration_ass_head.txt', f'{W}/ass_head.txt')
    P = json.load(open(f'{B}/plan_video.json')); build7.tsv(f'{W}/film.tsv', {k: tuple(v) for k, v in P['windows'].items()})
    env = dict(os.environ, FILM_SEC=str(P['frames'] / P['fps']), FIT_MAXSPEED='1.0' if LANG == 'th' else '1.10', FIT_BASE='0.90' if LANG == 'th' else '1.0')   # Thai: tonal, never faster than the voice's natural pace; slowed 10 % so it fills the same beats
    out = subprocess.run([build7.VENV, f'{build7.PROMPTS}/film_narration_fit_edge.py', 'film.tsv', 'film', LANG], cwd=W, env=env, capture_output=True, text=True)
    open(f'{B}/fit.log', 'w').write(out.stdout + out.stderr)
    ass = open(f'{W}/film.ass').read(); ass = re.sub(r'(Dialogue: 0,[^\n]*,Credit,,0,0,0,,)[^\n]*', lambda m: m.group(1) + CFG['cr'], ass); open(f'{W}/film.ass', 'w').write(ass)
    rows = re.findall(r'§NARR_FIT (\S+) cue=(\S+) room=(\S+) dur=(\S+) -> (.+?) slack=(\S+)', out.stdout)
    for r in rows: print(f'§FILM-MA-LANG fit {r[0]} room={r[2]} dur={r[3]} pick={r[4]} slack={r[5]}')
    bad = [r[0] for r in rows if not r[4].startswith('DETAIL')]
    print(f'§FILM-MA-LANG fit-summary {LANG} rows={len(rows)} not_detail={bad}'); print(out.stderr[-600:])
def mux():
    build7.mux()
if STAGE == 'prep': prep()
elif STAGE == 'fit': fit()
elif STAGE == 'mux': mux()
else: {'assets': build7.assets, 'video': build7.video}[STAGE]()
