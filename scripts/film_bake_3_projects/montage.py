# ⚠ DO NOT REMOVE — scope: owner 2026-11-23: "cut out the unventful parts including slow end camera pull away and combine them together
#   With cards 'Bake of 3 projects', and for each project credentials" + "narrate male only voice sparingly that each project behaves
#   according to abstract code without customization". READ THE LOG (montage.log): §MONTAGE_* lines.
# SPEC
#   CUT (per film, from its own bake log, never by eye):
#     N = §MAXQ_START frames, fps 24. topF = round(§CPE_BUILDUP_TOPOUT topoutU * N) = the frame the build completes.
#     KEEP A = [0, topF + 2 s)  — the build-up and the 2 s the ledger/cost rows lock at topout; the closing pull-away after it is cut.
#     KEEP B = §ESCAPE_ROUTE_WINDOW film=[u0,u1] * N, only when §ESCAPE_ROUTE_BUILD did not FAIL (the route is the one event in the pull-away).
#   SUPERSEDED (owner, later the same day): no cuts — every film is spliced WHOLE (its end orbit carries the full schedule/resource panel).
#   FACTS on the cards: pieces = §CPE_BUILDUP placed=../N total; tasks + days = §AUTHOR_TPL; commit = §CLI_BAKE_ENV; template = §AUTHOR_TPL v=.
#     A fact missing from a log stops the run (§MONTAGE_FACT_MISSING), nothing is typed in.
#   VOICE: Kokoro am_michael (local CPU), one line per card, nothing over the build-up. Every claim in a line is a log value above
#     (same commit, same template version on all three = "no customization").
#   WITNESS: output frame count = sum of kept frames + card frames (ffprobe -count_frames); each clip starts on its card (§MONTAGE_VOICE).
import os, re, sys, json, subprocess, numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.expanduser('~/Videos'); FPS = 24
FILMS = json.loads(sys.argv[1])   # [{"key":"Shed","label":...,"mp4":...,"log":...}, ...]
OUT = sys.argv[2]
def say(s): print(s, flush=True)
def grab(txt, rx, name, key):
    m = re.search(rx, txt)
    if not m: say(f'§MONTAGE_FACT_MISSING {key} {name}'); sys.exit(2)
    return m
facts, segs = {'order': [f['key'] for f in FILMS]}, {}
for f in FILMS:
    t = open(f['log'], encoding='utf-8', errors='replace').read(); k = f['key']
    N0 = int(grab(t, r'§MAXQ_START frames=(\d+)', 'frames', k).group(1)); rv = re.findall(r'§MAXQ_START_REVISED frames=\d+→(\d+)', t); NL = int(rv[-1]) if rv else N0
    N = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f['mp4']], capture_output=True, text=True).stdout.strip())
    say(f'§MONTAGE_FRAMES {k} log={NL} (start={N0}, revised={rv[-1] if rv else "-"}) file={N} => {"PASS" if N == NL else "MISMATCH"}')
    if N != NL: sys.exit(4)
    tu = float(grab(t, r'§CPE_BUILDUP_TOPOUT topoutU=([\d.]+)', 'topout', k).group(1))
    at = grab(t, r'§AUTHOR_TPL schedule=\S+ v=(\S+) tasks=(\d+) .*?elements=(\d+) totalDays=(\d+)', 'author', k)
    pieces = int(re.findall(r'§CPE_BUILDUP frame=\d+/\d+ t=[\d.]+ cursor=\d+ placed=\d+/(\d+)', t)[-1])
    commit = grab(t, r'§CLI_BAKE_ENV root=\S+ commit=(\w+)', 'commit', k).group(1)
    topF = round(tu * N); keep = [(0, min(N, topF + 2 * FPS))]
    esc = re.search(r'§ESCAPE_ROUTE_WINDOW film=\[([\d.]+),([\d.]+)\]', t); escFail = re.search(r'§ESCAPE_ROUTE_BUILD (FAIL|VACUOUS)', t)
    if esc and not escFail:
        a, b = round(float(esc.group(1)) * N), round(float(esc.group(2)) * N)
        if a < keep[-1][1]: keep[-1] = (0, max(keep[-1][1], b))
        else: keep.append((a, min(N, b)))
    # owner 2026-11-23 (later): "Need not remove parts during splicing together as they give good full schedule resource info" — the WHOLE film is kept;
    # the cut above is computed and logged only, for reference.
    keep = [(0, N)]
    segs[k] = keep
    facts[k] = dict(label=f['label'], pieces=pieces, tasks=int(at.group(2)), days=int(at.group(4)), tpl=at.group(1), commit=commit, frames=N)
    say(f'§MONTAGE_CUT {k} N={N} topoutU={tu} topF={topF} keep={keep} escape={"built" if esc and not escFail else ("FAIL/VACUOUS" if escFail else "none")} '
        f'kept={sum(b-a for a,b in keep)}/{N}')
    say(f'§MONTAGE_FACTS {k} ' + json.dumps(facts[k]))
