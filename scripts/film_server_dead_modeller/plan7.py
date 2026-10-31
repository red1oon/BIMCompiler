# Edit list (see assemble.py). R(cueA, offA, cueB, offB, speed): speed>1 = playback sped up (labelled on screen), everything not listed is cut.
def R(a, oa, b, ob, sp=1): return ((a, oa), (b, ob), sp)
def DRAG(g, w, tail=0.4, sel=True):   # select (glide + click, the Modeller frames the block) | the gizmo drag from just before the grab to just after the send
    r = []
    if sel: r.append(R(f'G{g}_{w}_sel_in', 0, f'G{g}_{w}_clicked', 0, 2))
    r.append(R(f'G{g}_{w}_down', -0.9, f'G{g}_{w}_out', tail, 2)); return r
def VIS(k, w, tail=1.0): return [R(f'V{k}_{w}_in', 0, f'V{k}_{w}_got', 0, 3), R(f'V{k}_{w}_got', 0, f'V{k}_{w}_got', tail)]
def FL(l):
    o = []
    for x in l: o += x if isinstance(x, list) else [x]
    return o
NOTE_MOVE = 'Move = a real drag of the Move gizmo (mouse events). Slow parts sped up (see badge); waits trimmed'
ITEMS = [
 {'id': 'open', 'type': 'card', 'png': 'card_title.png', 'sec': 7.5},
 {'id': 'poc', 'type': 'card', 'png': 'card_how.png', 'sec': 14.0},
 {'id': 'pair', 'type': 'footage', 'tag': 'TEST BENCH  -  pairing page', 'ranges': [
    R('S_pair1_in', 1.8, 'S_pair1_out', -0.4), R('S_pair2_in', 0.5, 'S_pair2_out', -1.2), R('S_pair3_in', 0.3, 'S_pair3_out', -1.2), R('S_pair4_in', 0, 'S_pair4_out', -0.7)]},
 {'id': 'create', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': "Space {SPACE} on both pages (log line TEAM_BOOT). Blocks are drawn by the Modeller's own command; waits trimmed", 'ranges': FL([
    R('S_chip_in', 0, 'S_chip_out', -0.6), R('S_create1_in', 0, 'S_create1_in', 4.0), R('S_create1b_in', 0, 'S_create1_out', -0.4), VIS(1, 'A', 1.3), R('S_create3_in', 0, 'V2_B_got', 0, 3), R('V2_B_got', 0, 'S_create3_out', 0)])},
 {'id': 'move', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': NOTE_MOVE, 'ranges': FL(
    DRAG(1, 'A') + DRAG(2, 'B') + [R('S_move1_out', -2.9, 'S_move1_out', 0), VIS(3, 'A'), VIS(4, 'B'), VIS(5, 'A'), R('S_move2_out', -2.6, 'S_move2_out', -0.2)])},
 {'id': 'clash', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': NOTE_MOVE, 'ranges': FL(
    DRAG(3, 'A') + DRAG(4, 'B') + DRAG(5, 'B', 0.4, False) + [R('S_clash1_out', -2.9, 'S_clash1_out', 0), VIS(6, 'A'), VIS(7, 'B'), VIS(8, 'A'), R('S_clash2_out', -5.6, 'S_clash2_out', -0.2)])},
 {'id': 'resolve', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': NOTE_MOVE, 'ranges': FL(
    DRAG(6, 'A') + [R('S_resolve1_out', -2.6, 'S_resolve1_out', 0), VIS(9, 'A'), VIS(10, 'B'), R('S_resolve2_out', -3.0, 'S_resolve2_out', -0.2)])},
 {'id': 'rotate', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': "Rotate = the Modeller's own command (it is not shared). Slow parts sped up (see badge)", 'ranges': FL([
    R('S_limits1_in', 0, 'S_limits1_out', 0), VIS(11, 'A'), VIS(12, 'B'), R('S_limits2_out', -3.0, 'S_limits2_out', -0.2)])},
 {'id': 'limits', 'type': 'card', 'png': 'card_limits.png', 'sec': 12.0},
 {'id': 'close', 'type': 'card', 'png': 'card_close.png', 'sec': 12.0},
]
