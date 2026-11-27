const puppeteer=require('/home/red1/bim-compiler/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-gpu']});const p=await b.newPage();
for(let i=1;i<=3;i++){await p.goto(process.argv[2],{waitUntil:'load'});await p.click('#go');
await p.waitForFunction(()=>/done in|ERROR/.test(document.getElementById('out').textContent),{timeout:120000});
console.log('run',i,(await p.evaluate(()=>document.getElementById('out').textContent)).split('\n')[0]);}
await b.close();})();
