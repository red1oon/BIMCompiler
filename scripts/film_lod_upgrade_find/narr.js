// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md). English only. The beats, their narration (F asks, M answers, one short turn each: the picture does the explaining)
// and the facts each beat speaks. Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json (path, value, the word in the text) and that nothing on the not-said list is spoken.
// READ out/guard.log. `typed` = the beat types a line (a script command in the top strip, or a Find term) with real key sounds; the voice starts after the return key.
'use strict';
exports.lang = 'en';
exports.beats = [
  { id: 'cover', hold: 3.6 },
  // rc3 (FILM rc3 SPEC): the Modeller's own Upgrade button, run for real. These beats are clicked, not typed: no key sound, the voice starts at the click (tsv.js / beatlen.js `click`).
  { id: 'mod_open', click: true, text: 'F: This is the Modeller, on the mosque as the author modelled it. Where is the upgrade? | M: This arrow. Six rule packs, and each says what it applies to here. | F: Four say zero. | M: Two read the drawings of a steel shed. Layers needs the layer sets of the architecture model. Beam rebar waits for its schedule.',
    says: [['pill.open.zero_rows', '4', 'four say zero']] },
  { id: 'mod_layers', click: true, text: 'F: The walls and floors? | M: So Layers runs on the architecture model. Two hundred twenty layer parts. Nine refused, each with its reason.',
    says: [['pill.layers.added', '220', 'two hundred twenty'], ['pill.layers.refused', '9', 'nine refused']] },
  { id: 'mod_joints', click: true, text: 'F: The steel? | M: Back on the combined model. Steel joints: fifty fin plate joints, zero clause failures. Configuration only. Capacity not checked.',
    says: [['pill.joints.joints', '50', 'fifty'], ['pill.joints.failures', '0', 'zero']] },
  { id: 'mod_gussets', click: true, text: 'F: And the diagonal braces? | M: Bracing gussets. Fifty-seven brace ends judged. One gusset built.',
    says: [['pill.gussets.ends', '57', 'fifty-seven'], ['pill.gussets.joints', '1', 'one gusset']] },
  { id: 'mod_beambars', click: true, text: 'F: The concrete beams? | M: Load the bar table from the drawings, then run. Three hundred six bar sets on ninety-two beams, and the page keeps moving while it works. | F: All matching the bar table? | M: No. Seven bar sets on two beams differ: those beams cannot hold the stated bars. The check says fail.',
    says: [['pill.beambars.sets', '306', 'three hundred six'], ['pill.beambars.beams', '92', 'ninety-two'], ['pill.beambars.mismatches', '7', 'seven'], ['pill.beambars.beams_affected', '2', 'two beams']] },
  { id: 'mod_ifc', click: true, text: 'F: Can I send it on? Which discipline goes in? | M: None is picked. The file takes every part the button added, shown here alone, and leaves the model out. First it refuses: four storeys have no height, and none is invented. Load the storey heights from the author\'s model, press again. | F: How many parts? | M: Four hundred fifty-nine added parts, written as four hundred seventy, because eleven bar sets of mixed sizes are split by diameter. Only the added work.',
    says: [['pill.ifc.refused_storeys', '4', 'four storeys'], ['pill.ifc.elements', '459', 'four hundred fifty-nine'], ['pill.ifc.parts', '470', 'four hundred seventy'], ['pill.ifc.split', '11', 'eleven']] },
  { id: 'added', text: 'M: Six hundred seventy-nine parts were added in all. The steel joints are configuration only. Capacity is not checked.',
    says: [['counts.added', '679', 'six hundred seventy-nine']] },
  { id: 'viewer', text: 'F: Now the Viewer. How do I find the added work? | M: The parts view hides one hundred eighty-one hosts, so their parts show. Then, Find.',
    says: [['viewer.hostsHidden', '181', 'one hundred eighty-one']] },
  { id: 'find_layer', typed: true, text: 'F: Layer. | M: The panel lists fifty. The model has two hundred twenty. Click the top row, a ceiling layer, and the Viewer flies to it.',
    says: [['viewer.find_layer.panel', '50', 'fifty'], ['find.layer.total', '220', 'two hundred twenty']] },
  { id: 'find_fin', typed: true, text: 'F: Fin plate. | M: Fifty, one for each joint. Click the top row and the Find lands on the plate, zero millimetres off. Configuration only. Capacity not checked.',   // rc2 (§AG): the stored centres were set to each part's own centre; rc1 said "two point eight metres off, a data fault"
    says: [['find.Fin plate.total', '50', 'fifty'], ['viewer.find_fin.fly_mm', '0', 'zero millimetres']] },
  { id: 'find_rebar', typed: true, text: 'F: Reinforcing. | M: Three hundred six bar sets. This is the bottom bars of one beam.',
    says: [['find.reinforcing.total', '306', 'three hundred six']] },
  { id: 'find_gusset', typed: true, text: 'F: Gusset. | M: Two parts, the plate and the bolts of the one joint that was built.',
    says: [['find.gusset.total', '2', 'two parts']] },
  { id: 'gus_card', text: 'F: Why only one of fifty-seven? | M: Twenty-two would clash with a neighbour. Thirteen have nothing to attach to. Seventeen have no room for the bolts. Four have too large a gap.',
    says: [['gusset.refused.REFUSED_CLASH', '22', 'twenty-two'], ['gusset.refused.NO_ATTACHMENT', '13', 'thirteen'], ['gusset.refused.NO_ROOM', '17', 'seventeen'], ['gusset.refused.GAP_TOO_LARGE', '4', 'four have']] },
  { id: 'close', text: 'M: Every number here was read from a log or from the model database. | F: And the guide? | M: The Modeller guide now has an Upgrade section. The link is at the bottom.',
    says: [['guide.covers_the_added_work_word', 'yes', 'upgrade section']] }
];
