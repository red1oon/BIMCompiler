// VIEWER_FIND_PANEL_ROOM_ACCURACY.md §17 — A/B a room_graph.js change against origin/main and
// separate THE ROUTE (doors[]/distance/room-stop sequence) from THE DRAWN GEOMETRY (path anchors).
// This is what caught two real defects before they reached a PR: a dropped room stop on HHS and a
// null-contract flip on JKR. RUN: node compare_routes_ab.js <db>::<label>[::<patch.sql>] ...
// A/B origin/main vs this PR: WHAT changed — doors, distance, room sequence, or only geometry anchors?
// Invariant under test: a graph with MORE walkable evidence may only ADD connectivity and never
// LENGTHEN an already-connected pair's route.
const fs=require('fs'); const WT='/tmp/wt-roompath-logic';
const initSqlJs=require(WT+'/viewer/lib/sql-wasm.js');
const NEW=require(WT+'/common/room_graph.js'), OLD=require('/tmp/rg_old/common/room_graph.js');
(async()=>{const SQL=await initSqlJs({wasmBinary:fs.readFileSync(WT+'/viewer/lib/sql-wasm.wasm')});
for (const spec of process.argv.slice(2)){
 const [f,label,patch]=spec.split('::');
 const mk=()=>{const d=new SQL.Database(new Uint8Array(fs.readFileSync(f))); if(patch) d.run(fs.readFileSync(patch,'utf8'));
   return s=>{try{const r=d.exec(s);return r.length?r[0].values:[]}catch(e){return[]}}};
 const qN=mk(), qO=mk();
 const gN=NEW.buildGraph(qN,{log:()=>{}}), gO=OLD.buildGraph(qO,{log:()=>{}});
 const rooms=gN.nodes.map(n=>n.guid).sort(); const L=Math.min(rooms.length,24);
 const realLog=console.log.bind(console); console.log=()=>{};
 let n=0,sameDoors=0,sameDist=0,sameRoomSeq=0,samePath=0,newlyConnected=0,lostConnection=0,longer=0,shorter=0,maxLonger=0;
 for(let i=0;i<L;i++)for(let j=i+1;j<L;j++){
  const pN=NEW.shortestPath(gN,rooms[i],rooms[j]), pO=OLD.shortestPath(gO,rooms[i],rooms[j]);
  if(!pO&&!pN) continue; n++;
  if(pN&&!pO){newlyConnected++;continue;} if(!pN&&pO){lostConnection++;continue;}
  const dN=JSON.stringify(pN.doors.map(d=>d.guid)), dO=JSON.stringify(pO.doors.map(d=>d.guid));
  if(dN===dO) sameDoors++;
  if(Math.abs(pN.distance-pO.distance)<1e-9) sameDist++;
  else if(pN.distance>pO.distance+1e-9){longer++; maxLonger=Math.max(maxLonger,pN.distance-pO.distance);} else shorter++;
  const rs=p=>JSON.stringify(p.path.filter(g=>{const k=(g&&(p===pN?gN:gO).nodesByGuid[g]||{}).kind; return k==='room'||k==='exit';}));
  if(rs(pN)===rs(pO)) sameRoomSeq++;
  if(JSON.stringify(pN.path)===JSON.stringify(pO.path)) samePath++;
 }
 console.log=realLog;
 console.log(`§AB ${label} pairs=${n} sameDoors=${sameDoors} sameDist=${sameDist} sameRoomSeq=${sameRoomSeq} samePathAnchors=${samePath} newlyConnected=${newlyConnected} lostConnection=${lostConnection} longer=${longer} (maxLonger=${maxLonger.toFixed(2)}m) shorter=${shorter}`);
}})().catch(e=>console.log('ERR '+e.stack));
