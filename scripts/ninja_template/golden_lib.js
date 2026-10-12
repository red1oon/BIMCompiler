// golden_lib.js — load the frozen TEXT goldens of the REAL Laos plugin's output (golden/<name>.cells.tsv, .log.txt). Regenerate: GoldenDump.java on a fresh oracle run.
const fs=require('fs'),path=require('path'); const DIR=path.join(__dirname,'golden');
function unesc(s){ return s.replace(/\\(.)/g,(m,c)=>c==='t'?'\t':c==='n'?'\n':c==='r'?'\r':c); }
function loadCells(name){ const out={Output:{},Process:{}}; const t=fs.readFileSync(path.join(DIR,name+'.cells.tsv'),'utf8').split('\n');
  for(const line of t){ if(!line) continue; const [sh,addr,kind,...rest]=line.split('\t'); const val=unesc(rest.join('\t')); const c=kind==='n'?{t:'n',v:Number(val)}:kind==='b'?{t:'b',v:val==='true'}:kind==='f'?{t:'n',f:val,v:0}:{t:'s',v:val}; out[sh][addr]=c; } return {Sheets:out}; }
function loadLog(name){ return fs.readFileSync(path.join(DIR,name+'.log.txt'),'utf8').split('\n').filter(Boolean); }
module.exports={loadCells,loadLog,DIR};
