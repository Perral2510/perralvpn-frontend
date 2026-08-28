# PerralVPN — design decisions

## Before / after plan

**Mode:** Redesign · Overhaul focused on the visual layer and interaction polish.

**Preserve:** Hash routes, navigation labels, form IDs and submission flow, API contracts, Vietnamese product copy, theme/language/support controls, brand name and existing assets.

**Improve:** App-shell hierarchy, auth composition, dashboard readability, pricing cards, control density, responsive behavior, focus states, loading/empty/error affordances, and motion choreography.

**Remove:** Conflicting mobile overrides, unnecessary decorative glow, weakly differentiated borders, and any dead rule that hides meaningful content.

**Protected contracts:** `#/dashboard`, `#/login`, `#/register`, `#/forgot-password`, all existing route hashes and IDs in `index.html`, static deployment, and current vanilla JavaScript architecture.

**Highest-risk change:** Rebalancing the login/auth scene and shell so the product feels more premium without disrupting the current auth logic or making the existing anime asset feel out of place.

**Rollback / fallback:** Keep all behavior in the current JS files and concentrate changes in `variables.css`, `style.css`, and small semantic additions to `index.html`; if the new visual direction feels too strong, reduce the accent gradient and motion tokens without changing layout contracts.

## Design read

```yaml
artifact: account dashboard + auth and purchase surfaces
 audience: Vietnamese VPN subscribers, resellers, and administrators
 visual-language: quiet network-operations console with editorial spacing, soft navy surfaces, and a restrained cyan signal accent
 mode: overhaul
 visual-variance: 4/10
 motion-intensity: 4/10
 information-density: 6/10
 asset-dependence: 5/10
 brand-fidelity: 8/10
```

## Positioning questions

| Surface | Narrative role | Viewing distance | Visual temperature | Capacity check |
|---|---|---|---|---|
| Auth | First-touch promise + conversion | Phone to laptop | Calm, trustworthy, quietly energetic | One clear form column with a focused brand rail |
| Dashboard | Daily control center | Laptop | Authoritative and calm | Summary first, actions second, detail below |
| Plan catalog | Compare and choose | Laptop / tablet | Clear and confident | Pricing tiers should scan in one pass |
| Tables / account | Utility and retention | Laptop | Neutral and precise | Dense data stays readable with strong row rhythm |

## Proposed design system

### Color palette

The palette keeps the recognizable deep navy + Perral blue relationship, but moves the interface toward warmer near-white surfaces and fewer competing colors.

| Role | Value | Use |
|---|---|---|
| Canvas | `#F4F7FB` | App background in light mode |
| Surface | `#FFFFFF` | Cards, form panels, topbar |
| Ink | `#0D172A` | Headings and primary text |
| Muted | `#667085` | Supporting text, metadata |
| Line | `#E4EAF2` | Borders and dividers |
| Signal blue | `#2F6FED` | Primary actions, active nav, links |
| Signal cyan | `#22C7B8` | Online state, secondary accent, soft highlights |
| Deep navy | `#0B1220` | Sidebar and auth rail |
| Status colors | Existing semantic green / amber / red | Operational meaning only |

Dark mode will retain the deep navy base, lift surfaces one step, and keep cyan reserved for connected/positive states rather than using a full neon treatment.

### Typography

Keep **Sora** for display and navigation labels and **Inter** for body copy and controls. Tighten display tracking for page titles, use a 14–16px body scale, and reserve **JetBrains Mono** for IDs, plan limits, and technical values.

### Spacing

Use the existing 4px base scale, with 8px and 16px as the dominant rhythm. Page containers use 24–32px desktop padding and 16px mobile padding. Major sections are separated by 32px; cards use 20–24px internal padding.

### Radius

Use 10px for controls and compact elements, 16px for cards and panels, and full pill radius only for status chips, segmented filters, and compact badges. Avoid mixing too many corner shapes on one screen.

### Shadow hierarchy

Use border-first surfaces with one quiet shadow level for cards and a deeper shadow only for menus, modals, and the auth form panel. Avoid decorative glow except for the support FAB and online status pulse.

### Motion

Use one shared ease curve `cubic-bezier(.22,1,.36,1)` for entrances and `cubic-bezier(.4,0,.2,1)` for state transitions. Route content enters with a 240–360ms fade + 12px rise. Cards use a 160ms lift on hover; buttons use a 120ms press scale; dropdowns and modals use a 180ms opacity/scale transition. No continuous motion except a restrained support pulse and existing marquee, both disabled under reduced-motion.

## Implementation intent

The redesign will be implemented as a CSS-first visual overhaul, with minimal markup changes: simplify the global surface language, make the sidebar/topbar feel like one system, rebalance the auth rail and card, add shared entrance classes for route-rendered pages, and consolidate mobile behavior at the end of the stylesheet. Existing JavaScript behavior remains the source of truth.
