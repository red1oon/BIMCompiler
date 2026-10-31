// ⚠ DO NOT REMOVE — Odoo 17 purchase flow recorder (ERP_FRIENDLY_OPS_LENS §3 flow b: purchase -> receive -> vendor bill). Gestures counted as §ODOO_GESTURE; verdict by RPC (verify_po.py). READ THE LOG.
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const G = []; const g = (k, w) => { G.push(k); console.log('§ODOO_GESTURE n=' + G.length + ' ' + k + ' ' + w); };
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 810 } })).newPage();
  await p.goto('http://localhost:8069/web/login?db=odoodemo');
  await p.fill('input[name=login]', 'admin'); await p.fill('input[name=password]', 'admin'); await p.click('button[type=submit]');
  await p.waitForSelector('.o_main_navbar', { timeout: 60000 });
  const click = async (loc, w) => { await loc.click(); g('click', w); await p.waitForTimeout(1200); };
  const type = async (loc, t, w) => { await loc.fill(t); g('type', w); await p.waitForTimeout(1500); };
  const btns = async (tag) => console.log('§ODOO_FACT ' + tag + ' buttons=' + JSON.stringify(await p.$$eval('button:visible', e => e.map(x => x.innerText.trim()).filter(Boolean).slice(0, 30))));
  await click(p.locator('.o_navbar_apps_menu button, .o_menu_toggle').first(), 'apps-menu');
  await click(p.locator('text=Purchase').first(), 'Purchase');
  await click(p.locator('button.o_list_button_add:visible').first(), 'New');
  await type(p.locator('div[name=partner_id] input'), 'Ready Mat', 'vendor');
  await click(p.locator('.o-autocomplete--dropdown-item').first(), 'pick vendor');
  await click(p.locator('a:has-text("Add a product"):visible').first(), 'Add a product');
  await type(p.locator('div[name=product_id] input').first(), 'Large Cabinet', 'product');
  await click(p.locator('.o-autocomplete--dropdown-item').first(), 'pick product');
  await type(p.locator('td[name=product_qty] input').first(), '5', 'qty');
  await btns('draft');
  await click(p.locator('button[name=button_confirm]:visible').first(), 'Confirm Order');
  await btns('confirmed');
  await click(p.locator('button[name=action_view_picking]:visible').first(), 'Receipt smart button');
  await click(p.locator('button[name=button_validate]:visible').first(), 'Validate');
  for (let i = 0; i < 3 && await p.locator('.modal button.btn-primary:visible').count(); i++) await click(p.locator('.modal button.btn-primary:visible').first(), 'dialog primary');
  await p.goBack(); await p.waitForTimeout(1500); g('click', 'back to order');
  await btns('afterReceive');
  await click(p.locator('button[name=action_create_invoice]:visible').first(), 'Create Bill');
  await btns('bill');
  const bd = p.locator('div[name=invoice_date] input');   // Odoo 17 refuses to post a vendor bill without a Bill Date: the user must type it (counted)
  if (await bd.count() && !(await bd.first().inputValue())) { await bd.first().fill('10/17/2026'); await bd.first().press('Tab'); g('type', 'bill date'); await p.waitForTimeout(800); }
  await click(p.locator('button[name=action_post]:visible').first(), 'Confirm bill'); await p.waitForTimeout(2000);
  console.log('§ODOO_GESTURES total=' + G.length + ' clicks=' + G.filter(x => x === 'click').length + ' typed=' + G.filter(x => x === 'type').length);
  await b.close();
})();
