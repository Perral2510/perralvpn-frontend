---
name: PerralVPN
description: Subscriber console for a Vietnamese VPN service, rendered as a night-watch hazard bulletin.
colors:
  ground: "#0B1418"
  ground-2: "#0E181D"
  panel: "#101C21"
  panel-2: "#16262C"
  panel-3: "#1D3238"
  rule: "#24383F"
  rule-strong: "#37555E"
  ink: "#E8F1F0"
  ink-2: "#AEC4C6"
  ink-3: "#93ACAF"
  ink-4: "#849DA0"
  signal: "#C9F24D"
  signal-deep: "#9FC72F"
  on-signal: "#0B1418"
  steel: "#5FA8C4"
  severity-1: "#C9F24D"
  severity-2: "#E5DE4F"
  severity-3: "#F2A73B"
  severity-4: "#E0623A"
  severity-5: "#B03A26"
  status-live: "#4FD08A"
  status-warn: "#F2A73B"
  status-bad: "#E0623A"
  status-dead: "#7A8F92"
typography:
  display:
    fontFamily: "Oswald, Be Vietnam Pro, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Oswald, Be Vietnam Pro, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 1vw, 1.6rem)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Oswald, Be Vietnam Pro, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.14
  body:
    fontFamily: "Be Vietnam Pro, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.004em"
  label:
    fontFamily: "Oswald, Be Vietnam Pro, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.12em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "max(11px, 0.8125em)"
    fontWeight: 400
    letterSpacing: "-0.02em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.signal-deep}"
    textColor: "{colors.on-signal}"
  button-default:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "38px"
  button-default-hover:
    backgroundColor: "{colors.panel-2}"
  button-accent:
    backgroundColor: "transparent"
    textColor: "{colors.signal}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "38px"
  button-danger:
    backgroundColor: "{colors.status-bad}"
    textColor: "#FCEDE8"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "38px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  badge:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
  nav-item-active:
    backgroundColor: "{colors.panel-3}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "6px 9px"
    height: "36px"
---

# Design System: PerralVPN

## Overview

**Creative North Star: "The Night-Watch Bulletin"**

The console reads as a public storm-and-flood warning board, not a SaaS dashboard. A subscriber opens it at 23:40 on a 3G connection to answer one question — how close am I to the danger line — and the interface answers it the way a hazard bulletin does: a full-bleed severity band, then measured values laid out against published thresholds on hairline rules, then the station board of nodes with their live reporting state. Nothing is centred for effect. Every block is justified by a number that has to be on screen.

Dark is a night-watch board: observation-blue ground, cool ink, one acid-lime signal rationed across the whole screen. Light is the same document printed on cool paper — the identical rule system, the identical hierarchy, remapped rather than reimagined. Both carry a faint ledger ruling on the page ground, so structure comes from hairlines and registers instead of shadows. Modules tile densely, edge to edge, in named grid areas: more information per viewport than a default SaaS grid, and less air than a marketing page.

Motion is the rive.app feel with none of the rive.app payload — hand-authored CSS transitions, SVG `pathLength`, and three small rAF loops. It is tied to measured values (a quota bar animating to its real percentage, a figure counting up to its real number), never to decoration, and it stops for both the vestibular preference and the metered connection.

**Key Characteristics:**
- Hairline rules carry structure; shadows appear only for floating layers.
- One brand signal colour, rationed to under 10% of any viewport.
- A five-step severity ramp is the only decorative colour system.
- Vietnamese leads, English equals; both are set in the same workhorse gothic.
- Every measured value is monospaced and tabular, so columns of numbers align.
- Nothing delays first paint: the shell sheet is render-blocking, module sheet is deferred and gated.

## Colors

The palette is a deep observation ground with a cool ink ramp and one acid signal; severity is a printed five-tier scale from caution-lime to hazard-red. Values below are the night-watch (`:root`) defaults. `:root[data-theme="light"]` remaps the same token names to the printed-paper set — the token names are the contract, the hexes are theme-bound.

