#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film "Fast Script ERP" (cloned from film_red1_shell; prompts/FILM_COMMAND_LINE_ERP.md "CH fast-script-erp"): the REAL recording.
# A real bash in a real pty (220 x 50), a `red1` on its PATH (a symlink to bim-ootb common/door/red1.js), the keys of script.json typed one by one; after EVERY key the
# screen of a terminal emulator (pyte) is kept. Nothing is typed in by hand into the picture: the screens are what the shell drew. The shell's own §RED1 log lines (stderr) go to a file,
# red1.err, the way a user would send them (`2>>file`, in a shell function): they are READ by facts.js, not shown. READ out/rec.log; an exit code is not evidence.
# Usage: python rec.py <out dir>       (needs a bim-ootb checkout at main with R0-R7: OOTB, default ~/bim-ootb; the warm Viewer page is headless Chrome on the CPU)
import subprocess, os, sys, pty, time, json, select, struct, fcntl, termios, signal, tempfile, re
import pyte
OUT = os.path.abspath(sys.argv[1]); os.makedirs(OUT, exist_ok=True)
OOTB = os.environ.get('OOTB', '/tmp/wt-film-fse-ootb'); ROWS, COLS = int(os.environ.get('ROWS', 50)), int(os.environ.get('COLS', 200))
STEPS = json.load(open(os.environ.get('SCRIPT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'script.json')))
home = tempfile.mkdtemp(prefix='red1film_'); bindir = os.path.join(home, 'bin'); os.makedirs(bindir)
wr = os.path.join(bindir, 'red1'); open(wr, 'w').write('#!/bin/sh\nexec node %s "$@"\n' % os.path.join(OOTB, 'common/door/red1.js')); os.chmod(wr, 0o755)   # `red1` on the PATH (the package.json bin, without npm link): bim-ootb is not touched
errf = os.path.join(OUT, 'red1.err'); open(errf, 'w').close()
rc = os.path.join(home, 'rc'); open(rc, 'w').write("PS1='$ '\nred1() { command red1 \"$@\" 2>>%s; }\nexport -f red1 2>/dev/null\n" % errf)
inp = os.path.join(home, 'inputrc'); open(inp, 'w').write('set enable-bracketed-paste off\n')
scratch = tempfile.mkdtemp(prefix='fse_scratch_')   # ISOLATION (owner): the film's purchase orders and completions go to a scratch op-log and journal, never the owner's door data
env = {'PATH': bindir + ':' + os.environ['PATH'], 'HOME': os.path.expanduser('~'), 'HISTFILE': '/dev/null', 'PUPPETEER_PATH': os.path.expanduser('~/bim-compiler/node_modules/puppeteer'), 'TERM': 'xterm-256color', 'INPUTRC': inp, 'RED1_HISTORY': os.path.join(scratch, 'hist'),
       'BIM_DOOR_JOURNAL': os.path.join(scratch, 'journal.jsonl'), 'BIM_OBJECT_OPLOG': os.path.join(scratch, 'ops.jsonl'), 'RED1_LOG': errf, 'RED1_NO_OPEN': '1', 'RED1_WARM': os.environ.get('RED1_WARM', 'off'), 'LANG': 'C.UTF-8', 'COLUMNS': str(COLS), 'LINES': str(ROWS)}
# SETUP (before the pty, off screen, into the SCRATCH op-log only): the seed's Hospital project cannot generate a PO as it stands (no warehouse, sales rep, customer, payment term, price list; its generated products have no vendor, so the
# process answers ok with 0 orders). setup.door gives it what the seed's own Landscape project and Product Purchasing rows hold, as door lines. READ setup.log: every line must answer ok.
sl = subprocess.run(['node', os.path.join(OOTB, 'common/door/door.js'), '--script', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'setup.door')], env=dict(env), capture_output=True, text=True, timeout=900)
open(os.path.join(OUT, 'setup.log'), 'w').write(sl.stdout + '\n--- stderr ---\n' + sl.stderr)
okn = sum(1 for l in sl.stdout.split('\n') if l.startswith('{') and json.loads(l).get('status') == 'ok')
print('§REC setup door lines ok=%d of %d (setup.log)' % (okn, len([l for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'setup.door')) if l.strip()])))
def snapdir(d):
    try: return {f: [os.path.getsize(os.path.join(d, f)), os.path.getmtime(os.path.join(d, f))] for f in os.listdir(d)}
    except Exception: return {}
