#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: prompts/FILM_UAT_GUIDE.md (the film that walks through the CAPEX UAT Guide). CPU only: no GPU, voices by local Kokoro (no cloud call).
# Read build.log after every run: §FILM_* lines carry every fact the film shows or says (page numbers found by text search, durations measured, the witness numbers). The exit code is not evidence.
# The film is written to ~/Videos and is NEVER committed (only this pipeline, its log and the spec are).
# usage: python3 scripts/film_uat_guide/build.py <work dir>     env: UAT_PDF (the saved PDF), UAT_LOGO, FILM_OUT
import os, re, sys, glob, json, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(HERE)); HOME = os.path.expanduser('~')
WORK = os.path.abspath(sys.argv[1]); os.makedirs(WORK, exist_ok=True)
PDF = os.environ.get('UAT_PDF', os.path.join(HOME, 'Downloads', 'CAPEX UAT Guide — step-by-step test script - BIM Intent Compiler.pdf'))
LOGO = os.environ.get('UAT_LOGO', os.path.join(HOME, 'Pictures', 'SYSNOVALogo.png'))
VENV = os.path.join(HOME, '.local/share/film_narration/venv/bin/python')
W, H, BAND, FPS = 1920, 1080, 230, 24
BG, CARD_BG = (15, 23, 42), (11, 15, 23)
WHITE, CORAL, SKY, GREY, RED, YEL = (243, 238, 232), (255, 107, 120), (125, 211, 252), (148, 163, 184), (232, 55, 44), (250, 204, 21)
FB, FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
LOGF = open(os.path.join(WORK, 'build.log'), 'w')


def log(m):
    print(m, flush=True); LOGF.write(m + '\n'); LOGF.flush()


def run(cmd, **kw):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, **kw)
    if r.returncode != 0:
        log('§FILM_FAIL cmd=' + ' '.join(map(str, cmd))[:300] + ' :: ' + r.stdout[-600:]); sys.exit(1)
    return r.stdout


def font(bold, size):
    return ImageFont.truetype(FB if bold else FR, size)


def canvas(bg=BG):
    return Image.new('RGB', (W, H), bg)


def text_c(d, y, s, f, fill):   # centred line
    w = d.textlength(s, font=f); d.text(((W - w) / 2, y), s, font=f, fill=fill)


def wrap(d, s, f, maxw):
    out, cur = [], ''
    for wd in s.split():
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: out.append(cur); cur = wd
    if cur: out.append(cur)
    return out


def fit_into(im, bw, bh):
    k = min(bw / im.width, bh / im.height); return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


def band_ok(im, bg):   # the caption band (bottom 230 px) must be background only
    px = im.crop((0, H - BAND, W, H)).getcolors(maxcolors=4)
    return bool(px) and len(px) == 1 and px[0][1] == bg


# ── 1 the live guide page: top (button ringed) + its print layout ─────────────────────────────────────────────
log(run(['node', os.path.join(HERE, 'shots.js'), WORK]).strip())
run(['pdftoppm', '-png', '-r', '100', '-f', '1', '-l', '6', os.path.join(WORK, 'print.pdf'), os.path.join(WORK, 'pr')])
prs = sorted(glob.glob(os.path.join(WORK, 'pr-*.png')))
pages = [Image.open(p).convert('RGB') for p in prs]; pages = [p.resize((1100, round(p.height * 1100 / p.width)), Image.LANCZOS) for p in pages]
tall = Image.new('RGB', (1100, sum(p.height + 16 for p in pages)), (71, 85, 105)); y = 0
for p in pages: tall.paste(p, (0, y)); y += p.height + 16
tall.save(os.path.join(WORK, 'tall.png')); log('§FILM_PRINT pages_stacked=%d tall=%dx%d' % (len(pages), tall.width, tall.height))

