# Mux fitted narration onto the silent film: each clip adelay'd to its cue, amix, loudnorm -16 LUFS, captions burned (.ass).
# usage (from the fit dir): mux.py <tag> <silent.mp4> <out.mp4>   — refuses to overwrite an existing output.
import sys,os,subprocess
tag,V,OUT=sys.argv[1:4]
if os.path.exists(OUT): sys.exit(f'§MUX_REFUSE exists {OUT}')
rows=[l.split('\t') for l in open(f'{tag}_plan.tsv').read().split('\n') if l]
cmd=['ffmpeg','-hide_banner','-y','-i',V]
for _,_,f in rows: cmd+=['-i',f.strip()]
fl=';'.join(f'[{k+1}:a]adelay={int(round(float(a)*1000))}:all=1[a{k}]' for k,(_,a,_) in enumerate(rows))
n=len(rows)
# optional page audio (the app's own V sounds, aligned by film_page_audio.py) under the narration
SFX=os.environ.get('SFX_WAV')
if SFX and os.path.exists(SFX):
    cmd+=['-i',SFX]; fl+=f';[{n+1}:a]volume={os.environ.get("SFX_VOL","0.9")}[a{n}]'; n+=1
nv=len(rows)
# optional music bed (film_music_bed.py) — DUCKED under the voices: the narration is the sidechain key (§8 MUSIC BED)
MUS=os.environ.get('MUSIC_WAV')
if MUS and os.path.exists(MUS):
    cmd+=['-i',MUS]; mi=len(rows)+1+(1 if (SFX and os.path.exists(SFX)) else 0)
    vox=''.join(f'[a{k}]' for k in range(nv))
    rest=''.join(f'[a{k}]' for k in range(nv,n))
    fl+=(f';{vox}amix=inputs={nv}:normalize=0:duration=longest,asplit=2[vox][vkey]'
         f';[{mi}:a]volume={os.environ.get("MUSIC_VOL","0.16")}[mus]'
         f';[mus][vkey]sidechaincompress=threshold=0.02:ratio=10:attack=40:release=600:makeup=1'+(',asplit=2[mduck][mstem]' if os.environ.get('MUSIC_STEM') else '[mduck]')+'')
    mix=f'[vox]{rest}[mduck]amix=inputs={2+n-nv}:normalize=0:duration=longest,apad,loudnorm=I=-16:TP=-1.5:LRA=11[aout]'
else:
    mix=''.join(f'[a{k}]' for k in range(n))+f'amix=inputs={n}:normalize=0:duration=longest,apad,loudnorm=I=-16:TP=-1.5:LRA=11[aout]'
cmd+=['-filter_complex',f'{fl};{mix};[0:v]ass={tag}.ass[vout]','-map','[vout]','-map','[aout]','-c:v','libx264','-crf','17',
      '-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-t',os.environ.get('FILM_SEC','206.79'),OUT]
if MUS and os.path.exists(MUS) and os.environ.get('MUSIC_STEM'):   # the ducked bed alone — the witness measures it in/out of speech
    cmd+=['-map','[mstem]','-t',os.environ.get('FILM_SEC','206.79'),os.environ['MUSIC_STEM']]
r=subprocess.run(cmd,capture_output=True,text=True); open(f'{tag}_mux.log','w').write(r.stderr)
print(f'§MUX rc={r.returncode} clips={len(rows)} out={OUT}')
