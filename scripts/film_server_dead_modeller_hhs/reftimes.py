# reftimes.py: final-film time of a recording cue or a §FILM_STATE reading (same mapping overlay_ass.py uses; a reading inside a cut snaps to the next kept range).
import json
class Ref:
    def __init__(s, asm, rec):
        s.tl = json.load(open(asm + '/timeline.json')); C = json.load(open(rec + '/cues.json'))
        s.cm = {x['name']: x['t'] for x in C['cues']}; s.states = C['states']
        s.kept = [(it['id'], k) for it in s.tl['items'] if it['type'] == 'footage' for k in it['kept']]
    def at(s, t, snap=False):
        for _, k in s.kept:
            if k['t1'] - 1e-6 <= t <= k['t2'] + 1e-6: return k['f0'] / 25 + (t - k['t1']) / k['sp']
        if snap:
            nx = [k['f0'] / 25 for _, k in s.kept if k['t1'] > t]
            if nx: return min(nx)
        return None
    def cue(s, name): return s.at(s.cm[name])
    def state(s, beat, who):
        r = [x for x in s.states if x['beat'] == beat and x['who'] == who][0]; return s.at(r['t'], snap=True)
    def card(s, id): it = [i for i in s.tl['items'] if i['id'] == id][0]; return it['start']
    def ref(s, spec):
        k, v = spec.split(':', 1)
        if k == 'cue': return s.cue(v)
        if k == 'state': b, w = v.split(':'); return s.state(b, w)
        if k == 'card': return s.card(v)
        raise ValueError(spec)
if __name__ == '__main__':
    import sys
    R = Ref(sys.argv[1], sys.argv[2])
    for sp in sys.argv[3:]: print('%-44s %s' % (sp, R.ref(sp)))
