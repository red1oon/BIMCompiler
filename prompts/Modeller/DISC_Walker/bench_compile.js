// The missing row in ROOM_INJECTOR_NEEDLE.md's l1ms table: Hospital's own client-side compile cost.
// Same viewer/lib/room_walker.js the browser runs, same sql.js WASM, against the SERVED bytes.
// CAVEAT stated up front: node, not a browser tab — no DOM, no competing render loop. Treat as a
// floor on the real first-load cost, not a substitute for the in-browser §STAGE4_RELOAD3 number.
const fs=require('fs'); const WT=process.argv[2], DB=process.argv[3], LABEL=process.argv[4];
const initSqlJs=require(WT+'/viewer/lib/sql-wasm.js');
const RW=require(WT+'/viewer/lib/room_walker.js');
(async()=>{
  const SQL=await initSqlJs({wasmBinary:fs.readFileSync(WT+'/viewer/lib/sql-wasm.wasm')});
  const t0=Date.now();
  const db=new SQL.Database(new Uint8Array(fs.readFileSync(DB)));
  const q=(s,p)=>{try{const r=p?db.exec(s,p):db.exec(s);return r.length?r[0].values:[]}catch(e){return[]}};
  const tOpen=Date.now();
  const elems=q("SELECT count(*) FROM elements_meta")[0][0];
  const before=q("SELECT count(*) FROM spatial_structure WHERE type='IfcSpace'")[0][0];
  const t1=Date.now();
  let out=null, err=null;
  try { out = RW.compileRooms(db); } catch(e){ err=e.message; }
  const t2=Date.now();
  const n = out ? (out.rooms ? out.rooms.length : (Array.isArray(out)?out.length:'?')) : 'ERR';
  console.log(`§BENCH_COMPILE ${LABEL} elements=${elems} rooms_before=${before} rooms_after=${n} `+
    `open=${tOpen-t0}ms compile=${t2-t1}ms total=${t2-t0}ms`+(err?` ERR=${err}`:''));
})().catch(e=>console.log('ERR '+e.stack));
