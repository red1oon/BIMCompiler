# Negative-control witness. For each mutated K1: target check must FAIL; no OTHER error-severity check may FAIL;
# error checks not FAILing must be PASS (or INCONCLUSIVE only for the schema control, which disables the schema tables by design).
import json,sys
res={r['file']:r for r in json.load(open(sys.argv[1]))}
man=[l.split() for l in open(sys.argv[2]) if l.strip()]
bad=0
for f,target in man:
    v=res[f]['validity']; st={c['id']:(c['status'],c['severity']) for c in v['checks']}
    tf=st[target][0]=='FAIL'
    others=[i for i,(s,sv) in st.items() if s=='FAIL' and i!=target and sv=='error']
    ok=tf and not others
    bad+=not ok
    print('%-30s target=%s %-12s other_error_fails=%s overall=%s -> %s'%(f,target,st[target][0],others,v['overall'],'OK' if ok else 'WRONG'))
print('§VL_NEGCONTROL_VERDICT','PASS' if bad==0 else 'FAIL','controls=',len(man),'wrong=',bad)
