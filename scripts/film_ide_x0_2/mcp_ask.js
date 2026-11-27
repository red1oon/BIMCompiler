// # ⚠ DO NOT REMOVE — SCOPE: the film "Editing Real Code 2" (§F.18). Asks the repo's REAL local facts server (the one an AI
// assistant would talk to) three questions over its real protocol, and prints one §FILM_MCP line with the answers. No model is
// called by this, or by the server. Usage: node mcp_ask.js <bim-ootb checkout> <compiler root> <dead field> <unsure field>
'use strict';
const cp = require('child_process'), path = require('path');
const [ROOT, COMP, DEAD, UNSURE] = process.argv.slice(2);
const child = cp.spawn(process.execPath, [path.join(ROOT, 'devtools/mcp/x0-facts/server.js'), '--root', ROOT, '--compiler-root', COMP, '--extra-logs', 'none'], { stdio: ['pipe', 'pipe', 'ignore'] });
let buf = ''; const waiting = new Map(); let id = 1;
child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); try { const m = JSON.parse(l); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } } catch (e) { /* not a message */ } } });
const rpc = (method, params) => new Promise(res => { const n = id++; waiting.set(n, res); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); });
(async () => {
  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'film', version: '0' } });
  const list = await rpc('tools/list', {});
  const ask = async f => (await rpc('tools/call', { name: 'where_is_field_set', arguments: { field: f } })).result.content[0].text;
  const a1 = await ask(DEAD), a2 = await ask(UNSURE);
  console.log('§FILM_MCP server=' + init.result.serverInfo.name + ' tools=' + list.result.tools.length + ' q1=' + JSON.stringify(DEAD) + ' a1=' + JSON.stringify(a1) + ' q2=' + JSON.stringify(UNSURE) + ' a2=' + JSON.stringify(a2));
  child.stdin.end();
})();
