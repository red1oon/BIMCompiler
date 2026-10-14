import json,urllib.request as u
def rpc(params):
    r=u.Request('http://localhost:8069/jsonrpc',json.dumps({"jsonrpc":"2.0","method":"call","params":params}).encode(),{'Content-Type':'application/json'})
    d=json.load(u.urlopen(r,timeout=300))
    if 'error' in d: raise Exception(d['error']['data']['message'][:400])
    return d.get('result', d)
uid=rpc({"service":"common","method":"login","args":["odoodemo","admin","admin"]})
def ex(m,f,a,k={}): return rpc({"service":"object","method":"execute_kw","args":["odoodemo",uid,"admin",m,f,a,k]})
