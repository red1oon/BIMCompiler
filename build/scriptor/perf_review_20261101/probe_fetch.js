var m=JSON.parse(require('fs').readFileSync('/home/red1/bim-compiler/dev_env/manifest.json','utf8'));
var t=Date.now();var peak=0;var iv=setInterval(function(){peak=Math.max(peak,process.memoryUsage().rss)},5);
require('/home/red1/bim-compiler/scripts/dev_env_fetch.js').fetchAll(m,{BIMCompiler:process.argv[2]},console.log).then(function(r){clearInterval(iv);console.log(JSON.stringify(r.results),'ms',Date.now()-t,'sampledPeakRssMB',(peak/1e6).toFixed(0))});
