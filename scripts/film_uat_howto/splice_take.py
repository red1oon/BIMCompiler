# ⚠ DO NOT REMOVE — film "UAT, hands on" (prompts/FILM_UAT_GUIDE.md §5.34): assemble the take folder of a SPLICED film. usage: FILM_PLAN=plan1 python3 splice_take.py <out_take_dir> <src_take_dir> [<src_take_dir> ...]
# For each scene of the plan, in plan order, the FIRST source folder that holds its recording (<id>.mkv + <id>.events.json) supplies it (hard-linked, never copied: films' pieces are large) AND that scene's own lines of the source's scenes.log
# (the LAST '§FILM_SCENE <id> begin' segment), so the assembled scenes.log holds exactly the checks of the scenes the film shows, each once. One assembled verdict line is added, naming the sources: it is PASS only if no line of the log is a FAIL.
# READ THE OUTPUT: '§SPLICE <scene> <- <folder>' per scene and the verdict.
import sys, os, re, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
P = importlib.import_module(os.environ.get('FILM_PLAN', 'plan1')); out = os.path.abspath(sys.argv[1]); srcs = [os.path.abspath(x) for x in sys.argv[2:]]
os.makedirs(out, exist_ok=True); log = []; used = {}
def segment(folder, sid):
    L = open(os.path.join(folder, 'scenes.log'), encoding='utf8').read().split('\n'); idx = [i for i, l in enumerate(L) if l.startswith('§FILM_SCENE %s begin' % sid)]
    if not idx: return []
    i = idx[-1]; j = next((k for k in range(i + 1, len(L)) if L[k].startswith('§FILM_SCENE ') and L[k].endswith(' begin') or L[k].startswith('§FILM_SCENES_VERDICT')), len(L)); return L[i:j]
for sc in P.SCENES:
    sid = sc['id']; src = next((d for d in srcs if os.path.exists(os.path.join(d, sid + '.mkv')) and os.path.exists(os.path.join(d, sid + '.events.json'))), None)
    if not src: sys.exit('§SPLICE_REFUSED scene %s is in no source folder' % sid)
    for ext in ('.mkv', '.events.json'):
        dst = os.path.join(out, sid + ext)
        if os.path.exists(dst): os.remove(dst)
        os.link(os.path.join(src, sid + ext), dst)
    log += segment(src, sid); used[sid] = src; print('§SPLICE %s <- %s' % (sid, src))
fails = [l for l in log if l.startswith('§FILM_CHECK FAIL')]
log.append('§FILM_SCENES_VERDICT %s scenes=%s (assembled by splice_take.py from %s)' % ('PASS' if not fails else 'FAIL fails=%d' % len(fails), ','.join(used), ' | '.join(sorted(set(used.values())))))
open(os.path.join(out, 'scenes.log'), 'w', encoding='utf8').write('\n'.join(log) + '\n'); print(log[-1][:200])
