// scratch-style driver (not product code): the importer's STANDARD gate + convert on a directory of typed DXFs. Usage: node gate_probe.js <dir>. Reads bim-ootb modeller modules read-only.
const fs=require('fs'),path=require('path'); const D='/home/red1/bim-ootb/modeller/';
const I=require(D+'dxf2bim_import.js'),P=require(D+'dxf2prep.js'),SG=require(D+'dxf2suggest.js'),MK=require(D+'dxf2bim/dxf2marks.js');
const dir=process.argv[2]; const names=fs.readdirSync(dir).filter(f=>f.endsWith('.dxf')).sort();
const eff=names.map(n=>({name:n,text:fs.readFileSync(path.join(dir,n),'utf8')}));
const read=I.readSheets(eff,{prep:P,prepChoices:{}});
read.forEach(s=>console.log('§GATE sheet',s.name,'role',s.role,'why',s.why||'','layers',JSON.stringify(((s.desc&&s.desc.layers)||[]).map(l=>l.name+':'+l.type))));
const g=I.gate(read,{set:'STD'});
console.log('§GATE ok',g.ok,'keys',Object.keys(g).join(','));
console.log('§GATE refused',JSON.stringify(g.refused||g.reasons||g.why||null).slice(0,900));
if(g.R){const R=g.R; console.log('§GATE R keys',Object.keys(R).join(',')); for(const k of Object.keys(R)){const v=R[k]; if(Array.isArray(v)) console.log('§GATE R.'+k,'n=',v.length);} }
if(g.ok){ try{const c=I.convert(read,{set:'STD'}); console.log('§CONVERT keys',Object.keys(c).join(',')); if(c.R) for(const k of Object.keys(c.R)){const v=c.R[k]; if(Array.isArray(v)) console.log('§CONVERT R.'+k,'n=',v.length);} }catch(e){console.log('§CONVERT error',e.message)} }
try{ const c=I.convert(read,{set:'STD'}); const els=c.els||[]; const by={}; els.forEach(e=>{const k=e.cls||e.class||e.type||e.kind||'?'; by[k]=(by[k]||0)+1});
 console.log('§CONVERT els',els.length,JSON.stringify(by)); console.log('§CONVERT first el keys',els[0]?Object.keys(els[0]).join(','):'-');
 console.log('§CONVERT gaps',(c.gaps||[]).length,JSON.stringify((c.gaps||[]).slice(0,25)).slice(0,1500)); console.log('§CONVERT refused',JSON.stringify(c.refused||[]).slice(0,400));
 console.log('§CONVERT verdict',JSON.stringify(c.verdict).slice(0,600)); console.log('§CONVERT roofZ',JSON.stringify(c.roofZ),'slabZ',JSON.stringify(c.slabZ),'frame',JSON.stringify(c.frame).slice(0,200));
}catch(e){console.log('§CONVERT error',e.stack.split('\n').slice(0,3).join(' | '))}
try{ const c2=I.convert(read,{set:'STD'}); const bl=(c2.verdict&&c2.verdict.blocking)||[]; const cnt={}; bl.forEach(b=>{const k=b.code+'|'+b.shape+'|'+b.sheet+'|'+(b.detail&&b.detail.layer); cnt[k]=(cnt[k]||0)+1}); console.log('§VERDICT blocking',bl.length,JSON.stringify(cnt));
 const adv=(c2.verdict&&c2.verdict.advisory)||[]; console.log('§VERDICT advisory',adv.length,JSON.stringify(adv.slice(0,5)).slice(0,500)); console.log('§VERDICT keys',Object.keys(c2.verdict||{}).join(',')); console.log('§CONVERT ST',JSON.stringify(c2.ST).slice(0,400)); console.log('§CONVERT merged',JSON.stringify(c2.merged).slice(0,300)); }catch(e){console.log('§VERDICT error',e.message)}
