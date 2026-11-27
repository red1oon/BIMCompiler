import subprocess,re,sys,json
def luma(path):
    r=subprocess.run(['ffmpeg','-hide_banner','-t','8','-i',path,'-vf','fps=25,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-','-f','null','-'],capture_output=True,text=True)
    out=r.stdout; fr=[]; t=None
    for l in out.split('\n'):
        m=re.search(r'pts_time:([0-9.]+)',l)
        if m: t=float(m.group(1))
        m=re.search(r'YAVG=([0-9.]+)',l)
        if m and t is not None: fr.append((t,float(m.group(1))))
    return fr
def pulse(path):
    fr=luma(path); seen_black=False; tw=None; te=None
    for t,y in fr:
        if y<30: seen_black=True
        if seen_black and tw is None and y>200: tw=t
        if tw is not None and te is None and t>tw and y<60: te=t; break
    return tw,te,len(fr)
if __name__=='__main__':
    v=json.load(open(sys.argv[1]+'/videos.json')); c=json.load(open(sys.argv[1]+'/cues.json'))
    cm={x['name']:x['t'] for x in c['cues']}; res={}
    for w in 'AB':
        tw,te,n=pulse(v[w]); res[w]={'white':tw,'end':te,'frames':n}
        print(w,'first white',tw,'back to black',te,'(white lasted %.2fs vs cue %.2fs)'%(te-tw,cm['pulse_end']-cm['pulse_white']),'frames@25',n)
    json.dump(res,open(sys.argv[1]+'/sync.json','w'))
