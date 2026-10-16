// Which leg carries CTRL-A's 238 illegal samples — the NEW bridge, or a pre-existing hop?
const fs=require('fs'); const WT=process.argv[2], DB=process.argv[3];
const initSqlJs=require(WT+'/viewer/lib/sql-wasm.js'); const RG=require(WT+'/common/room_graph.js');
(async()=>{const SQL=await initSqlJs({wasmBinary:fs.readFileSync(WT+'/viewer/lib/sql-wasm.wasm')});
const db=new SQL.Database(new Uint8Array(fs.readFileSync(DB)));
const q=s=>{try{const r=db.exec(s);return r.length?r[0].values:[]}catch(e){return[]}};
const g=RG.buildGraph(q,{log:()=>{}});
const ctx={rasters:g.rasters,roomRectsByStorey:g.roomRectsByStorey,corridorRectsByStorey:g.corridorRectsByStorey};
const guids=g.nodes.filter(n=>n.kind==='room').map(n=>n.guid).sort();
const pick=i=>guids[Math.floor(i*(guids.length-1))];
const res=RG.shortestPath(g,pick(0.10),pick(0.90));
const E6=new Set(g.edges.filter(e=>e.kind==='E6').map(e=>e.a+'|'+e.b));
console.log('leg  storey            kind->kind            len   illegal  isE6bridge');
for(let i=0;i+1<res.path.length;i++){
  const A=g.nodesByGuid[res.path[i]],B=g.nodesByGuid[res.path[i+1]];
  if(!A||!B||A.storey!==B.storey) { console.log(String(i).padStart(3)+'  (cross-storey hop, skipped)'); continue; }
  const bad=RG.chordIllegalCount(ctx,A.storey,A.cx,A.cy,B.cx,B.cy);
  const len=Math.hypot(B.cx-A.cx,B.cy-A.cy);
  const e6=E6.has(A.guid+'|'+B.guid)||E6.has(B.guid+'|'+A.guid);
  console.log(String(i).padStart(3)+'  '+String(A.storey).padEnd(18)+(A.kind+'->'+B.kind).padEnd(22)+
    len.toFixed(1).padStart(6)+bad.toString().padStart(9)+'   '+(e6?'YES — §997 bridge':''));
}})().catch(e=>console.log('ERR '+e.stack));
