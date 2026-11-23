// ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §45 seam probe (measurement instrument, read its § lines): the scan page's embedded image as the vendored pdf.js 3.11.174 decodes it (the browser's own code path), written as raw RGB.
// Usage: node scan_pixels_pdfjs.js <dir holding pdf.min.js + pdf.worker.min.js (bim-ootb modeller/lib/pdfjs)> <scan.pdf> <out_dir>  -> pdfjs-<page>.raw (RGB, the image as stored, NOT turned by /Rotate) + .json
const fs = require('fs'), path = require('path');
const LIB = process.argv[2], pdf = process.argv[3], out = process.argv[4];
const pdfjs = require(path.join(LIB, 'pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.join(LIB, 'pdf.worker.min.js');
(async () => {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdf)), isEvalSupported: false, useSystemFonts: false, verbosity: 0 }).promise;
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p), ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
      const name = ops.argsArray[i][0];
      const img = await new Promise(res => page.objs.get(name, res));
      const d = img.data || (img.bitmap ? null : null);
      console.log(`§SEAM_PDFJS page=${p} rotate=${page.rotate} name=${name} w=${img.width} h=${img.height} kind=${img.kind} bytes=${d ? d.length : 'bitmap'}`);
      if (d) fs.writeFileSync(path.join(out, `pdfjs-${p}.raw`), Buffer.from(d.buffer, d.byteOffset, d.length));
      fs.writeFileSync(path.join(out, `pdfjs-${p}.json`), JSON.stringify({ w: img.width, h: img.height, kind: img.kind, rotate: page.rotate }));
    }
  }
  await doc.destroy();
})().catch(e => { console.error('ERR', e && e.stack || e); process.exit(1); });
