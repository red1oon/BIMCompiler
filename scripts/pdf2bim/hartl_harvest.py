# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §57: harvest the published Hartl Haus floor plans (a second German drawing style, a Rosetta set). Read the log after every run (§HARVEST lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §57 (harvest) — Witness: the §HARVEST_SUMMARY line (pages read, plans on disk, failures named).
# Usage: python3 -P hartl_harvest.py <out_dir>   -> <out_dir>/plans/*.png, <out_dir>/index.json
#   The plans are the maker's copyright: kept on this disk only, never committed or published. One request per 2 s, a generic client name; files already on disk are not fetched again.
import sys, os, re, json, time, urllib.request, html

BASE = 'https://www.hartlhaus.de/'
UA = 'Mozilla/5.0 (compatible; research-client)'
out = os.path.abspath(sys.argv[1]); P = os.path.join(out, 'plans'); os.makedirs(P, exist_ok=True)
def log(*a): print(*a, flush=True)
last = [0.0]
def get(url):
    w = 2.0 - (time.time() - last[0])
    if w > 0: time.sleep(w)
    last[0] = time.time()
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r: return r.read()

listing = get(BASE + 'alle-hauser.html').decode('utf-8', 'replace')
pages = sorted(set(re.findall(r'href="(hauser/[^"]+\.html)"', listing)))
log(f'§HARVEST listing pages={len(pages)}')
idx = []; fails = []
for pg in pages:
    cat, slug = pg.split('/')[1], pg.split('/')[-1][:-5]
    try: h = get(BASE + pg).decode('utf-8', 'replace')
    except Exception as e: fails.append((pg, str(e))); log(f'§HARVEST_FAIL page={pg} {e}'); continue
    title = html.unescape((re.search(r'<title>([^<]*)</title>', h) or [None, ''])[1]).strip()
    # plans: images/[<24-hex>_]HH_GR_<model>[_<storey>].png|jpg, full size only (the site also serves -p-500 / -p-800 copies), fetched at the un-prefixed path
    found = {}
    for m in re.finditer(r'images/([0-9a-f]{24}_)?(HH_GR_[^"\'\s>]+?\.(?:png|jpe?g))', h, re.I):
        if not re.search(r'-p-\d+\.', m.group(2)): found.setdefault(m.group(2), set()).add('images/' + (m.group(1) or '') + m.group(2))
    imgs = sorted(found)
    rec = dict(page=pg, category=cat, slug=slug, title=title, plans=[])
    for fn in imgs:
        dst = os.path.join(P, fn)
        m = re.search(r'_(KG|UG|EG|OG|DG|SG|1OG|2OG)(?=[_.])', fn, re.I)
        if not os.path.exists(dst):
            urls = sorted(found[fn], key=len); err = None   # the un-prefixed path first, then the hash-prefixed copy (measured: 4 plans exist only there)
            for u in urls:
                try: b = get(BASE + u); open(dst + '.part', 'wb').write(b); os.replace(dst + '.part', dst); err = None; break   # never an empty file on a failed fetch
                except Exception as e: err = e
            if err: fails.append((fn, str(err))); log(f'§HARVEST_FAIL plan={fn} {err} tried={urls}'); continue
        rec['plans'].append(dict(file=fn, storey=m.group(1).upper() if m else None, bytes=os.path.getsize(dst)))
    idx.append(rec)
    log(f"§HARVEST page={pg} plans={len(rec['plans'])} {[p['storey'] for p in rec['plans']]}")
json.dump(dict(source=BASE + 'alle-hauser.html', fetched=time.strftime('%Y-%m-%d'), note='maker copyright: private research copy, never committed', houses=idx), open(os.path.join(out, 'index.json'), 'w'), indent=1, ensure_ascii=False)
n = sum(len(r['plans']) for r in idx)
log(f"§HARVEST_SUMMARY pages={len(pages)} read={len(idx)} plans={n} houses_without_plans={sum(1 for r in idx if not r['plans'])} failures={len(fails)}")
