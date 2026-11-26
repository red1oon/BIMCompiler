#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: CitaGlobal trailer HQ PART (~30 s) spliced from finished films + doc stills, slid together.
# Spec: ~/Projects/CitaGlobal/CitaGlobal_Pitch_Report.md §13.8. Nothing is recorded here: every piece is an existing
# file, cut, sped up, cropped clear of its burned-in captions. READ <work>/build_hq.log after every run.
# Issue this proves: every piece exists and yields exactly the frames planned (§HQ_PIECE ... OK), and the joined
# part has the length the offsets predict (§HQ_TOTAL planned == counted).
# Run: python3 build_hq.py <workDir>   → <workDir>/hq_part.mp4
import json, os, subprocess, sys
H = os.path.expanduser('~'); V = H + '/Videos'; D = H + '/Downloads'
WORK = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'hq'); os.makedirs(WORK, exist_ok=True)
ST = os.path.join(os.path.dirname(WORK), 'stills')     # doc stills fetched from bim-compiler origin/master docs/
FPS, BG = 30, '0x0b1a2e'
LOG = []
def say(s): LOG.append(s); print(s)
UAT = V + '/CAPEX_UAT_Guide_film_EN_2026-11-14_rc3.mp4'
CROP_UAT = 'crop=1511:850:204:0'          # above the caption band (bottom 230 px, FILM_UAT_GUIDE §2)
CROP_SUB = 'crop=1742:980:89:0'            # above a one-line subtitle
# (name, kind, src, start, seconds_of_source, speed, crop, out_seconds)
P = [
 ('2d_to_3d',   'clip', UAT, 31.2, 12.3, 2.5, CROP_UAT, None),
 ('4d5d_bn',    'still', ST + '/4D5DHTML.png', 0, 0, 1, None, 1.3),
 ('4d5d_shed',  'still', ST + '/shed_4d5d.jpg', 0, 0, 1, None, 1.2),
 ('5d_excel',   'still', ST + '/4DDashBoard.png', 0, 0, 1, None, 1.1),
 ('4d5d_phone', 'still', ST + '/Mobile4D5D.jpeg', 0, 0, 1, None, 1.1),
 ('time_mach',  'clip', V + '/4D.mp4', 46, 10, 3.0, 'crop=1813:1020:53:60', None),
 ('bake_path',  'still', ST + '/filmmaker-path-editor.png', 0, 0, 1, None, 1.2),
 ('bake_cine',  'still', ST + '/cinema-path-editor.png', 0, 0, 1, None, 1.1),
 ('bake_out',   'clip', V + '/Bake_of_3_projects_1920x1080_24fps_2026-11-23.mp4', 40, 3, 2.0, None, None),
 ('find_storey','still', ST + '/find-panel-open.png', 0, 0, 1, None, 1.0),
 ('find_parts', 'still', ST + '/find-axis-parts.png', 0, 0, 1, None, 1.0),
 ('find_room',  'still', ST + '/find-room-highlight-hhs.png', 0, 0, 1, None, 1.0),
 ('find_path1', 'still', ST + '/find-room-path-hospital-topview.png', 0, 0, 1, None, 1.1),
 ('find_path2', 'still', ST + '/find-room-path-hospital-frontview.png', 0, 0, 1, None, 1.1),
 ('erp_en',     'clip', V + '/Help_that_answers_ERP_EN_AFTER_2026-11-16_v4.mp4', 26, 1.1, 1, CROP_SUB, None),
 ('erp_de',     'clip', V + '/Help_that_answers_ERP_DE_AFTER_2026-11-16_v1.mp4', 28, 1.1, 1, CROP_SUB, None),
 ('erp_zh',     'clip', V + '/Help_that_answers_ERP_ZH_AFTER_2026-11-16_v5.mp4', 26, 1.1, 1, CROP_SUB, None),
 ('erp_th',     'clip', V + '/Command_Line_ERP_CH3_Inside_The_Record_TH_rc1.mp4', 30, 1.1, 1, CROP_SUB, None),
 ('dash_looks', 'clip', UAT, 145.8, 10.1, 2.0, CROP_UAT, None),
 ('bake_3proj', 'clip', V + '/Bake_of_3_projects_1920x1080_24fps_2026-11-23.mp4', 150, 1.2, 1, None, None),
 ('bake_jebel', 'clip', V + '/Jebel_buildup_4D5D_1920x1080_24fps_2026-11-23.mp4', 70, 1.2, 1, None, None),
 ('bake_hhs',   'clip', D + '/HHS_Office_Federated_4D_AFTER_1920x1080_24fps_2026-11-19.mp4', 60, 1.2, 1, None, None),
 ('bake_hosp',  'clip', D + '/Hospital_FULL_HIRES.mp4', 120, 1.2, 1, None, None),
 ('bake_term',  'clip', D + '/Terminal_FULL_allON_1080p24.mp4', 60, 1.2, 1, None, None),
 ('bake_vol',   'clip', V + '/escape_route_allon_1080p.mp4', 5, 1.4, 1, None, None),
]
XF = 0.25                                   # slide between pieces
SLIDE_GROUPS = {'4d5d_bn','4d5d_shed','5d_excel','4d5d_phone','bake_path','bake_cine','find_storey','find_parts','find_room','find_path1','find_path2'}
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: say('§HQ_FFMPEG_ERR ' + r.stderr[-400:])
    return r.returncode
