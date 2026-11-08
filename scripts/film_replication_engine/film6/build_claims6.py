#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: builds claims6.json (the claims ledger of Film 6). Every quote is checked here against the fetched source text kept in inputs/claims_src/ (a quote not found verbatim, or over 25 words, aborts).
# READ THE LOG after every run (logs/claims6_build.log): FOUND/MISSING per quote, word counts. Nothing is written from memory.
import json, re, hashlib, os, sys
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, 'inputs', 'claims_src')
ACC = '2026-10-28'
def rd(f): return open(os.path.join(S, f), errors='ignore').read()
def norm(s): return re.sub(r'\s+', ' ', s)
CL = [
 dict(id='idem-imp-a', source='iDempiere', claim='A staged-import row is flagged when it has been processed.', url='https://wiki.idempiere.org/en/Import_Order_(Window_ID-281)',
  fetched_from='https://web.archive.org/web/2024/https://wiki.idempiere.org/en/Import_Order_(Window_ID-281)', title='Import Order (Window ID-281) - iDempiere en',
  quote='The Imported check box indicates if this import has been processed.', file='idempiere_import_order_wayback.txt', depth='full page text (Wayback snapshot; the live wiki answers HTTP 403 to curl and WebFetch from this machine)', status='CONFIRMED_VIA_ARCHIVE'),
 dict(id='idem-imp-b', source='iDempiere', claim='Every import row keeps the error text the import produced.', url='https://wiki.idempiere.org/en/Import_Order_(Window_ID-281)',
  fetched_from='https://web.archive.org/web/2024/https://wiki.idempiere.org/en/Import_Order_(Window_ID-281)', title='Import Order (Window ID-281) - iDempiere en',
  quote='The Import Error Message displays any error messages generated during the import process.', file='idempiere_import_order_wayback.txt', depth='full page text (Wayback snapshot)', status='CONFIRMED_VIA_ARCHIVE'),
 dict(id='idem-lineage', source='Compiere / ADempiere / iDempiere', claim='ADempiere began as a fork of Compiere, and iDempiere descends from ADempiere.', url='https://en.wikipedia.org/wiki/IDempiere',
  title='iDempiere - Wikipedia', quote='2006, starts the development of ADempiere as a fork of the open source version of Compiere.', file='wiki_idempiere.txt', depth='full page text (secondary source: an encyclopedia)', status='CONFIRMED_SECONDARY',
  note='Second sentence of the same page, also verbatim: "So iDempiere can be seen as the next generation of ADempiere or as a fork of the ADempiere Branch GlobalQSS Adempiere361". The page does not itself speak of an "import convention"; that is carried by idem-imp-a / idem-imp-b.'),
 dict(id='resa-load', source='Oracle Retail Sales Audit', claim='ReSA loads the till data into its own tables first, and a separate batch process audits it.', url='https://docs.oracle.com/cd/E79623_01/rms/pdf/160C/html/resa_ug/resa-import.htm',
  title='Importing Transactional Data - Oracle Retail Sales Audit (ReSA) User Guide Release 16.0', quote='This data is then loaded into the ReSA database tables. A batch process then audits the uploaded data.', file='oracle_resa_import.txt', depth='full page (chapter 5)', status='CONFIRMED'),
 dict(id='resa-errors', source='Oracle Retail Sales Audit', claim='Validation errors are kept in error tables, not lost.', url='https://docs.oracle.com/cd/E79623_01/rms/pdf/160C/html/resa_ug/resa-import.htm',
  title='Importing Transactional Data - ReSA User Guide 16.0', quote='All errors are written to error tables.', file='oracle_resa_import.txt', depth='full page (chapter 5)', status='CONFIRMED'),
 dict(id='resa-audit', source='Oracle Retail Sales Audit', claim='Errors found in audit must be corrected or overridden by an auditor.', url='https://docs.oracle.com/cd/E79623_01/rms/pdf/160C/html/resa_ug/resa-auditing.htm',
  title='Auditing Transactional Data - ReSA User Guide 16.0', quote='Any errors that are generated as part of the validation process must be corrected or overridden.', file='oracle_resa_audit.txt', depth='full page (chapter 7)', status='CONFIRMED',
  note='The same page says transactions go from the store to head office "at the end of the day or by trickle-poll method". The film does not say Oracle is end-of-day only.'),
 dict(id='d365-valid', source='Dynamics 365 Commerce', claim='Store transactions are validated before the statement calculation; only those that pass go on.', url='https://learn.microsoft.com/en-us/dynamics365/commerce/valid-checker',
  title='Validate store transactions for statement calculation - Commerce | Dynamics 365 | Microsoft Learn', quote='only transactions that pass the transaction validation rules go to the transaction statement calculation process', file='d365_valid.txt', depth='full page', status='CONFIRMED'),
 dict(id='d365-trickle', source='Dynamics 365 Commerce', claim='CAUTION, not for the film as a support: Microsoft recommends trickle feed, i.e. near-real-time posting of sales; only tender and cash management wait for the end of the day.', url='https://learn.microsoft.com/en-us/dynamics365/commerce/trickle-feed',
  title='Trickle feed-based order creation for retail store transactions - Commerce | Dynamics 365 | Microsoft Learn', quote='Tender and cash management transactions are processed on the financial statement at the end of the day.', file='d365_trickle.txt', depth='full page', status='CONFIRMED',
  note='The same page recommends moving to trickle-feed posting for "near-real-time" recognition. So the film must NOT say that the industry posts only at day end; it names D365 only for validate-before-calculate (d365-valid). Kept in the ledger so the lead sees the counter-example.'),
 dict(id='erpnext-subledger', source='ERPNext POS', claim='POS sales do not touch the stock and accounting ledgers until the session is closed with a voucher.', url='https://docs.frappe.io/erpnext/pos-invoice-consolidation',
  title='POS Invoice Consolidation (ERPNext docs; page <title> is empty in the fetched HTML, heading read from the text)', quote='the sales from the POS session do not affect the stock and accounting ledgers until a Closing POS Voucher is submitted for that session', file='erpnext_consol.txt', depth='the page text (the HTML is a 2.9 MB docs shell; the passage was located in the text and read in context)', status='CONFIRMED'),
 dict(id='erpnext-merge', source='ERPNext POS', claim='At close, one consolidated sales invoice replaces the day\'s intermediate invoices in the ledgers.', url='https://docs.frappe.io/erpnext/pos-invoice-consolidation',
  title='POS Invoice Consolidation (ERPNext docs)', quote='a single sales invoice which merges all the intermediate invoices created throughout the day', file='erpnext_consol.txt', depth='the page text, read in context', status='CONFIRMED'),
 dict(id='lf-secondary', source='Ink & Switch, Local-first software', claim='In local-first software the servers hold secondary copies.', url='https://www.inkandswitch.com/essay/local-first/',
  title='Local-first software: you own your data, in spite of the cloud (Kleppmann, Wiggins, van Hardenberg, McGranaghan; April 2019)', quote='Servers still exist, but they hold secondary copies of your data in order to assist with access from multiple devices.', file='inkswitch.txt', depth='full essay text', status='CONFIRMED'),
 dict(id='lf-offline', source='Ink & Switch, Local-first software', claim='Read and write any time, even offline.', url='https://www.inkandswitch.com/essay/local-first/',
  title='Local-first software (Kleppmann et al., 2019)', quote='the user can read and write this data anytime, even while offline', file='inkswitch.txt', depth='full essay text', status='CONFIRMED'),
 dict(id='lf-own', source='Ink & Switch, Local-first software', claim='The user keeps agency and ownership of the data.', url='https://www.inkandswitch.com/essay/local-first/',
  title='Local-first software (Kleppmann et al., 2019)', quote='full agency and ownership of that data', file='inkswitch.txt', depth='full essay text', status='CONFIRMED'),
 dict(id='sqlite-serverless', source='SQLite', claim='SQLite is serverless: the program reads and writes the database file directly, there is no server process.', url='https://www.sqlite.org/serverless.html',
  title='SQLite Is Serverless', quote='there is no separate server process to install, setup, configure, initialize, manage, and troubleshoot', file='sqlite_serverless.txt', depth='full page', status='CONFIRMED'),
 dict(id='sqlite-direct', source='SQLite', claim='Direct file access instead of a server.', url='https://www.sqlite.org/serverless.html',
  title='SQLite Is Serverless', quote='the process that wants to access the database reads and writes directly from the database files on disk', file='sqlite_serverless.txt', depth='full page', status='CONFIRMED'),
 dict(id='sqlite-hipp', source='SQLite', claim='Richard Hipp is SQLite\'s lead developer (the owner\'s "Richard Hipp approach"). The serverless page itself does not name him.', url='https://sqlite.org/crew.html',
  title='SQLite crew page', quote='the lead developer (Richard Hipp)', file='sqlite_crew.txt', depth='full page (815 characters of text)', status='CONFIRMED',
  note='Use only to say who is meant. The film does not put words in his mouth; the quote on screen is from sqlite.org/serverless.html (sqlite-serverless).'),
 dict(id='slipok-sample', source='SlipOK (sample slip verifier)', claim='SlipOK is a Thai slip-verification service; one of two providers the third-party SDK wraps (the other is EasySlip).', url='https://slipok.com/',
  title='slipverify-jvm README (third party, GitHub)', fetched_from='https://raw.githubusercontent.com/sunJirapath/slipverify-jvm/main/README.md', quote='Providers: EasySlip and SlipOK.', file='slipverify-jvm_README.md', depth='README of a third-party SDK; the vendor\'s own site and API docs (slipok.com, slipok.com/api-documentation/check-slip/) answer HTTP 403 (Cloudflare challenge) to curl AND to WebFetch from this machine, so NOT read',
  status='UNCONFIRMED_PRIMARY', note='SECONDARY ONLY. Proposed cut: say nothing about what SlipOK does or costs. The film says (owner words, TEAMWORK_FRAMEWORK §40.2): "a slip-verification service, SlipOK as the sample; another provider swaps in as another row." Also found, not for the film: thanakan README lists slipok.com as "free for 100 slip per month" (a price claim, undated: do not use).'),
]
out = []; ok = True
for c in CL:
    f = os.path.join(S, c['file']); txt = norm(rd(c['file'])); q = c['quote']; n = len(q.split())
    found = norm(q).lower() in txt.lower()
    i = txt.lower().find(norm(q).lower()); ctx = txt[max(0, i - 160): i + len(q) + 160] if found else None
    print('§CLAIM_CHECK %s words=%d %s %s' % (c['id'], n, 'FOUND' if found else 'MISSING', c['status']))
    if not found or n > 25:
        ok = False; print('  !! %s: %s' % (c['id'], 'quote not found verbatim' if not found else 'over 25 words')); continue
    d = dict(c); d['quote_words'] = n; d['accessed'] = ACC; d['source_text_file'] = 'inputs/claims_src/' + c['file']
    d['source_text_sha256'] = hashlib.sha256(open(f, 'rb').read()).hexdigest()[:16]; d['context_excerpt'] = ctx; d['read_depth'] = d.pop('depth'); d.pop('file')
    out.append(d)
if not ok: print('§CLAIMS_VERDICT FAIL'); sys.exit(1)
conf = sum(1 for d in out if d['status'].startswith('CONFIRMED')); unc = sum(1 for d in out if d['status'].startswith('UNCONFIRMED'))
json.dump(dict(built='film6/build_claims6.py', accessed=ACC, n=len(out), confirmed=conf, unconfirmed=unc,
  rule='quote <= 25 words, verbatim in the stored source text; UNCONFIRMED = the film must not make the claim (propose cut)', claims=out), open(os.path.join(H, 'claims6.json'), 'w'), indent=1, ensure_ascii=False)
print('§CLAIMS_VERDICT PASS n=%d confirmed=%d unconfirmed=%d' % (len(out), conf, unc))
