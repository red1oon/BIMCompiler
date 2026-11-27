# overlay_ass.py <timeline.json> <rec/cues.json> <fit.ass> <out.ass> : append tags, number lines (from §FILM_STATE) and honesty notes to the fitted subtitle ASS.
import sys, json
tl = json.load(open(sys.argv[1])); C = json.load(open(sys.argv[2]))
def ts(x): return f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
def final(t, kept):   # cue-time -> final film time inside an item's kept ranges (snap forward if in a cut)
    for k in kept:
        if k['t1'] - 1e-6 <= t <= k['t2'] + 1e-6: return k['f0']/25 + (t - k['t1'])/k.get('sp', 1)
    for k in kept:
        if t < k['t1']: return k['f0']/25
    return None
SPACE = (C.get('boot', {}).get('A') or [''])[0].split('space=')[-1].split()[0] if C.get('boot', {}).get('A') else '?'
ev = []
for it in tl['items']:
    if it['type'] != 'footage': continue
    if it.get('tag'): ev.append(f"Dialogue: 1,{ts(it['start'])},{ts(it['end'])},Tag,,0,0,0,,{{\\pos(960,36)}}{it['tag']}")
    if it.get('note'): ev.append(f"Dialogue: 1,{ts(it['start'])},{ts(it['end'])},Note,,0,0,0,,{{\\pos(40,884)}}{it['note'].replace('{SPACE}', SPACE)}")
# number lines per pane: from states (mapped into whichever footage item holds them)
for it in tl['items']:
    if it['type'] != 'footage': continue
    for k in it['kept']:
        if k.get('sp', 1) != 1: ev.append(f"Dialogue: 2,{ts(k['f0']/25)},{ts((k['f0']+k['n'])/25)},Spd,,0,0,0,,{{\\pos(1790,36)}} playback x{k['sp']:g} ")
allk = [(it, k) for it in tl['items'] if it['type'] == 'footage' for k in it['kept']]
def fmt(rec, w):
    L = []
    if not rec['el']: L.append('model: empty (0 blocks)')
    for nm in sorted(rec['el']):
        e = rec['el'][nm]; c = e['centre']
        line = f"{nm}  centre ({c[0]:.3f}, {c[1]:.3f}, {c[2]:.3f})"
        if rec['beat'].startswith('limits'): s = e['size']; line += f"  size {s[0]:g} x {s[1]:g} x {s[2]:g}"
        L.append(line)
    for k in rec['conf']:
        L.append(f"WARNING {k['block']} {k['col']}: values {k['values'][0]:g} / {k['values'][1]:g}, kept {k['kept']:g}")
    if rec['chipLocalOnly']: L.append(f"local-only, not shared: {rec['chipLocalOnly']} op")
    return L
bypane = {'A': [], 'B': []}
for r in C['states']:
    ft = None
    for it in tl['items']:
        if it['type'] != 'footage': continue
        f = final(r['t'], it['kept']) if any(k['t1'] - 1e-6 <= r['t'] <= k['t2'] + 1e-6 for k in it['kept']) else None
        if f is not None: ft = (f, it); break
    if ft is None:   # state logged inside a cut: snap to the start of the next kept range
        nxt = [(k['f0']/25, it) for it in tl['items'] if it['type'] == 'footage' for k in it['kept'] if k['t1'] > r['t']]
        if nxt: ft = min(nxt, key=lambda z: z[0])
    if ft: bypane[r['who']].append((ft[0], ft[1], r))
end_total = tl['total_frames'] / 25
import re
cards = [it for it in tl['items'] if it['type'] == 'card']
# numbers are shown only while they are TRUE of the picture: blank them from the moment a visit or a gizmo gesture starts until the next reading
stops = sorted(k['f0']/25 for it in tl['items'] if it['type'] == 'footage' for k in it['kept'] if re.match(r'^(V\d+_[AB]_in|G\d+_[AB]_(sel_in|down))$', k.get('a', '')))
for w, lst in bypane.items():
    lst.sort(key=lambda z: z[0])
    for i, (f, it, r) in enumerate(lst):
        nxt = lst[i + 1][0] if i + 1 < len(lst) else it['end']
        later = [c['start'] for c in cards if c['start'] >= f] + [v for v in stops if v > f + 0.05]
        if later: nxt = min(nxt, min(later))
        if nxt <= f + 0.05: continue
        x = 40 if w == 'A' else 1000
        for j, line in enumerate(fmt(r, w)):
            ev.append(f"Dialogue: 1,{ts(f)},{ts(nxt)},Num{w},,0,0,0,,{{\\pos({x},{738 + j*33})}}{line}")
for it in tl['items']:
    for (t0, t1, text) in (it.get('notes_final') or []): ev.append(f"Dialogue: 1,{ts(t0)},{ts(t1)},Note,,0,0,0,,{{\\pos(40,884)}}{text}")
base = open(sys.argv[3]).read()
open(sys.argv[4], 'w').write(base.rstrip('\n') + '\n' + '\n'.join(ev) + '\n')
print('§OVERLAY events=%d' % len(ev))
