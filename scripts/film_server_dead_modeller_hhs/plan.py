# Edit list (see assemble.py). R(cueA, offA, cueB, offB, speed): speed>1 = playback sped up (labelled on screen), everything not listed is cut.
def R(a, oa, b, ob, sp=1): return ((a, oa), (b, ob), sp)
def DRAG(g, w, tail=1.6, sel=True, sp=3):   # select + move the camera onto the block (x2) | the gizmo drag from just before the grab to just after the send + the return to the overview
    r = []
    if sel: r.append(R(f'G{g}_{w}_sel_in', 0, f'G{g}_{w}_sel_done', 0, 4))
    r.append(R(f'G{g}_{w}_down', -0.9, f'G{g}_{w}_out', tail, sp)); return r
def VIS(k, w, tail=1.0): return [R(f'V{k}_{w}_in', 0, f'V{k}_{w}_got', 0, 6), R(f'V{k}_{w}_got', 0, f'V{k}_{w}_got', tail)]
def FL(l):
    o = []
    for x in l: o += x if isinstance(x, list) else [x]
    return o
NOTE_AIDS = "Film aids: floors above Level 1 hidden, wing names and rings are drawn over the page. Blocks = the Modeller's own command"
NOTE_MOVE = 'Move = a real drag of the Move gizmo (mouse events). Slow parts sped up (see badge); waits trimmed'
ITEMS = [
 {'id': 'recap', 'type': 'card', 'png': 'card_recap.png', 'sec': 8.0},
 {'id': 'open', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': "Both windows open the same building: HHS Office (log line ARC-SEED, 1077 elements). Space {SPACE}. Pairing as in part two", 'ranges': FL([
    R('OPEN_A_in', 0, 'OPEN_A_out', 0, 4), R('OPEN_B_in', 0, 'OPEN_B_out', 0, 4), R('S_wings_in', 0, 'S_wings_out', -0.2)])},
 {'id': 'draw', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': NOTE_AIDS, 'ranges': FL([
    R('S_drawA_in', 0, 'S_drawA_out', -3.0, 4), R('S_drawA_out', -3.0, 'S_drawA_out', -0.2), R('S_drawB_in', 0, 'S_drawB_out', -3.4, 4), R('S_drawB_out', -3.4, 'S_drawB_out', -0.2)])},
 {'id': 'visit1', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': 'Slow parts sped up (see badge); waits trimmed', 'ranges': FL([
    VIS(1, 'A'), VIS(2, 'B'), VIS(3, 'A', 1.0), R('S_visit1_out', -2.8, 'S_visit1_out', -0.2)])},
 {'id': 'move', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': NOTE_MOVE, 'ranges': FL(
    DRAG(1, 'A') + DRAG(2, 'B') + DRAG(3, 'B') + [R('S_move1_out', -2.8, 'S_move1_out', 0), VIS(4, 'A'), VIS(5, 'B'), VIS(6, 'A'), R('S_move2_out', -3.0, 'S_move2_out', -0.2)])},
 {'id': 'head', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': 'Selection = the Modeller\'s own select call. Slow parts sped up (see badge)', 'ranges': FL([
    R('S_head1_in', 0, 'S_head1_out', -0.2), VIS(7, 'A'), VIS(8, 'B'), R('S_head2_out', -3.4, 'S_head2_out', -0.2), R('S_head3_in', 0, 'V9_A_in', 0), VIS(9, 'A'), VIS(10, 'B'), R('S_head3_out', -2.4, 'S_head3_out', -0.2)])},
 {'id': 'people', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': 'People list of window B (button at the bottom right)', 'ranges': FL([
    R('S_people_out', -10.5, 'S_people_out', -0.2)])},
 {'id': 'off', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': 'A ticks "Do not show what I am on" (People list, bottom right). Slow parts sped up (see badge)', 'ranges': FL([
    R('S_off_in', 0, 'S_off_mid', 0, 6), VIS(11, 'A'), VIS(12, 'B'), R('S_off_out', -9.5, 'S_off_out', -0.2)])},
 {'id': 'wall', 'type': 'footage', 'tag': 'LIVE  -  the real Modeller', 'note': 'Move = a real gizmo drag. Last shot: all but the wall hidden for the view; dashed line = where it started', 'ranges': FL(
    DRAG(4, 'A') + [R('S_wall_out', -2.6, 'S_wall_out', 0), VIS(13, 'A'), VIS(14, 'B'), R('S_wall2_out', -3.2, 'S_wall2_out', -0.2), R('S_wall3_out', -7.5, 'S_wall3_out', -0.2)])},
 {'id': 'limits', 'type': 'card', 'png': 'card_limits.png', 'sec': 16.0},
 {'id': 'close', 'type': 'card', 'png': 'card_close.png', 'sec': 12.0},
]
