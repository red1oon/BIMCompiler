#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: SOFT, independent evidence that the Thai VOICE says the numbers the text says (the hand-table / round-trip / by-value checks prove the TEXT; this listens to the AUDIO). Whisper "small" (multilingual, CPU, local after its one-time model download)
# transcribes each beat's fitted clip in Thai; every number it prints as digits (or Thai number words, read with the same independent reader) is compared with the beat's expected values from facts.json (perBeat).
# Whisper small is a rough Thai recogniser (it merges and drops numbers), so this is REPORTED, never a pass/fail gate: §ASR_BEAT lines say which expected values were heard, which were not, and which heard numbers were not expected.
# usage: asr_numbers_th.py <facts.json (with perBeat)> <tag> <dir with <tag>_<id>.wav>
import sys, json, re, subprocess, numpy as np
TOK = [('ศูนย์', 0), ('หนึ่ง', 1), ('สอง', 2), ('สาม', 3), ('สี่', 4), ('ห้า', 5), ('หก', 6), ('เจ็ด', 7), ('แปด', 8), ('เก้า', 9), ('ยี่', 2), ('เอ็ด', 1), ('สิบ', 10), ('ร้อย', 100), ('พัน', 1000), ('หมื่น', 10000), ('แสน', 100000)]
TV = dict(TOK); TRE = re.compile('|'.join(sorted((t[0] for t in TOK), key=len, reverse=True)))
def words_to_numbers(t):                       # same reading rule as the narration script's independent reader, for number words whisper writes out
    runs, cur, last = [], [], -1
    for m in TRE.finditer(t):
        if m.start() == last and cur: cur.append(m.group())
        else:
            if cur: runs.append(cur)
            cur = [m.group()]
        last = m.end()
    if cur: runs.append(cur)
    out = []
    for r in runs:
        total, pend = 0, None
        for w in r:
            v = TV[w]
            if v >= 10: total += (1 if pend is None else pend) * v; pend = None
            else: pend = v
        out.append(total + (0 if pend is None else pend))
    return out
from faster_whisper import WhisperModel
facts, tag, d = sys.argv[1:4]; PB = json.load(open(facts))['perBeat']
m = WhisperModel('small', device='cpu', compute_type='int8'); tot_exp = tot_hit = 0
for bid, exp in PB.items():
    f = f'{d}/{tag}_{bid}.wav'
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    tx = lambda x: ' '.join(s.text for s in m.transcribe(x, language='th', beam_size=5, condition_on_previous_text=False, temperature=0.0, vad_filter=False)[0])
    txt = tx(a) + ' || ' + tx(a[int(1.9 * 16000):])        # whisper sometimes stops after the short first turn: transcribe the whole clip AND the clip from 1.9 s, and count numbers heard in either (union)
    from collections import Counter
    cnt = Counter()                                          # multiset union over the two passes: per value the larger count
    for part in txt.split(' || '):
        c = Counter([int(x) for x in re.findall(r'\d+', part.replace(',', ''))] + words_to_numbers(part))
        for k, v in c.items(): cnt[k] = max(cnt[k], v)
    heard = list(cnt.elements())
    left = list(heard); hit = []; miss = []
    for e in exp:
        if e in left: left.remove(e); hit.append(e)
        else: miss.append(e)
    tot_exp += len(exp); tot_hit += len(hit)
    print(f'§ASR_BEAT {bid} expected={exp} heard_digits={heard} not_heard={miss} unexpected={left} text="{txt[:160]}"', flush=True)
print(f'§ASR_DONE expected_numbers={tot_exp} heard={tot_hit} (soft evidence; whisper-small Thai is rough, not a gate)')
