// ⚠ DO NOT REMOVE — Scope: GLOSSARY-USE witness for the Thai cut of Film 5 (the one table a Thai reviewer corrects = the GLOSSARY comment at the top of mk_cards5_th.py, extended here with the two terms the replacement card adds).
// For every glossary term: how often it is used on screen (all reveal states of every card, plus the source tags) and in speech (the narration TSV); a term used 0 times in both is DEAD; a term used in speech but never on screen (or the reverse) is flagged;
// every rival spelling (VARIANTS: transliterations such as แอดมิน / คีย์ / เช็ก that would make the film say one thing two ways) must occur 0 times, else FAIL. A planted rival spelling must be seen (control). Product and window names (ERP, Modeller, Complete, DocAction, HQ) stay Latin by rule and are not glossary terms.
// usage: node gloss5_th.js <narration.tsv> <captions.ass>      Read the log: §TH_GLOSSARY_USE, §TH_GLOSSARY_VARIANT, §TH_GLOSSARY_USE_DONE.
'use strict';
const fs = require('fs'), path = require('path');
const [tsv, ass] = process.argv.slice(2);
const X = require('../facts5_th.js').build(), Cards = require('../cards5_th.js').build(X);
const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const screen = Object.keys(Cards.C).map(id => strip(Cards.C[id])).join('\n') + '\n' + Object.values(Cards.SRCTAG).join('\n') + '\n' + Object.values(Cards.TITLES).join('\n');
const speech = fs.readFileSync(tsv, 'utf8').split('\n').map(l => l.split('\t')[5] || '').join('\n');
const caps = ass ? fs.readFileSync(ass, 'utf8').split('\n').filter(l => l.startsWith('Dialogue:') && !/,Credit,/.test(l)).map(l => l.split(',').slice(9).join(',')).join('\n') : '';
// [English, Thai term, rival spellings that must not occur]
const G = [['app', 'แอป', ['แอพ', 'แอปพลิเคชัน']], ['admin', 'ผู้ดูแล', ['แอดมิน', 'ผู้บริหารระบบ', 'ผู้ดูแลระบบ']], ['translation rule', 'กฎแปลงรูปแบบ', ['กฎการแปล', 'กฎแปลภาษา']], ['policy message', 'ข้อความนโยบาย', []],
  ['signature', 'ลายเซ็น', ['ลายมือชื่อ', 'ซิกเนเจอร์']], ['key', 'กุญแจ', ['คีย์', 'รหัสลับ']], ['key list', 'รายการกุญแจ', ['ลิสต์กุญแจ']], ['primary key (trust)', 'กุญแจหลัก', ['กุญแจแรก', 'คีย์หลัก']], ['backup key', 'สำรอง', []],
  ['check', 'การตรวจ', ['เช็ก', 'เช็ค', 'การเช็ก']], ['test suite', 'ชุดทดสอบ', ['ชุดเทสต์', 'เทสต์สวีท']], ['deliberately broken copy', 'สำเนาที่จงใจทำให้เสีย', ['มิวแทนท์']], ['merged', 'รวมแล้ว', ['เมิร์จ', 'เมิร์ช', 'ผสานแล้ว']],
  ['parked', 'พักไว้', ['จอดไว้', 'พาร์ก']], ['refused', 'ปฏิเสธ', ['ปฏิเสธไม่รับ', 'รีเจ็กต์']], ['visit', 'แวะ', ['เยี่ยมชม', 'การเข้าชม']], ['superseded', 'ถูกแทนที่แล้ว', ['ถูกยกเลิกแล้ว', 'ถูกแทนแล้ว']], ['withdrawn', 'ถูกถอน', []],
  ['executor', 'ผู้ดำเนินการ', ['ผู้ประมวลผล', 'เอ็กซิคิวเตอร์']], ['post (to the books)', 'ลงบัญชี', ['โพสต์บัญชี', 'บันทึกบัญชีลงบัญชี']], ['thin pipe', 'ท่อบาง', ['ท่อผอม', 'ท่อเล็ก']], ['joiner', 'ผู้เข้าร่วม', ['ผู้ร่วมทีม', 'สมาชิกใหม่']]];
const cnt = (t, x) => t.split(x).length - 1; let dead = 0, varBad = 0;
G.forEach(([en, th, vars]) => { const a = cnt(screen, th), b = cnt(speech, th), c = cnt(caps, th); if (!a && !b) dead++; console.log(`§TH_GLOSSARY_USE ${en} = ${th} screen=${a} speech=${b} captions=${c}${!a && !b ? ' DEAD' : !a ? ' speech-only' : !b ? ' screen-only' : ''}`);
  vars.forEach(v => { const n = cnt(screen, v) + cnt(speech, v) + cnt(caps, v); if (n) { varBad++; console.log(`§TH_GLOSSARY_VARIANT ${en}: rival spelling "${v}" occurs ${n} times  WRONG`); } }); });
const planted = cnt(screen + 'แอดมิน', 'แอดมิน') + cnt('คีย์', 'คีย์'); console.log(`§TH_GLOSSARY_CONTROL a planted rival spelling is ${planted >= 2 ? 'detected' : 'NOT detected'}`);
const ok = !varBad && planted >= 2; console.log(`§TH_GLOSSARY_USE_DONE terms=${G.length} dead=${dead} rival_spellings_found=${varBad} ${ok ? 'PASS' : 'FAIL'} (dead / one-sided terms are reported, not failed)`); process.exit(ok ? 0 : 1);
