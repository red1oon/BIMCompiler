#!/usr/bin/env python3
# Writes prompts/film_narration_server_dead_desktop_v1.tsv from the build's timeline.json: row cue/end = FILM time of the segment (card or clip) the row
# narrates, taken from the recorder's §FILM_CUE log through film_server_dead_desktop_build.py (never typed). Columns as film_narration_server_dead_dialogue_v1.tsv:
# id <tab> cue_s <tab> end_s <tab> §source <tab> SHORT <tab> DETAIL ; turns "F: ... | M: ...".
# usage: film_server_dead_desktop_tsv.py <work_dir/timeline.json> <out.tsv>
import sys, json
tl = json.load(open(sys.argv[1])); S = {s['id']: s for s in tl['segments']}; CF = tl['cue_film']
# (id, first_seg, last_seg, start_pad, end_pad, source, SHORT, DETAIL)
R = [
 ('open', 'title', 'title', 0.3, 0.0, 'title card', 'F: The server is dead? | M: On purpose. Stay with me.',
  'F: The server is dead? | M: On purpose. This is the desktop version.'),
 ('problem', 'problem', 'problem', 0.3, 0.0, 'problem card', 'F: Why does an ERP need a server? | M: Usually it does. Here, none.',
  'F: Why does an ERP even need a server? | M: Normally every user talks to one database server. When it stops, everyone stops. Here, there is none.'),
 ('bench', 'bench', 'bench', 0.3, 0.0, 'bench card', 'F: Real screens, or a mock-up? | M: Real ERP. The post box is a folder.',
  'F: Is this a real screen, or a mock-up? | M: The ERP window is real, and so are the clicks. The post box is a folder, standing in for GitHub. A script does the clicking, and waiting time is cut.'),
 ('teamon', 'on', 'on', 0.3, 0.3, '§FILM_CUE panel_open/A mode_click/A', 'M: A opens the Team pill. | F: Why is that line red? | M: No trial key. The folder needs none.',
  'M: User A opens the Team pill. | F: Why is that line red? | M: The trial key is not installed. The folder does not need one. Team mode goes on.'),
 ('found', 'found', 'found', 0.3, 0.3, '§FILM_CUE chip_unpaired/A panel_unpaired/A founded/A', 'M: A presses Start a team. | F: And the link? | M: Blurred, on purpose.',
  'M: The chip says: not paired. So A presses Start a team. | F: Where is the invite link? | M: Right there, blurred on purpose. A sends it to the other user. | F: Is the link a password? | M: No. It is only the team\'s address. Nobody gets in without A\'s approval.'),
 ('join', 'join', 'join', 0.3, 0.3, '§FILM_CUE invite_opened/B invite_prefilled/B joined_code/B', 'M: B opens the link and presses Join. | F: Then what? | M: B gets a code.',
  'M: User B is a private window, so a different user. It opens the link. | F: What does B do? | M: Presses Join, and gets a short code to read out loud.'),
 ('approve', 'approve', 'approve', 0.3, 0.3, '§FILM_CUE requests_listed/A role_picked/A approved/A b_paired/B', 'F: Can anyone join? | M: No. A approves the code. | F: And B? | M: Visits, and is paired.',
  'F: Can anyone just join? | M: No. A checks the join requests, and sees exactly B\'s code. A picks a role, and approves. | F: And B? | M: B visits the post box. Now both windows say: team devices, two. | F: And the role? | M: It decides what B may write. Every device checks it with the ERP\'s own role rules.'),
 ('order', 'enter', 'visit1', 0.3, 0.3, '§FILM_CUE order_new/A line_saved/A visitA1/A visitB1/B b_grid_has_order/B', 'M: A enters an order. | F: Does B see it? | M: After the visits, yes.',
  'M: A enters a Sales Order and one line. Sped up four times. | F: Does B see it already? | M: Not until the visits. A visits, B visits... and there is the order, on B. | F: A visit? | M: A trip to the post box. Drop off your letters, pick up the others.'),
 ('complete', 'complete', 'complete', 0.3, 0.3, '§FILM_CUE complete_click/A a_completed/A visitA2/A visitB2/B', 'M: A presses Complete. | F: Does B know? | M: After it visits.',
  'F: Now what? | M: A presses Complete, in the normal document action bar. B still shows Drafted. | F: Until it visits? | M: Until it visits. Then B shows Completed too. | F: Same status, same numbers? | M: Same status, and the same tax and line flags. The whole Complete travels as one group.'),
 ('tax', 'tax', 'tax', 0.3, 0.3, '§FILM_CUE b_tax_tab/B', 'M: The tax row came across too.',
  'M: The consequences travelled with it. Here, the order tax row, on B.'),
 ('clash', 'clash', 'clash', 0.3, 0.3, '§FILM_CUE a_completes_2/A b_completes_2/B visit_B_x2/B', 'F: Both press Complete? | M: Let us try. Both screens warn.',
  'F: Could both press Complete on the same order? | M: Let us do exactly that. A completes. B completes, before either has visited. Then they visit. Both screens warn: current record was changed by another user, please ReQuery. | F: That message looks familiar. | M: It is iDempiere\'s own wording, for the same situation.'),
 ('clash2', 'clash2', 'clash2', 0.3, 0.3, '§FILM_CUE conflict_shown/A conflict_shown/B', 'F: Who wins? | M: Nobody. Still Drafted.',
  'F: So who wins? | M: Nobody. The status stays Drafted, and none of the Complete\'s consequences show. All or none. Nothing is silently lost.'),
 ('limits', 'limits', 'limits', 0.3, 0.2, 'limits card · TEAMWORK_FRAMEWORK §13.7 named limits', 'F: What is missing? | M: Plenty. It is a proof of concept.',
  'F: So what is still missing? | M: Plenty. Stock reservation, document numbers and demo data are not shared yet. There is no clash chooser. The default setup is a one cycle trial, and its key is not installed.'),
 ('close', 'close', 'close', 0.3, 0.2, 'close card · witness PASS lines', 'F: So the server is dead? | M: Here, yes. Thanks for watching!',
  'F: So... the server really is dead? | M: Here, yes. Every line on this card is a test that passed, and this film is one space on both windows. A proof of concept. Thanks for watching!'),
]
out = []
for i, a, b, sp, ep, src, sh, de in R:
    st = S[a]['fs'] + sp; en = S[b]['fe'] - ep
    out.append('\t'.join([i, '%.1f' % st, '%.1f' % en, src, sh, de]))
open(sys.argv[2], 'w').write('\n'.join(out) + '\n')
print('§FILM_TSV rows=%d -> %s' % (len(out), sys.argv[2]))
