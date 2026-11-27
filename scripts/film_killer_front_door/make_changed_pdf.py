# ⚠ DO NOT REMOVE - film "PDF and Excel are killer apps" (prompts/FILM_KILLER_FRONT_DOOR.md): the trial balance with ONE printed digit changed (498.09 -> 499.09), made at record time in a temp folder, never committed. The content stream is uncompressed, so a same-length edit keeps the file valid. Usage: python3 -I make_changed_pdf.py <in.pdf> <out.pdf>
import re, sys, zlib
src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
def obj(n):
    i = b.index(('\n%d 0 obj' % n).encode()) + 1
    j = b.index(b'endobj', i); return b[i:j]
def stream(o):
    j = o.index(b'stream') + 6; j += 2 if o[j:j+2] == b'\r\n' else 1
    k = o.rindex(b'endstream'); d = o[j:k]
    return zlib.decompress(d) if b'FlateDecode' in o[:j] else d
# font resource name -> ToUnicode map
res = obj(6).decode('latin1'); fonts = {}
for m in re.finditer(r'/(F\d+) (\d+) 0 R', res):
    fo = obj(int(m.group(2))).decode('latin1'); tu = int(re.search(r'/ToUnicode (\d+) 0 R', fo).group(1))
    cm = stream(obj(tu)).decode('latin1'); mp = {}
    for bm in re.finditer(r'beginbfchar(.*?)endbfchar', cm, re.S):
        for a, c in re.findall(r'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>', bm.group(1)): mp[int(a, 16)] = chr(int(c[:4], 16))
    for bm in re.finditer(r'beginbfrange(.*?)endbfrange', cm, re.S):
        for a, e, arr in re.findall(r'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*\[(.*?)\]', bm.group(1), re.S):
            for n, c in enumerate(re.findall(r'<([0-9a-fA-F]+)>', arr)): mp[int(a, 16) + n] = chr(int(c[:4], 16))
        for a, e, c in re.findall(r'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>(?![^\[]*\])', re.sub(r'\[.*?\]', '', bm.group(1), flags=re.S)):
            for g in range(int(a, 16), int(e, 16) + 1): mp[g] = chr(int(c[:4], 16) + g - int(a, 16))
    fonts[m.group(1)] = mp
i = b.index(b'\n5 0 obj') + 1; j = b.index(b'stream', i) + 7; k = b.index(b'endstream', j); s = b[j:k]
t = s.decode('latin1'); cur = None; chunks = []   # (font, offset of the 4-hex glyph, glyph, char, y)
for m in re.finditer(r'/(F\d+) [\d.]+ Tf|\[((?:<[0-9a-fA-F]+>|\s|-?[\d.]+)+)\] TJ|1 0 0 1 ([\d.]+) ([\d.]+) Tm', t):
    if m.group(1): cur = m.group(1)
    elif m.group(2):
        for h in re.finditer(r'<([0-9a-fA-F]+)>', m.group(2)):
            for q in range(0, len(h.group(1)), 4):
                g = int(h.group(1)[q:q+4], 16); chunks.append((cur, m.start(2) + h.start(1) + q, g, fonts[cur].get(g, '?')))
text = ''.join(c[3] for c in chunks); hits = [m.start() for m in re.finditer(r'498\.09', text)]
print('printed text hits for 498.09:', len(hits))
assert len(hits) == 1
p = hits[0] + 2; fnt, off, g8, ch = chunks[p]; assert ch == '8'
g9 = [g for g, c in fonts[fnt].items() if c == '9'][0]
new = t[:off] + '%04x' % g9 + t[off + 4:]; assert len(new) == len(t)
out = b[:j] + new.encode('latin1') + b[k:]; open(dst, 'wb').write(out); print('wrote', dst, len(out), 'glyph', g8, '->', g9)
