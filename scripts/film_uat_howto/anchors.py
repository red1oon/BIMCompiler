# ⚠ DO NOT REMOVE — film "UAT, hands on" (prompts/FILM_UAT_GUIDE.md §5.29): the ANCHORS check, run BEFORE a build. usage: FILM_PLAN=plan1 python3 anchors.py <takeDir>
# Every narration beat hangs on a cue the take logged (a cue name, a 'click:<label>', or an 'at:a|b|f' between two logged events), and every scene's span cues exist: the build (compose.py) dies on a KeyError otherwise.
# Prints '§ANCHORS bad=N' and one line per bad beat. READ IT: an exit code is not evidence.
import sys, os, json, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); P = importlib.import_module(os.environ.get('FILM_PLAN', 'plan1')); TAKE = sys.argv[1]; bad = 0; n = 0
for sc in P.SCENES:
    f = os.path.join(TAKE, sc['id'] + '.events.json')
    if not os.path.exists(f): print('§ANCHORS_BAD %s no events file' % sc['id']); bad += 1; continue
    ev = json.load(open(f)); cue = {c['name'] for c in ev['cues']}; clk = {'click:' + c['label'] for c in ev['clicks'] if c.get('label')}
    for a in sc['span']:
        if a not in cue: print('§ANCHORS_BAD %s span cue %s missing' % (sc['id'], a)); bad += 1
    for b in sc['beats']:
        n += 1; c = b[1]
        if c.startswith('at:'): ok = all((x in cue or x in clk) for x in c[3:].split('|')[:2])
        else: ok = c in cue or c in clk
        if not ok: print('§ANCHORS_BAD %s beat %s cue %s not in the take (cues: %s)' % (sc['id'], b[0], c, ' '.join(sorted(cue))[:200])); bad += 1
print('§ANCHORS bad=%d beats=%d scenes=%d' % (bad, n, len(P.SCENES)))
sys.exit(1 if bad else 0)