OBJDIR = os.path.expanduser('~/.cache/bim_object'); OBJ0 = snapdir(OBJDIR)
pid, fd = pty.fork()
if pid == 0:
    fcntl.ioctl(0, termios.TIOCSWINSZ, struct.pack('HHHH', ROWS, COLS, 0, 0)); os.chdir(home); os.execvpe('bash', ['bash', '--noprofile', '--rcfile', rc, '-i'], env)
fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack('HHHH', ROWS, COLS, 0, 0))
screen = pyte.Screen(COLS, ROWS); stream = pyte.ByteStream(screen); log = open(os.path.join(OUT, 'rec.log'), 'w')
def L(m): print(m); log.write(m + '\n'); log.flush()
def pump(t):   # read until nothing has arrived for t seconds; returns the bytes read
    n = 0
    while True:
        r, _, _ = select.select([fd], [], [], t)
        if not r: return n
        try: d = os.read(fd, 65536)
        except OSError: return n
        if not d: return n
        stream.feed(d); n += len(d)
def text(): return [l.rstrip() for l in screen.display]
def snap(kind, step, what=''):
    for l in screen.display:
        m = re.search(r'^Posted .*: Project (\d+),', l)
        if m: LASTPROJ[0] = m.group(1)
    rows = []
    for y in range(ROWS):
        runs = []; line = screen.buffer[y]
        for x in range(COLS):
            c = line[x]; a = (c.fg, c.bg, c.bold, c.reverse)
            if runs and runs[-1][1] == a: runs[-1][0] += c.data
            else: runs.append([c.data, a])
        rows.append([[r[0], list(r[1])] for r in runs])
    return {'kind': kind, 'step': step, 'what': what, 'rows': rows, 'cx': screen.cursor.x, 'cy': screen.cursor.y, 'hidden': screen.cursor.hidden, 'text': text(), 't': round(time.time() - T0, 3), 'lg': os.path.getsize(errf)}
def settle(expect, quiet, maxs):   # until the cursor line ends with `expect` and nothing has arrived for `quiet` seconds
    t = time.time(); last = time.time()
    while time.time() - t < maxs:
        if pump(0.1): last = time.time()
        cur = text()[screen.cursor.y]
        if cur.rstrip().endswith(expect.rstrip()) and time.time() - last >= quiet: return True
    return False
_np = subprocess.run(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'noport.js'), OOTB], capture_output=True, text=True).stdout.strip().split('\t')
NOPORT = _np[0] if len(_np) == 3 else '??'; NOPORT_CLASS = _np[1] if len(_np) == 3 else '??'; NOPORT_N = _np[2] if len(_np) == 3 else '0'
def pos():   # the purchase orders the run made, from the SCRATCH op-log (a CRUD_CREATE of c_order carries its DocumentNo), in creation order
    out = []
    try:
        for l in open(os.path.join(scratch, 'ops.jsonl')):
            try: o = json.loads(l)
            except Exception: continue
            blob = json.dumps(o)
            if '"c_order"' in blob and 'CRUD_CREATE' in blob:
                m = re.search(r'"documentno": ?"(\d+)"', blob)
                if m and m.group(1) not in out: out.append(m.group(1))
    except Exception: pass
    return out
LASTPROJ = ['??']
def sub(t):
    for i in range(3): t = t.replace('{po%d}' % i, (pos() + ['??', '??', '??'])[i])
    return t.replace('{noport}', NOPORT).replace('{postedproj}', LASTPROJ[0])   # the project the post made, read from the screen the shell drew
