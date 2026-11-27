// ⚠ DO NOT REMOVE — Odoo 17 sales flow recorder (ERP_FRIENDLY_OPS_LENS §3 flow a). Gestures counted as §ODOO_GESTURE; verdict read by RPC (verify_so.py), never the screen. READ THE LOG.
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
  const btns = async () => console.log('§ODOO_FACT buttons=' + JSON.stringify(await p.$$eval('button:visible', e => e.map(x => x.innerText.trim()).filter(Boolean).slice(0, 25))));
  await click(p.locator('.o_navbar_apps_menu button, .o_menu_toggle').first(), 'apps-menu');
  await click(p.locator('text=Sales').first(), 'Sales');
  await click(p.locator('button.o_list_button_add:visible, button.o-kanban-button-new:visible').first(), 'New');
  await type(p.locator('div[name=partner_id] input'), 'Azure Interior', 'customer');
  await click(p.locator('.o-autocomplete--dropdown-item').first(), 'pick customer');
  await click(p.locator('a:has-text("Add a product"):visible').first(), 'Add a product');
  await type(p.locator('div[name=product_template_id] input').first(), 'Large Cabinet', 'product');
  await click(p.locator('.o-autocomplete--dropdown-item').first(), 'pick product');
  await type(p.locator('td[name=product_uom_qty] input').first(), '5', 'qty');
  await btns();
  await click(p.locator('button[name=action_confirm]:visible').first(), 'Confirm');
  console.log('§ODOO_FACT order=' + await p.locator('div[name=name]').innerText().catch(() => '?'));
  await btns();
  await click(p.locator('button[name=action_view_delivery]:visible').first(), 'Delivery smart button');
  await click(p.locator('button[name=button_validate]:visible').first(), 'Validate');
  for (let i = 0; i < 3 && await p.locator('.modal button.btn-primary:visible').count(); i++) await click(p.locator('.modal button.btn-primary:visible').first(), 'dialog primary');
  await p.goBack(); await p.waitForTimeout(1500); // breadcrumb back counted as a gesture
  g('click', 'back to order');
  await click(p.locator('button:has-text("Create Invoice"):visible').first(), 'Create Invoice');
  for (let i = 0; i < 2 && await p.locator('.modal button.btn-primary:visible').count(); i++) await click(p.locator('.modal button.btn-primary:visible').first(), 'dialog primary');
  await btns();
  await click(p.locator('button[name=action_post]:visible').first(), 'Confirm invoice');
  await click(p.locator('button[name=action_register_payment]:visible').first(), 'Pay');
  await click(p.locator('.modal button.btn-primary:visible').first(), 'Create Payment');
  console.log('§ODOO_GESTURES total=' + G.length + ' clicks=' + G.filter(x => x === 'click').length + ' typed=' + G.filter(x => x === 'type').length);
  await b.close();
})();