# ── 2 the saved PDF: facts and pages found by text search ───────────────────────────────────────────────────────
if not os.path.exists(PDF): log('§FILM_FAIL the saved PDF is not at ' + PDF); sys.exit(1)
NPAGES = int(re.search(r'Pages:\s+(\d+)', run(['pdfinfo', PDF])).group(1))
PTXT = {i: run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', PDF, '-']) for i in range(1, NPAGES + 1)}
log('§FILM_PDF file=%s pages=%d' % (os.path.basename(PDF), NPAGES))


def find_page(rx, after=1):
    for i in range(after, NPAGES + 1):
        if re.search(rx, PTXT[i]): return i
    log('§FILM_FAIL no page of the saved PDF matches ' + rx); sys.exit(1)


def words(n):
    x = run(['pdftotext', '-bbox', '-f', str(n), '-l', str(n), PDF, '-'])
    return [(float(a), float(b), float(c), float(d), re.sub(r'&amp;', '&', t)) for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', x)]


def pdf_still(name, n, heading, anchor, marks, note, picture=False):
    """left: the whole page (the zoom window framed); right: the window enlarged, the marked words boxed (boxes = pdftotext word boxes)."""
    run(['pdftoppm', '-png', '-r', '170', '-f', str(n), '-l', str(n), '-singlefile', PDF, os.path.join(WORK, 'pg%d' % n)])
    pg = Image.open(os.path.join(WORK, 'pg%d.png' % n)).convert('RGB'); sc = pg.width / 612.0; ws = words(n)
    PW, PH = 1210, 720; win_h = 612.0 * PH / PW
    an = [w for w in ws if re.search(anchor, w[4])]
    if not an: log('§FILM_FAIL page %d has no word matching %s' % (n, anchor)); sys.exit(1)
    cy = (an[0][1] + an[0][3]) / 2; y0 = max(0, min(792 - win_h, (an[0][3] + 14 - win_h) if picture else (cy - win_h * 0.32))); y1 = y0 + win_h   # picture=True: the caption sits at the bottom of the window, the picture above it
    rows = []   # a mark is a PHRASE: consecutive words on one line (plus `extend` more words of that line), boxed as one; a loose word elsewhere on the page is never marked
    for toks, extend in marks:
        found = 0
        for i in range(len(ws) - len(toks) + 1):
            seq = ws[i:i + len(toks)]
            if all(seq[j][4] == toks[j] for j in range(len(toks))) and all(abs(q[1] - seq[0][1]) < 4 for q in seq) and y0 <= seq[0][1] and seq[0][3] <= y1:
                end = i + len(toks) - 1
                while end + 1 < len(ws) and end - (i + len(toks) - 1) < extend and abs(ws[end + 1][1] - seq[0][1]) < 4: end += 1
                rows.append([seq[0][0], min(q[1] for q in ws[i:end + 1]), ws[end][2], max(q[3] for q in ws[i:end + 1])]); found += 1
        if not found: log('§FILM_FAIL %s: phrase %s not found in the window of page %d' % (name, ' '.join(toks), n)); sys.exit(1)
    im = canvas(); d = ImageDraw.Draw(im)
    d.text((60, 28), heading, font=font(True, 40), fill=SKY)
    d.text((60, 80), note, font=font(False, 24), fill=GREY)
    th = fit_into(pg, 560, PH); tx, ty = 60, 120; im.paste(th, (tx, ty)); k = th.width / 612.0
    d.rectangle((tx - 2, ty - 2, tx + th.width + 1, ty + th.height + 1), outline=(71, 85, 105), width=2)
    d.rectangle((tx, ty + y0 * k, tx + th.width, ty + y1 * k), outline=YEL, width=4)
    zoom = pg.crop((0, round(y0 * sc), pg.width, round(y1 * sc))).resize((PW, PH), Image.LANCZOS); zx, zy = 650, 120; im.paste(zoom, (zx, zy))
    d.rectangle((zx - 3, zy - 3, zx + PW + 2, zy + PH + 2), outline=YEL, width=3); z = PW / 612.0
    for a, b, c, e in rows:
        d.rounded_rectangle((zx + a * z - 8, zy + (b - y0) * z - 7, zx + c * z + 8, zy + (e - y0) * z + 7), radius=8, outline=RED, width=5)
    pn = 'page %d of %d' % (n, NPAGES); d.text((W - 60 - d.textlength(pn, font=font(True, 26)), 78), pn, font=font(True, 26), fill=YEL)
    im.save(os.path.join(WORK, name + '.png'))
    log('§FILM_PDF still=%s page=%d anchor=%s window_pt=%.0f..%.0f boxes=%d band_clear=%s' % (name, n, anchor, y0, y1, len(rows), band_ok(im, BG)))
    if not rows: log('§FILM_FAIL %s: nothing was marked' % name); sys.exit(1)


P_FIRST = find_page(r'What you need')
P_PLAN = find_page(r'Picture B1-b')
P_STEPS = find_page(r'B2 · Open all nine sheets')
P_NOTES = find_page(r'Notes \(chapter B\)')
P_LIMITS = find_page(r'Known limits')
P_SIGN = find_page(r'Sign-off')
SAVED = 'Your saved copy · Downloads / ' + os.path.basename(PDF)[:44] + '….pdf'
pdf_still('s05', P_FIRST, 'First check: what you need, and who does what', r'^need$', [(['What', 'you', 'need'], 0), (['Who', 'does', 'what'], 0)], SAVED)
pdf_still('s06', P_PLAN, 'Chapter B: your own Shed drawings, each one labelled', r'^B1-b$', [(['Picture', 'B1-b'], 5)], SAVED, True)
P_ARR = find_page(r'Picture B2-b'); P_3D = find_page(r'Picture B2-e'); P_DASH = find_page(r'Read Total Projects')   # the chapter's step table (the heading text alone also appears in page 1's who-does-what table)
pdf_still('s6ba', P_ARR, 'The nine sheets, standing in place', r'^B2-b$', [(['Picture', 'B2-b'], 9)], SAVED, True)
pdf_still('s6bb', P_3D, 'The 3D Shed they become', r'^B2-e$', [(['Picture', 'B2-e'], 8)], SAVED, True)
pdf_still('sd1a', P_DASH, 'Chapter D: the dashboard, checked tile by tile', r'^D3$', [(['D1'], 3), (['D2'], 3), (['D3'], 4), (['D8'], 4)], SAVED)
pdf_still('s07', P_STEPS, 'Every step: Do · Confirm · tick Pass or Fail by hand', r'^Confirm$', [(['Confirm', 'on', 'screen'], 0), (['Result'], 0), (['☐', 'Pass', '☐', 'Fail'], 0)], SAVED)
pdf_still('s08a', P_NOTES, 'What differs goes on the Notes line', r'^Notes$', [(['Notes', '(chapter', 'B):'], 1)], SAVED)
pdf_still('s08b', P_LIMITS, 'Known limits: do not fail a step on these', r'^limits$', [(['Known', 'limits'], 7)], SAVED)
pdf_still('s09', P_SIGN, 'The last page: sign-off for each chapter', r'^Sign-off$', [(['Sign-off'], 0), (['Tester'], 0), (['Date'], 0), (['Passed'], 2), (['Signature'], 0)], SAVED)
# s08 = the two halves side by side would shrink both: the beat shows the Notes line first, then Known limits (two stills, one beat)

# ── 3 composed stills and cards ──────────────────────────────────────────────────────────────────────────────────────────
logo = Image.open(LOGO).convert('RGBA'); log('§FILM_LOGO file=%s size=%dx%d' % (os.path.basename(LOGO), logo.width, logo.height))


def logo_plate(h):   # the sponsor's logo on a white plate (its colours are made for a light ground)
    lg = logo.resize((round(logo.width * h / logo.height), h), Image.LANCZOS); pl = Image.new('RGB', (lg.width + 36, lg.height + 24), (255, 255, 255)); pl.paste(lg, (18, 12), lg); return pl


# b01 preamble: the Shed floor plan, the guide's own picture
plan = Image.open(os.path.join(REPO, 'docs/img/uat/uat_b1_sheet_0_floor_plan.png')).convert('RGB')
im = canvas(); d = ImageDraw.Draw(im); p = fit_into(plan, 1800, 735); im.paste(p, ((W - p.width) // 2, 105))
d.text((60, 40), 'Sponsored by', font=font(False, 26), fill=GREY); im.paste(logo_plate(52), (250, 18))
d.text((W - 60 - d.textlength('CAPEX UAT Guide · the film', font=font(True, 28)), 40), 'CAPEX UAT Guide · the film', font=font(True, 28), fill=SKY)
im.save(os.path.join(WORK, 's01.png')); log('§FILM_STILL s01 floor_plan=%dx%d band_clear=%s' % (plan.width, plan.height, band_ok(im, BG)))

# chapter card (silent, plain dark)
im = canvas(CARD_BG); d = ImageDraw.Draw(im)
text_c(d, 300, 'CHAPTER 0', font(True, 34), CORAL); text_c(d, 370, 'UAT', font(True, 150), WHITE); text_c(d, 560, "or it doesn't work", font(True, 96), CORAL)
text_c(d, 720, 'User Acceptance Test', font(False, 40), WHITE)
d.text((60, 40), 'Sponsored by', font=font(False, 26), fill=GREY); im.paste(logo_plate(52), (250, 18)); im.save(os.path.join(WORK, 'c00.png'))

# b02 the owner's sentence
im = canvas(CARD_BG); d = ImageDraw.Draw(im)
text_c(d, 150, 'Part of any software project completion is a', font(False, 50), WHITE)
text_c(d, 225, 'User Acceptance Test, done independently.', font(True, 62), WHITE)
text_c(d, 380, 'Not by AI.', font(True, 84), CORAL)
text_c(d, 520, 'By a qualified CTFL company.', font(True, 62), WHITE)
text_c(d, 610, 'Audited and signed.', font(True, 62), SKY)
text_c(d, 760, 'CTFL = Certified Tester Foundation Level (ISTQB)', font(False, 30), GREY)
im.save(os.path.join(WORK, 's02.png')); log('§FILM_STILL s02 band_clear=%s' % band_ok(im, CARD_BG))

# b03 the live guide page, the Print button ringed
im = canvas(); top = Image.open(os.path.join(WORK, 'guide_top.png')).convert('RGB'); top = fit_into(top, W, H - BAND); im.paste(top, ((W - top.width) // 2, 0))
im.save(os.path.join(WORK, 's03.png')); log('§FILM_STILL s03 guide_top=%dx%d band_clear=%s' % (top.width, top.height, band_ok(im, BG)))

# rc3: the guide page at each of its diagrams (quick scroll), and the dashboard in its looks
def page_still(src, dst, heading=None):
    im = canvas(); pic = Image.open(os.path.join(WORK, src)).convert('RGB'); pic = fit_into(pic, W, H - BAND); im.paste(pic, ((W - pic.width) // 2, 0))
    if heading:
        dd = ImageDraw.Draw(im); tw = dd.textlength(heading, font=font(True, 34)); dd.rounded_rectangle((W - tw - 90, 772, W - 30, 832), radius=12, fill=(18, 38, 58)); dd.text((W - tw - 60, 782), heading, font=font(True, 34), fill=WHITE)
    im.save(os.path.join(WORK, dst)); return band_ok(im, BG)


DIAG = ['uat_b1_sheet_0_floor_plan', 'uat_b1_sheet_3_beam_layout', 'uat_b1_sheet_4_foundation_layout', 'uat_b1_nine_opened', 'uat_b1_arranged', 'uat_b1_arranged_top', 'uat_b2_convert_button', 'uat_b2_converted']
ok = [page_still('site_' + k + '.png', 'q_%d.png' % i) for i, k in enumerate(DIAG)]; log('§FILM_STILL site_diagrams=%d band_clear_all=%s' % (len(ok), all(ok)))
LOOKS = [('classic', 'light', 'Classic · Light'), ('classic', 'dark', 'Classic · Dark'), ('executive', 'light', 'Executive · Light'), ('executive', 'dark', 'Executive · Dark')]
ok = [page_still('dash_%s_%s.png' % (a_, b_), 't_%d.png' % i, c_) for i, (a_, b_, c_) in enumerate(LOOKS)]; log('§FILM_STILL dashboard_looks=%d band_clear_all=%s' % (len(ok), all(ok)))
page_still('dash_classic_light.png', 'sd1b.png', 'The dashboard · on the sample data')

# b04 background of the scrolled print layout
im = canvas(); d = ImageDraw.Draw(im); d.text((60, 28), 'Print this guide / Save as PDF', font=font(True, 40), fill=SKY)
d.text((60, 80), "the page's own print layout", font=font(False, 24), fill=GREY); d.rectangle((407, 107, 1513, 853 - 3), outline=YEL, width=3)
im.save(os.path.join(WORK, 's04_bg.png'))

# b10 what the user company should note (each line from the guide's own text)
NOTE = ['Test independently: not the developer, not the AI', 'Use the GardenWorld test client, never live data', 'Test dates are set for 13 November 2026: the colours drift with the calendar',
        'What differs goes on the Notes line; do not fail a known limit', 'Keep the signed sheets: they are your acceptance record']
im = canvas(CARD_BG); d = ImageDraw.Draw(im); text_c(d, 70, 'What the user company should note', font(True, 60), SKY); y = 210
for i, s in enumerate(NOTE):
    d.ellipse((150, y + 4, 206, y + 60), fill=CORAL); n = str(i + 1); d.text((178 - d.textlength(n, font=font(True, 36)) / 2, y + 10), n, font=font(True, 36), fill=CARD_BG)
    for ln in wrap(d, s, font(False, 44), 1500): d.text((240, y + 4), ln, font=font(False, 44), fill=WHITE); y += 58
    y += 50
im.save(os.path.join(WORK, 's10.png')); log('§FILM_STILL s10 lines=%d last_y=%d band_clear=%s' % (len(NOTE), y, band_ok(im, CARD_BG)))

# b11 closing: the standards, the sponsor, the contact
STD = [('ISO/IEC/IEEE 29119', 'Software testing'), ('ISO/IEC 25010', 'Product quality model'), ('ISO/IEC/IEEE 12207', 'Software life cycle processes'), ('ISTQB CTFL', 'Certified testers · acceptance testing'),
       ('ISO 19650', 'Information management using BIM'), ('ISO 16739 (IFC)', 'Open BIM data'), ('ISO/IEC 27001', 'Information security'), ('ISO 9001', 'Quality management')]
im = canvas(CARD_BG); d = ImageDraw.Draw(im); text_c(d, 96, 'Software standards such software has to comply with', font(True, 50), SKY)   # y=96: the voice credit line is drawn in the top 80 px of the last seconds
for i, (a, b) in enumerate(STD):
    x = 150 if i < 4 else 1000; y = 200 + (i % 4) * 104
    d.text((x, y), a, font=font(True, 40), fill=WHITE); d.text((x, y + 52), b, font=font(False, 30), fill=GREY)
pl = logo_plate(76); im.paste(pl, (150, 652))
CONTACT = ['For further information', 'Redhuan D. OON, CTFL  ·  red1org@gmail.com', 'SYSNOVA (UK / Bangladesh)']
d.text((150 + pl.width + 50, 640), CONTACT[0], font=font(False, 30), fill=GREY); d.text((150 + pl.width + 50, 682), CONTACT[1], font=font(True, 44), fill=WHITE); d.text((150 + pl.width + 50, 742), CONTACT[2], font=font(True, 36), fill=SKY)
cw = max(d.textlength(CONTACT[1], font=font(True, 44)), d.textlength(CONTACT[2], font=font(True, 36))) + 150 + pl.width + 50
log('§FILM_STILL s11 contact_right_edge=%d frame=%d inside=%s' % (cw, W, cw <= W - 60))
im.save(os.path.join(WORK, 's11.png')); log('§FILM_STILL s11 standards=%d band_clear=%s' % (len(STD), band_ok(im, CARD_BG)))

# ── 4 voices, pass 1: measure every beat ────────────────────────────────────────────────────────────────────────────────
BEATS = [l.rstrip('\n').split('\t') for l in open(os.path.join(HERE, 'beats_en.tsv')) if l.strip()]


def fit(tag, rows, film_sec):
    fd = os.path.join(WORK, tag); os.makedirs(fd, exist_ok=True)
    open(os.path.join(fd, 'ass_head.txt'), 'w').write(open(os.path.join(REPO, 'prompts/film_narration_ass_head.txt')).read())
    open(os.path.join(fd, tag + '.tsv'), 'w').write(''.join('%s\t%.3f\t%.3f\t%s\t%s\t%s\n' % r for r in rows))
    out = run([VENV, os.path.join(REPO, 'prompts/film_narration_fit_kokoro_v3.py'), tag + '.tsv', tag, '1.15'], cwd=fd, env=dict(os.environ, FILM_SEC=str(film_sec)))
    open(os.path.join(fd, 'fit.log'), 'w').write(out); return fd, out


fd1, o1 = fit('fit1', [(b[0], 60.0 * i, 60.0 * i + 58, b[1], b[2], b[3]) for i, b in enumerate(BEATS)], 60.0 * len(BEATS) + 10)
DUR = {m.group(1): float(m.group(2)) for m in re.finditer(r'§NARR_FIT (\S+) cue=[\d.]+ room=[\d.]+ dur=([\d.]+)', o1)}
log('§FILM_VOICE pass1 beats=%d dur=%s' % (len(DUR), json.dumps(DUR)))
if len(DUR) != len(BEATS): log('§FILM_FAIL pass 1 did not voice every beat'); sys.exit(1)

# ── 5 the silent picture: one segment per beat, each a whole number of frames ───────────────────────────────────────
LEAD = {}; TAIL = {'b11': 5.0, 'b06': 2.0, 'b6b': 3.0, 'bd1': 5.0}   # rc3: longer on the illustrated parts, longest on the dashboard (the prize)
segs, cues, t = [], {}, 0.0   # (file, frames)


def still_seg(name, png, sec):
    n = int(round(sec * FPS)); o = os.path.join(WORK, name + '.mp4'); D = n / FPS
    run(['ffmpeg', '-hide_banner', '-y', '-loop', '1', '-framerate', str(FPS), '-i', png, '-vf', 'fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4,format=yuv420p' % (D - 0.4),
         '-frames:v', str(n), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-tune', 'stillimage', '-r', str(FPS), o])
    return o, n


def scroll_seg(name, sec):
    n = int(round(sec * FPS)); o = os.path.join(WORK, name + '.mp4'); D = n / FPS; travel = min(tall.height - 740, 3400)
    run(['ffmpeg', '-hide_banner', '-y', '-loop', '1', '-framerate', str(FPS), '-i', os.path.join(WORK, 'tall.png'), '-loop', '1', '-framerate', str(FPS), '-i', os.path.join(WORK, 's04_bg.png'), '-filter_complex',
         "[0:v]crop=1100:740:0:'min(%d*max(t-0.8\\,0)/%.3f\\,%d)'[c];[1:v][c]overlay=410:110,fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4,format=yuv420p" % (travel, max(D - 1.6, 1), travel, D - 0.4),
         '-frames:v', str(n), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-r', str(FPS), o])
    log('§FILM_SCROLL travel_px=%d seconds=%.2f' % (travel, D)); return o, n


def chain_seg(name, pngs, holds, trans, kind, sec):
    """stills shown one after another: each held `holds[i]` s, joined by a `trans` s move (slideup = a quick scroll, fade = a look change); the last one holds to the end of `sec`."""
    n = int(round(sec * FPS)); D = n / FPS; o = os.path.join(WORK, name + '.mp4'); holds = list(holds); used = sum(holds[:-1]) + trans * (len(pngs) - 1); holds[-1] = max(holds[-1], D - used)
    cmd = ['ffmpeg', '-hide_banner', '-y']; fc = []; off = 0.0
    for k, png in enumerate(pngs):
        cmd += ['-loop', '1', '-framerate', str(FPS), '-t', '%.3f' % (holds[k] + trans + 0.2), '-i', png]
    prev = '[0:v]'
    for k in range(1, len(pngs)):
        off += holds[k - 1] + (trans if k > 1 else 0); lab = '[x%d]' % k
        fc.append('%s[%d:v]xfade=transition=%s:duration=%.2f:offset=%.3f%s' % (prev, k, kind, trans, off, lab)); prev = lab
    fc.append('%sfade=t=in:st=0:d=0.3,fade=t=out:st=%.3f:d=0.4,format=yuv420p[v]' % (prev, D - 0.4))
    run(cmd + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-frames:v', str(n), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-r', str(FPS), o])
    log('§FILM_CHAIN %s stills=%d hold_each=%.2f move=%.2f kind=%s last_hold=%.2f seconds=%.2f' % (name, len(pngs), holds[0], trans, kind, holds[-1], D)); return o, n


def add(seg):
    global t
    segs.append(seg); t += seg[1] / FPS


add(still_seg('v_c00', os.path.join(WORK, 'c00.png'), 3.6))   # rc3: the film's zero second is the chapter card
for b in BEATS:
    i = b[0]; lead = LEAD.get(i, 0.5); sec = lead + DUR[i] + 1.2 + TAIL.get(i, 0.0); start = t
    if i == 'b04': add(scroll_seg('v_' + i, max(sec, 8.0)))
    elif i == 'bq1': add(chain_seg('v_bq1', [os.path.join(WORK, 's03.png')] + [os.path.join(WORK, 'q_%d.png' % k) for k in range(len(DIAG))], [0.9] + [0.5] * len(DIAG), 0.28, 'slideup', sec))
    elif i == 'bt1': add(chain_seg('v_bt1', [os.path.join(WORK, 't_%d.png' % k) for k in range(len(LOOKS))], [2.2] * len(LOOKS), 0.35, 'fade', sec))
    elif i == 'b08':
        h = sec / 2; add(still_seg('v_b08a', os.path.join(WORK, 's08a.png'), h)); add(still_seg('v_b08b', os.path.join(WORK, 's08b.png'), h))
    elif i == 'b6b':
        h = sec / 2; add(still_seg('v_b6ba', os.path.join(WORK, 's6ba.png'), h)); add(still_seg('v_b6bb', os.path.join(WORK, 's6bb.png'), h))
    elif i == 'bd1':
        add(still_seg('v_bd1a', os.path.join(WORK, 'sd1a.png'), 4.5)); add(still_seg('v_bd1b', os.path.join(WORK, 'sd1b.png'), sec - 4.5))
    else: add(still_seg('v_' + i, os.path.join(WORK, 's' + i[1:] + '.png'), sec))
    cues[i] = (start + lead, t - 0.1)
open(os.path.join(WORK, 'concat.txt'), 'w').write(''.join("file '%s'\n" % s[0] for s in segs))
SILENT = os.path.join(WORK, 'silent.mp4'); run(['ffmpeg', '-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(WORK, 'concat.txt'), '-c', 'copy', SILENT])
FRAMES = sum(s[1] for s in segs); TOTAL = FRAMES / FPS
got = int(run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', SILENT]).strip())
log('§FILM_PICTURE segments=%d frames_planned=%d frames_counted=%d seconds=%.3f' % (len(segs), FRAMES, got, TOTAL))

# ── 6 voices, pass 2 on the real cues, then the mux ──────────────────────────────────────────────────────────────────────
fd2, o2 = fit('fit2', [(b[0], cues[b[0]][0], cues[b[0]][1], b[1], b[2], b[3]) for b in BEATS], TOTAL)
picks = re.findall(r'§NARR_FIT (\S+) .*? -> (\S+)', o2); wrong = len(re.findall(r'§NARR_TONE .* WRONG', o2))
log('§FILM_VOICE pass2 detail=%d of %d not_detail=%s tone_wrong=%d' % (sum(1 for _, p in picks if p == 'DETAIL'), len(BEATS), json.dumps([x for x in picks if x[1] != 'DETAIL']), wrong))
for l in o2.split('\n'):
    if l.startswith('§NARR_FIT') or 'WRONG' in l: log('  ' + l[:200])
OUT = os.environ.get('FILM_OUT'); rc = 3
while not OUT:
    c = os.path.join(HOME, 'Videos', 'CAPEX_UAT_Guide_film_EN_2026-11-14_rc%d.mp4' % rc)
    if not os.path.exists(c): OUT = c
    rc += 1
run(['python3', os.path.join(REPO, 'prompts/film_narration_mux.py'), 'fit2', SILENT, OUT], cwd=fd2, env=dict(os.environ, FILM_SEC='%.3f' % TOTAL))

# ── 7 witness (numbers) ───────────────────────────────────────────────────────────────────────────────────────────────────────
fr = int(run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', OUT]).strip())
au = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', OUT, '-af', 'silencedetect=n=-40dB:d=4,ebur128', '-f', 'null', '-'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout
sil = [float(x) for x in re.findall(r'silence_duration: ([\d.]+)', au)]; lufs = re.findall(r'I:\s+(-?[\d.]+) LUFS', au)
log('§FILM_WITNESS out=%s frames=%d (picture %d) seconds=%.2f silences_ge_4s=%s longest=%.2f loudness_LUFS=%s' % (OUT, fr, FRAMES, fr / FPS, json.dumps([round(x, 2) for x in sil]), max(sil) if sil else 0.0, lufs[-1] if lufs else '?'))
# one contact sheet (a single layout look): the middle frame of every segment
tiles, at = [], 0.0
for k, (f, n) in enumerate(segs):
    mid = at + n / FPS / 2; at += n / FPS; o = os.path.join(WORK, 'cs%02d.png' % k)
    run(['ffmpeg', '-hide_banner', '-y', '-ss', '%.3f' % mid, '-i', OUT, '-frames:v', '1', '-vf', 'scale=640:360', o]); tiles.append(Image.open(o).convert('RGB'))
cols = 4; sheet = Image.new('RGB', (cols * 640, ((len(tiles) + cols - 1) // cols) * 360), (0, 0, 0))
for k, tl in enumerate(tiles): sheet.paste(tl, ((k % cols) * 640, (k // cols) * 360))
sheet.save(os.path.join(WORK, 'contact_sheet.png')); log('§FILM_DONE contact_sheet=%s tiles=%d' % (os.path.join(WORK, 'contact_sheet.png'), len(tiles)))
