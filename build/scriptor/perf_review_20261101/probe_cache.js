var WC=require('/home/red1/bim-compiler/scripts/witness_cache.js'),path=require('path');
var f=process.argv[2],cw=process.argv[3];var R=['/home/red1/bim-compiler','/home/red1/bim-ootb'];
function go(){var t=process.hrtime.bigint();var r=WC.runSync({file:f,cwd:cw,roots:R,exclude:[process.argv[4]]});var ms=Number(process.hrtime.bigint()-t)/1e6;
 console.log('cached='+r.cached+' exit='+r.exit+' inputs='+r.inputs+' skip='+r.skip+' ms='+ms.toFixed(0)+' outBytes='+r.out.length+' rssMB='+(process.memoryUsage().rss/1e6).toFixed(0));
 if(r.cached){var fs=require('fs'),sz=r.inputList.map(function(x){try{return [x.p,x.k==='F'?fs.statSync(x.p).size:0]}catch(e){return [x.p,0]}}).sort(function(a,b){return b[1]-a[1]}).slice(0,4);console.log('biggest inputs',JSON.stringify(sz));
  var hs=r.inputList.map(function(x){var t=process.hrtime.bigint();require('crypto').createHash('sha256').update(x.k==='F'?(function(){try{return fs.readFileSync(x.p)}catch(e){return ''}})():'').digest('hex');return [x.p.split('/').slice(-2).join('/'),Number(process.hrtime.bigint()-t)/1e6]}).sort(function(a,b){return b[1]-a[1]}).slice(0,4);console.log('slowest hash ms',JSON.stringify(hs));}}
go();go();
