// scratch-style driver (not product code): the importer's standard gate + convert WITH the LOD400 library read from a LOCAL directory (exported by BIMCompiler scripts/export_library_subset.js --full).
// Usage: node lib_probe.js <dir of typed dxf> <local library dir ending with />   Reads bim-ootb modeller modules read-only.
const fs=require('fs'),path=require('path'); const D=(process.env.PDF2BIM_OOTB||'/home/red1/bim-ootb')+'/modeller/';
const I=require(D+'dxf2bim_import.js'),P=require(D+'dxf2prep.js');
const dir=process.argv[2], base=process.argv[3];
const names=fs.readdirSync(dir).filter(f=>f.endsWith('.dxf')).sort();
const eff=names.map(n=>({name:n,text:fs.readFileSync(path.join(dir,n),'utf8')}));
const read=I.readSheets(eff,{prep:P,prepChoices:{}});
const fetchJson=async u=>{const f=u.startsWith('/')?u:path.join(base,u); try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){return null}};
(async()=>{
  const r=await I.loadOci(read,{base,fetchJson,convertOpts:{set:'STD'}});
  const R=r.R; console.log('§LIB passes',r.passes,'families',JSON.stringify(r.families),'shards',r.shards.length);
  const els=R.els||[]; const by={}; els.forEach(e=>{const k=e.storey+'/'+e.class; by[k]=(by[k]||0)+1}); console.log('§LIB els',els.length,JSON.stringify(by));
  console.log('§LIB fillHard',JSON.stringify(R.fillHard||[]).slice(0,400)); console.log('§LIB fillGaps',(R.fillGaps||[]).length,JSON.stringify(R.fillGaps||[]));   // whole: witness_doors.py W-D4 reads it (§39)
  const bl=(R.verdict&&R.verdict.blocking)||[]; const cnt={}; bl.forEach(b=>{const k=b.code+'|'+b.shape+'|'+(b.detail&&b.detail.layer); cnt[k]=(cnt[k]||0)+1}); console.log('§LIB blocking',bl.length,JSON.stringify(cnt));
  const ac=(R.verdict&&R.verdict.accepted)||[]; const ca={}; ac.forEach(b=>{const k=b.code+'|'+b.shape+'|'+(b.detail&&b.detail.layer); ca[k]=(ca[k]||0)+1}); console.log('§LIB accepted',ac.length,JSON.stringify(ca),'verdict',R.verdict&&R.verdict.verdict,'advisory codes',JSON.stringify([...new Set(((R.verdict&&R.verdict.advisory)||[]).map(x=>x.code))].filter(x=>/accept/.test(x))));
  console.log('§LIB roofZ',JSON.stringify(R.roofZ).slice(0,200),'slabZ',JSON.stringify(R.slabZ).slice(0,300));
})().catch(e=>console.log('§LIB error',e.stack.split('\n').slice(0,4).join(' | ')));
(async()=>{ const r=await I.loadOci(read,{base,fetchJson,convertOpts:{set:'STD'}}); const R=r.R;
  (R.ST||[]).forEach(st=>{ const v=(st.bridge&&st.bridge.voids)||[]; console.log('§LIB storey',st.name,'voids',v.length,'openings in voids',v.reduce((n,x)=>n+x.openings.length,0),'fills.elements',(st.fills&&st.fills.elements||[]).length,'fills.gaps',JSON.stringify((st.fills&&st.fills.gaps||[]).slice(0,4)).slice(0,500),'hard',st.hard);
    console.log('§LIB bridge keys',Object.keys(st.bridge||{}).join(','),'| ops',(st.ops||[]).length, JSON.stringify(Object.keys(st)).slice(0,300)); });
  const ops=R.ops||[]; const c={}; ops.forEach(o=>{c[o.op_type]=(c[o.op_type]||0)+1}); console.log('§LIB op types',JSON.stringify(c));
})();
// optional IFC write: node lib_probe.js <dir> <lib/> <out.ifc>  (web-ifc from ~/bim-compiler/node_modules, as dxf2bim_cli.js does)
if(process.argv[4]){ (async()=>{ const r=await I.loadOci(read,{base,fetchJson,convertOpts:{set:'STD'}}); const R=r.R;
  const W=require('/home/red1/bim-compiler/node_modules/web-ifc'); const IFC=require(D+'dxf2ifc.js'); const api=new W.IfcAPI(); await api.Init();
  const b=IFC.build(IFC.fromEls(R.els,R.ST),{api,WebIFC:W,name:'pdf2bim_tbkltn_p1.ifc',buildingType:null}); fs.writeFileSync(process.argv[4],Buffer.from(b.bytes));
  console.log('§IFC wrote',process.argv[4],'bytes',b.bytes.length,'byClass',JSON.stringify(b.byClass),'storeys',JSON.stringify(b.storeys),'typed',b.typed,'proxyTyped',JSON.stringify(b.proxyTyped));
})().catch(e=>console.log('§IFC error',e.stack.split('\n').slice(0,4).join(' | '))); }
