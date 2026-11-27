// P0c: why ~100K chars per shader program? Lights by type, per-program source size, onBeforeCompile hooks — phone emulation.
const puppeteer = require(process.argv[2] + '/p0/tools/node_modules/puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-first-run'] });
  const p = await b.newPage();
  await p.emulate({ viewport: { width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36' });
  await p.evaluateOnNewDocument(() => { window.__src = []; const C = WebGL2RenderingContext.prototype, f = C.shaderSource;
    C.shaderSource = function (s, src) { __src.push({ len: src.length, type: this.getShaderParameter ? 0 : 0, head: src.slice(0, 0), pl: (src.match(/#define NUM_POINT_LIGHTS (\d+)/) || [])[1], sl: (src.match(/#define NUM_SPOT_LIGHTS (\d+)/) || [])[1],
      dl: (src.match(/#define NUM_DIR_LIGHTS (\d+)/) || [])[1], name: (src.match(/#define SHADER_NAME (\S+)/) || [])[1], plShadow: (src.match(/#define NUM_POINT_LIGHT_SHADOWS (\d+)/) || [])[1], frag: /gl_FragColor|pc_fragColor|out highp vec4/.test(src) }); return f.call(this, s, src); }; });
  await p.goto(`http://localhost:${process.argv[3]}/viewer/viewer.html?db=buildings/Duplex_extracted.db`, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 90; i++) { await new Promise(r => setTimeout(r, 1000)); if (await p.evaluate(() => !!(window.APP && APP.renderer && APP.renderer.info.render.triangles > 0)).catch(() => false)) break; }
  await new Promise(r => setTimeout(r, 2000));
  const o = await p.evaluate(() => { const L = {}; let hooks = 0, mats = new Set(); APP.scene.traverse(x => { if (x.isLight) { const k = x.type + (x.castShadow ? '+shadow' : ''); L[k] = (L[k] || 0) + 1; }
      if (x.material) (Array.isArray(x.material) ? x.material : [x.material]).forEach(m => { mats.add(m); }); });
    mats.forEach(m => { if (m.onBeforeCompile && String(m.onBeforeCompile).length > 30) hooks++; });
    const hookSrc = [...mats].filter(m => m.onBeforeCompile && String(m.onBeforeCompile).length > 30).slice(0, 3).map(m => String(m.onBeforeCompile).slice(0, 160).replace(/\s+/g, ' '));
    return { lights: L, materials: mats.size, hooks, hookSrc, shadowMap: APP.renderer.shadowMap.enabled, src: __src }; });
  const tot = o.src.reduce((a, s) => a + s.len, 0);
  console.log('§P0C lights=' + JSON.stringify(o.lights) + ' materials=' + o.materials + ' onBeforeCompile_materials=' + o.hooks + ' shadowMap=' + o.shadowMap + ' shaders=' + o.src.length + ' total_chars=' + tot);
  o.src.sort((a, z) => z.len - a.len).slice(0, 14).forEach(s => console.log('§P0C_SHADER ' + (s.frag ? 'frag' : 'vert') + ' len=' + s.len + ' name=' + s.name + ' point=' + s.pl + ' spot=' + s.sl + ' dir=' + s.dl + ' pointShadows=' + s.plShadow));
  o.hookSrc.forEach(h => console.log('§P0C_HOOK ' + h));
  await b.close();
})();
