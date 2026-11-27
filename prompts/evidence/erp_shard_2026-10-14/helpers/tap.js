const puppeteer=require('/home/red1/bim-compiler/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-gpu']});const p=await b.newPage();
await p.goto(process.argv[2],{waitUntil:'load'});await p.click('#go');
await p.waitForFunction(()=>/done in|ERROR/.test(document.getElementById('out').textContent),{timeout:120000});
console.log(await p.evaluate(()=>document.getElementById('env').textContent+'\n'+document.getElementById('out').textContent));await b.close();})();
