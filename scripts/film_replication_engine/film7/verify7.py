#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film7 verdict. READ the §FILM-MA-CHECK lines; the exit code is not evidence. Prints §FILM-MA-VERDICT PASS judged=N | FAIL | INCONCLUSIVE (nothing judged).
# usage: verify7.py <builddir>
import sys, os, re, json, subprocess, glob
import beats7
B = sys.argv[1]; judged = 0; fails = 0
def chk(key, ok, info=''):
    global judged, fails
    judged += 1; fails += 0 if ok else 1
    print(f"§FILM-MA-CHECK {key} {'OK' if ok else 'FAIL'} {info}")
def run(*a): return subprocess.run(a, capture_output=True, text=True)
FACTS = json.load(open(f'{B}/facts7.resolved.json'))
P = json.load(open(f'{B}/plan_video.json')); OUT = f'{B}/Migrating_Legacy_Accounting_EN.mp4'
# A. every placeholder is a resolved fact with a src line
used = set()
for kind, name, d in beats7.ITEMS:
    txt = ' '.join([d.get('short', ''), d.get('detail', ''), d.get('strip', '')] + (d['image'][1] if d.get('image') and d['image'][0] == 'card' else []))
    used |= set(re.findall(r'\{(?:fact:)?([a-z0-9_]+)\}', txt))
for f in sorted(used):
    chk(f'fact:{f}', f in FACTS and bool(FACTS[f].get('src')), FACTS.get(f, {}).get('src', 'MISSING'))
# provenance file lists every used fact
prov = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PROVENANCE7.md')).read() if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PROVENANCE7.md')) else ''
chk('provenance-covers-facts', all(f in prov for f in used), f'{len(used)} facts')
# B. typed digits: none in voiced lines; planted control must be caught
rx = lambda t: bool(re.search(r'\d', re.sub(r'\{[^}]*\}', '', t)))
voiced = [d[k] for kind, n, d in beats7.ITEMS if kind == 'beat' for k in ('short', 'detail')]
chk('no-typed-digit-in-voice', not any(rx(t) for t in voiced), f'{len(voiced)} lines')
chk('planted-number-control', rx('M: we moved 42 invoices') and not rx('M: we moved {fact:odoo_open_docs} invoices'), 'planted digit caught, placeholder passes')
# C. audio fits video
fit = open(f'{B}/fit.log').read(); rows = re.findall(r'§NARR_FIT (\S+) cue=(\S+) room=(\S+) dur=(\S+) -> (\S+) slack=(\S+)', fit)
nb = sum(1 for k, _, _ in beats7.ITEMS if k == 'beat')
chk('fit-rows', len(rows) == nb, f'{len(rows)}/{nb}')
for r in rows: chk(f'fit:{r[0]}', r[4].startswith('DETAIL') and float(r[5]) >= 0, f'pick={r[4]} dur={r[3]} room={r[2]} slack={r[5]}')
tone = re.findall(r'§NARR_TONE .*?(OK|WRONG)', fit); chk('tone-no-WRONG', len(tone) > 0 and 'WRONG' not in tone, f'{len(tone)} chunks, wrong={tone.count("WRONG")}')
plan = [l.split('\t') for l in open(f'{B}/fit1/film_plan.tsv').read().split('\n') if l]
for i, cue, f in plan:
    dur = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(B, 'fit1', f.strip())).stdout.strip())
    end = P['windows'][i][1]; chk(f'clip-in-window:{i}', float(cue) + dur <= end + 1e-6, f'cue={float(cue):.2f}+dur={dur:.2f}={float(cue)+dur:.2f} <= beat end {end:.2f}')
# D. frames / duration
def frames(p): return int(run('ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', p).stdout.strip())
fs, fo = frames(f'{B}/silent.mp4'), frames(OUT)
chk('frames-silent', fs == P['frames'], f'{fs} vs expected {P["frames"]}'); chk('frames-final=silent', fo == fs, f'{fo} vs {fs}')
dd = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT).stdout.strip()); chk('duration', abs(dd - P['frames'] / P['fps']) < 0.15, f'{dd:.2f}s vs {P["frames"]/P["fps"]:.2f}s')
# E. silences
sd = run('ffmpeg', '-hide_banner', '-nostats', '-i', OUT, '-af', 'silencedetect=n=-40dB:d=4', '-vn', '-f', 'null', '-').stderr
sil = [float(x) for x in re.findall(r'silence_duration: ([\d.]+)', sd)]; print('§FILM-MA-SILENCES >=4s:', sil)
chk('silence-longest<=7.5', (max(sil) if sil else 0) <= 7.5, f'longest={max(sil) if sil else 0:.2f}s count={len(sil)} (closing card 7.0 s + limits card 6.0 s are designed-silent)')
# F. loudness
eb = run('ffmpeg', '-hide_banner', '-nostats', '-i', OUT, '-af', 'ebur128=peak=true', '-vn', '-f', 'null', '-').stderr; I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', eb)[-1]); chk('loudness', abs(I + 16) <= 1.5, f'I={I} LUFS')
# G. forbidden names (voice, captions, beat table, build scripts)
# forbidden terms live in an UNTRACKED file (<builddir>/forbidden.txt: the owner's private-name rule + the Civil Works naming rule): this public script spells none of them
FT = [t.strip() for t in open(f'{B}/forbidden.txt').read().split() if t.strip()]; chk('forbidden-list-loaded', len(FT) > 0, f'{len(FT)} terms')
FORB = re.compile('|'.join(map(re.escape, FT)), re.I); scanned = [f'{B}/fit1/film.tsv', f'{B}/fit1/film.ass', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'beats7.py')]
for s in scanned: chk(f'no-forbidden:{os.path.basename(s)}', not FORB.search(open(s).read()), 'forbidden.txt terms')
# H. subtitle band empty on every beat picture
bad = 0
for kind, n, d in beats7.ITEMS:
    if kind == 'beat':
        m = float(run('convert', f'{B}/img/{n}.png', '-crop', '1920x230+0+850', '-colorspace', 'Gray', '-format', '%[fx:maxima-minima]', 'info:').stdout); bad += m > 0.001
chk('subtitle-band-empty', bad == 0, f'{nb} pictures, nonblank={bad}')
# I. page errors / sources
chk('pageerr', FACTS['pageerr']['value'] == '0', 'pageerror events in the recording')
print(f"§FILM-MA-VERDICT {'INCONCLUSIVE' if not judged else 'FAIL' if fails else 'PASS'} judged={judged} failed={fails}")
sys.exit(0 if judged and not fails else 1)
