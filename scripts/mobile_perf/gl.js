const puppeteer=require(process.argv[2]+'/tools/node_modules/puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new'});const p=await b.newPage();
 console.log('§P0_GL '+await p.evaluate(()=>{const g=document.createElement('canvas').getContext('webgl2');const e=g&&g.getExtension('WEBGL_debug_renderer_info');return g?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'no webgl2'}));await b.close();})();
