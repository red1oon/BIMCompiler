# assemble.py <recdir> <plan.py> <outdir>: cut kept ranges from the two recordings (aligned by the sync pulse), compose User A | User B on bg.png,
# add cards, concat to <outdir>/silent.mp4 (25 fps, 1920x1080), and write <outdir>/timeline.json (beats, ranges, final times) for the script + ASS overlays.
import sys, os, json, subprocess, importlib.util
rec, planf, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
spec = importlib.util.spec_from_file_location('plan', planf); plan = importlib.util.module_from_spec(spec); spec.loader.exec_module(plan)
V = json.load(open(rec + '/videos.json')); C = json.load(open(rec + '/cues.json')); SY = json.load(open(rec + '/sync.json'))
cm = {}
for x in C['cues']: cm[x['name']] = x['t']
FPS = 25
def vt(w, t): return SY[w]['white'] + (t - cm['pulse_white'])
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); sys.exit('ffmpeg failed')
clips = []; timeline = []; cur = 0   # cur = frame counter
def add_clip(path, nframes): clips.append(path); return nframes
for ii, item in enumerate(plan.ITEMS):
    start = cur; kept = []
    if item['type'] == 'card':
        n = int(round(item['sec'] * FPS)); p = f'{out}/c_{os.path.basename(item["png"])}_{n}.mp4'
        if not os.path.exists(p): run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', item['png'], '-frames:v', str(n), '-r', str(FPS), '-c:v', 'libx264', '-crf', '14', '-preset', 'ultrafast', '-g', '25', '-pix_fmt', 'yuv420p', p])
        clips.append(p); cur += n
    else:
        for ri, rg in enumerate(item['ranges']):
            a, b = rg[0], rg[1]; sp = rg[2] if len(rg) > 2 else 1
            t1 = cm[a[0]] + a[1]; t2 = cm[b[0]] + b[1]; assert t2 > t1, (a, b, t1, t2); n = int(round((t2 - t1) / sp * FPS)); p = f'{out}/s_{int(t1*1000)}_{n}_{sp}.mp4'
            if not os.path.exists(p):
                run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{vt("A", t1):.3f}', '-i', V['A'], '-ss', f'{vt("B", t1):.3f}', '-i', V['B'], '-loop', '1', '-i', 'bg.png',
                     '-filter_complex', f'[0:v]setpts=PTS/{sp},fps={FPS},scale=960:640,setsar=1[a];[1:v]setpts=PTS/{sp},fps={FPS},scale=960:640,setsar=1[b];[2:v]format=yuv420p[bg];[bg][a]overlay=0:70:shortest=1[x];[x][b]overlay=960:70:shortest=1,format=yuv420p',
                     '-frames:v', str(n), '-r', str(FPS), '-c:v', 'libx264', '-crf', '14', '-preset', 'ultrafast', '-g', '25', p])
            clips.append(p); kept.append({'t1': t1, 't2': t2, 'f0': cur, 'n': n, 'sp': sp, 'a': a[0]}); cur += n
    timeline.append({'id': item.get('id', f'i{ii}'), 'type': item['type'], 'tag': item.get('tag'), 'start': start / FPS, 'end': cur / FPS, 'frames': cur - start, 'kept': kept, 'note': item.get('note')})
open(out + '/concat.txt', 'w').write(''.join(f"file '{os.path.abspath(c)}'\n" for c in clips))
run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', out + '/concat.txt', '-c', 'copy', out + '/silent.mp4'])
json.dump({'total_frames': cur, 'fps': FPS, 'items': timeline}, open(out + '/timeline.json', 'w'), indent=1)
print('§ASSEMBLE total_frames=%d (%.2fs) clips=%d' % (cur, cur / FPS, len(clips)))
for t in timeline: print('  %-12s %-5s %7.2f-%7.2f  %5.2fs' % (t['id'], t['type'], t['start'], t['end'], t['end'] - t['start']))
