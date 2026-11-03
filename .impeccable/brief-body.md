## Scope

Primary target: `ui.css` (whole-console visual world) with `index.html`, `app.js`, `ui.js`, `motion.js`. Visitor mode: Operate. Covers all 11 shell routes plus `#/login`, `#/register`, `#/forgot-password`.

## Audience and job

Vietnamese PerralVPN subscribers, often on 3G/4G with high RTT, opening the console to answer one live question: how much quota is left, which node is actually reachable, is my plan about to run out, and what do I do about it now.

## Direction contract

THESIS: The console reads as a public storm-and-flood warning board, not a SaaS dashboard — every number sits against a published threshold with a severity tier, because "how close am I to the danger line" is the real question and a KPI card row never answers it. It refuses the category-default arrangement of sidebar plus four big-number cards plus one line chart.

OWN-WORLD: Deep observation-blue ground (`--obs`) and a printed-paper light ground, both carrying a hairline rule system rather than card shadows. A five-step severity ramp runs from the committed brand signal `#C9F24D` up through amber to a burnt red, and the ramp is the only decorative colour allowed. Modules tile densely in named CSS grid areas, edge to edge, with more information per screen than a default SaaS grid. Type is a workhorse UI gothic at small sizes with tabular figures; a mono role is reserved for measured values (latency, quota, serial codes). Station-plot notation replaces generic status chips.

STORY: The visitor understands at a glance which corridor is congested and how urgent their quota is, believes it because the numbers are ruled and dated like a bulletin, and acts — change node, top up, or open the support channel — without hunting for the control.

FIRST VIEWPORT: `#/dashboard` opens on an observation header: the account's current severity tier as a full-bleed tier band across the top of the content column, then a dense ruled bulletin strip (quota used / remaining / days left, each against its threshold tick), then the station board of nodes with live reporting state, then the traffic isobar field. Primary action sits inline on the tier band, not centred below it.

FORM: Assigned direction `7cd7d9c2` index 6 (meteorological hazard bulletin) fused with the winning challenger `japanese-high-density-web`, raised by `variable-font-specimen` (one live-bound control remaps the whole panel, no submit), `vernacular-ephemera-cassette-j-card` (hard binary halves that flip on Y and cannot overflow their stated capacity), `notation-diagram-systems-orienteering-map` (a fixed ranked symbol legend whose meaning never changes), `wayfinding-cartography-signage-midnight-transit-diagram` (connection lines at 45 and 90 degrees only), and `pop-culture-shelf-streaming-title-card-wall` (neighbour-relative focus: the engaged row lifts, sibling ink dims).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints carried

No bundler, no CDN, CSP `script-src 'self'`. Every JS-emitted class hook from the contract inventory must survive. Motion is in-repo CSS/SVG only — no Rive runtime. Weak-network budget is a first-class requirement: no motion or asset may delay first paint.

## Unresolved

Whether a service worker / offline shell is wanted later. Whether self-hosted fonts replace the Google Fonts link (CSP change required for `img-src`/`font-src` if assets move hosts).
