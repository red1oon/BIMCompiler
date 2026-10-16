const fs=require('fs'),path=require('path');const OOTB='/home/red1/bim-ootb';
const initSqlJs=require(path.join(OOTB,'node_modules/sql.js/dist/sql-wasm.js'));
const RG=require('/tmp/wt-spine-bridge/common/room_graph.js');   // the CANDIDATE build
(async()=>{const SQL=await initSqlJs({locateFile:f=>path.join(OOTB,'node_modules/sql.js/dist/',f)});
const db=new SQL.Database(new Uint8Array(fs.readFileSync(process.argv[2])));
const q=s=>{const r=db.exec(s);return r.length?r[0].values:[]};
const logs=[];RG.buildGraph(q,{log:m=>logs.push(m)});
const br=logs.filter(l=>/§ROOM_SPINE_BRIDGE room=/.test(l));
const d=br.map(l=>parseFloat(l.match(/dist=([\d.]+)m/)[1])).sort((a,b)=>a-b);
console.log('§VERIFY new room->spine bridges = '+br.length);
console.log('  dist: min='+d[0].toFixed(2)+'m  median='+d[Math.floor(d.length/2)].toFixed(2)+'m  max='+d[d.length-1].toFixed(2)+'m');
console.log('  buckets:  <=2m: '+d.filter(x=>x<=2).length+'   2-5m: '+d.filter(x=>x>2&&x<=5).length+
            '   5-15m: '+d.filter(x=>x>5&&x<=15).length+'   >15m: '+d.filter(x=>x>15).length);
console.log('\n  the 8 LONGEST fabricated openings:');
br.map(l=>({l,d:parseFloat(l.match(/dist=([\d.]+)m/)[1])})).sort((a,b)=>b.d-a.d).slice(0,8)
  .forEach(x=>console.log('    '+x.d.toFixed(2).padStart(6)+'m  '+x.l.match(/room="([^"]+)"/)[1]));
db.close();})();
