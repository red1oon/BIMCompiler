# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v3 ASSEMBLY. Cuts a series of clips (segments of baked films + page clips) into one
# silent film at one format (W×H, FPS, yuv420p, no audio), in the given order. Read the log: §ASSEMBLE seg= lines + total.
# usage: film_assemble.py <out.mp4> <W> <H> <FPS> <file>@<ss>-<to> [<file>@<ss>-<to> ...]   (ss/to in seconds; '-' = to end)
import sys, subprocess, os, tempfile
out, W, H, FPS = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
if os.path.exists(out): sys.exit(f'§ASSEMBLE_REFUSE exists {out}')
tmp = tempfile.mkdtemp(prefix='asm-'); parts = []; t = 0.0
for k, spec in enumerate(sys.argv[5:]):
    f, rng = spec.rsplit('@', 1); ss, to = rng.split('-', 1)
    p = os.path.join(tmp, f'p{k:02d}.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', ss, '-i', f] + (['-t', str(float(to) - float(ss))] if to else []) + \
          ['-vf', f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,fps={FPS}', '-an',
           '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', p]
    subprocess.run(cmd, check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
    print(f'§ASSEMBLE seg={k} src={os.path.basename(f)} ss={ss} to={to or "end"} dur={d:.2f} at={t:.2f}'); t += d; parts.append(p)
lst = os.path.join(tmp, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', out], check=True)
print(f'§ASSEMBLE out={out} segments={len(parts)} total={t:.2f}s')