same = len({facts[k]['commit'] for k in facts['order']}) == 1 and len({facts[k]['tpl'] for k in facts['order']}) == 1
say(f'§MONTAGE_SAME_CODE commit={[facts[k]["commit"] for k in facts["order"]]} template={[facts[k]["tpl"] for k in facts["order"]]} => {"PASS" if same else "FAIL"}')
if not same: sys.exit(3)
for k in facts['order']:
    facts[k]['extra'] = f'Same viewer build ({facts[k]["commit"]}) and schedule template v{facts[k]["tpl"]} as the other two. No code written for this project.'
json.dump(facts, open(os.path.join(D, 'facts.json'), 'w'), indent=1)
r = subprocess.run(['python3', os.path.join(D, 'cards.py')], capture_output=True, text=True); say(r.stdout.strip() + r.stderr.strip()[-400:])
# ---- voice: one line per card
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split()
def W(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('-' + ONES[n % 10] if n % 10 else '')
    if n < 1000: return ONES[n // 100] + ' hundred' + (' and ' + W(n % 100) if n % 100 else '')
    return W(n // 1000) + ' thousand' + ((', ' if n % 1000 >= 100 else ' and ') + W(n % 1000) if n % 1000 else '')
LINES = {'title': 'Three projects, three different models. One code path, with nothing customised for any of them.'}
for k in facts['order']:
    x = facts[k]; w = W(x['pieces'])
    if not w: say(f'§MONTAGE_FACT_MISSING words for {x["pieces"]}'); sys.exit(2)
    D9 = W(x['days'])
    if not D9: say(f'§MONTAGE_FACT_MISSING words for days {x["days"]}'); sys.exit(2)
    Wc = w[0].upper() + w[1:]
    LINES[k] = {'Shed': f'The poultry barn. {Wc} pieces, scheduled in {D9} working days by the same template.',
                'JKR': f'A local Malaysian building. {Wc} pieces. The same rules decide what goes up first.',
                'Jebel': f'Jebel. {Wc} pieces, and still not one line of code written for it.'}[k]
from kokoro_onnx import Kokoro
KD = os.path.expanduser('~/.local/share/film_narration/kokoro/'); kk = Kokoro(KD + 'kokoro-v1.0.onnx', KD + 'voices-v1.0.bin')
clips = {}
for cid, line in LINES.items():
    a, sr = kk.create(line, voice='am_michael', speed=1.0, lang='en-us'); p = os.path.join(D, f'vo_{cid}.wav'); sf.write(p, a, sr)
    clips[cid] = (p, len(a) / sr); say(f'§MONTAGE_VOICE {cid} sec={len(a)/sr:.2f} text="{line}"')
# ---- assemble: card (voice + 0.8 s, min 3.5 s) then the kept pieces of that film
parts, i = [], 0
def card_part(cid, hold=None):
    dur = hold or max(3.5, clips[cid][1] + 1.0); p = os.path.join(D, f'p{len(parts):02d}_card_{cid}.mp4')
    audio = ['-i', clips[cid][0]] if cid in clips else ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-loop', '1', '-framerate', str(FPS), '-i', os.path.join(D, f'card_{cid}.png')] + audio + [
        '-filter_complex', f'[0:v]format=yuv420p,fade=in:0:8,fade=out:st={dur-0.35:.2f}:d=0.35[v];[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,adelay=400|400,apad,aresample=48000[a]',
        '-map', '[v]', '-map', '[a]', '-t', f'{dur:.3f}', '-r', str(FPS), '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ac', '2', '-ar', '48000', p], check=True)
    parts.append((p, round(dur * FPS)))
card_part('title')
for f in FILMS:
    k = f['key']; card_part(k)
    for a, b in segs[k]:
        n = b - a; p = os.path.join(D, f'p{len(parts):02d}_{k}_{a}_{b}.mp4')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f['mp4'], '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-filter_complex',
            f'[0:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,fade=in:0:6,fade=out:{n-8}:8[v]', '-map', '[v]', '-map', '1:a',
            '-t', f'{n/FPS:.4f}', '-r', str(FPS), '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ac', '2', '-ar', '48000', p], check=True)
        parts.append((p, n))
card_part('end', hold=9.0)
lst = os.path.join(D, 'concat.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p, _ in parts))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', OUT], check=True)
got = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', OUT], capture_output=True, text=True).stdout.strip())
want = sum(n for _, n in parts)
say(f'§MONTAGE_OUT {OUT} frames={got} expected={want} parts={len(parts)} sec={got/FPS:.1f} => {"PASS" if abs(got-want) <= len(parts) else "FAIL"}')
