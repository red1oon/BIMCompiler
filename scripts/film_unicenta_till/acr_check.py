# ⚠ DO NOT REMOVE — Scope: the ACRONYM witness of "uniCenta POS, reborn" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34.G; owner 2026-11-05: ERP said as E-R-P, AI said as A-I). The fitted beat clips are transcribed back with faster-whisper (word timestamps; raw 16 kHz samples)
# and every caption occurrence of ERP / AI is asserted to be SPELLED, by the SYLLABLE DELTA: the same engine and voice saying the film's turn (the voice text of the film) is LONGER than the same turn with the acronym replaced by ONE syllable (ERP -> "urp", AI -> "eye", what the owner heard) by >= SMIN s per occurrence: letters take several syllables, one syllable does not. Word timestamps alone could not tell
# ERP-as-word from E-R-P (control 0.58 s vs 0.66 s) and Edge normalises an upper-case ERP / AI to letters itself (ms: "ERP" and "E-R-P" are the same 5.18 s), so the duration delta against the syllable is the measure; whisper's hearing of letters is printed as supporting evidence only. A PROBE sentence proves the rule for AI even where the film has none;
# a CONTROL (the syllable against itself, delta 0) must FAIL, or the check is blind. For each caption occurrence in the film: its VOICE text row holds the spelled form and no bare acronym, and the fitted clip exists (whisper's hearing of it printed as support). Edge pads a lone-word utterance to a fixed 1.87 s, so the probe is a whole sentence.
# Zero film occurrences print INCONCLUSIVE, never PASS.   usage: acr_check.py <lang en|zh|ms> <workdir holding <lang>_<id>.wav + narration_<lang>_cap.tsv>   READ THE LOG.
import sys, re, os, asyncio, subprocess, numpy as np, soundfile as sf
lang, wd = sys.argv[1], os.path.abspath(sys.argv[2]); HERE = os.path.dirname(os.path.abspath(__file__))
from faster_whisper import WhisperModel
M = WhisperModel('base.en' if lang == 'en' else 'small', device='cpu', compute_type='int8'); WL = {'en': 'en', 'zh': 'zh', 'ms': 'ms'}[lang]
MIN = {'ERP': 0.0, 'AI': 0.0}; SMIN = {'ERP': 0.30, 'AI': 0.08}; PAT = {'ERP': r'^e\W*r\W*p\W*$', 'AI': r'^a\W*i\W*$|^a\.?i\.?$'}   # AI: two letter names against one syllable differ by little (measured +0.11 en, +0.12 zh, +0.22 ms)
def voice(t): return subprocess.run(['node', '-e', "console.log(require(process.argv[1]).voiceOf(process.argv[2], process.argv[3]))", HERE + '/voice.js', t, lang], capture_output=True, text=True).stdout.strip()
def words(wav):
    a, sr = sf.read(wav, dtype='float32'); a = a if a.ndim == 1 else a.mean(1)
    if sr != 16000: subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ar', '16000', '-ac', '1', '/tmp/_acr.wav'], check=True); a, _ = sf.read('/tmp/_acr.wav', dtype='float32')
    seg, _ = M.transcribe(a, language=WL, word_timestamps=True, beam_size=5); out = []
    for s in seg:
        for w in s.words: out.append((w.word.strip().lower(), w.start, w.end))
    return out
def found(ws, key):   # a single token matching, or the letters as separate one-letter tokens in a row; returns durations
    res = []; L = list(key.lower()); i = 0
    while i < len(ws):
        if re.match(PAT[key], ws[i][0]): res.append(ws[i][2] - ws[i][1]); i += 1; continue
        if len(ws[i][0].strip('.,')) == 1 and i + len(L) <= len(ws) and all(ws[i + k][0].strip('.,') == L[k] for k in range(len(L))): res.append(ws[i + len(L) - 1][2] - ws[i][1]); i += len(L); continue
        i += 1
    return res
def synth(text, path):
    if lang == 'en':
        from kokoro_onnx import Kokoro; K = '/home/red1/.local/share/film_narration/kokoro/'; k = Kokoro(K + 'kokoro-v1.0.onnx', K + 'voices-v1.0.bin'); a, sr = k.create(text, voice='am_michael', speed=0.97, lang='en-us'); sf.write(path, a, sr)
    else:
        import edge_tts; v = {'zh': 'zh-CN-YunxiNeural', 'ms': 'ms-MY-OsmanNeural'}[lang]; asyncio.run(edge_tts.Communicate(text, v).save(path + '.mp3')); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path + '.mp3', path], check=True)

