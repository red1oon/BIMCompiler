// ⚠ DO NOT REMOVE — render an SVG to PNG in headless Chromium (no GPU), the way a browser draws it (ImageMagick's own SVG renderer drops this diagram's fills). node svg2png.js in.svg out.png [width]
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright'), fs = require('fs');
(async () => { const [, , i, o, w] = process.argv, svg = fs.readFileSync(i, 'utf8'), m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg) || /width="([\d.]+)"[^>]*height="([\d.]+)"/.exec(svg);
  const W = Number(m[1]), H = Number(m[2]), scale = (Number(w) || 1900) / W;
  const b = await chromium.launch({ args: ['--disable-gpu'] }), p = await (await b.newContext({ viewport: { width: Math.ceil(W), height: Math.ceil(H) }, deviceScaleFactor: scale })).newPage();
  await p.setContent('<html><body style="margin:0;background:#fff">' + svg.replace(/<\?xml[^>]*>/, '') + '</body></html>'); await p.waitForTimeout(300);
  await p.locator('svg').first().screenshot({ path: o }); await b.close(); console.log('§SVG2PNG ' + o + ' ' + W + 'x' + H + ' scale=' + scale.toFixed(2)); })();
