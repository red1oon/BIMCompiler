#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: BUILD the film "How to escape from your SAP Business One" from out/cards (cards.py) + the voice (storyboard script_en.md). READ out/build.log after every run; exit codes are not evidence.
# Every number the voice says is filled from out/rec/facts.json (record.js) — the NUMBERS dict below fails the build if a fact is missing. Voice = Kokoro, local CPU (FILM_NARRATION.md
#   PLAYBOOK voices: F af_heart, M am_michael). Captions = the house ASS head (prompts/film_narration_ass_head.txt), burnt into the bottom band the cards keep empty. CPU only.
# Run: ~/.local/share/film_narration/venv/bin/python build.py <out.mp4>   (refuses to overwrite)
import os, sys, json, re, subprocess, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Videos/How_to_escape_from_your_SAP_Business_One_EN_rc1.mp4')
if os.path.exists(OUT): print('§BUILD_REFUSED %s exists (never overwritten)' % OUT); sys.exit(5)
W = os.path.join(HERE, 'out/build'); os.makedirs(W, exist_ok=True); C = os.path.join(HERE, 'out/cards'); LOG = []
def say(s): print(s); LOG.append(s)
F = json.load(open(os.path.join(HERE, 'out/rec/facts.json')))
msg = F['form_msg']; mig = lambda t: int(re.search(t + r' (\d+)', msg).group(1))
def words(n):
    o = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
    t = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
    if n < 20: return o[n]
    if n < 100: return t[n // 10] + ('-' + o[n % 10] if n % 10 else '')
    return o[n // 100] + ' hundred' + (' and ' + words(n % 100) if n % 100 else '')
N = {'bp': mig('C_BPartner'), 'pr': mig('M_Product'), 'ev': mig('C_ElementValue'), 'ops': F['commit_ops'], 'inc': int(F['inconclusive_rules'][0])}
assert F['offline_proven'] is True and F['verify_chain'] == 'ok' and F['offline_requests'] == 0, 'a voiced claim is not proven by the recording'
assert F['agent_read_only'] is True and F['warehouse_refusal_shown'] is True and F['alpha_values_leaked'] == 0 and F['witness_verdict'][0] == 'PASS', 'a voiced claim is not proven by the recording'
say('§BUILD facts ' + json.dumps(N) + ' offline_proven=%s verify=%s read_only=%s' % (F['offline_proven'], F['verify_chain'], F['agent_read_only']))
w = {k: words(v) for k, v in N.items()}
one = lambda n, s, p: '%s %s' % (words(n).capitalize(), s if n == 1 else p)
BEATS = [
 ('01_title.png', 5.0, []),
 ('02_trap.png', 0, [('F', 'We run SAP Business One. Can we take our data out ourselves?'), ('M', "Yes. This is how. It is an early version, so we will also show what it can't do yet.")]),
 ('03_open.png', 0, [('F', "For Business Central you read Microsoft's own source code. And SAP?"),
   ('M', "SAP publishes no open data model for Business One. Its old open source database, SAP DB, was only the engine. It never held Business One's tables.")]),
 ('04_server.png', 0, [('M', 'But every Business One server describes itself. Its Service Layer publishes the model. So the agent reads it from your own server, checks every field against it, and only reads.')]),
 ('05_guide.png', 0, [('F', 'Did you have a Business One to test with?'), ('M', 'No. So the test server here answers with the only records SAP prints in its own guide. One customer, three items, one warehouse, one account.')]),
 ('06_act1.png', 3.6, []),
 ('07_agent.png', 0, [('M', 'Step one. Run the agent on a machine that can reach your Service Layer. It needs Node, and nothing else. It logs in, reads, logs out, and writes one file.')]),
 ('08_act2.png', 3.6, []),
 ('09_login.png', 0, [('M', 'Step two. Create your own company in the ERP, the way iDempiere sets one up, and log in.')]),
 ('10_act3.png', 3.6, []),
 ('11_form.png', 0, [('M', 'Step three. Open Migrate from SAP Business One, pick the file, and set the cut-over date.')]),
 ('12_summary.png', 0, [('F', 'What will it do?'), ('M', 'A dry run first. Here one warehouse is refused, and it says why. It has no country, and the ERP needs an address for it.')]),
 ('13_done.png', 0, [('M', 'Process. All of it goes in, or none of it does.')]),
 ('14_bp.png', 0, [('M', "%s, %s and %s from SAP's own examples, in the ERP's own windows." % (one(N['bp'], 'customer', 'customers'), words(N['pr']) + (' item' if N['pr'] == 1 else ' items'), words(N['ev']) + (' account' if N['ev'] == 1 else ' accounts')))]),
 ('15_products.png', 3.0, []),
 ('16_found.png', 0, [('F', 'Did it just work?'), ('M', "No. An item without a unit stopped the whole load. Now it gets the company's default unit, as iDempiere's own import does. And rows refused before the load never showed on the summary, in the Business Central form too. Both are fixed.")]),
 ('17_offline.png', 0, [('M', 'And the ERP keeps working with the internet off. Here a record is edited and saved, with no network request at all.')]),
 ('18_proof.png', 0, [('M', 'The run checked itself. %s records in one signed change set, the chain verified, and the summary equal to the result in every table.' % w['ops'].capitalize())]),
 ('19_alpha.png', 0, [('M', "This is an alpha. %s of its rules had no record to test against, and a tester's run will judge them. The report it writes holds counts and field names, and no values." % w['inc'].capitalize())]),
 ('20_notyet.png', 0, [('F', 'So we can switch tomorrow?'), ('M', 'Not yet. Run it on your own server, and send the report back. That is how it grows.')]),
 ('21_end.png', 7.0, []),
]
SR = 24000; K = os.path.expanduser('~/.local/share/film_narration/kokoro/')
k = Kokoro(K + 'kokoro-v1.0.onnx', K + 'voices-v1.0.bin'); VOX = {'F': 'af_heart', 'M': 'am_michael'}; SPD = {'F': 1.03, 'M': 0.97}
def trim(a, th=0.004):
    idx = np.where(np.abs(a) > th)[0]; return a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a
LEAD, GAP, TAIL = 0.45, 0.38, 1.1
timeline, events, segs, t = [], [], [], 0.0
for card, hold, turns in BEATS:
    if not os.path.exists(os.path.join(C, card)): say('§BUILD_FAIL missing card ' + card); sys.exit(2)
    if not turns: segs.append((card, hold)); t += hold; continue
    pos, parts = LEAD, []
    for spk, line in turns:
        a, _ = k.create(line, voice=VOX[spk], speed=SPD[spk], lang='en-us'); a = trim(np.asarray(a, dtype=np.float32))
        parts.append((pos, a)); events.append((t + pos, t + pos + len(a) / SR, spk, line)); pos += len(a) / SR + GAP
    dur = pos - GAP + TAIL; segs.append((card, dur))
    for p0, a in parts: timeline.append((t + p0, a))
    say('§BUILD beat %s %.2fs turns=%d' % (card, dur, len(turns))); t += dur
TOTAL = t; audio = np.zeros(int(TOTAL * SR) + SR, dtype=np.float32)
for t0, a in timeline: i = int(t0 * SR); audio[i:i + len(a)] += a
sf.write(os.path.join(W, 'voice.wav'), audio, SR)
# video: each card a still segment with 0.4 s fades, concatenated
lst = open(os.path.join(W, 'list.txt'), 'w')
for i, (card, dur) in enumerate(segs):
    o = os.path.join(W, 'seg%02d.mp4' % i)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-framerate', '30', '-t', '%.3f' % dur, '-i', os.path.join(C, card),
        '-vf', 'fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4,format=yuv420p' % max(0, dur - 0.4), '-c:v', 'libx264', '-tune', 'stillimage', '-r', '30', o], check=True)
    lst.write("file '%s'\n" % o)