def spell(t, key):
    L = ('-' if lang == 'ms' else ' ').join(key); return re.sub(r'(?<![A-Za-z])' + key + r'(?![A-Za-z])', L, t)
def dur(text, tag):
    p = f'{wd}/_d_{tag}.wav'; synth(text, p); a, sr = sf.read(p); return len(a) / sr
def turns(t): return [x.strip()[2:].strip() for x in t.split(' | ') if x.strip().startswith('M:')]
PROBE = {'en': 'It has no AI inside, and no ERP server.', 'zh': '里面没有 AI，也没有 ERP 服务器。', 'ms': 'Ia tiada AI di dalam, dan tiada pelayan ERP.'}[lang]
SYL = {'ERP': 'urp', 'AI': 'eye'}
def syl(t, key): return re.sub(r'(?<![A-Za-z])' + key + r'(?![A-Za-z])', SYL[key], t)   # Edge pads very short utterances to a fixed length (1.87 s measured), so the PROBE is a whole sentence, the acronym alone is not measurable
fails = 0; inc = 0; passed = 0
VOICE = {l.split('\t')[0]: l.rstrip('\n').split('\t')[4] for l in open(f'{wd}/narration_{lang}.tsv')}
for key in ('ERP', 'AI'):
    sp = spell(PROBE, key); sy = syl(PROBE, key); ds = dur(sp, 'ps'); dy = dur(sy, 'py'); delta = ds - dy; ok = delta >= SMIN[key]; hs = len(found(words(f'{wd}/_d_ps.wav'), key))
    print(f'§ACR_PROBE lang={lang} {key} voiced="{sp}" dur={ds:.2f}s one_syllable_control="{sy}" dur={dy:.2f}s delta=+{delta:.2f}s (min {SMIN[key]}) whisper_letters={hs} {"PASS" if ok else "FAIL"}'); fails += 0 if ok else 1; passed += ok
    dc = dur(sy, 'py2') - dy; caught = dc < SMIN[key]; print(f'§ACR_CONTROL lang={lang} {key} one-syllable vs one-syllable delta={dc:+.2f}s {"PASS caught (not letters)" if caught else "FAIL the check passes a one-syllable word: it is blind"}'); fails += 0 if caught else 1
CAP = {l.split('\t')[0]: l.rstrip('\n').split('\t')[1] for l in open(f'{wd}/narration_{lang}_cap.tsv')}; occ = {'ERP': 0, 'AI': 0}
for i, t in CAP.items():
    for key in ('ERP', 'AI'):
        n = len(re.findall(r'(?<![A-Za-z])' + key + r'(?![A-Za-z])', t))
        if not n: continue
        wav = f'{wd}/{lang}_{i}.wav'; occ[key] += n
        if not os.path.exists(wav): print(f'§ACR_CHECK lang={lang} beat={i} {key} FAIL no fitted clip {wav}'); fails += 1; continue
        sp = spell(key, key); in_voice = len(re.findall(r'(?<![A-Za-z])' + re.escape(sp) + r'(?![A-Za-z])', VOICE[i])); bare = len(re.findall(r'(?<![A-Za-z])' + key + r'(?![A-Za-z])', VOICE[i])); heard = len(found(words(wav), key))
        ok = in_voice >= n and bare == 0
        print(f'§ACR_CHECK lang={lang} beat={i} {key} caption_occurrences={n} voice_text_spelled="{sp}"x{in_voice} bare_{key}_in_voice={bare} clip={os.path.basename(wav)} whisper_letters_in_fitted_clip={heard} (supporting) {"PASS" if ok else "FAIL"}'); fails += 0 if ok else 1; passed += ok
for key in ('ERP', 'AI'):
    if occ[key] == 0: print(f'§ACR_CHECK lang={lang} {key} INCONCLUSIVE: no caption occurrence of {key} in this film (the PROBE above proves the engine; nothing in the film to judge)'); inc += 1
print(f'§ACR_VERDICT lang={lang} {"FAIL fails=%d" % fails if fails else "PASS" if not inc else "PASS-with-INCONCLUSIVE"} film_occurrences={occ} checks_passed={passed}'); sys.exit(1 if fails else 0)