def frames(f):
    r = subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','csv=p=0',f],capture_output=True,text=True)
    return int(r.stdout.strip() or 0)
fit = f'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color={BG},setsar=1'
pieces = []
for i,(name,kind,src,ss,dur,speed,crop,outs) in enumerate(P):
    out = os.path.join(WORK, f'p{i:02d}_{name}.mp4')
    if not os.path.exists(src): say(f'§HQ_PIECE {name} MISSING src={src}'); continue
    if kind == 'clip':
        n = round(dur / speed * FPS)
        vf = ','.join([x for x in [crop, f'setpts=PTS/{speed}', fit, f'fps={FPS}', 'format=yuv420p'] if x])
        rc = run(['ffmpeg','-v','error','-y','-ss',str(ss),'-i',src,'-an','-vf',vf,'-frames:v',str(n),'-c:v','libx264','-crf','18',out])
    else:
        n = round(outs * FPS)
        # gentle push-in so a still is never static
        vf = f'{fit},scale=2304:1296,zoompan=z=\'1+0.05*on/{n}\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d={n}:s=1920x1080:fps={FPS},format=yuv420p'
        rc = run(['ffmpeg','-v','error','-y','-loop','1','-i',src,'-vf',vf,'-frames:v',str(n),'-c:v','libx264','-crf','18',out])
    got = frames(out) if rc == 0 else 0
    say(f'§HQ_PIECE {name} src={os.path.basename(src)} in={ss} speed={speed} planned={n} counted={got} {"OK" if got==n else "MISMATCH"}')
    pieces.append((name, out, got / FPS))
# join: slide (smoothleft) inside page/panel groups and into each new section; quick fade between bake shots
inputs, fc, prev, off = [], [], '0:v', 0.0
for k,(name,f,sec) in enumerate(pieces):
    inputs += ['-i', f]
for k in range(1, len(pieces)):
    off += pieces[k-1][2] - XF
    a, b = pieces[k-1][0], pieces[k][0]
    tr = 'fade' if (a.startswith('bake_') and b.startswith('bake_') and b not in SLIDE_GROUPS and a not in SLIDE_GROUPS) else 'smoothleft'
    fc.append(f'[{prev}][{k}:v]xfade=transition={tr}:duration={XF}:offset={off:.4f}[x{k}]'); prev = f'x{k}'
planned = round((sum(p[2] for p in pieces) - XF * (len(pieces) - 1)) * FPS)
outp = os.path.join(WORK, 'hq_part.mp4')
run(['ffmpeg','-v','error','-y',*inputs,'-filter_complex',';'.join(fc),'-map',f'[{prev}]','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-r',str(FPS),outp])
got = frames(outp)
say(f'§HQ_TOTAL pieces={len(pieces)} of {len(P)} planned_frames={planned} counted={got} seconds={got/FPS:.2f} {"OK" if abs(got-planned)<=1 else "MISMATCH"}')
open(os.path.join(WORK, 'build_hq.log'), 'w').write('\n'.join(LOG) + '\n')
