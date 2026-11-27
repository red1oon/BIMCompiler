// ⚠ DO NOT REMOVE — film "Information is Free" (prompts/FILM_INFORMATION_IS_FREE.md, CH 0): the lower frame. Every picture is a REAL page opened in headless Chromium (Playwright, --disable-gpu, software GL, CPU only),
// 1280x358 drawn at 1.5 = 1920x537, with what the page itself says read from its DOM (title, heading, status, the language picker's value). A page that does not load, or a chooser that is not found, is a FAIL: nothing is drawn.
// The guide is switched through its own language chooser (the header's menu, then the link of that language); the ERP login is re-rendered through its own picker #idmp-login-lang. No login is performed.
// Usage: node capture.js <outDir>      READ out/capture.log; writes <outDir>/*.png and <outDir>/shots.json
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/home/red1/bim-ootb/tests/node_modules/playwright');
const out = path.resolve(process.argv[2] || 'out/shots'); fs.mkdirSync(out, { recursive: true });
const OWNER = 'https://github.com/red1oon/BIMCompiler', SITE = 'https://red1oon.github.io/BIMCompiler', ERP = 'https://red1oon.github.io/bim-ootb/erp/idempiere.html';
const L = (m) => console.log('§CAPTURE ' + m), shots = {}, fails = [];
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu', '--use-gl=swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 358 }, deviceScaleFactor: 1.5, locale: 'en-US' }), pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  const snap = async (id, url, note, read, status) => { await pg.waitForTimeout(1200); const info = read ? await pg.evaluate(read) : {}; await pg.screenshot({ path: path.join(out, id + '.png') });
    shots[id] = Object.assign({ file: 'shots/' + id + '.png', url: pg.url(), requested: url, http: status, note }, info); L(id + ' http=' + status + ' url=' + pg.url() + ' ' + JSON.stringify(info)); };
  const go = async (url, wait) => { const r = await pg.goto(url, { waitUntil: 'load', timeout: 120000 }); await pg.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {}); if (wait) await pg.waitForSelector(wait, { timeout: 60000 }); return r ? r.status() : 0; };
  const scroll = (y) => pg.evaluate((y) => window.scrollTo(0, y), y);
  try {
    let st = await go(OWNER, 'article.markdown-body, #readme'); await scroll(150);
    await snap('gh_repo', OWNER, 'the BIMCompiler GitHub page', () => ({ title: document.title, about: (document.querySelector('.f4.my-3, [class*=about] p') || {}).innerText || '', license: /MIT license/i.test(document.body.innerText) }), st);
    st = await go(OWNER + '/blob/master/prompts/DOCS_I18N.md', 'article.markdown-body'); await scroll(110);
    await snap('gh_spec', 'DOCS_I18N.md', 'a spec rendered on GitHub', () => ({ title: document.title, h1: (document.querySelector('article.markdown-body h1') || {}).innerText || '' }), st);
    st = await go(SITE + '/', '.md-content'); await snap('site_home', SITE, 'the docs site home page', () => ({ title: document.title, h1: (document.querySelector('.md-content h1') || {}).innerText || '' }), st);
    // the guide, through its own chooser: open the header's language menu, click the link of the language
    st = await go(SITE + '/FastScriptGuide/', '.md-select'); const gread = () => ({ title: document.title, lang: document.documentElement.lang, h1: (document.querySelector('.md-content h1') || {}).innerText || '' });
    await snap('guide_en', 'FastScriptGuide', 'the CLI guide, English', gread, st);
    for (const lg of ['es', 'ja', 'de']) {
      await pg.hover('.md-select'); await pg.waitForSelector('.md-select__inner a[hreflang="' + lg + '"]', { state: 'visible', timeout: 10000 });
      if (lg === 'es') await snap('guide_menu', 'chooser', 'the language chooser open', () => ({ choices: Array.from(document.querySelectorAll('.md-select__inner a')).map(a => a.getAttribute('hreflang') + ':' + a.innerText.trim()) }), st);
      const [resp] = await Promise.all([pg.waitForNavigation({ waitUntil: 'load', timeout: 60000 }), pg.click('.md-select__inner a[hreflang="' + lg + '"]')]); await pg.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
      await snap('guide_' + lg, 'chooser->' + lg, 'the CLI guide, ' + lg + ', reached by its chooser link', gread, resp ? resp.status() : 0);
    }
    st = await go(OWNER + '/blob/master/LICENSE', 'article, .blob-wrapper, [data-testid=blob-content], #read-only-cursor-text-area'); await scroll(110);
    await snap('gh_license', 'LICENSE', 'the LICENSE page on GitHub', () => ({ title: document.title, text: (document.body.innerText.match(/MIT License/) || [''])[0], copyright: (document.body.innerText.match(/Copyright \(c\)[^\n]*/) || [''])[0] }), st);
    // the ERP login card, re-rendered through its own picker; nothing is typed or clicked beyond the picker
    st = await go(ERP); await pg.waitForFunction(() => { const s = document.getElementById('idmp-login-lang'); return s && s.options.length > 1 && s.offsetParent !== null; }, { timeout: 180000 });
    for (const [tag, loc] of [['en', 'en_US'], ['es', 'es_ES'], ['ja', 'ja_JP'], ['zh', 'zh_CN']]) { await pg.selectOption('#idmp-login-lang', loc); await pg.waitForTimeout(900);
      await snap('login_' + tag, ERP, 'the ERP login card, picker = ' + loc, () => ({ picker: document.getElementById('idmp-login-lang').value, pickerText: document.getElementById('idmp-login-lang').selectedOptions[0].text, heading: ((document.querySelector('.idmp-login h2, .idmp-login h1, #idmp-login h2, [class*=login] h2') || {}).innerText || '').slice(0, 80), card: document.body.innerText.split('\n').filter(x => x.trim()).slice(0, 4).join(' / ').slice(0, 160) }), st); }
  } catch (e) { fails.push(String(e && e.stack || e).split('\n').slice(0, 3).join(' ')); L('FAIL ' + fails[fails.length - 1]); }
  await b.close(); fs.writeFileSync(path.join(out, 'shots.json'), JSON.stringify({ made: new Date().toISOString(), shots, pageErrors: errs, fails }, null, 1));
  const need = ['gh_repo', 'gh_spec', 'site_home', 'guide_en', 'guide_es', 'guide_ja', 'guide_de', 'gh_license', 'login_en', 'login_es', 'login_ja', 'login_zh'], miss = need.filter(k => !shots[k] || shots[k].http >= 400);
  L('DONE shots=' + Object.keys(shots).length + ' missing_or_http_error=' + (miss.join(',') || 'none') + ' page_errors=' + errs.length + ' fails=' + fails.length); process.exit(miss.length || fails.length ? 1 : 0);
})();
