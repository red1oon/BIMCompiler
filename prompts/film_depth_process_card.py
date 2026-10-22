# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md §9 closing card (red1 2026-10-13: "add black card at the back explaining our process here:
#   1. SQLite to iDempiere parity parallel task, 2. smell out the gaps, 3. fix them, prove again, 4. move to next task, 5. suggest an important
#   task for us to check"). Plain black 1920x1080 card, five numbered steps, in the narration language. Read the log: §PROC_CARD.
# usage: python3 film_depth_process_card.py <out.png> [en|th]
import sys, os
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; LANG = sys.argv[2] if len(sys.argv) > 2 else 'en'
W, H = 1920, 1080
T = {'en': ('HOW EVERY FILM HERE IS MADE', [
        'SQLite vs iDempiere parity: the same task run side by side',
        'Smell out the gaps: every difference is logged',
        'Fix them the iDempiere way, then prove it again',
        'Move on to the next task',
        'Your turn: suggest an important task for us to check']),
     'zh': ('这里每部片子是怎么做的', [
        'SQLite 与 iDempiere 对等：同一个任务并排运行',
        '找出缺口：每一处差异都记录在案',
        '按 iDempiere 的方式修好，再证明一次',
        '继续做下一个任务',
        '轮到你了：建议一个我们应该检查的重要任务']),
     'th': ('ภาพยนตร์ทุกเรื่องที่นี่ทำอย่างไร', [
        'SQLite กับ iDempiere ทำงานเดียวกันแบบคู่ขนาน เทียบกันทีละขั้น',
        'สืบหาช่องว่าง ทุกความต่างถูกบันทึกไว้',
        'แก้ตามแบบ iDempiere แล้วพิสูจน์ซ้ำอีกครั้ง',
        'ไปงานถัดไป',
        'ถึงตาคุณ: แนะนำงานสำคัญที่เราควรตรวจสอบ'])}
kicker, steps = T[LANG]
def _f(paths, sz):
    for p in paths:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
LAT = {False: ['/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'], True: ['/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']}
THA = {False: ['/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf'], True: ['/usr/share/fonts/truetype/noto/NotoSansThai-Bold.ttf', '/usr/share/fonts/truetype/noto/NotoLoopedThai-Bold.ttf']}
def is_thai(ch): return '\u0e00' <= ch <= '\u0e7f'
def mixed(d, x, y, text, sz, fill, bold=False):
    if LANG == 'zh':   # Noto Sans CJK SC has the Han glyphs AND the Latin ones
        d.text((x, y), text, font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-' + ('Bold' if bold else 'Regular') + '.ttc', sz, index=2), fill=fill); return     # Thai runs in Noto Sans Thai, everything else (Latin, digits) in Noto Sans — each font only has its own glyphs
    fl, ft_ = _f(LAT[bold], sz), _f(THA[bold], sz); run, cur = '', None
    def flush(x):
        nonlocal run
        if run: f = ft_ if cur else fl; d.text((x, y), run, font=f, fill=fill); x += d.textlength(run, font=f); run = ''
        return x
    for ch in text:
        t = is_thai(ch) and True or False
        if ch == ' ' : t = cur if cur is not None else False
        if cur is None: cur = t
        if t != cur: x = flush(x); cur = t
        run += ch
    flush(x)
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
mixed(d, 180, 150, kicker, 40, (255, 140, 26), True)
y = 270
for i, s in enumerate(steps, 1):
    d.text((180, y - 8), str(i), font=_f(LAT[True], 88), fill=(79, 195, 247))
    mixed(d, 300, y + 10, s, 54, (235, 238, 242)); y += 135
im.save(out); print('§PROC_CARD wrote', out, LANG, 'steps=%d' % len(steps))