### Primary
- **Watch Lime** (`--signal` `#C9F24D` / light `#7BAF12`): the single brand signal. Active nav icon, primary button fill, tier-1 band, focus ring, selection, quota bar at low usage. Rationed.
- **Deep Lime** (`--signal-deep` `#9FC72F` / light `#5F8A06`): hover and pressed state of the signal, and the inset rule on a recommended plan card.
- **Bulletin Ink on Signal** (`--signal-ink` `#C9F24D` / light `#4C7004`): signal-hued *text* on a panel. The light theme must darken the lime to clear 4.5:1, so text never uses `--signal` directly.

### Severity (the only decorative scale)
- **Tier 1 — Clear** (`--t1` `#C9F24D`): quota comfortable, service nominal.
- **Tier 2 — Advisory** (`--t2` `#E5DE4F`): approaching the threshold.
- **Tier 3 — Watch** (`--t3` `#F2A73B`): needs a decision this cycle.
- **Tier 4 — Warning** (`--t4` `#E0623A`): near exhaustion; the band flag beacon animates.
- **Tier 5 — Hazard** (`--t5` `#B03A26` / light `#702215`): exceeded. Ink flips to the light set.
- In light theme the whole ramp darkens (`#4F7A08`, `#7F6D05`, `#8F5410`, `#8E3318`, `#702215`) so near-white ink stays readable on a printed band. Tier 2 is the binding step: at `#8A7706` it measured 4.33:1 against `--t1-ink` and failed AA at 11–13px, so it is held at `#7F6D05` (4.99:1). Never lighten it back for hue's sake.
- Band text carries no opacity fade. Dimming the 13px description cost more contrast than it bought hierarchy.

### Neutral
- **Ground / Ground 2** (`#0B1418`, `#0E181D` / light `#EDF1EE`, `#E5EAE6`): page and sidebar.
- **Panel / Panel 2 / Panel 3** (`#101C21`, `#16262C`, `#1D3238` / light `#FBFCFB`, `#EAEFEB`, `#DCE3DE`): module, raised row, active nav and progress track.
- **Rule / Rule Strong** (`#24383F`, `#37555E` / light `#C4D0CA`, `#9BADA5`): the hairline system. `--edge` and `--edge-strong` are the only borders in the product.
- **Ink 1–4** (`#E8F1F0`, `#AEC4C6`, `#93ACAF`, `#849DA0` / light `#0D1A1E`, `#3A4F54`, `#41565B`, `#4E6468`): every step clears 4.5:1 against the lightest dark surface, including the smallest micro-label.
- **Instrument Steel** (`--steel` `#5FA8C4` / light `#2E6F8C`): neutral data accent — info badges, guide hints, telemetry not tied to status.
- **Status set** (`--live` `#4FD08A`, `--warn` `#F2A73B`, `--bad` `#E0623A`, `--dead` `#7A8F92`): node and order state only, never decoration.

### Named Rules
**The One Signal Rule.** `--signal` is the only brand colour and appears on under 10% of any viewport. If a screen needs more than one lime element, the others are wrong.

**The Signal Never Speaks as Text Rule.** Text in a signal hue uses `--signal-ink`, never `--signal`. In light theme the two are 100° apart in lightness, because the brand lime on paper reads at 1.9:1.

## Typography

**Display Font:** Oswald (with Be Vietnam Pro → Segoe UI → system-ui)
**Body Font:** Be Vietnam Pro (with Segoe UI → system-ui → -apple-system)
**Label/Mono Font:** JetBrains Mono (with ui-monospace → SFMono-Regular → Consolas)

**Character:** A condensed workhorse gothic for anything you read at a glance, a humanist Vietnamese-complete UI sans for anything you read at length, and a mono reserved exclusively for measurements. The three roles never trade places — a headline in the body font looks like a label, and a number in the display font looks like a guess.

### Hierarchy
- **Display** (600, `clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem)`, 1.14, −0.012em): page `h1` only, in a ruled masthead.
- **Headline** (600, `clamp(1.25rem, 1.05rem + 1vw, 1.6rem)`, 1.14): section `h2`, auth card titles.
- **Title** (600, `1.0625rem`, 1.14): card and modal headings.
- **Body** (400, `14px` — `13px` under 600px, 1.55, −0.004em): prose, table cells, descriptions. Max reading measure 68ch.
- **Label** (500, `11px`, +0.12em, uppercase): eyebrow-free microcopy — card titles, field labels, table heads, nav group titles. `.12–.2em` tracking, never wider.
- **Mono** (400, `max(11px, .8125em)`, −0.02em, tabular): latency, quota, serials, codes, dates. Any figure a user might compare against another figure.

