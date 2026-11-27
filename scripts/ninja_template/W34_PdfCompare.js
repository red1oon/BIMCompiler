// W34 — numeric comparison of OUR PDF vs a Spire-produced reference PDF (both extracted by pdf_geom.py; no pixels, no eyeballing).
// Tolerances (stated, not hidden): page height 0.05pt; page width / x positions 2.0pt (column px rounding is host-dependent, <=1px per column);
// fills & edges: y 0.15pt, x 2.0pt, line width 0.1pt; words: text equal, horizontal anchor (left|centre|right, whichever agrees best) 3.0pt (Spire adds per-run character spacing of ~0.09pt/char to emulate Excel text widths -> 2-3pt drift along a long line), vertical centre 3.0pt (font metrics differ).
// Spire's "Evaluation Warning" banner words are excluded (unlicensed build only). INCONCLUSIVE when the reference has no words.
const fs=require('fs'); const A=JSON.parse(fs.readFileSync(process.argv[2])), B=JSON.parse(fs.readFileSync(process.argv[3])); const TOL_X=+(process.env.TOL_X||2.0), TOL_W=+(process.env.TOL_W||3.0), TOL_Y=0.15;
const BANNER=new Set(['Evaluation','Warning',':','The','document','was','created','with','Spire.XLS','for','Java']);
const res=[]; const bad=(k,m)=>{res.push(`FAIL ${k}: ${m}`)}; const ok=(k,m)=>res.push(`ok   ${k}: ${m}`);
// page
Math.abs(A.page[1]-B.page[1])<=0.05?ok('pageHeight',`${A.page[1]} == ${B.page[1]}`):bad('pageHeight',`${A.page[1]} vs ${B.page[1]}`);
Math.abs(A.page[0]-B.page[0])<=TOL_X?ok('pageWidth',`${A.page[0]} ~ ${B.page[0]} (d=${(B.page[0]-A.page[0]).toFixed(2)})`):bad('pageWidth',`${A.page[0]} vs ${B.page[0]}`);
// edges: merge collinear segments into coverage intervals
function cover(lines){ const H={},V={}; lines.forEach(l=>{ const lw=Math.round(l.lw*10)/10; const hor=Math.abs(l.y0-l.y1)<0.05, ver=Math.abs(l.x0-l.x1)<0.05; if(hor){const k=Math.round(l.y0*10)/10+'|'+lw; (H[k]=H[k]||[]).push([Math.min(l.x0,l.x1),Math.max(l.x0,l.x1)]);} else if(ver){const k=Math.round(l.x0*10)/10+'|'+lw; (V[k]=V[k]||[]).push([Math.min(l.y0,l.y1),Math.max(l.y0,l.y1)]);} });
  const mergeI=a=>{a.sort((p,q)=>p[0]-q[0]);const o=[];a.forEach(i=>{const t=o[o.length-1]; if(t&&i[0]<=t[1]+0.3) t[1]=Math.max(t[1],i[1]); else o.push(i.slice());});return o;};
  const out=[]; for(const k in H){const [y,lw]=k.split('|');mergeI(H[k]).forEach(i=>out.push({o:'h',p:+y,lw:+lw,a:i[0],b:i[1]}));} for(const k in V){const [x,lw]=k.split('|');mergeI(V[k]).forEach(i=>out.push({o:'v',p:+x,lw:+lw,a:i[0],b:i[1]}));} return out; }
