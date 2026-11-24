# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §60: mine the Hartl Haus house pages (roof form, pitch, heights, size, storeys). Read the log after every run (§HP lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §60 — Witness: W-S60a (field coverage + distinct values), falsifier (a non-existing field reads 0), VACUOUS (< 10 pages)
# Usage: python3 -P hartl_pages.py <harvest dir (index.json)>   -> <dir>/pages/<slug>.html, <dir>/pages_index.json. Private copy (maker's copyright), never committed.
#   One request per 2 s, a generic client name, robots-allowed paths only (the same 'hauser/' pages the plan harvest read); files already on disk are not fetched again.
import sys, os, re, json, time, urllib.request, html
BASE = 'https://www.hartlhaus.de/'; UA = 'Mozilla/5.0 (compatible; research-client)'
out = os.path.abspath(sys.argv[1]); P = os.path.join(out, 'pages'); os.makedirs(P, exist_ok=True)
def log(*a): print(*a, flush=True)
last = [0.0]
def get(url):
    w = 2.0 - (time.time() - last[0])
    if w > 0: time.sleep(w)
    last[0] = time.time()
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r: return r.read()
idx = json.load(open(os.path.join(out, 'index.json')))['houses']; got = 0; fails = []
for h in idx:
    dst = os.path.join(P, h['slug'] + '.html')
    if os.path.exists(dst): got += 1; continue
    try: b = get(BASE + h['page']); open(dst + '.part', 'wb').write(b); os.replace(dst + '.part', dst); got += 1
    except Exception as e: fails.append((h['page'], str(e))); log(f"§HP_FAIL {h['page']} {e}")
log(f'§HP_FETCH houses={len(idx)} pages on disk={got} failures={len(fails)}')

# ---- W-S60a: the 'Hausdetails' block of every page: net area (DIN 277), pitch (n°), roof form, the plan tabs (storeys) ----
import collections, statistics
def text(f):
    t = open(f, errors='replace').read(); t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
    return re.sub(r'\n\s*\n+', '\n', html.unescape(re.sub(r'<[^>]+>', '\n', t)))
FORMS = ['Satteldach', 'Walmdach', 'Krüppelwalmdach', 'Pultdach', 'Flachdach', 'Zeltdach', 'Pfettendach', 'Mansarddach']
recs = []
for h in idx:
    f = os.path.join(P, h['slug'] + '.html')
    if not os.path.exists(f): continue
    t = text(f); a = t.find('Hausdetails'); blk = t[a:a + 900] if a >= 0 else ''
    area = re.search(r'(\d{2,3},\d{1,2})\s*\n\s*Nettogrundrissfl', blk); pitch = re.search(r'^\s*(\d{1,2})\s*°\s*$', blk, re.M)
    forms = [w for w in FORMS if re.search(r'^\s*' + w + r'\b', blk, re.M)]
    tabs = []
    g = t.find('\nGrundrisse\n', a if a >= 0 else 0)
    if g >= 0:
        for ln in t[g + 12:g + 200].split('\n'):
            if ln.strip() in ('Erdgeschoss', 'Obergeschoss', 'Dachgeschoss', 'Untergeschoss', 'Kellergeschoss', 'Galerie', 'Spitzboden'): tabs.append(ln.strip())
            elif ln.strip() and tabs: break
    title_deg = re.search(r'(\d{2})°\s*Dachneigung', t[:600])
    recs.append(dict(slug=h['slug'], category=h['category'], area=float(area.group(1).replace(',', '.')) if area else None, pitch=int(pitch.group(1)) if pitch else (int(title_deg.group(1)) if title_deg else None), forms=forms, tabs=tabs))
M = len(recs)
for fld in ('area', 'pitch', 'forms', 'tabs'): log(f"§HP_FIELD {fld} printed on {sum(1 for r in recs if r[fld])} of {M} houses")
log(f"§HP_FIELD Dachfarbe-XYZ printed on {sum(1 for h in idx if os.path.exists(os.path.join(P, h['slug'] + '.html')) and 'Dachfarbe-XYZ' in open(os.path.join(P, h['slug'] + '.html'), errors='replace').read())} of {M} houses (falsifier: a field that does not exist must read 0)")
log(f"§HP_FORMS " + str(dict(collections.Counter(w for r in recs for w in r['forms']))) + f"  no form read: {sum(1 for r in recs if not r['forms'])}")
log(f"§HP_PITCH " + str(sorted(collections.Counter(r['pitch'] for r in recs if r['pitch']).items())))
log(f"§HP_FORM_x_PITCH " + str(sorted(collections.Counter((r['forms'][0] if r['forms'] else None, r['pitch']) for r in recs).items(), key=lambda x: -x[1])[:14]))
log(f"§HP_STOREYS " + str(sorted(collections.Counter(tuple(r['tabs']) for r in recs).items(), key=lambda x: -x[1])[:10]))
log(f"§HP_W-S60a houses={M} verdict={'VACUOUS' if M < 10 else 'READ'}")
json.dump(recs, open(os.path.join(out, 'pages_index.json'), 'w'), indent=1, ensure_ascii=False)
