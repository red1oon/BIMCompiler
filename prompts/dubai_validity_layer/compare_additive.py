# Additivity witness: new worker's {type, metrics, message} must equal the unmodified worker's, byte-for-byte as JSON.
import json,sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2])); bad=0
for x,y in zip(a,b):
    kx={k:x.get(k) for k in('type','metrics','message')}; ky={k:y.get(k) for k in('type','metrics','message')}
    ok=json.dumps(kx,sort_keys=True)==json.dumps(ky,sort_keys=True); bad+=not ok
    print('ADDITIVE', 'EQUAL' if ok else 'DIFFERENT', x['file'], 'new_keys=',sorted(set(x['keys'])-set(y['keys'])))
print('§VL_ADDITIVE_VERDICT', 'PASS' if bad==0 and len(a)==len(b) and len(a)>0 else 'FAIL', 'files=',len(a),'different=',bad)
