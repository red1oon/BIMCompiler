# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v5 STRUCTURE Chapter 0 title card (1920×1080 PNG). Numbers parsed from the logs passed in.
# usage: python3 film_ch0_card.py <bake_cli.log> <bake_page.log> <out.png>   Read the log: §CH0_CARD.
import sys, re
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
cli, page, out = open(sys.argv[1]).read(), open(sys.argv[2], errors='replace').read(), sys.argv[3]
wall = int(re.search(r'§CLI_BAKE_WALL totalSec=(\d+)', cli).group(1))
total = int(re.findall(r'§COST_ODOMETER day=\d+ placed=\d+/(\d+)', page)[-1])
days = int(re.search(r'§CPE_DAY_COUNTER frame=\d+ day=\d+ of=(\d+)', page).group(1))
mins = round(wall / 60)
print(f'§CH0_CARD wallSec={wall} minutes={mins} pieces={total} days={days}')
BG, INK, INK2 = '#1a1a19', '#ffffff', '#c3c2b7'; F = ['Noto Sans', 'Ubuntu Sans']
fig = plt.figure(figsize=(19.2, 10.8), dpi=100, facecolor=BG); ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 1920); ax.set_ylim(1080, 0); ax.axis('off')
ax.text(120, 140, 'Chapter 0', color=INK2, fontsize=28, family=F, va='center')
ax.text(120, 250, 'IFC Extraction Program', color=INK, fontsize=72, fontweight='bold', family=F, va='center')
ax.text(122, 340, 'everything your model already knows, at no extra cost', color=INK2, fontsize=32, family=F, va='center')
for i, (a, b) in enumerate([('Set up in seconds.', 'the camera follows waypoints you save'),
                            (f'Baked in {mins} minutes.', f'{total:,} pieces, {days} days of programme, on one laptop'),
                            ('No keyframes, no video editor.', 'the build order, cards and checks come from your model')]):
    y = 520 + i * 150
    ax.text(120, y, a, color=INK, fontsize=44, fontweight='bold', family=F, va='center')
    ax.text(122, y + 56, b, color=INK2, fontsize=26, family=F, va='center')
fig.savefig(out, dpi=100, facecolor=BG); print(f'§CH0_CARD out={out}')
