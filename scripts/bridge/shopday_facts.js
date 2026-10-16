// §SHOPDAY-RUN-1: the ONE fact set both sides receive for SD-00. Every value is EXTRACTED from the GardenWorld setup
// (ad_orginfo location of client 11: Westport CT 06555 "1000 Main Street", region 102, country 100 US; acct schema 101 currency USD 100).
module.exports = {
  systemLogin: { user: 'SuperUser', pass: process.env.BRIDGE_SYS_PASS || 'System',   // localhost throwaway pilot only (same precedent as ad_client.js GardenAdmin default)
    lang: 'en_US', ClientID: 0, RoleID: 1200001, OrgID: 0, WarehouseID: 0, stage: 0 },
  SETS: {
    2: { name: 'ShopTwo', orgValue: 'T2', orgName: 'Second Shop', currencyId: 301, currencyIso: 'MYR', countryId: 238, regionId: null, city: 'Kuala Lumpur', postal: '50450', address1: '1 Jalan Ampang' },
    1: { name: process.env.SHOPDAY_CLIENT || 'ShopDayTest', orgValue: 'SHOP', orgName: 'Shop',
         currencyId: 100, currencyIso: 'USD', countryId: 100, regionId: 102, city: 'Westport', postal: '06555', address1: '1000 Main Street' },
  },
  // 2nd fact set (SHOPDAY_FACTS=2): a different name/org/currency/country/address -- the determinism check of the born-tenant template
  get client() { return this.SETS[process.env.SHOPDAY_FACTS === '2' ? 2 : 1]; },
  // facts in the shape client_template.instantiate wants; clientId/today/year/currencyDesc are read from legacy (psql SELECT) when the client exists
  templateFacts(set, clientId, today) {
    const c = this.SETS[set], pgq = require('./client_template').pg;
    const desc = pgq(`select description from c_currency where c_currency_id=${c.currencyId}`)[0];
    const created = clientId ? pgq(`select to_char(created,'YYYY-MM-DD') from ad_client where ad_client_id=${clientId}`)[0] : today;
    return { clientId, name: c.name, orgValue: c.orgValue, orgName: c.orgName, adminUser: c.name + 'Admin', normalUser: c.name + 'User', currencyId: c.currencyId, countryId: c.countryId,
      regionId: c.regionId, address1: c.address1, city: c.city, postal: c.postal, today: created, year: +created.slice(0, 4), currencyDesc: desc };
  },
  get adminUser() { return this.client.name + 'Admin'; },
  get normalUser() { return this.client.name + 'User'; },
  setupParams() {
    const c = this.client;
    return { ClientName: c.name, OrgValue: c.orgValue, OrgName: c.orgName, AdminUserName: this.adminUser, NormalUserName: this.normalUser,
      IsSetInitialPassword: 'Y', C_Currency_ID: c.currencyId, C_Country_ID: c.countryId, ...(c.regionId ? { C_Region_ID: c.regionId } : {}), CityName: c.city, Postal: c.postal, Address1: c.address1,
      IsUseBPDimension: 'Y', IsUseProductDimension: 'Y', IsUseProjectDimension: 'N', IsUseCampaignDimension: 'N', IsUseSalesRegionDimension: 'N', IsUseActivityDimension: 'N',
      UseDefaultCoA: 'Y', InactivateDefaults: 'N' };
  },
  // ADMIN-LANE READ (not business data): a System-session WS query is client-filtered (AD_Client_ID IN (0, session)), so it cannot see
  // another tenant. The new client's ids are therefore read from the pilot DB with a psql SELECT (same path as the D6 config rows).
  // Returns {clientId, adminRoleId, userRoleId, orgId, whId} or null.
  resolveIds() {
    const cp = require('child_process');
    const sql = `select c.ad_client_id, (select ad_role_id from ad_role where ad_client_id=c.ad_client_id and name=c.name||' Admin'), (select ad_role_id from ad_role where ad_client_id=c.ad_client_id and name=c.name||' User'), (select min(ad_org_id) from ad_org where ad_client_id=c.ad_client_id and ad_org_id>0), (select min(m_warehouse_id) from m_warehouse where ad_client_id=c.ad_client_id) from ad_client c where c.name='${this.client.name.replace(/'/g, "''")}'`;
    const r = cp.spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-At', '-F', ',', '-c', 'set search_path=adempiere', '-c', sql], { encoding: 'utf8' });
    const line = (r.stdout || '').split('\n').find(l => /^\d+,/.test(l));
    if (!line) return null;
    const [clientId, adminRoleId, userRoleId, orgId, whId] = line.split(',').map(Number);
    return { clientId, adminRoleId, userRoleId, orgId, whId };
  },
};
