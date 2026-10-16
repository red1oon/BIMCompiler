// Acceptance: R14 degree, deg0 count, room-pair pathability (BFS over the edge set)
const fs=require('fs');
const WT=process.argv[2];
const initSqlJs=require(WT+'/viewer/lib/sql-wasm.js'); const RG=require(WT+'/common/room_graph.js');
(async()=>{const SQL=await initSqlJs({wasmBinary:fs.readFileSync(WT+'/viewer/lib/sql-wasm.wasm')});
for(const spec of process.argv.slice(3)){const [f,label]=spec.split('::');
const db=new SQL.Database(new Uint8Array(fs.readFileSync(f)));
const q=s=>{try{const r=db.exec(s);return r.length?r[0].values:[]}catch(e){return[]}};
const g=RG.buildGraph(q,{log:()=>{}});
const adj={}; const deg={};
for(const e of g.edges){ (adj[e.a]=adj[e.a]||[]).push(e.b); (adj[e.b]=adj[e.b]||[]).push(e.a);
  deg[e.a]=(deg[e.a]||0)+1; deg[e.b]=(deg[e.b]||0)+1; }
const rooms=g.nodes.filter(n=>n.kind==='room');
const deg0=rooms.filter(r=>!deg[r.guid]).length;
// components over ALL nodes, then count room-pairs in the same component
const comp={}; let c=0;
for(const n of Object.keys(g.nodesByGuid)){ if(comp[n]!==undefined) continue; c++;
  const st=[n]; comp[n]=c; while(st.length){const x=st.pop(); for(const y of (adj[x]||[])) if(comp[y]===undefined){comp[y]=c; st.push(y);} } }
const sizes={}; for(const r of rooms){const k=comp[r.guid]; sizes[k]=(sizes[k]||0)+1;}
let reach=0; for(const k in sizes) reach+=sizes[k]*(sizes[k]-1)/2;
const total=rooms.length*(rooms.length-1)/2;
const r14=rooms.find(r=>String(r.name).indexOf(' R14')>=0&&String(r.storey).indexOf('Level 1')>=0);
console.log(`${label.padEnd(18)} rooms=${String(rooms.length).padStart(4)} deg0=${String(deg0).padStart(3)} pathable=${reach}/${total} (${(100*reach/total).toFixed(1)}%)`+(r14?`  R14deg=${deg[r14.guid]||0}`:''));
}})().catch(e=>console.log('ERR '+e.stack));
