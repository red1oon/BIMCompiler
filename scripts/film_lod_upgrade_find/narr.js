// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md). English only. The beats, their narration (F asks, M answers, one short turn each: the picture does the explaining)
// and the facts each beat speaks. Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json (path, value, the word in the text) and that nothing on the not-said list is spoken.
// READ out/guard.log. `typed` = the beat types a line (a script command in the top strip, or a Find term) with real key sounds; the voice starts after the return key.
'use strict';
exports.lang = 'en';
exports.beats = [
  { id: 'cover', hold: 3.6 },
  { id: 'mod_conn', typed: true, text: 'F: This is the Modeller. Where is the upgrade button? | M: There is none. The upgrade is a rule script. This one detailed fifty steel joints. | F: Checked? | M: Zero clause failures.',
    says: [['conn.joints', '50', 'fifty'], ['conn.failures', '0', 'zero']] },
  { id: 'mod_layers', typed: true, text: 'F: And the walls and floors? | M: Another script splits them into their material layers. Two hundred twenty layer parts. The Modeller draws the layers, not the whole wall.',
    says: [['counts.layer', '220', 'two hundred twenty']] },
  { id: 'mod_rebar', typed: true, text: 'F: The beams? | M: Reinforcement from the structural schedule. Three hundred six bar sets on ninety-two beams. | F: All matching the schedule? | M: No. Seven bar sets on two beams differ. The check says fail, and it stays in the log.',
    says: [['rebar.sets', '306', 'three hundred six'], ['rebar.beams', '92', 'ninety-two'], ['rebar.mismatches', '7', 'seven'], ['rebar.beams_affected', '2', 'two beams']] },
  { id: 'mod_gusset', typed: true, text: 'F: And the diagonal braces? | M: Gussets. Fifty-seven brace ends were judged. One gusset was built.',
    says: [['gusset.total', '57', 'fifty-seven'], ['gusset.generated', '1', 'one gusset']] },
  { id: 'added', text: 'M: Six hundred seventy-nine parts were added in all. The steel joints are configuration only. Capacity is not checked.',
    says: [['counts.added', '679', 'six hundred seventy-nine']] },
  { id: 'viewer', text: 'F: Now the Viewer. How do I find the added work? | M: The parts view hides one hundred eighty-one hosts, so their parts show. Then, Find.',
    says: [['viewer.hostsHidden', '181', 'one hundred eighty-one']] },
  { id: 'find_layer', typed: true, text: 'F: Layer. | M: The panel lists fifty. The model has two hundred twenty. Click the top row, a ceiling layer, and the Viewer flies to it.',
    says: [['viewer.find_layer.panel', '50', 'fifty'], ['find.layer.total', '220', 'two hundred twenty']] },
  { id: 'find_fin', typed: true, text: 'F: Fin plate. | M: Fifty, one for each joint. But look. The Find lands two point eight metres from the plate. The stored centre is the beam\'s, not the plate\'s. A data fault, reported. Configuration only. Capacity not checked.',
    says: [['find.Fin plate.total', '50', 'fifty'], ['viewer.find_fin.miss_round1', '2.8', 'two point eight'], ['centre.conn_center_equals_host_center', '150', 'the beam']] },
  { id: 'find_rebar', typed: true, text: 'F: Reinforcing. | M: Three hundred six bar sets. This is the bottom bars of one beam.',
    says: [['find.reinforcing.total', '306', 'three hundred six']] },
  { id: 'find_gusset', typed: true, text: 'F: Gusset. | M: Two parts, the plate and the bolts of the one joint that was built.',
    says: [['find.gusset.total', '2', 'two parts']] },
  { id: 'gus_card', text: 'F: Why only one of fifty-seven? | M: Twenty-two would clash with a neighbour. Thirteen have nothing to attach to. Seventeen have no room for the bolts. Four have too large a gap.',
    says: [['gusset.refused.REFUSED_CLASH', '22', 'twenty-two'], ['gusset.refused.NO_ATTACHMENT', '13', 'thirteen'], ['gusset.refused.NO_ROOM', '17', 'seventeen'], ['gusset.refused.GAP_TOO_LARGE', '4', 'four have']] },
  { id: 'close', text: 'M: Every number here was read from a log or from the model database. | F: And the guide? | M: No guide section covers this yet. That is a gap to close before posting.',
    says: [['guide.covers_the_added_work_word', 'no', 'no guide section']] }
];
