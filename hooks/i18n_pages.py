# ⚠ DO NOT REMOVE — hooks/i18n_pages.py: the per-page rules of the translated site (bim-compiler prompts/DOCS_I18N.md §2, §3, §6b, §6d V1).
# READ THE BUILD LOG (§I18N lines) after every build; the witness W-DOCS-I18N (scripts/witness_docs_i18n.js) reads the built site.
# Runs after mkdocs-static-i18n (event_priority -100). Per page:
#   1. the chooser and the <link rel=alternate> list a language only where the page REALLY exists in it (a fallback copy is not a translation; V0 defect 2);
#   2. a fallback copy (an English page under /<lang>/) gets the "not translated yet" line, noindex, and a canonical link to the English page;
#   3. a translated page gets the "translated from the English page" line, and "out of date" when the English source changed since (source_sha, §3).
import hashlib, logging, os
import yaml
from mkdocs.plugins import event_priority

log = logging.getLogger('mkdocs.hooks.i18n_pages')
HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, 'i18n_ui.yml'), encoding='utf-8') as fh:
    UI = yaml.safe_load(fh) or {}
DEFAULT = 'en'
STATE = {'root': None, 'docs': None, 'counts': {}}

def _say(msg):
    log.info('§I18N ' + msg)

def _sha16(path):
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()[:16]

def on_config(config):
    if STATE['root'] is None:   # the first call is the default (English) build: its site_url is the site's root
        STATE['root'] = (config.get('site_url') or '/').rstrip('/') + '/'
        STATE['docs'] = config['docs_dir']
    return config

@event_priority(-100)   # AFTER mkdocs-static-i18n, which rebuilds config.extra.alternate for each page in its own on_page_context (measured: at the default priority this hook ran first and was overwritten)
def on_page_context(context, page, config, nav):
    build = config.theme.get('language') or DEFAULT
    alts = getattr(page.file, 'alternates', None) or {}
    src = getattr(page.file, 'locale', DEFAULT)
    real = [lang for lang, f in alts.items() if getattr(f, 'locale', None) == lang]   # the languages this page truly exists in
    alt = getattr(config.extra, 'alternate', None) or []   # the plugin sets it as an ATTRIBUTE (config.extra.alternate = …) and Jinja reads the attribute; .get() saw the empty key (measured)
    kept = [a for a in alt if a.get('lang') in real]
    config.extra.alternate = kept if len(kept) > 1 else []   # one language left = nothing to choose: no chooser, no alternate links
    en = alts.get(DEFAULT)
    en_url = STATE['root'] + (en.url if en is not None else '')
    c = STATE['counts'].setdefault(build, {'pages': 0, 'translated': 0, 'fallback': 0, 'stale': 0, 'chooser': 0})
    c['pages'] += 1
    if kept and len(kept) > 1:
        c['chooser'] += 1
    if build != DEFAULT:
        ui = UI.get(build, {})
        if src != build:   # an English page copied into this language's site
            c['fallback'] += 1
            page.meta['i18n_note'] = ui.get('not_translated', '').replace('{en}', en_url)
            page.meta['i18n_noindex'] = True
            page.canonical_url = en_url
        else:
            c['translated'] += 1
            src_path = os.path.join(STATE['docs'], en.file.src_uri) if en is not None and getattr(en, 'file', None) else None
            if src_path is None and en is not None:
                src_path = os.path.join(STATE['docs'], en.src_uri)
            now = _sha16(src_path) if src_path and os.path.exists(src_path) else None
            was = str(page.meta.get('source_sha', ''))
            stale = (now is None) or (was != now)
            if stale:
                c['stale'] += 1
            page.meta['i18n_note'] = ui.get('stale' if stale else 'translated', '').replace('{en}', en_url)
            _say('translated page=' + page.file.src_uri + ' build=' + build + ' review=' + str(page.meta.get('review')) + ' source_sha=' + was + ' english_sha=' + str(now) + ' stale=' + str(stale) + ' chooser=' + ','.join(a['lang'] for a in config.extra.alternate))
    return context

def on_post_build(config):
    for b, c in sorted(STATE['counts'].items()):
        _say('build=' + b + ' pages=' + str(c['pages']) + ' translated=' + str(c['translated']) + ' fallback=' + str(c['fallback']) + ' stale=' + str(c['stale']) + ' with-chooser=' + str(c['chooser']))