### Named Rules
**The Eleven-Pixel Floor.** No functional text anywhere is set below 11px, in either theme, at any breakpoint. Decorative letterspacing is capped at `.22em` and comes down before the size does.

**The Measured Is Monospaced Rule.** Values that change, compare, or align use `JetBrains Mono` with `font-variant-numeric: tabular-nums`. Labels use the display gothic. Prose uses the body sans.

## Layout

The shell is a fixed `248px` sticky sidebar plus a flexible `main-content`; collapsing to `64px` (`--sidebar-w-collapsed`) is a user-initiated toggle, animated once over `--dur-3`. The topbar is `56px` (`52px` under 860px), sticky, and blurs the ground behind it. Content columns cap at `--content-max: 1360px`, centred, padded `24px 20px 40px` and reducing to `12px 12px 32px` at 600px.

Density comes from **1px-gap grids**: `.tier-grid`, `.quick-grid` and `.plan-filter` set `gap:1px` over a `--rule` background and `overflow:hidden`, so adjacent modules share a hairline instead of carrying two borders. This is the mosaic — modules read as one printed sheet with registers, not as floating cards. Named grid areas (`--edge`-ruled rows in `.bulletin-strip`, `.station-row`, `.traffic-stats`) divide columns with `border-left`, collapsing to `border-top` on narrow viewports.

The full-bleed exception is `.tier-band`: it bleeds with `margin-inline: calc(var(--space-5) * -1)` and its negative margin shrinks in step with the container padding at every breakpoint, so the bleed never creates horizontal overflow.

**Breakpoints** (all `max-width`): `1240`, `1080`, `960`, `860`, `600`, `420`. At `860` the sidebar becomes a fixed drawer with a scrim; at `960` the auth promo half hides; at `600` the base body drops to 13px and strips become columns; at `420` tiles go single-column and the station board sheds its load column.

**Spacing rhythm:** `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40` (`--space-1` → `--space-10`). Card padding is `20px`, grid gap `16px`, section gap `20px`, page gap `20px`. Vertical rhythm is multiples of 4 with no arbitrary values.

## Elevation & Depth

Depth is **linear, not cast**. Almost every module in the system is flush: a `1px` hairline, a background step (`--ground` → `--panel` → `--panel-2` → `--panel-3`), and the page ledger ruling underneath. Shadows exist only for things that genuinely leave the page — floating layers the user acts on while the surface below stays visible.

### Shadow Vocabulary
- **`--shadow-pop`** (`0 12px 28px -18px rgba(0,0,0,.75)` / light `.35`): the FAB at rest-to-hover, a lifted tile. Small travel distance.
- **`--shadow-float`** (`0 26px 54px -26px rgba(0,0,0,.85)` / light `.42`): dropdown menu, toast, modal. Reserved for layers with a scrim or a dismiss affordance.
- **Tonal step** (no shadow): every card, strip, table and band. Depth from `background: var(--panel-2)` and `border: var(--edge)`.

### Named Rules
**The Hairline-By-Default Rule.** A module gets depth from a rule and a background step, never from a box-shadow. Two shadows exist in the whole system and both mean "this floats and you can dismiss it."

**The Colored-Edge Ban.** A card or callout is never marked with a thick `border-left`/`border-right` in a status colour. Status is carried by a glyph, a mono label, and at most a `1px` hairline in the status hue.

## Shapes

Near-square, print-finished corners: `2 / 3 / 4 / 6px` (`--radius-xs → --radius-lg`) plus `--radius-pill` for avatars, dots and progress tracks. Cards and strips take `4px`; buttons, inputs and nav items take `3px`; badges, ticks and chips take `2px`. The `1px` hairline (`--edge`) is the dominant graphic primitive; `--edge-strong` marks a boundary that means something (masthead rule, dialog frame, focus-adjacent border). Registration marks — the `7px` lime square before the breadcrumb, the `5px` square before an error message — do the work that icons of bullets would do elsewhere. No clipping, no masks except the scrollbar thumb and the loader ring, no rotated elements.

## Components

