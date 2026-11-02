#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: SOFT independent evidence that the English VOICE says the numbers the script says. Whisper small.en (CPU, local) transcribes each beat's fitted clip; numbers it writes as digits or number words
# are read with the same rule as film2_tsv.js and compared with the numbers in that beat's script. REPORTED, never a pass/fail gate (a recogniser may merge or drop numbers): §ASR_BEAT says which expected values were heard, which not, which heard were not expected.
# usage: asr_numbers_en.py <en.tsv> <fitdir> <tag>
import sys, re, subprocess, numpy as np
from collections import Counter
from faster_whisper import WhisperModel
TSV, D, TAG = sys.argv[1:4]
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(); TENS = {w: i * 10 for i, w in enumerate('x x twenty thirty forty fifty sixty seventy eighty ninety'.split()) if i >= 2}
W = {w: i for i, w in enumerate(ONES)}; W.update(TENS)
def nums(text):
    return [v for part in re.split(r'(?<!\d)[,.;:?!]\s|\s[-\u2014]\s', text) for v in nums1(part)]
def nums1(text):
    t = re.sub(r'(?<=\d),(?=\d)', '', text.lower()); out = [int(x) for x in re.findall(r'\d+', t)]
    toks = re.findall(r"[a-z]+", re.sub(r'\d+', ' | ', t)); tot = cur = 0; run = False
    def flush():
        nonlocal tot, cur, run
        if run: out.append(tot + cur)
        tot = cur = 0; run = False
    for tk in toks:
        if tk in W: run = True; cur += W[tk]
        elif tk == 'hundred': run = True; cur = (cur or 1) * 100
        elif tk == 'thousand': run = True; tot += (cur or 1) * 1000; cur = 0
        else: flush()
    flush(); return out
m = WhisperModel('small.en', device='cpu', compute_type='int8'); te = th = 0
for l in open(TSV):
    f = l.rstrip('\n').split('\t'); bid, det = f[0], f[5]
    exp = Counter(nums(det)); 
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/{TAG}_{bid}.wav', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    tx = lambda x: ' '.join(s.text for s in m.transcribe(x, language='en', beam_size=5, condition_on_previous_text=False, temperature=0.0)[0])
    got = Counter()                                           # whisper sometimes stops after the short first turn: transcribe the whole clip AND the clip from 1.9 s; per value the larger count
    for part in (a, a[int(1.9 * 16000):]):
        for k, v in Counter(nums(tx(part))).items(): got[k] = max(got[k], v)
    miss = sorted((exp - got).elements()); extra = sorted((got - exp).elements()); te += sum(exp.values()); th += sum((exp & got).values())
    print(f'§ASR_BEAT {bid} expected={sorted(exp.elements())} not_heard={miss} heard_not_expected={extra}', flush=True)
print(f'§ASR_DONE expected_numbers={te} heard={th} (soft evidence; whisper small.en, not a gate)')