lst.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(W, 'list.txt'), '-c', 'copy', os.path.join(W, 'silent.mp4')], check=True)
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return '%d:%02d:%05.2f' % (h, m, s)
ass = open(os.path.join(HERE, '../../prompts/film_narration_ass_head.txt')).read().rstrip('\n') + '\n'
CAP = []
cap = lambda l: l
for a0, a1, spk, line in events: ass += 'Dialogue: 0,%s,%s,%s,,0,0,0,,%s\n' % (ts(a0), ts(a1 + 0.25), spk, cap(line).replace('\n', ' '))
open(os.path.join(W, 'captions.ass'), 'w').write(ass)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(W, 'silent.mp4'), '-i', os.path.join(W, 'voice.wav'),
    '-vf', 'ass=' + os.path.join(W, 'captions.ass'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-shortest', OUT], check=True)
r = subprocess.run(['ffmpeg', '-nostats', '-i', OUT, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT], capture_output=True, text=True).stdout)
gaps = [round(events[i + 1][0] - events[i][1], 2) for i in range(len(events) - 1)]
say('§BUILD_DONE %s duration=%.1fs integrated=%s LUFS turns=%d longest_silence_between_turns=%.1fs' % (OUT, dur, I[-1] if I else '?', len(events), max(gaps)))
open(OUT[:-4] + '_narration.txt', 'w').write('How to escape from your SAP Business One — narration (EN). Numbers from scripts/film_sap_migration/out/rec/facts.json.\n\n' + '\n'.join('[%s] %s: %s' % (ts(a0), s, cap(l)) for a0, a1, s, l in events) + '\n')
open(os.path.join(HERE, 'out/build.log'), 'w').write('\n'.join(LOG) + '\n')