### Buttons
- **Shape:** barely-rounded (`--radius-sm`, 3px); never pill.
- **Primary** (`.btn-primary`): `--signal` fill, `--on-signal` ink, uppercase Oswald 13px/500 at `.04em`, `8px 16px`, `min-height:38px`, hairline in the same hue. Hover → `--signal-deep`; active → `translateY(1px)`.
- **Default** (`.btn`): `--panel` fill, `--edge-strong`, `--ink`. Hover → `--panel-2` with `--ink-4` border.
- **Accent** (`.btn-accent`): transparent, `--signal` border, `--signal-ink` text; hover fills `--signal-wash`.
- **Secondary / Outline / Danger / Danger-outline:** `--panel-2` / transparent+`--rule-strong` / `--bad` solid / `--bad` hairline. `.btn-sm` is `30px` tall at 11.5px.
- **Hover / Focus:** colour and border move on `--dur-1 linear`; only transform uses `--ease-out`. Global `:focus-visible` gives a `2px` `--signal` outline at `2px` offset.
- **Loading** (`.btn.is-loading`): label hides, width is preserved, and a masked conic ring spins in `--on-signal` (or `--spin-c`). A button never reflows while working.

### Badges & Chips
- **Style:** mono 11px at `.04em`, `2px 8px`, `--radius-xs`, `1px` hairline, `--panel-2` ground, `--ink-2` ink.
- **State:** `-success | -warning | -danger | -info` mix the status hue 16% into the panel and 40% into the border, then set the text to the status hue; `-signal` inverts to solid lime with `--on-signal`.
- **Status dot:** `7px` circle, `--dead` default, `--live` / `--bad` / `--warn` by state. An error dot beacon-animates. Never colour alone — the row always carries a text state too.

### Cards / Ruled Modules
- **Corner Style:** 4px.
- **Background:** `--panel` on `--ground`; header strips and footers step to `--panel-2`.
- **Shadow Strategy:** none — see Elevation. Transition is `border-color` only.
- **Border:** `--edge` at 1px, `--edge-strong` for a masthead rule or a dialog frame.
- **Internal Padding:** `--space-5` (20px), dropping to `--space-4` under 420px.
- **`.card-title`:** display 12px at `.13em` uppercase, `--ink-2`, sitting above its own bottom hairline.

### Inputs / Fields
- **Style:** `--panel` fill, `--edge`, `--radius-sm`, `9px 12px`, `min-height:40px`, body 14px. Label above in display 11px uppercase at `.1em`, `--ink-3`.
- **Hover / Focus:** hover lifts the border to `--rule-strong`; focus removes the outline and paints `--signal` border + `0 0 0 3px var(--signal-wash)` glow.
- **Readonly:** dashed border, `--panel-2` ground — visibly transcribed, not editable.
- **Error:** `.field.has-error` reveals `.error-msg` (11.5px, `--bad`, led by a `5px` square) and shifts the border to `--bad` with a mixed focus glow.
- **Checkbox:** `16px`, `--radius-xs`, `--edge-strong`; checked fills `--signal` and a `clip-path` tick scales in on `--ease-spring`.

### Navigation
- **Style:** `--ink-2` ink on transparent, `--radius-sm`, `min-height:36px`, `6px 9px`, 13px/500 body sans, `18px` icon slot.
- **States:** hover `--nav-hover-bg` + `--ink`; active `--nav-active-bg` (`--panel-3` dark, `--ink` in light) with a `--signal` icon. Only the icon takes the signal colour, never the label.
- **Groups:** `.nav-group__title` display 11px at `.16em` uppercase, `--ink-4`; groups divide with a top hairline.
- **Collapsed:** labels, group titles and meta hide; items centre into the `64px` rail.
- **Mobile:** under 860px the sidebar is a fixed drawer translating `-102% → 0` on `--dur-3` with a blurred scrim.

### Tier Band (signature)
Full-bleed severity statement. `data-tier` 1–5 sets `--band-bg` / `--band-ink`; the band is framed top and bottom by a `1px` `--band-ink` rule, carries a mono flag chip (`11px`, `.22em`, `1px solid currentColor`), a display 20px uppercase level, a 13px description at full ink, and a five-tick scale where reached ticks go from `.2` to `.9` opacity. Tiers 4 and 5 beacon the flag square. Primary action sits inline on the band, inverted to `--band-ink`.

