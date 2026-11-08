#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: BUILD the film "How to escape from your Odoo" from out/cards (cards.sh) + the voice. READ out/build.log after every run; exit codes are not evidence.
# Every number the voice says is filled from out/rec/facts.json (record.js) — the NUMBERS dict below fails the build if a fact is missing. Voice = Kokoro, local CPU (FILM_NARRATION.md
#   PLAYBOOK voices: F af_heart, M am_michael). Captions = the house ASS head (prompts/film_narration_ass_head.txt), burnt into the bottom band the cards keep empty. CPU only.
# Run: ~/.local/share/film_narration/venv/bin/python build.py <out.mp4>   (refuses to overwrite)
import os, sys, json, re, subprocess, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Videos/How_to_escape_from_your_Odoo_EN_rc1.mp4')
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
N = {'bp': mig('C_BPartner'), 'pr': mig('M_Product'), 'ev': mig('C_ElementValue'), 'il': mig('M_InventoryLine'), 'ops': F['commit_ops']}
assert F['offline_proven'] is True and F['verify_chain'] == 'ok' and F['offline_requests'] == 0, 'a voiced claim is not proven by the recording'
say('§BUILD facts ' + json.dumps(N) + ' offline_proven=%s verify=%s' % (F['offline_proven'], F['verify_chain']))
w = {k: words(v) for k, v in N.items()}
# (card, hold-if-silent seconds, [(speaker, line)])
BEATS = [
 ('01_title.png', 5.0, []),
 ('02_trap.png', 0, [('F', 'My data lives on a server I keep paying for. Can I get it out?'), ('M', "Yes. This is one real run, with Odoo's demo company, from start to finish.")]),
 ('03_beforeafter.png', 0, [('M', 'On the left, Odoo. On the right, the Kernel ERP, in this browser, on this machine. Three steps got it there.')]),
 ('04_act1.png', 3.6, []),
 ('05_export.png', 0, [('M', 'Step one. A small program next to your Odoo reads what you need, and writes one workbook. It never changes Odoo.')]),
 ('06_act2.png', 3.6, []),
 ('07_login.png', 0, [('M', 'Step two. Create your own company in the ERP, the way iDempiere sets one up, and log in.')]),
 ('08_act3.png', 3.6, []),
 ('09_form.png', 0, [('M', 'Step three. Open Migrate from Odoo and pick the files. Nothing is uploaded. It asks a couple of questions, like which unit is which.')]),
 ('10_summary.png', 0, [('F', 'Before I press anything, what will it do?'), ('M', 'This is a dry run of the real import. Every sheet says how many rows go in, and why any would be refused. Here, none.')]),
 ('11_done.png', 0, [('M', 'Process. All of it goes in, or none of it does.')]),
 ('12_bp.png', 0, [('F', 'Is it really there?'), ('M', '%s customers, %s products, %s accounts and %s stock lines. Exactly what the summary said.' % (w['bp'].capitalize(), w['pr'], w['ev'], w['il']))]),
 ('13_products.png', 0, [('M', 'And their products, in the ERP\'s own window.')]),
 ('14_local.png', 3.6, []),
 ('15_offline.png', 0, [('F', 'And if the internet goes down?'), ('M', 'Nothing stops. Here the internet is off, and a customer is still edited and saved. Every click is answered on this machine, with no server to wait for, and none to pay for.')]),
 ('16_team.png', 0, [('F', 'But my staff need the same data.'), ('M', 'Each device sends only its signed changes through a relay: a post box, not a server. Start a team here, and your colleagues pick up the changes at their next visit. The team film shows it in full.')]),
 ('17_proof.png', 0, [('M', 'The run checked itself. %s records, in one signed change set, the chain verified, and the summary equal to the result in every table.' % w['ops'].capitalize())]),
 ('18_anyerp.png', 0, [('M', "Odoo is the first door we opened. Nothing in the loader is Odoo's. It is built for any system whose data you can read.")]),
 ('19_notyet.png', 0, [('F', 'So I can switch tomorrow?'), ('M', 'Masters and opening stock, today. Balances, open invoices and a timing comparison come in the next update of this film.')]),
 ('20_end.png', 7.0, []),
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
for a0, a1, spk, line in events: ass += 'Dialogue: 0,%s,%s,%s,,0,0,0,,%s\n' % (ts(a0), ts(a1 + 0.25), spk, line.replace('\n', ' '))
open(os.path.join(W, 'captions.ass'), 'w').write(ass)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(W, 'silent.mp4'), '-i', os.path.join(W, 'voice.wav'),
    '-vf', 'ass=' + os.path.join(W, 'captions.ass'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-shortest', OUT], check=True)
r = subprocess.run(['ffmpeg', '-nostats', '-i', OUT, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT], capture_output=True, text=True).stdout)
gaps = [round(events[i + 1][0] - events[i][1], 2) for i in range(len(events) - 1)]
say('§BUILD_DONE %s duration=%.1fs integrated=%s LUFS turns=%d longest_silence_between_turns=%.1fs' % (OUT, dur, I[-1] if I else '?', len(events), max(gaps)))
open(OUT[:-4] + '_narration.txt', 'w').write('How to escape from your Odoo — narration (EN). Numbers from scripts/film_odoo_migration/out/rec/facts.json.\n\n' + '\n'.join('[%s] %s: %s' % (ts(a0), s, l) for a0, a1, s, l in events) + '\n')
open(os.path.join(HERE, 'out/build.log'), 'w').write('\n'.join(LOG) + '\n')
