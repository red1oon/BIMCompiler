// P0b (MOBILE_PERF P0, sandboxed): what fills the boot freeze between §DB_LOADED and the first drawn model frame?
// Issue it settles: how much of that freeze is GPU/driver-bound (varies by device) vs plain JS (a phone pays at its CPU speed).
// Same phone emulation + CPU 4x as P0; backend = swiftshader (software GL) or intel (real iGPU via ANGLE gl-egl).
const puppeteer = require(process.argv[2] + '/p0/tools/node_modules/puppeteer-core');
const [,, S, port, backend, run] = process.argv;
const FLAGS = { swiftshader: [], intel: ['--use-angle=gl-egl', '--ignore-gpu-blocklist'] }[backend];
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-first-run', '--user-data-dir=' + S + '/prof_b_' + backend + '_' + run + '_' + Date.now()].concat(FLAGS) });
  const p = await b.newPage(); const c = await p.target().createCDPSession();
  await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.emulate({ viewport: { width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36' });
  await p.evaluateOnNewDocument(() => {
    const G = window.__gl = { calls: {}, shaderChars: 0, uploadBytes: 0, texBytes: 0, parallelAsked: false, firstTri: null };
    window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => __lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
    const rec = (name, ms, bytes) => { const k = G.calls[name] || (G.calls[name] = { n: 0, ms: 0, max: 0 }); k.n++; k.ms += ms; if (ms > k.max) k.max = ms; };
    const wrap = (proto, name) => { const f = proto[name]; if (!f) return; proto[name] = function () { const t = performance.now(); const r = f.apply(this, arguments); rec(name, performance.now() - t);
      if (name === 'shaderSource') G.shaderChars += (arguments[1] || '').length;
      if (name === 'bufferData' || name === 'bufferSubData') { const a = arguments[name === 'bufferData' ? 1 : 2]; if (a && a.byteLength) G.uploadBytes += a.byteLength; }
      if (/^tex(Sub)?Image[23]D$/.test(name)) { for (const a of arguments) if (a && a.byteLength) { G.texBytes += a.byteLength; break; } }
      return r; }; };
    const NAMES = ['compileShader', 'linkProgram', 'getProgramParameter', 'getShaderParameter', 'getProgramInfoLog', 'getShaderInfoLog', 'shaderSource', 'useProgram',
      'bufferData', 'bufferSubData', 'texImage2D', 'texSubImage2D', 'texImage3D', 'texSubImage3D', 'texStorage2D', 'drawElements', 'drawArrays', 'drawElementsInstanced',
      'drawArraysInstanced', 'readPixels', 'finish', 'flush', 'getError', 'getUniformLocation', 'getActiveUniform', 'getAttribLocation', 'clear', 'fenceSync', 'clientWaitSync', 'getBufferSubData'];
    for (const C of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) if (C) NAMES.forEach(n => wrap(C.prototype, n));
    for (const C of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) if (C) { const ge = C.prototype.getExtension; C.prototype.getExtension = function (n) { const e = ge.call(this, n);
      if (n === 'KHR_parallel_shader_compile') G.parallelAsked = true;
      if (e && /multi_draw/i.test(n)) Object.getOwnPropertyNames(Object.getPrototypeOf(e)).filter(m => /^multiDraw/.test(m)).forEach(m => wrap(Object.getPrototypeOf(e), m));
      return e; }; }
  });
  const t0 = Date.now(); let dbAt = null, profOn = false;
  p.on('console', async m => { if (!profOn && /§DB_LOADED/.test(m.text())) { profOn = true; dbAt = Date.now() - t0;
    await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 500 }); await c.send('Profiler.start'); } });
  await p.goto(`http://localhost:${port}/viewer/viewer.html?db=buildings/Duplex_extracted.db`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => {});
  let first = null;
  while (Date.now() - t0 < 90000) { await new Promise(r => setTimeout(r, 100));
    const tri = await p.evaluate(() => { const r = window.APP && APP.renderer; return r && r.info ? r.info.render.triangles : 0; }).catch(() => 0);
    if (tri > 0) { first = Date.now() - t0; break; } }
  const prof = profOn ? (await c.send('Profiler.stop')).profile : null;
  await new Promise(r => setTimeout(r, 2500));
  const st = await p.evaluate(() => { const r = APP.renderer, gl = r.getContext(); const e = gl.getExtension('WEBGL_debug_renderer_info');
    return { gl: __gl, lt: __lt, programs: (r.info.programs || []).length, mem: r.info.memory, render: r.info.render, gpu: gl.getParameter(e.UNMASKED_RENDERER_WEBGL) }; });
  // inclusive time per function inside the DB_LOADED → first-frame window
  let incl = {}; if (prof) { const byId = new Map(prof.nodes.map(n => [n.id, n])); const parent = new Map();
    prof.nodes.forEach(n => (n.children || []).forEach(ch => parent.set(ch, n.id)));
    prof.samples.forEach((id, i) => { const dt = (prof.timeDeltas[i] || 0) / 1000; const seen = new Set();
      for (let n = id; n !== undefined; n = parent.get(n)) { const cf = byId.get(n).callFrame; const k = (cf.url.split('/').pop().split('?')[0] || '(' + cf.functionName + ')') + ':' + (cf.functionName || 'anon');
        if (!seen.has(k)) { seen.add(k); incl[k] = (incl[k] || 0) + dt; } } }); }
  const top = Object.entries(incl).filter(([k]) => !/^\((root|program|idle|garbage collector)\)/.test(k)).sort((a, z) => z[1] - a[1]).slice(0, 28).map(([k, v]) => k + '=' + Math.round(v)).join(' | ');
  const self = prof ? (() => { const s = {}; const byId = new Map(prof.nodes.map(n => [n.id, n])); prof.samples.forEach((id, i) => { const k = byId.get(id).callFrame.functionName || 'anon'; if (/^\((program|garbage collector|idle)\)$/.test(k)) s[k] = (s[k] || 0) + (prof.timeDeltas[i] || 0) / 1000; }); return s; })() : {};
  const calls = Object.entries(st.gl.calls).sort((a, z) => z[1].ms - a[1].ms).map(([k, v]) => k + ' n=' + v.n + ' ms=' + Math.round(v.ms) + ' max=' + Math.round(v.max)).join(' | ');
  const big = st.lt.filter(([s]) => s > (dbAt || 0) - 1500).slice(0, 6).map(x => x[0] + '+' + x[1]).join(' ');
  console.log(`§P0B_RUN backend=${backend} run=${run} gpu="${st.gpu}" db_loaded_ms=${dbAt} first_frame_ms=${first} window_ms=${first - dbAt} programs=${st.programs} parallel_ext_used=${st.gl.parallelAsked} shader_chars=${st.gl.shaderChars} buf_upload_MB=${(st.gl.uploadBytes / 1048576).toFixed(1)} tex_upload_MB=${(st.gl.texBytes / 1048576).toFixed(1)} geometries=${st.mem.geometries} textures=${st.mem.textures} calls=${st.render.calls} tris=${st.render.triangles}`);
  console.log(`§P0B_LT backend=${backend} run=${run} longtasks_after_db: ${big}`);
  console.log(`§P0B_NATIVE backend=${backend} run=${run} program_ms=${Math.round(self['(program)'] || 0)} gc_ms=${Math.round(self['(garbage collector)'] || 0)} idle_ms=${Math.round(self['(idle)'] || 0)}`);
  console.log(`§P0B_GLCALLS backend=${backend} run=${run} ${calls}`);
  console.log(`§P0B_INCL backend=${backend} run=${run} ${top}`);
  await b.close();
})();
