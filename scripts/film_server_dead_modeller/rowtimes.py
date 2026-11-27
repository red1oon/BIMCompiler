import json,sys,os
ASM=sys.argv[1]
tl=json.load(open(ASM+'/timeline.json')); it={x['id']:x for x in tl['items']}
def endof(item,idx): k=it[item]['kept'][idx]; return (k['f0']+k['n'])/25
b={'create':endof('create',2),'move':endof('move',4),'clash':endof('clash',5),'resolve':endof('resolve',2)}
rows={'pair':(it['pair']['start'],it['pair']['end']),'draw':(it['create']['start'],b['create']),'visit1':(b['create'],it['create']['end']),'move':(it['move']['start'],b['move']),'agree':(b['move'],it['move']['end']),'clash':(it['clash']['start'],b['clash']),'warn':(b['clash'],it['clash']['end']),'resolve':(it['resolve']['start'],b['resolve']),'cleared':(b['resolve'],it['resolve']['end']),'rotate':(it['rotate']['start'],it['rotate']['end']),'limits':(it['limits']['start'],it['limits']['end']),'close':(it['close']['start'],it['close']['end'])}
json.dump(rows,open('rows_time.json','w'))
for n,(a,e) in rows.items(): print('%-8s %6.2f-%6.2f  %5.1f'%(n,a,e,e-a))
