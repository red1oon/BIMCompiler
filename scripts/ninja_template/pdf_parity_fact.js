// pdf_parity_fact.js — prints ONE §PDF_PARITY_FACT line computed from the PDF-geometry gate logs (W34 output of run_all.sh section [D]): how many checked items match the commercial converter's
// reference PDFs on the 3 reference sheets. Items = page(2) + edge coverage runs + fills + words per sheet; mismatched = unmatched reference edges + extra edges of ours (+ any other FAIL counts).
// Nothing is typed by hand; INCONCLUSIVE when the logs are missing. usage: node pdf_parity_fact.js [logsDir]
const fs=require('fs'),path=require('path'); const dir=process.argv[2]||path.join(__dirname,'logs'); let items=0,miss=0,n=0,bad=false;
for(const f of ['geom','xtab','v2']){ let t; try{t=fs.readFileSync(path.join(dir,'D_geom_'+f+'.log'),'utf8');}catch(e){bad=true;continue;} n++;
  if(!/§PDF_GEOM_VERDICT PASS/.test(t)){bad=true;continue;} items+=2;
  let m; if((m=/edges: (\d+) coverage runs match/.exec(t))) items+=+m[1]; else if((m=/unmatched ref (\d+), extra ours (\d+) \(of (\d+) reference runs\)/.exec(t))){ items+=+m[3]; miss+=+m[1]+(+m[2]); } else bad=true;
  if((m=/fills: (\d+) fill rect/.exec(t))) items+=+m[1]; else bad=true; if((m=/words: (\d+) words/.exec(t))) items+=+m[1]; else bad=true; }
console.log(bad||!items?`§PDF_PARITY_FACT INCONCLUSIVE sheets=${n}`:`§PDF_PARITY_FACT items=${items} mismatched=${miss} matchPct=${(100*(items-miss)/items).toFixed(1)} sheets=${n}`);
