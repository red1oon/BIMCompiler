// card_visibility.js <team_avatars.js path> <out.png> — the chapter card "Team Visibility" (TEAMWORK_FRAMEWORK §15.15.4): an ILLUSTRATION of the HHS plan with more
// people on it than the two-person take, drawn with the SAME built-in avatar set (team_avatars.js is loaded by the page, not redrawn by hand). Labelled as illustration.
'use strict';
var fs = require('fs'), AV = require(process.argv[2]), pw = require('/home/red1/bim-ootb/tests/node_modules/playwright');
// footprint polygon of Level 1 (metres, from the slab extents of HHS_ARC.db): north arm y>=31, west spine, south arm y<=-4  — mapped to a 1000x640 drawing box
var PTS = [[-14, 43], [22, 43], [22, 31], [-4, 31], [-4, -4], [52, -4], [52, -14], [-14, -14]];
var X0 = -16, X1 = 58, Y0 = -20, Y1 = 48, W = 1000, H = 640, sx = W / (X1 - X0), sy = H / (Y1 - Y0), S = Math.min(sx, sy);
function px(x, y) { return [Math.round((x - X0) * S + 20), Math.round((Y1 - y) * S + 10)]; }
var poly = PTS.map(function (p) { return px(p[0], p[1]).join(','); }).join(' ');
// who is where (illustration: invented names, labelled as such)
var PEOPLE = [
  { n: 'Aisha', a: 'a02', x: 1, y: 37, on: 'N1' }, { n: 'Chen', a: 'a08', x: 8.5, y: 37, on: 'N2' }, { n: 'Jun', a: 'a19', x: 16, y: 37, on: 'N3' },
  { n: 'Bilal', a: 'a12', x: -9, y: 25, on: 'W1' }, { n: 'Kemal', a: 'a23', x: -9, y: 14.5, on: 'W2' }, { n: 'Dewi', a: 'a15', x: -9, y: 4, on: 'stair core' },
  { n: 'Eka', a: 'a05', x: 10, y: -9.5, on: 'S1' }, { n: 'Farid', a: 'a07', x: 17, y: -9.5, on: 'S2' }, { n: 'Gita', a: 'a11', x: 24, y: -9.5, on: 'S3' },
  { n: 'Hana', a: 'a21', x: 31, y: -9.5, on: 'S4' }, { n: 'Ivan', a: 'a16', x: 38, y: -9.5, on: 'S5' }];
var more = 2;   // two more on the south wing than the five heads shown: "5 heads, then +N"
var heads = PEOPLE.map(function (p) { var c = px(p.x, p.y); return '<div class="who" style="left:' + (c[0] - 34) + 'px;top:' + (c[1] - 34) + 'px"><div class="av">' + AV.svg(p.a, 64) + '</div><div class="nm">' + p.n + '</div><div class="on">on ' + p.on + '</div></div>'; }).join('');
var pm = px(46, -9.5);
var plus = '<div class="who" style="left:' + (pm[0] - 34) + 'px;top:' + (pm[1] - 34) + 'px"><div class="av plus">+' + more + '</div><div class="nm">more</div></div>';
var html = '<!doctype html><meta charset="utf-8"><style>' +
  'body{margin:0;width:1920px;height:1080px;background:#12213c;color:#f5f0e8;font-family:"Liberation Sans",sans-serif;position:relative;overflow:hidden}' +
  '.k{position:absolute;left:110px;top:74px;font:700 34px "Liberation Sans Narrow";color:#e8984a;letter-spacing:2px}' +
  'h1{position:absolute;left:110px;top:112px;margin:0;font:700 128px "Liberation Sans Narrow";line-height:1}' +
  '.sub{position:absolute;left:114px;top:262px;font:700 40px "Liberation Sans";color:#bed0e6}' +
  '#plan{position:absolute;left:90px;top:340px;width:1040px;height:680px}' +
  '.who{position:absolute;width:68px;text-align:center}.av{width:64px;height:64px;border-radius:50%;overflow:hidden;margin:0 2px;box-shadow:0 0 0 3px #fff,0 4px 10px #0008}' +
  '.av.plus{display:flex;align-items:center;justify-content:center;background:#1f5fd6;color:#fff;font:700 26px "Liberation Sans"}' +
  '.nm{font:700 20px "Liberation Sans Narrow";margin-top:6px;text-shadow:0 0 4px #000}.on{font:16px "Liberation Sans Narrow";color:#cfe0ff;text-shadow:0 0 4px #000;white-space:nowrap;margin-left:-14px;margin-right:-14px}' +
  '.pts{position:absolute;left:1190px;top:360px;width:620px}.pts div{background:#1d3157;border:2px solid #2c4a80;border-radius:18px;padding:18px 24px;margin-bottom:22px;font:30px/1.35 "Liberation Sans"}.pts b{color:#ffcf8b}' +
  '.ill{position:absolute;left:1190px;top:930px;width:620px;font:italic 26px/1.35 "Liberation Sans";color:#a9bad4}' +
  '</style><div class="k">CHAPTER</div><h1>Team Visibility</h1><div class="sub">Who is here, and what they are on, at a glance.</div>' +
  '<div id="plan"><svg width="1040" height="680" viewBox="0 0 1040 680"><polygon points="' + poly + '" fill="#243c68" stroke="#4d71b3" stroke-width="4" stroke-linejoin="round"/>' +
  '<text x="' + px(-14, 44.6)[0] + '" y="' + px(-14, 44.6)[1] + '" fill="#8fb0e6" font-size="26" font-family="Liberation Sans Narrow" font-weight="700">NORTH WING</text>' +
  '<text x="' + px(0, 16)[0] + '" y="' + px(0, 16)[1] + '" fill="#8fb0e6" font-size="26" font-family="Liberation Sans Narrow" font-weight="700">WEST WING</text>' +
  '<text x="' + px(-14, -16.2)[0] + '" y="' + px(-14, -16.2)[1] + '" fill="#8fb0e6" font-size="26" font-family="Liberation Sans Narrow" font-weight="700">SOUTH WING</text></svg>' + heads + plus + '</div>' +
  '<div class="pts"><div><b>Every avatar is a person</b> logged in to the team, wherever their computer is.</div><div>Each one <b>picks their own</b> from 24 built-in characters.</div><div>You see <b>where they work</b> and <b>what they are on</b>, refreshed at every Visit. No server in between.</div></div>' +
  '<div class="ill">Illustration, not live data: invented names, more people than the live take that follows. The avatars are the real built-in set.</div>';
(async function () {
  var b = await pw.chromium.launch(); var p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); await p.setContent(html); await p.waitForTimeout(400);
  await p.screenshot({ path: process.argv[3] }); await b.close(); console.log('§CARD_VISIBILITY ' + process.argv[3] + ' people=' + PEOPLE.length + ' shown<=5 per wing rule: south shows ' + PEOPLE.filter(function (x) { return x.y < 0; }).length + ' heads + "+' + more + '"');
})();
