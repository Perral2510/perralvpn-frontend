# PerralVPN frontend — redesign audit

## Current mode
Redesign · Overhaul of the visual layer, while preserving route structure, existing behavior, content meaning, and static deployment model.

## Observed current state
- The app is a static, no-build frontend using HTML/CSS/vanilla JavaScript modules loaded from `index.html`.
- Main shell: dark sticky sidebar, light sticky topbar, content area, support FAB, theme toggle, language dropdown, account dropdown.
- Unauthenticated state routes to `#/login` and renders a split-screen auth scene: dark navy / blue visual panel on the left with large anime watermark and glass-like login card on the right.
- Auth copy is Vietnamese and includes the product promise, 24/7 support, 99.9% stability, email/password fields, remember-me, forgot password, login and register CTA.
- Existing brand cues: PerralVPN name, `DA` mark, deep blue + teal accent, Sora display type, Inter body type, JetBrains Mono for data.
- Existing assets: four anime watermark/promo files under `assets/`.
- Existing motion: small ease transitions, button press scale, progress transitions, promo marquee / subtle background motion, reduced-motion override.
- The screenshot shows the current auth scene is visually strong in concept but feels dense/dated in execution: too much decorative watermark, small form card, mixed visual weight, and interaction focus is not sufficiently clear.
- The logged-out shell also briefly shows the sidebar/topbar behind auth routing, suggesting a possible initial loading/route transition that should be visually softened or prevented.

## Preserve
- Hash route names and page entry points.
- Static hosting and current API/backend contracts.
- Existing Vietnamese content and auth field IDs/semantics.
- PerralVPN brand name, blue/teal palette relationship, theme switch, language switch, support FAB.
- Existing real assets unless the user later asks for brand asset replacement.

## Improve
- Unify visual language across app shell and auth pages.
- Increase hierarchy and whitespace, simplify borders/shadows, improve contrast.
- Make active navigation and primary CTAs clearer.
- Normalize cards, controls, and status treatments.
- Make motion more intentional: route/page entrance, nav hover, card lift, button feedback, modal/dropdown presence; all with reduced-motion support.
- Improve mobile layout and remove duplicated / conflicting mobile overrides in CSS.

## Remove / avoid
- Decorative elements that compete with login form or dashboard data.
- Excessive neon/glow and duplicated override rules.
- Any dead CSS that force-hides required content such as `.dashboard-billing-card`.

## Protected contracts
- `index.html` IDs, route hashes, form field names/order, and existing JS event wiring.
- API endpoints and static deployment assumptions.
- Accessibility semantics and reduced-motion behavior.

## v0 visual check after refresh layer

The auth route now fills the viewport without the logged-out shell showing behind it. The visual rail has a calmer navy treatment, the anime asset is present but subdued, the headline / stats establish a clearer first-touch hierarchy, and the form panel reads as a focused white surface with more generous spacing and a stronger CTA. The support FAB remains visible and consistent with the brand accent. The browser console reported no output or runtime error during this pass.

## Auth route check

Register and forgot-password routes both rendered successfully with the existing IDs, labels, buttons, and shared auth composition intact. The longer register content adds a small amount of vertical scroll at the current viewport, which is acceptable and will be covered by the responsive rules. No route-level JavaScript error was observed.