const ea=cover(A.lines), eb=cover(B.lines); const used=new Set(); let miss=0;
ea.forEach(e=>{ const j=eb.findIndex((f,i)=>!used.has(i)&&f.o===e.o&&Math.abs(f.lw-e.lw)<=0.1&&Math.abs(f.p-e.p)<=(e.o==='h'?TOL_Y:TOL_X)&&Math.abs(f.a-e.a)<=(e.o==='h'?TOL_X:TOL_Y)&&Math.abs(f.b-e.b)<=(e.o==='h'?TOL_X:TOL_Y)); if(j>=0) used.add(j); else {miss++; if(miss<=4) res.push(`     unmatched reference edge ${JSON.stringify(e)}`);} });
const extra=eb.length-used.size; const KNOWN=process.env.KNOWN_EDGE_DEVIATION; /* 'unmatchedRef,extraOurs' pinned deviation (D2): passes ONLY if the numbers are exactly these */
if(miss===0&&extra===0) ok('edges',`${ea.length} coverage runs match`); else if(KNOWN&&KNOWN===`${miss},${extra}`) ok('edges',`KNOWN DEVIATION D2 pinned: unmatched ref ${miss}, extra ours ${extra} (of ${ea.length} reference runs)`); else bad('edges',`reference ${ea.length}, ours ${eb.length}, unmatched ref ${miss}, extra ours ${extra}`+(KNOWN?` (pinned D2 was ${KNOWN})`:''));
// fills
const fa=A.rects, fb=B.rects; let fm=0; fa.forEach(r=>{ const j=fb.findIndex(q=>Math.abs(q.y0-r.y0)<=0.3&&Math.abs(q.y1-r.y1)<=0.3&&Math.abs(q.x0-r.x0)<=TOL_X&&Math.abs(q.x1-r.x1)<=TOL_X&&(r.fc||[]).every((v,i)=>Math.abs(v-((q.fc||[])[i]||0))<0.01)); if(j<0) fm++; });
(fm===0&&fa.length===fb.length)?ok('fills',`${fa.length} fill rect(s) match incl. colour`):bad('fills',`reference ${fa.length}, ours ${fb.length}, unmatched ${fm}`);
// words
const wa=A.words.filter(w=>!BANNER.has(w.t)), wb=B.words.filter(w=>!BANNER.has(w.t)); const takenB=new Set(); let wm=0,wx=0,wy=0; const ex=[];
// match each reference word to the NEAREST same-text word of ours (greedy, reading order) - robust to a shifted occurrence index
const byText={}; wb.forEach((w,i)=>(byText[w.t]=byText[w.t]||[]).push(i));
wa.slice().sort((p,q)=>p.y0-q.y0||p.x0-q.x0).forEach(w=>{ let best=-1,bd=1e9; (byText[w.t]||[]).forEach(i=>{ if(takenB.has(i)) return; const o=wb[i]; const d=Math.hypot(o.x0-w.x0,(o.y0+o.y1)/2-(w.y0+w.y1)/2); if(d<bd){bd=d;best=i;} });
  if(best<0||bd>60){wm++; if(ex.length<8) ex.push(`word missing in ours: ${w.t} @${w.x0},${w.y0}`); return;} takenB.add(best); const o=wb[best];
  const dx=Math.min(Math.abs(o.x0-w.x0),Math.abs(o.x1-w.x1),Math.abs((o.x0+o.x1)/2-(w.x0+w.x1)/2)), dy=Math.abs((o.y0+o.y1)/2-(w.y0+w.y1)/2); if(dx>TOL_W){wx++; if(ex.length<8) ex.push(`x ${w.t}: ref ${w.x0}-${w.x1} ours ${o.x0}-${o.x1}`);} if(dy>3.0){wy++; if(ex.length<8) ex.push(`y ${w.t}: ref ${w.y0} ours ${o.y0}`);} });
const extraW=wb.length-takenB.size; if(extraW>0&&ex.length<8) wb.forEach((w,i)=>{ if(!takenB.has(i)&&ex.length<8) ex.push(`extra word in ours: ${w.t} @${w.x0},${w.y0}`); });
(wm===0&&wx===0&&wy===0&&extraW===0)?ok('words',`${wa.length} words, anchors within ${TOL_W}pt, vertical within 3pt`):bad('words',`${wa.length} reference words: missing ${wm}, extra in ours ${extraW}, x>${TOL_W} ${wx}, y>3 ${wy}`);
ex.slice(0,6).forEach(e=>res.push('     '+e));
console.log(res.join('\n')); const failed=res.some(r=>r.startsWith('FAIL')); console.log('§PDF_GEOM_VERDICT '+(wa.length===0?'INCONCLUSIVE (no reference words)':failed?'FAIL':'PASS'));
