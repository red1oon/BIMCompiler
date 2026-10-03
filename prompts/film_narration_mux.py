# Mux fitted narration onto the silent film: each clip adelay'd to its cue, amix, loudnorm -16 LUFS, captions burned (.ass).
# usage (from the fit dir): mux.py <tag> <silent.mp4> <out.mp4>   — refuses to overwrite an existing output.
import sys,os,subprocess
tag,V,OUT=sys.argv[1:4]
if os.path.exists(OUT): sys.exit(f'§MUX_REFUSE exists {OUT}')
rows=[l.split('\t') for l in open(f'{tag}_plan.tsv').read().split('\n') if l]
cmd=['ffmpeg','-hide_banner','-y','-i',V]
for _,_,f in rows: cmd+=['-i',f.strip()]
fl=';'.join(f'[{k+1}:a]adelay={int(round(float(a)*1000))}:all=1[a{k}]' for k,(_,a,_) in enumerate(rows))
mix=''.join(f'[a{k}]' for k in range(len(rows)))+f'amix=inputs={len(rows)}:normalize=0:duration=longest,apad,loudnorm=I=-16:TP=-1.5:LRA=11[aout]'
cmd+=['-filter_complex',f'{fl};{mix};[0:v]ass={tag}.ass[vout]','-map','[vout]','-map','[aout]','-c:v','libx264','-crf','17',
      '-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-t',os.environ.get('FILM_SEC','206.79'),OUT]
r=subprocess.run(cmd,capture_output=True,text=True); open(f'{tag}_mux.log','w').write(r.stderr)
print(f'§MUX rc={r.returncode} clips={len(rows)} out={OUT}')