### Station Board (signature)
Node reporting as a transit departure board: `54px` mono code column, name with an uppercase region sub-line, load bar, right-aligned tabular latency, and a state chip. Rows are hairline-separated inside one panel. **Neighbour-relative focus** — hovering the board dims every non-hovered row to `.58` while the engaged row takes `--panel-2`. Below 1080px the latency column drops out; below 420px the load column does.

### Isobar Field (signature)
Traffic drawn as contour rings rather than a line chart: a `230px` canvas (`150px` under 600px, so the pointer-sliced frame still contains all three readings) with a hairline graph grid at `64px`/`46px`, `1.25px` rings stepping up to a `2.25px` high ring, and a dotted outer ellipse marking the plan allowance so every ring reads against its threshold. The field is authored in a `1140 × 230` viewBox with `squash .26` and radii `36 → 470`, so the outermost ring spans roughly three-fifths of the panel instead of sitting as a small cluster in a wide void. `vector-effect: non-scaling-stroke` keeps the rules hairline at any zoom. The layer leans at most `±7px` toward the pointer, and only on hover-capable, unmetered, non-reduced-motion devices.

### Notation Key (signature)
The board's fixed legend: the five ramp swatches with their published tier names and the thresholds `serviceSeverity()` actually enforces (`≥ 50% or ≤ 7 days`, and so on), closed by one line stating what the white tick on a meter means. It is the only place the ramp is spelled out, so the colours stay a notation rather than a mood. Rows are hairline-separated (`1px` gaps on `--rule`) inside one module; the swatch is `16 × 7px` and takes the theme's own ramp token. It sits directly under the identity card so the console's two-column mosaic closes at the same baseline as the plan module beside it.

### Promo Slide
The referral carousel's right panel is a printed `45°` hatch in `--rule-strong`, masked to fade in from the copy edge over the hairline rule field. It is ornament and nothing else: no slide draws bars, rings or sparklines for numbers it has not measured.

### Support FAB
`52px` square, `--signal` fill, `--radius-sm`, `1px` `--signal-deep` border, `--shadow-float` on hover. At rest it is icon-only; the i18n label appears as an absolutely-positioned chip outside the square on hover/focus, moving on `transform` and `opacity` so the reveal never reflows the shell.

## Do's and Don'ts

### Do:
- **Do** set all functional text at 11px or above, in both themes, at every breakpoint — including decorative letterspaced micro-labels.
- **Do** reach for `--signal-ink` for signal-hued text and `--signal` for signal-hued fills only.
- **Do** build structure from `--edge` / `--edge-strong` hairlines and background steps before considering a shadow.
- **Do** use `gap:1px` over a `--rule` background for tiled mosaics instead of doubling up borders.
- **Do** put measured values in `JetBrains Mono` with tabular figures, and every value against a threshold the user can see.
- **Do** let any motion that represents a measured value — count-up, bar fill, ring draw — no-op cleanly under `prefers-reduced-motion` and under `data-motion="low"`.
- **Do** preserve width and layout through every state change: loading buttons, hover reveals, carousel indicators all animate on `transform`, `opacity` or colour.
- **Do** keep light and dark as the same document: remap the same token names, never restructure for one theme.
- **Do** carry status with a glyph plus text; colour is never the only signal.
- **Do** put the primary action inline on the tier band, not centred beneath it.

### Don't:
- **Don't** put a kicker or eyebrow line above a heading. The bulletin's own furniture — the tier band, the ruled masthead, `page-header__meta` — carries that role.
- **Don't** thicken a left or right border into a status stripe. It is not a card, and it is not how a warning board marks severity.
- **Don't** ship the Rive runtime or any external animation dependency. Motion is in-repo CSS/SVG; `script-src 'self'` and the weak-network budget both forbid it.
- **Don't** let a transition on `width`, `margin` or `max-width` run continuously — one user-initiated toggle is fine, a scroll-linked or auto-advancing layout shift is not.
- **Don't** add a third shadow. Two exist; both mean "this floats."
- **Don't** invent uptime, benchmark, testimonial or jurisdiction claims. Numbers on screen come from the backend or `mock-data.js`.
- **Don't** drop the mono role into a label or the display gothic into a measurement.
- **Don't** paint route content before the module stylesheet is attached — the `sheet-pending` / `sheet-ready` handshake exists to stop that flash.
