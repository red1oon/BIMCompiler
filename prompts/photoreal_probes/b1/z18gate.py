import json,base64,numpy as np
S='/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/'
d=json.load(open(S+'z18_gate.json'))['result']; org=np.array(d['org'][:3]); cell=d['cell']
R={r['n']:(r,np.frombuffer(base64.b64decode(r['b64']),dtype=np.float32).reshape(r['h'],r['w'],6)) for r in d['rois']}
def teeth(name, axis, rng, lo, hi, want):
    r,a=R[name]; G=a[:,:,0]>=0.999
    E=[]
    for k in rng:
        line=G[k,lo:hi] if axis=='row' else G[lo:hi,k]
        t=np.where(np.diff(line.astype(int))!=0)[0]
        if len(t)==0: continue
        i=lo+t[0]+1
        y,x=(k,i) if axis=='row' else (i,k)
        E.append((k,i,*a[y,x,2:5],a[y,x,5],a[y-(0 if axis=='row' else 1),x-(1 if axis=='row' else 0),5]))
    E=np.array(E)
    di=np.diff(E[:,1]); tj=np.where(np.abs(di)>=3)[0]
    print(f'\n== {name}: gate boundary traced on {len(E)} {axis}s ({want})')
    print('  boundary image coord per line (every 5th):', E[::5,1].astype(int).tolist())
    print('  teeth (jumps >=3 px between consecutive lines):',len(tj),'at lines',(E[tj+1,0]).astype(int).tolist())
    W=E[tj+1][:,2:5]
    if len(W)>1:
        sp=np.linalg.norm(np.diff(W,axis=0),axis=1); print('  world at tooth jumps:',np.round(W,3).tolist()); print('  spacing between tooth jumps (m):',np.round(sp,3).tolist())
        for j,c in enumerate('xyz'):
            v=W[:,j]; fr=((v-org[j])/cell)%1; print(f'   {c}: values {np.round(v,3).tolist()} cell-fraction {np.round(fr,2).tolist()} diffs {np.round(np.diff(v),3).tolist()}')
    lum=E[:,5]; lum0=E[:,6]; print('  luminance at boundary: gate-open side mean %.4f, the other side mean %.4f (ratio %.2f)'%(np.mean(np.maximum(lum,lum0)),np.mean(np.minimum(lum,lum0)),np.mean(np.maximum(lum,lum0))/np.mean(np.minimum(lum,lum0))))
    return E
teeth('floor','row',range(100,274),200,440,'floor sawtooth, image x ~780-800')
teeth('duct','col',range(100,220),120,200,'left duct side, image x 480-600')
teeth('duct','col',range(380,460),0,160,'upper-right duct, image x 760-840')
