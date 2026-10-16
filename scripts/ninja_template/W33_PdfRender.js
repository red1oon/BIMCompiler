// W33 — render the engine's Output sheet to PDF with build/erp/ninja_pdf.js. usage: node W33_PdfRender.js <template.xlsx> <out.pdf> [profile]   env FROM/TO ; fonts: Arial->Liberation Sans, Lao script->Noto Sans Lao (or $LAO_FONT / $LAO_FONT_BOLD = Phetsarath OT)
const E=require(process.env.EXCELJS||'/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),PDFKit=require(process.env.PDFKIT||'/home/red1/Projects/ninja-template-data/nm/node_modules/pdfkit'),fs=require('fs');
const C=require(__dirname+'/../../build/erp/ninja_calc.js'),H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),R=require(__dirname+'/../../build/erp/ninja_pdf.js');
const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const L=(process.env.NT_DATA||'/home/red1/Projects/ninja-template-data')+'/';
const db=new D(L+'legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f)); const exec=T.sqliteExecutor(db);
const LIB='/usr/share/fonts/truetype/liberation/LiberationSans-', NOTO='/usr/share/fonts/truetype/noto/NotoSansLao-';
const FREE='/usr/share/fonts/truetype/freefont/FreeSerif'; const SAME=process.env.SAME_FONT_AS_SPIRE==='1';   /* witness mode: use the font Spire substituted on this host */
const THAI='/usr/share/fonts/truetype/noto/NotoSansThai-';
const fonts={resolve(name,bold,italic,text){ if(/[\u0E01-\u0E5B]/.test(text)) return bold?(process.env.THAI_FONT_BOLD||THAI+'Bold.ttf'):(process.env.THAI_FONT||THAI+'Regular.ttf'); if(SAME&&!/[\u0E80-\u0EFF]/.test(text)) return FREE+(bold&&italic?'BoldItalic':bold?'Bold':italic?'Italic':'')+'.ttf'; if(/[຀-໿]/.test(text)) return bold?(process.env.LAO_FONT_BOLD||NOTO+'Bold.ttf'):(process.env.LAO_FONT||NOTO+'Regular.ttf'); return LIB+(bold&&italic?'BoldItalic':bold?'Bold':italic?'Italic':'Regular')+'.ttf'; }};
(async()=>{ const buf=fs.readFileSync(process.argv[2]); const m=await H.loadModel(E,buf);
 if(!process.env.NO_ENGINE) T.runTemplate(m,exec,{XLSX:X,clientId:11,orgId:0,from:process.env.FROM||'2006-12-01 00:00:00.0',to:process.env.TO||'2006-12-31 00:00:00.0'});
 const cs=C.evaluateSheet(m,'Output'); console.log(`§CALC Output formulas=${cs.evaluated} errors=${cs.errors} unsupported=${JSON.stringify(cs.unsupported)}`);
 const r=await R.renderSheet(PDFKit,m,{profile:process.argv[4]||'excel',fonts,formatNumber:(f,v)=>X.SSF.format(f,v),lineHeightFactor:process.env.LINEH?Number(process.env.LINEH):undefined});
 fs.writeFileSync(process.argv[3],r.pdf); console.log(`§PDF_RENDER ${process.argv[2].split('/').pop()} -> ${process.argv[3].split('/').pop()} page=${r.page.map(x=>x.toFixed(2)).join('x')} range=${r.range.rows}x${r.range.cols} bytes=${r.pdf.length}`);
})().catch(e=>{console.log('§PDF_RENDER ERROR',e.stack);process.exit(1)});
