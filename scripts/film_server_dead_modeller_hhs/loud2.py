# two-pass loudnorm on the muxed film's audio only (video stream copied): usage loud2.py in.mp4 out.mp4 (refuses to overwrite)
import subprocess,sys,json,re,os
src,dst=sys.argv[1:3]
if os.path.exists(dst): sys.exit('refuse: exists '+dst)
r=subprocess.run(['ffmpeg','-hide_banner','-i',src,'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-vn','-f','null','-'],capture_output=True,text=True)
j=json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}',r.stderr,re.S).group(0)); print('pass1',j)
af='loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=%s:measured_LRA=%s:measured_TP=%s:measured_thresh=%s:offset=%s:linear=true'%(j['input_i'],j['input_lra'],j['input_tp'],j['input_thresh'],j['target_offset'])
r=subprocess.run(['ffmpeg','-hide_banner','-y','-i',src,'-c:v','copy','-af',af,'-c:a','aac','-b:a','192k','-ar','48000',dst],capture_output=True,text=True)
print('rc',r.returncode)
