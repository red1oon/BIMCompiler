// VIEWER_FIND_PANEL_ROOM_ACCURACY.md §17 — the probe that found the 5cm floor-plane miss: per storey,
// the raster builder's z window vs the real IfcSlab z values and their areas.
// RUN: node probe_raster_zband.js <db>   (from a bim-ootb worktree)
const fs=require('fs'); const WT=__dirname;
const initSqlJs=require(WT+'/viewer/lib/sql-wasm.js'); const RG=require(WT+'/common/room_graph.js');
(async()=>{const SQL=await initSqlJs({wasmBinary:fs.readFileSync(WT+'/viewer/lib/sql-wasm.wasm')});
const db=new SQL.Database(new Uint8Array(fs.readFileSync(process.argv[2])));
const q=(s,p)=>{try{const r=db.exec(s,p);return r.length?r[0].values:[]}catch(e){return[]}};
const g=RG.buildGraph(q,{log:()=>{}});
const slabs=q("SELECT m.guid,m.storey,t.center_z,t.bbox_z,t.bbox_x,t.bbox_y FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid WHERE m.ifc_class LIKE 'IfcSlab%' AND t.center_z IS NOT NULL");
const storeys=Array.from(new Set(g.nodes.map(n=>n.storey)));
storeys.forEach(st=>{
  const rooms=g.nodes.filter(n=>n.storey===st);
  const zAvg=rooms.reduce((s,n)=>s+n.cz,0)/(rooms.length||1);
  const lo=zAvg-2, hi=zAvg+1;
  const inWin=slabs.filter(s=>s[2]>=lo&&s[2]<=hi);
  const near=slabs.filter(s=>Math.abs(s[2]-zAvg)<=6);
  console.log(`§ZBAND storey=${st} rooms=${rooms.length} roomCzAvg=${zAvg.toFixed(2)} window=[${lo.toFixed(2)},${hi.toFixed(2)}] slabsInWindow=${inWin.length} slabsWithin6m=${near.length}`+
    (near.length?` nearZ=[${near.slice(0,6).map(s=>s[2].toFixed(2)+(s[1]==='Unknown'?'*':'')).join(',')}] areas=[${near.slice(0,6).map(s=>(s[4]*s[5]).toFixed(0)).join(',')}]`:''));
});
})().catch(e=>console.log('ERR '+e.stack));
