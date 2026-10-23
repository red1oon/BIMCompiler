// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// BIM Team Postbox — Gmail as the post office's VISIT LOG (bim-compiler prompts/TEAMWORK_FRAMEWORK.md §11.19a / §12.13).
// It holds no truth: each note is a device's signed head plus links to its bundle files in the GitHub pipe repo, and
// every reader verifies those. Notes are INSERTED into this mailbox (Gmail API users.messages.insert: "does not send a
// message", "bypassing most scanning and classification") under the label BIMTEAM — no sending quota, no spam filter.
//   setup()       — run ONCE from the editor: label, secret, inbound trigger; this is also where Google asks for consent.
//   doPost(e)     — a device notes its visit: {secret, space, kid, seq, summary, links[], head}.
//   doGet(e)      — read the log: ?secret=…&max=20 → newest entries (subject, date, snippet).
//   fileInbound() — every 5 min: visit notes MAILED here ([BIMTEAM] subject — phone share sheet, legacy iDempiere SMTP)
//                   get the same label and leave the inbox.

function setup() {
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('SECRET')) p.setProperty('SECRET', Utilities.getUuid().replace(/-/g, ''));
  labelId_();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'fileInbound') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('fileInbound').timeBased().everyMinutes(5).create();
  Logger.log('POSTBOX READY · label BIMTEAM · SECRET=' + p.getProperty('SECRET'));
  return p.getProperty('SECRET');
}

function labelId_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('LABEL_ID');
  if (id) return id;
  var l = (Gmail.Users.Labels.list('me').labels || []).filter(function (x) { return x.name === 'BIMTEAM'; })[0];
  if (!l) l = Gmail.Users.Labels.create({ name: 'BIMTEAM', labelListVisibility: 'labelShow', messageListVisibility: 'show' }, 'me');
  p.setProperty('LABEL_ID', l.id);
  return l.id;
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function secretOk_(s) { return s && s === PropertiesService.getScriptProperties().getProperty('SECRET'); }

function doPost(e) {
  var b = {};
  try { b = JSON.parse((e.postData && e.postData.contents) || '{}'); } catch (x) { return out_({ ok: false, error: 'json' }); }
  if (!secretOk_(b.secret)) return out_({ ok: false, error: 'secret' });
  var me = Session.getEffectiveUser().getEmail();
  var subject = '[BIMTEAM] ' + String(b.space || '').slice(0, 12) + ' ' + String(b.kid || '').slice(0, 16) + ' seq ' + Number(b.seq || 0) +
                (b.note_id ? ' #' + String(b.note_id).replace(/[^0-9a-f]/g, '').slice(0, 16) : '');   // a note's own id: lets a device confirm it by reading back
  var text = String(b.summary || '').slice(0, 2000) + '\n\nlinks:\n' + (b.links || []).slice(0, 20).join('\n') + '\n\nsigned head:\n' + JSON.stringify(b.head || {}).slice(0, 8000);
  var raw = 'From: ' + me + '\r\nTo: ' + me + '\r\nSubject: ' + subject + '\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n' + text;
  var m = Gmail.Users.Messages.insert({ raw: Utilities.base64EncodeWebSafe(raw, Utilities.Charset.UTF_8), labelIds: [labelId_()] }, 'me');
  return out_({ ok: true, id: m.id, subject: subject });
}

function doGet(e) {
  var q = (e && e.parameter) || {};
  if (!secretOk_(q.secret)) return out_({ ok: false, error: 'secret' });
  var res = Gmail.Users.Messages.list('me', { labelIds: [labelId_()], maxResults: Math.min(Number(q.max || 20), 50) });
  var entries = (res.messages || []).map(function (x) {
    var m = Gmail.Users.Messages.get('me', x.id, { format: 'full' }), h = {}, text = '';
    (m.payload.headers || []).forEach(function (y) { h[y.name] = y.value; });
    if (m.payload.body && m.payload.body.data) text = decode_(m.payload.body.data);
    return { id: x.id, subject: h.Subject, date: h.Date, text: text };   // the whole note (the snippet is cut at ~200 chars)
  });
  return out_({ ok: true, entries: entries });
}

// Gmail's body.data arrives as bytes from the advanced service, or as base64url WITHOUT padding (seen 2026-10-23)
function decode_(d) {
  if (typeof d !== 'string') return Utilities.newBlob(d).getDataAsString();
  while (d.length % 4) d += '=';
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(d)).getDataAsString();
}

function fileInbound() {
  var lid = labelId_(), res = Gmail.Users.Messages.list('me', { q: 'subject:"[BIMTEAM]" -label:BIMTEAM in:inbox', maxResults: 50 });
  (res.messages || []).forEach(function (x) { Gmail.Users.Messages.modify({ addLabelIds: [lid], removeLabelIds: ['INBOX'] }, 'me', x.id); });
}
