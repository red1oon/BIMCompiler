// FINANCIALS_GROUNDING.md §C census scanner (static, heuristic upper bound). clientTables.txt = lowercase table names from ad_seed.db (AD_Table IsView=N, AccessLevel<>4, has AD_Client_ID column).
const fs=require('fs'),path=require('path');
const root=process.argv[4]||'erp'; // usage: node financials_census.js clientTables.txt out.json <path-to-bim-ootb>/erp
const CT=new Set(fs.readFileSync(process.argv[2],'utf8').split('\n').filter(Boolean));
const dirs=['','callouts','processes','plugins','migrate','overlay'];
let files=[];
function walk(d,deep){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(deep&&!/tests|node_modules/.test(e.name))walk(p,true)}else if(/\.(m?js)$/.test(e.name))files.push(p)}}
for(const d of dirs){const p=path.join(root,d);if(d==='')for(const e of fs.readdirSync(p,{withFileTypes:true}))if(e.isFile()&&/\.m?js$/.test(e.name))files.push(path.join(p,e.name));else;else if(fs.existsSync(p))walk(p,true)}
const hits=[];let stmts=0,filesWith=new Set();
const NAMEK=/\b(name|value|columnname|tablename|docbasetype|documentno|isdefault|issotrx|iso_code|description|isactive\s*=\s*'y'|issummary|isdocnocontrolled|ref_list|classname)\b/i;
for(const f of files){const src=fs.readFileSync(f,'utf8').split('\n');
 for(let i=0;i<src.length;i++){const ln=src[i];
  const m=/(['"`])((?:(?!\1).)*?\b(?:select|update|delete\s+from|insert\s+into)\b(?:(?!\1).)*)\1/i.exec(ln); if(!m)continue;
  // statement = this line + up to 6 following concatenation lines until ; or closing call
  let st=ln;for(let k=1;k<7&&i+k<src.length;k++){if(/^\s*(\/\/|var |const |let |function |return |if )/.test(src[i+k]))break;st+=' '+src[i+k];if(/\)\s*;|\)\)\s*;/.test(src[i+k]))break}
  const tbls=[];const re=/\b(?:from|join|into|update)\s+([a-z_0-9]+)/gi;let t;while((t=re.exec(st)))tbls.push(t[1].toLowerCase());
  const ct=tbls.filter(x=>CT.has(x));if(!ct.length)continue;stmts++;
  const hasClient=/ad_client_id|clientid|client_id|\bcid\b|getclient|tenant/i.test(st);
  if(hasClient)continue;
  const w=/\bwhere\b(.*)/i.exec(st);let cls;
  if(/^\s*(insert)/i.test(m[2]))cls='INSERT';
  else if(!w)cls='SCAN';
  else{const pk=new RegExp('\\b'+ct[0]+'_id\\s*=\\s*\\?|\\b'+ct[0]+'_id\\s*=\\s*[\\d$]|\\bid\\s*=\\s*\\?','i');
    if(pk.test(w[1])&&!/\bor\b|\bin\s*\(/i.test(w[1]))cls='PK';else if(NAMEK.test(w[1]))cls='NAMEKEYED';else cls='OTHER-WHERE';}
  hits.push({f:path.relative(root,f),l:i+1,cls,t:ct[0],s:st.replace(/\s+/g,' ').slice(0,150)});filesWith.add(f)}}
const by={};for(const h of hits)by[h.cls]=(by[h.cls]||0)+1;
console.log(JSON.stringify({files:files.length,clientStmts:stmts,noClientFilter:hits.length,by,filesWith:filesWith.size}));
fs.writeFileSync(process.argv[3],JSON.stringify(hits));
