# AI positioning in AEC/BIM: does "No AI inside — deterministic, auditable" resonate?

(Research date 2026-10-02. ~19 tool calls; several primary pages returned 403 (RIBAJ, buildingSMART IDS survey, DesignRush), so those facts rest on search snippets and are flagged.)

## 1. How vendors/startups market AI in AEC; hype level and documented complaints

### Takeaway
Every major vendor (Autodesk, Nemetschek/Solibri, Bentley) is now positioning around AI assistants/agents, with "trusted AI", transparency cards and "human in the loop" as the reassurance layer. Documented concerns are accuracy, data security/training on customer data, cost/lock-in, and maintainability of AI-generated code.

### Cited Findings
- Autodesk markets "Trusted AI": five trust principles, ISO/IEC 42001 certification, "AI Transparency Cards" (nutrition-label style) now inside Autodesk Assistant — [Autodesk news](https://adsknews.autodesk.com/en/news/autodesk-assistant-ai-transparency-cards-2026/); [AEC Magazine](https://aecmag.com/ai/autodesk-puts-updated-ai-transparency-cards-inside-assistant)
- Autodesk says some AI features train on aggregated, de-identified customer content, plus synthetic data; it either hosts models in its own trust boundary or acts to prevent model providers training on customer data — [Autodesk Trusted AI](https://www.autodesk.com/trust/trusted-ai/ai-transparency-cards) (as summarized by search; page not fetched in full)
- Autodesk EVP Amy Bunszel: "Our models are trained on all data we have permission to train on." CEO Anagnost aims for "the probability of getting what you want isn't 70%, it's 99.99 something percent". Autodesk stresses humans "remain the final decision-makers and retain accountability." AEC Magazine lists customer worries: rising API/usage costs, vendor lock-in — [AEC Magazine, Autodesk shows its AI hand](https://aecmag.com/features/autodesk-shows-its-ai-hand/)
- Nemetschek: group-wide "AI Strategy 2026" (agent-based AI, automation, product-specific AI); Nemetschek AI Assistant rolled out across brands since 2025 — [Nemetschek digitalBAU 2026](https://www.nemetschek.com/en/digitalbau-2026)
- Solibri (model checking, the closest competitor category to a deterministic compiler) introduced a tiered platform with AI features in April 2026 and an AI assistant in beta in June 2026 — [Solibri release notes June 2026](https://www.solibri.com/articles/solibri-release-notes-june-2026); [Solibri next evolution](https://www.solibri.com/articles/introducing-the-next-evolution-of-solibri)
- Bentley announced new AI programs at Year in Infrastructure — [GeoWeek News](https://www.geoweeknews.com/articles/bentley-systems-announces-new-ai-programs-and-capabilities-at-its-year-in-infrastructure-event/) (details not fetched). No Trimble source found.
- Martyn Day (AEC Magazine, 7 Mar 2026): "Aesthetics, spatial judgement, and experiential quality do not reduce neatly to constraint satisfaction"; distinguishes deterministic parametric BIM (explicit designer-defined relationships) from agentic systems. John Egan (BIM Launcher CEO) warns of AI-written code: "Your developers won't really understand what is in there and what happens if something mission critical breaks?" Buro Happold's May Winfield: "Humans must remain in the loop." — [AEC Magazine, The agentic future of BIM](https://aecmag.com/bim/the-agentic-future-of-bim/)
- Clash-detection accuracy complaint: automated tools can flag thousands of intersections with up to ~60% false positives (claim from a secondary blog, unverified) — [search result source list incl. Green Arch World](https://greenarchworld.com/architecture-design/ai-powered-clash-detection-in-bim-a-technical-deep-dive/)

### Inferences
- Hype level is high and vendor-led; "trust" is being sold as a layer on top of probabilistic AI (certifications, cards, human-in-loop). A "no AI inside" claim is the structural opposite and therefore differentiated, not redundant.
- Autodesk's 99.99% aspiration implicitly concedes that generic AI is ~70% reliable for professional work (inference from the quote).

### Gaps
- No Trimble source found. No named complaint (lawsuit/forum thread) about training on AEC customer data found; only vendor reassurance and generic concerns. Startup marketing (AI QTO/scheduling) not researched in depth.

## 2. Do professionals and regulators care about determinism, traceability, reproducibility?

### Takeaway
Regulation and standards are strongly about traceability/audit trails and are moving toward explainability and documented review of AI output (RICS). Nothing found that demands "no AI," but the requirements AI struggles with (reproducibility, who/what/when/why) are exactly what a deterministic tool provides natively.

### Cited Findings
- UK golden thread (HRB): must be kept digitally and securely and be "a building's single source of truth", updated through design and construction, Accountable Person responsible for "accurate and accessible" — [Building Safety Regulator](https://buildingsafety.campaign.gov.uk/building-safety-regulator-making-buildings-safer/building-safety-regulator-news/understanding-the-golden-thread/)
- Golden thread record must show who changed what and when (audit trail) — [search summary of GOV.UK guidance "Keeping information about a higher-risk building: the golden thread"](https://buildingsafety.campaign.gov.uk/making-buildings-safer/building-safety-regulator-news/understanding-the-golden-thread/); [Mishcon de Reya](https://www.mishcon.com/guides/building-safety-act-the-golden-thread-of-information)
- ISO 19650 CDE: audit trail of information development and exchange, information states (WIP/Shared/Published/Archived), status and revision identification — [BibLus summary](https://biblus.accasoftware.com/en/container-information-states-iso-19650-wip-shared-published-archived/); [12d Synergy guide](https://www.12dsynergy.com/guides/iso-19650/) (secondary sources; ISO text itself not read)
- buildingSMART IDS (v1.0, June 2024) is machine-readable and "provid[es] identical results in all checking software" — [buildingSMART IDS](https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/) and [IDS survey results](https://www.buildingsmart.org/ids-survey-results-2026/) (snippet only; survey page 403). Respondents valued automated checking, human+machine readability, openness.
- RICS "Responsible use of AI in surveying practice" (published 10 Sep 2025, effective 9 Mar 2026, mandatory for members): written client notice of AI use; written assessment of whether AI is the right tool vs alternatives; written decision on output reliability; register of AI systems; dip sampling; statement of PI cover extent for AI use; courts expected to reference it — [CMS law summary](https://cms.law/en/gbr/legal-updates/rics-introduces-mandatory-ai-standard-for-surveyors-what-insurers-and-their-clients-need-to-know); [RICS](https://www.rics.org/news-insights/rics-launches-landmark-global-standard-on-responsible-use-of-ai-in-surveying)
- Insurers: renewal forms now ask how firms use AI, who reviews output, what documentation exists, whether disclosed to clients; a few carriers file AI exclusions; 80% of A&E carriers see AI as potential disruptor — [Ames & Gough claim via search result; original not fetched](https://www.insurancejournal.com/magazines/mag-features/2024/04/01/766865.htm) (the URL is an unrelated 2024 Insurance Journal piece; treat attribution as weak)

### Inferences
- A deterministic tool lowers the compliance burden under RICS-style regimes (no AI-reliability assessment/register needed for the tool itself) — but only if the claim is true of the runtime. (Inference.)
- Reproducibility ("same input, same output") maps directly to audit-trail and identical-results ideals in IDS and golden thread; this is a stronger argument than "no AI" per se.
- Public procurement requirements: no concrete source found.

### Gaps
- No public-procurement text requiring determinism. No insurer statement that deterministic tools get better terms. ISO 19650 and GOV.UK primary text not read directly.

## 3. Evidence for "no AI"/"human-made"/"privacy-first" positioning elsewhere

### Takeaway
Consumer-side evidence is real and growing but mostly about AI-generated content, not AI in tooling; hard sales data is thin and vendor-reported. Local-first is a respected philosophy but a niche market.

### Cited Findings
- Gartner survey (1,539 US consumers, Oct 2025, released 16 Mar 2026): 50% prefer brands that avoid GenAI in consumer-facing content — [Business Wire](https://www.businesswire.com/news/home/20260316095093/en/Gartner-Marketing-Survey-Finds-50-of-Consumers-Prefer-Brands-That-Avoid-Using-GenAI-in-Consumer-Facing-Content); [Customer Experience Dive](https://www.customerexperiencedive.com/news/half-consumers-prefer-brands-dont-use-generative-ai-gartner/814957/)
- WSU study (six experiments): the term "artificial intelligence" in product descriptions lowered purchase intent via lower emotional trust; stronger for high-risk products — [WSU](https://news.wsu.edu/press-release/2024/07/30/using-the-term-artificial-intelligence-in-product-descriptions-reduces-purchase-intentions/); [Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/19368623.2024.2368040). Consumer products, not B2B.
- Aerie "no AI" pledge: claimed 23% Q4 2025 sales increase — reported by [DesignRush](https://news.designrush.com/no-ai-disclaimers-brands-consumer-trust-2026) (snippet only, page 403; causation unproven, treat as marketing claim)
- No-AI labels exist (Authors Guild "Human Authored", Spotify "Verified" badges 2026, iHeart "Guaranteed Human"); no unified standard of what "AI-free" means; no sales-effect data in the source — [Wikipedia: No-AI label](https://en.wikipedia.org/wiki/No-AI_label)
- Definitional ambiguity: "AI-Free" read as no AI content vs no AI anywhere in operations — [contentmarketing.ai](https://www.contentmarketing.ai/blog/strategy/is-ai-free-a-strategic-advantage-in-2026/) (blog, low authority)
- Local-first: Ink & Switch essay (2019) lists seven ideals incl. privacy, longevity, user control, offline — [Ink & Switch](https://www.inkandswitch.com/essay/local-first/)

### Inferences
- B2B professionals reward verifiability more than purity; the "no AI" signal likely works as shorthand for "predictable, auditable, private" (inference, no AEC-specific test found).
- Whether it helped or hurt a software product commercially: no rigorous source found.

### Gaps
- No AEC-specific study of "no AI" messaging. No case of an AEC product marketed "no AI". Local-first commercial outcomes not sourced.

## 4. Risks of the claim and wording

### Takeaway
"No AI" is a testable advertising claim; regulators treat AI claims (and by extension their negation) under truthfulness/substantiation rules, and the term is ambiguous. Open-source communities already distinguish AI-assisted authorship from AI at runtime, with disclosure norms. Word the claim as a precise, verifiable architectural statement.

### Cited Findings
- FTC treats AI claims under Section 5: truthful, not misleading, substantiated before made; e.g. FTC v. Workado ("98% accurate" vs ~53% in testing) — [Troutman Pepper Locke](https://www.troutman.com/insights/false-advertising-liability-ftc-scrutiny-and-competitive-litigation-in-the-age-of-ai-marketing/); [CCI](https://www.corporatecomplianceinsights.com/substantiate-your-ai-claims-before-they-become-ai-washing-challenges/). These concern overstated AI, not "no AI"; applying the doctrine to a negative claim is inference.
- Linux kernel policy allows AI-assisted code with an "Assisted-by" tag and human accountability; Gentoo and NetBSD ban AI-written code; Debian encourages but does not require disclosure — [Tom's Hardware](https://www.tomshardware.com/software/linux/linux-distros-ban-tainted-ai-generated-code); [It's FOSS](https://itsfoss.com/news/linux-ai-coding-assistants-policy/). Shows disclosure of AI-assisted authorship is an established norm.
- EU AI Act labelling duties from 2 Aug 2026 (AI-generated content) — [Lewis Silkin](https://www.lewissilkin.com/insights/2026/07/31/the-new-ai-labelling-rules-for-deployers-in-the-advertising-supply-chain) (not read in depth)
- AI-written-code maintainability concern from industry CEO — [AEC Magazine](https://aecmag.com/bim/the-agentic-future-of-bim/)

### Inferences (wording)
- Risky: bare "No AI" or "AI-free" (a critic can point to AI-assisted code in the repo; ambiguity above).
- Safer, already consistent with project's stance: "No AI in the runtime. Same input, same output — verify it in the open-source repo. AI assisted in writing the code; every output is computed by deterministic maths." Pair with substantiation: reproducibility test/hash evidence, a repo statement of where AI was used, and the "best-effort, margin of error" caveat (an accuracy claim needs a stated, measured tolerance).
- "Deterministic" must be true literally (no unseeded randomness, no model calls, pinned dependencies); a single counterexample would damage the claim more than not making it. "Mercedes Benz finishing" is a trademark-adjacent comparison: legal review suggested (inference, no source).

### Gaps
- No documented case of a "no AI" claim being challenged by a regulator. No source on trademark use of "Mercedes Benz".

## 5. Survey data on AEC professionals' trust in AI

### Takeaway
Adoption is rising (40%+ of UK construction professionals use AI at work per NBS), but reliability/accuracy and data security are the top stated concerns in surveys of contractors and AEC firms. No survey found that directly measures preference for deterministic tools.

### Cited Findings
- NBS Digital Construction Report 2025 (559 respondents): 40%+ use AI daily (under 10% five years ago); 49% of architecture professionals; uses = technical info search, text drafting, data analysis; 60% anxious about falling behind — [NBS press release](https://www.thenbs.com/about-nbs/press-releases/ai-adoption-surges-as-digital-anxiety-grips-the-construction-sector); [RIBAJ via search snippet](https://www.ribaj.com/intelligence/artificial-intelligence-ai-technology-uptake-digital-construction-report-2025/). The fetched press release gave no trust/accuracy stats.
- Bluebeam (1,000+ decision-makers, US/UK/FR/DE/AU, July 2025): 27% of AEC firms use AI; top concerns data-sharing security 42%, cost/complexity 33%; 69% say AI-regulation concern affects efforts; 94% of users plan to expand — [Bluebeam press](https://press.bluebeam.com/2025/10/new-bluebeam-report-shows-early-ai-adopters-in-aec-seeing-significant-roi-despite-uneven-adoption/); [ASCE](https://www.asce.org/publications-and-news/civil-engineering-source/article/2025/12/18/architecture-engineering-construction-sector-slow-to-adapt-ai-survey-shows)
- Dodge Construction Network/CMiC (235 US contractors, Sep–Oct 2025): 57% cite lack of reliability/accuracy of AI output as chief concern; 54% data security and privacy — [Construction Dive](https://www.constructiondive.com/news/builders-ai-transform-businesses-survey/807555/). Vendor-sponsored, small, US contractors.
- McKinsey AI trust survey (Dec 2025–Jan 2026, ~500 organizations, cross-industry): inaccuracy and cybersecurity most-cited AI risks — [McKinsey](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era) (snippet only)

### Inferences
- The two top concerns (accuracy 57%, security 54%) are exactly what "deterministic + local/no model calls" answers; but the same surveys show strong adoption intent, so "no AI" must not read as "anti-productivity".

### Gaps
- No RICS/NBS stat on trust specifically; no Deloitte AEC survey found; no survey on determinism preference.

## Overall read (inference)
Resonance is likely strongest with BIM managers/coordinators, checkers and compliance-minded roles (reproducible checking, audit trail, IDS parity), and weaker as a blanket consumer-style "no AI" badge. Lead with "deterministic, reproducible, auditable, open-source verifiable"; use "no AI in the runtime" as the proof point, with an explicit AI-assisted-development disclosure.
