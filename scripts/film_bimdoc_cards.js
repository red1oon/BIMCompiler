// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — film_bimdoc_cards.js: the ONE card builder of the BIM Document film (FILM_NARRATION.md §BIMDOC-FILM-V3 / -ZH-MS). Used by scripts/film_bimdoc.js (English, recorded)
//   and scripts/film_bimdoc_lang.js (Chinese / Malay: the same three cards, translated, swapped in at the English frame counts). build(lang) THROWS on any text key a language lacks,
//   so no card ships half-translated. Every claim on the closing card is sourced in FUSED_4D5D_WEDGE_LANE.md §PRIOR-ART 2026-11-09. Witness: scripts/film_bimdoc_card_layout.js.
'use strict';
const CARD_CSS = '#__fc{display:none}html,body{margin:0;width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:"DejaVu Sans",sans-serif}' +
  '.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.k{color:#FF6B78;font-size:34px;letter-spacing:2px;margin-bottom:26px}' +
  '.t{font-size:96px;font-weight:700;text-align:center;line-height:1.15}.t b{color:#FF6B78}.p{font-size:40px;color:#c9c4bd;margin-top:34px;text-align:center}' +
  '.row{display:flex;align-items:center;gap:0;margin-top:30px}.bx{width:330px;height:210px;border:4px solid #7dd3fc;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:46px;font-weight:700;color:#7dd3fc}' +
  '.bx small{font-size:28px;font-weight:400;color:#c9c4bd;margin-top:10px}.ar{width:100px;text-align:center;font-size:72px;color:#FF6B78}.fn{position:absolute;bottom:260px;width:100%;text-align:center;font-size:30px;color:#8b95a5}' +
  '.pp{font-size:42px;color:#e6e1da;max-width:1500px;text-align:center;line-height:1.45;margin-top:30px}.pp b{color:#7dd3fc;font-weight:700}' +
  '.src{position:absolute;bottom:70px;left:120px;right:120px;text-align:center;font-size:24px;color:#8b95a5;line-height:1.5}';
// per-language font: Chinese needs the CJK face (Chromium renders it; never ffmpeg drawtext, FILM_NARRATION.md Mandarin rule)
const FONT = { en: null, ms: null, zh: '"Noto Sans CJK SC","DejaVu Sans",sans-serif' };
const KEYS = ['chain.k', 'chain.sheet', 'chain.sheet.s', 'chain.doc', 'chain.doc.s', 'chain.task', 'chain.task.s', 'chain.inv', 'chain.inv.s',
  'ch.k', 'ch.t', 'ch.pp', 'end.k', 'end.t', 'end.pp1', 'end.pp2', 'end.src1', 'end.src2'];
