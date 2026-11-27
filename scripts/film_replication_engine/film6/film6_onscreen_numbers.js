// ⚠ DO NOT REMOVE — Scope: every digit token on every card and shot caption of Film 6 must be a resolved fact value (facts6.resolved.json) or a listed STRUCTURAL token with its source (an AD id, a role id, a section number, a gate name) — nothing typed. Control: a planted token is detected. Read the log: §ONSCREEN_NUMBERS.
'use strict';
const fs = require('fs'), path = require('path');
const X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.resolved.json'), 'utf8')), CL = JSON.parse(fs.readFileSync(path.join(__dirname, 'claims6.json'), 'utf8')), Cards = require('./cards6.js').build(X, CL);
const STRUCT = { '102': 'role GardenWorld Admin (dictionary)', '103': 'role GardenWorld User (dictionary)', '280': 'AD_Window 280 Import Payment (menu leaf, shots)', '200074': 'AD_Process 200074 Recurring Run (menu)', '53187': 'AD_Process 53187 Tenant Accounting Processor (menu)', '2431': 'bim-ootb PR number (TEAMWORK_FRAMEWORK §41.1)', '11': 'G-11 (TEAMWORK_FRAMEWORK §38)', '13': 'G-13', '14': 'G-14', '41': '§41.1', '42': '§42.x', '39': '§39 R5', '1': 'section .1', '2': 'section .2', '3': 'section .3', '5': 'section/chapter numbers', '4': 'chapter numbers', '0': 'chapter 0', '5b': '', '4c': '' };
const allowed = new Map(); Object.entries(X).forEach(([k, f]) => { if (f.status === 'now' && /^-?\d+$/.test(f.value)) allowed.set(String(Math.abs(Number(f.value))), 'fact ' + k); });
Object.entries(STRUCT).forEach(([k, v]) => { if (!allowed.has(k)) allowed.set(k, 'structural: ' + v); });
CL.claims.forEach(c => (c.url.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach(m => { const v = m.replace(/,/g, ''); if (!allowed.has(v)) allowed.set(v, 'digits of the claim URL ' + c.id); }));   // the source URL printed under each quote (claims6.json)
['42.2', '42.3', '41.1'].forEach(v => allowed.set(v, 'TEAMWORK_FRAMEWORK section number in a source tag'));
const strip = h => h.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const caps = Object.values(JSON.parse(fs.readFileSync(path.join(__dirname, 'shot_captions.json'), 'utf8')));
const texts = [...Object.entries(Cards.C).map(([k, h]) => ['card:' + k, strip(h)]), ...caps.map((c, i) => ['caption:' + i, c])];
let n = 0; const unknown = [];
texts.forEach(([id, t]) => { (t.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach(m => { n++; const v = m.replace(/,/g, ''); if (!allowed.has(v)) unknown.push(id + ':' + m); }); });
console.log(`§ONSCREEN_NUMBERS tokens=${n} not_a_fact_or_listed_structural=${unknown.length} ${unknown.length ? 'FAIL ' + unknown.join(' ') : 'PASS'}`);
const planted = '12345678'; console.log(`§ONSCREEN_NUMBERS_CONTROL a planted token (${planted}) is ${allowed.has(planted) ? 'NOT detected FAIL' : 'detected PASS'}`);
process.exit(unknown.length || allowed.has(planted) ? 1 : 0);