KEY = {'Tab': b'\t', 'Down': b'\x1b[B', 'Up': b'\x1b[A', 'Return': b'\r', 'Esc': b'\x1b', 'CtrlL': b'\x0c', 'Tab': b'\t'}
T0 = time.time(); frames = []; pump(1.0); settle('$', 0.3, 15)
frames.append(snap('s', 'start', 'the bash prompt')); L('§REC start screen cursor=(%d,%d) line=%r' % (screen.cursor.x, screen.cursor.y, text()[screen.cursor.y]))
for st in STEPS:
    sid = st['id']; t0 = time.time(); L('§REC step %s begin' % sid)
    for it in st['do']:
        if 'line' in it:   # typed character by character, then Return
            it = dict(it, line=sub(it['line']))
            for ch in it['line']:
                os.write(fd, ch.encode()); pump(0.05); frames.append(snap('k', sid, ch))
            os.write(fd, b'\r'); pump(0.15); frames.append(snap('r', sid, 'Return'))
        elif 'chunk' in it:   # two keys arriving together (a fast typist): the shell draws its grey suggestion for the whole of "cd Bu", not for "cd B" alone (which would name a local building)
            os.write(fd, it['chunk'].encode()); pump(0.05); frames.append(snap('k', sid, it['chunk'][-1]))
        elif 'type' in it:   # typed character by character, NO Return (a grey suggestion is then waited for)
            for ch in it['type']:
                os.write(fd, ch.encode()); pump(0.05); frames.append(snap('k', sid, ch))
        elif 'pause' in it:   # let a redraw (the grey suggestion) land, then a still of it
            pump(it['pause']); frames.append(snap('a', sid, 'pause'))
        elif 'key' in it:   # one named key (arrow, Return, Esc, Ctrl-L)
            os.write(fd, KEY[it['key']]); pump(0.25)
            frames.append(snap('r' if it['key'] in ('Return', 'Esc') else 'k', sid, it['key']))
        elif 'digit' in it:
            os.write(fd, it['digit'].encode()); pump(0.15); frames.append(snap('k', sid, it['digit']))
        elif 'see' in it:   # wait until a screen line holds the text (a menu that has been drawn), then until quiet
            t1 = time.time()
            while time.time() - t1 < it.get('max', 60) and not any(it['see'] in l for l in text()): pump(0.2)
            ok = any(it['see'] in l for l in text()); pump(0.5); frames.append(snap('a', sid, 'answer' + ('' if ok else ' TIMEOUT')))
            L('§REC step %s see %r -> %s' % (sid, it['see'], 'ok' if ok else 'TIMEOUT'))
            if not ok: L('§REC_FAIL timeout in step ' + sid); json.dump({'rows': ROWS, 'cols': COLS, 'frames': frames}, open(os.path.join(OUT, 'frames.json'), 'w')); sys.exit(1)
        elif 'wait' in it:   # the answer: settled when the cursor line ends with the expected prompt
            tw = time.time(); ok = settle(it['wait'], it.get('quiet', 0.6), it.get('max', 240)); frames.append(snap('a', sid, 'answer' + ('' if ok else ' TIMEOUT')))
            if it.get('showwait'): frames[-1]['showwait'] = True; frames[-1]['waited'] = round(time.time() - tw - it.get('quiet', 0.6), 2)   # a REAL wait the film shows (post: the session building), not cut
            L('§REC step %s wait for %r -> %s after %.1f s' % (sid, it['wait'], 'ok' if ok else 'TIMEOUT', time.time() - t0))
            if not ok: L('§REC_FAIL timeout in step ' + sid); json.dump(frames, open(os.path.join(OUT, 'frames.json'), 'w')); sys.exit(1)
    L('§REC step %s done: %.1f s, frames so far %d' % (sid, time.time() - t0, len(frames)))
try: os.kill(pid, signal.SIGHUP)
except Exception: pass
json.dump({'rows': ROWS, 'cols': COLS, 'frames': frames, 'scratch': scratch, 'objBefore': OBJ0, 'objAfter': snapdir(OBJDIR), 'noport': {'name': NOPORT, 'class': NOPORT_CLASS, 'count': NOPORT_N}, 'pos': pos()}, open(os.path.join(OUT, 'frames.json'), 'w'))
L('§REC scratch=%s ops=%s' % (scratch, os.path.join(scratch, 'ops.jsonl'))); L('§REC noport name=%s class=%s count=%s pos=%s' % (NOPORT, NOPORT_CLASS, NOPORT_N, pos()))
L('§REC_DONE frames=%d keys=%d returns=%d answers=%d' % (len(frames), sum(f['kind'] == 'k' for f in frames), sum(f['kind'] == 'r' for f in frames), sum(f['kind'] == 'a' for f in frames)))
