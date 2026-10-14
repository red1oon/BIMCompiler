const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const G = []; const g = (kind, what) => { G.push(kind + ':' + what); console.log('§ODOO_GESTURE n=' + G.length + ' ' + kind + ' ' + what); };
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 810 } })).newPage();
  await p.goto('http://localhost:8069/web/login?db=odoodemo');
  await p.fill('input[name=login]', 'admin'); await p.fill('input[name=password]', 'admin'); await p.click('button[type=submit]');
  await p.waitForSelector('.o_main_navbar', { timeout: 60000 });
  const click = async (loc, what) => { await loc.click(); g('click', what); await p.waitForTimeout(900); };
  const btns = async () => p.$$eval('button:visible', e => e.map(x => x.innerText.trim()).filter(Boolean));
  // counted flow starts here (login excluded: both systems need it)
  await click(p.locator('.o_navbar_apps_menu button, .o_menu_toggle').first(), 'apps-menu');
  await click(p.locator('text=Manufacturing').first(), 'Manufacturing');
  await click(p.locator('button.o_list_button_add:visible').first(), 'New');
  await p.locator('div[name=product_id] input').fill('Table Top'); g('type', 'product'); await p.waitForTimeout(1500);
  await click(p.locator('.o-autocomplete--dropdown-item').first(), 'pick product');
  await p.locator('div[name=product_qty] input').fill('100'); g('type', 'qty'); await p.waitForTimeout(800);
  console.log('§ODOO_FACT afterEntry fields=' + JSON.stringify(await p.$$eval('.o_field_widget', e => e.map(x => x.getAttribute('name') + '=' + (x.querySelector('input')?.value ?? x.innerText.trim().slice(0, 30))))));
  await click(p.locator('button:has-text("Confirm"):visible').first(), 'Confirm');
  console.log('§ODOO_FACT afterConfirm buttons=' + JSON.stringify(await btns()));
  console.log('§ODOO_FACT afterConfirm name=' + await p.locator('div[name=name]').innerText().catch(() => '?'));
  await p.waitForTimeout(2500);
  const facts = async (tag) => console.log('§ODOO_FACT ' + tag + ' ' + JSON.stringify(await p.$$eval('.o_field_widget', e => e.map(x => x.getAttribute('name') + '=' + (x.querySelector('input')?.value ?? x.innerText.trim().replace(/\s+/g, ' ').slice(0, 90))).filter(x => /qty|move_raw|state/.test(x)))));
  await facts('beforeProduce');
  const qp = p.locator('div[name=qty_producing] input').first();
  await qp.fill('100'); g('type', 'qty_producing'); await qp.press('Tab'); await p.waitForTimeout(1500);
  await facts('afterQtyProducing');
  console.log('§ODOO_FACT buttons=' + JSON.stringify(await p.$$eval('button:visible', e => e.map(x => x.innerText.trim()).filter(Boolean).slice(7, 20))));
  const md = p.locator('button:has-text("Mark as Done"):visible').first();
  if (await md.count()) { await click(md, 'Mark as Done'); await p.waitForTimeout(2000); }
  let guard = 0;
  while (guard++ < 4) {
    const m = p.locator('.modal:visible');
    if (!(await m.count())) break;
    console.log('§ODOO_FACT dialog=' + JSON.stringify((await m.first().innerText()).replace(/\s+/g, ' ').slice(0, 330)));
    const sq = m.first().locator('button:has-text("Set Quantities")');
    const pri = (await sq.count()) ? sq.first() : m.first().locator('button.btn-primary').first(); const t = (await pri.innerText()).trim();
    await click(pri, 'dialog:' + t); await p.waitForTimeout(2000);
  }
  await facts('final');
  console.log('§ODOO_FACT final url=' + p.url());
  console.log('§ODOO_GESTURES total=' + G.length + ' clicks=' + G.filter(x => x.startsWith('click')).length + ' typed=' + G.filter(x => x.startsWith('type')).length);
  await b.close();
})();
