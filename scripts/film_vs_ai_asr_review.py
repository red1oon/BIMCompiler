import re,subprocess,sys,numpy as np
from faster_whisper import WhisperModel
lang,tsv,prefix,ids=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4].split(',')
m=WhisperModel('small',device='cpu',compute_type='int8')
rows={l.split('\t')[0]:l.rstrip('\n').split('\t') for l in open(tsv)}
def load(w): return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',w,'-f','f32le','-ac','1','-ar','16000','-']),dtype=np.float32)
for rid in ids:
    segs,_=m.transcribe(load(f'{prefix}_{rid}.wav'),language=lang,beam_size=3)
    print(f'[{rid}] text : {rows[rid][5]}\n       heard: '+' '.join(s.text.strip() for s in segs),flush=True)