const TEXT = {
  en: {
    'chain.k': 'THE CHAIN, END TO END', 'chain.sheet': 'Sheet', 'chain.sheet.s': 'the drawing file', 'chain.doc': 'BIM Document', 'chain.doc.s': 'a row in the register',
    'chain.task': 'Project task', 'chain.task.s': 'hours and progress', 'chain.inv': 'Invoice', 'chain.inv.s': 'amounts',
    'ch.k': 'CHAPTER', 'ch.t': 'BIM Integration to <b>ERP</b>',
    'ch.pp': 'In an earlier film, any set of BIM model elements was pushed to the ERP as a <b>Project Order</b>.<br>Now the project\'s back-office documentation is wired in too,<br>as a new BIM data record set: the <b>BIM Document</b>.',
    'end.k': 'ALREADY IN THE SAME KERNEL', 'end.t': 'One kernel. <b>One signed log.</b>',
    'end.pp1': 'The 4D schedule in our BIM already reads the <b>Project Order</b> back: planned against committed cost, phase by phase, as you scrub time.',
    'end.pp2': 'To our knowledge, the first to run BIM and ERP together in <b>one browser kernel</b>: every write applied locally and signed on one op-log, with no app or database server.',
    'end.src1': 'Closest prior art: RIB iTWO 4.0 / MTWO (BIM 5D + ERP on cloud servers) · MI ERP BIM for Odoo 19 (IFC elements as ERP records, on an Odoo server) · INTELSYS.build (SAP S/4HANA + Autodesk).',
    'end.src2': 'This film: a test server with public example data (a synthetic Duplex sheet set). The 4D variance is shown on the Hospital showcase project.' },
  zh: {
    'chain.k': '完整链路，从头到尾', 'chain.sheet': '图纸', 'chain.sheet.s': '图纸文件', 'chain.doc': 'BIM 文档', 'chain.doc.s': '登记册里的记录',
    'chain.task': '项目任务', 'chain.task.s': '工时与进度', 'chain.inv': '发票', 'chain.inv.s': '金额',
    'ch.k': '章节', 'ch.t': 'BIM 与 <b>ERP</b> 集成',
    'ch.pp': '在之前的影片里，任意一组 BIM 模型构件都可以推送到 ERP，成为<b>项目订单</b>。<br>现在，项目的后台文档也接了进来，<br>成为一组新的 BIM 数据记录：<b>BIM 文档</b>。',
    'end.k': '已在同一内核之中', 'end.t': '一个内核。<b>一条签名日志。</b>',
    'end.pp1': '我们 BIM 里的 4D 进度计划已经读回<b>项目订单</b>：按阶段对比计划成本与承诺成本，随时间轴拖动而变化。',
    'end.pp2': '据我们所知，首个在<b>同一个浏览器内核</b>中同时运行 BIM 与 ERP 的方案：每次写入都在本地执行，并签名记录在同一条操作日志上，无需应用服务器或数据库服务器。',
    'end.src1': '最接近的先例：RIB iTWO 4.0 / MTWO（BIM 5D + ERP，运行在云服务器上）· Odoo 19 的 MI ERP BIM（IFC 构件存为 ERP 记录，运行在 Odoo 服务器上）· INTELSYS.build（SAP S/4HANA + Autodesk）。',
    'end.src2': '本片：测试服务器，使用公开示例数据（合成的 Duplex 图纸集）。4D 成本差异展示于 Hospital 示范项目。' },
  ms: {
    'chain.k': 'RANTAIAN, DARI AWAL HINGGA AKHIR', 'chain.sheet': 'Helaian', 'chain.sheet.s': 'fail lukisan', 'chain.doc': 'BIM Document', 'chain.doc.s': 'satu baris dalam daftar',
    'chain.task': 'Tugas projek', 'chain.task.s': 'jam dan kemajuan', 'chain.inv': 'Invois', 'chain.inv.s': 'amaun',
    'ch.k': 'BAB', 'ch.t': 'Integrasi BIM ke <b>ERP</b>',
    'ch.pp': 'Dalam filem terdahulu, mana-mana set elemen model BIM dihantar ke ERP sebagai <b>Project Order</b>.<br>Kini dokumentasi pejabat belakang projek turut disambungkan,<br>sebagai set rekod data BIM yang baharu: <b>BIM Document</b>.',
    'end.k': 'SUDAH ADA DALAM KERNEL YANG SAMA', 'end.t': 'Satu kernel. <b>Satu log bertandatangan.</b>',
    'end.pp1': 'Jadual 4D dalam BIM kami sudah membaca semula <b>Project Order</b>: kos dirancang berbanding kos komited, fasa demi fasa.',
    'end.pp2': 'Setahu kami, yang pertama menjalankan BIM dan ERP bersama dalam <b>satu kernel pelayar</b>: setiap tulisan dibuat setempat dan ditandatangani pada satu log, tanpa pelayan aplikasi atau pangkalan data.',
    'end.src1': 'Karya terdahulu terdekat: RIB iTWO 4.0 / MTWO (BIM 5D + ERP pada pelayan awan) · MI ERP BIM untuk Odoo 19 (elemen IFC sebagai rekod ERP, pada pelayan Odoo) · INTELSYS.build (SAP S/4HANA + Autodesk).',
    'end.src2': 'Filem ini: pelayan ujian dengan data contoh awam (set helaian Duplex sintetik). Varians 4D ditunjukkan pada projek pameran Hospital.' }
};
function build(lang) {
  const T = TEXT[lang]; if (!T) throw new Error('film_bimdoc_cards: no text table for ' + lang);
  const miss = KEYS.filter((k) => !T[k]); if (miss.length) throw new Error('film_bimdoc_cards: ' + lang + ' lacks ' + miss.join(','));
  const css = '<style>' + CARD_CSS + (FONT[lang] ? 'html,body{font-family:' + FONT[lang] + '}' : '') + '</style>';
  const bx = (k) => '<div class="bx">' + T[k] + '<small>' + T[k + '.s'] + '</small></div>';
  return {
    card: css + '<div class="w"><div class="k">' + T['chain.k'] + '</div><div class="row">' + bx('chain.sheet') + '<div class="ar">&rarr;</div>' + bx('chain.doc') + '<div class="ar">&rarr;</div>' +
      bx('chain.task') + '<div class="ar">&rarr;</div>' + bx('chain.inv') + '</div></div>',
    ch: css + '<div class="w"><div class="k">' + T['ch.k'] + '</div><div class="t">' + T['ch.t'] + '</div><div class="pp">' + T['ch.pp'] + '</div></div>',
    end: css + '<div class="w"><div class="k">' + T['end.k'] + '</div><div class="t">' + T['end.t'] + '</div><div class="pp">' + T['end.pp1'] + '<br>' + T['end.pp2'] + '</div>' +
      '<div class="src">' + T['end.src1'] + '<br>' + T['end.src2'] + '</div></div>'
  };
}
module.exports = { CARD_CSS, TEXT, KEYS, build };
