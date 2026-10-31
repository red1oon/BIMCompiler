#!/usr/bin/env node
// usage: film_html_shot.js <out_dir> <a.html> [<b.html> ...]  -> <out_dir>/<name>.png at 1920x1080 (Playwright chromium, --disable-gpu). Used by film_server_dead_desktop_build.py for the cards.
const PW=require('/home/red1/bim-ootb/tests/node_modules/playwright'),path=require('path');
(async()=>{const out=process.argv[2];const b=await PW.chromium.launch({args:['--disable-gpu']});const p=await b.newPage({viewport:{width:1920,height:1080}});
for(const f of process.argv.slice(3)){await p.goto('file://'+path.resolve(f));await p.waitForTimeout(300);const o=path.join(out,path.basename(f,'.html')+'.png');await p.screenshot({path:o});console.log('§CARD '+o);}await b.close();})();
