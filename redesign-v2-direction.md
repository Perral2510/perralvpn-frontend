# PerralVPN redesign v2 — direction

## Why the previous pass failed

The previous pass changed tokens and added another CSS layer, but it preserved the old visual grammar too closely: dark sidebar, blue-glow card treatment, anime-led auth scene, and dense component rhythm. That made the result feel like a polish pass rather than a redesign.

## New direction: Quiet Signal

This version changes the visual composition, not only the colors. The logged-in product becomes a **light-first operations workspace**: a warm-white canvas, pale navigation rail, dark graphite typography, and indigo used as a precise interaction signal. Cyan is reserved for live/connected status. The anime watermark will no longer sit behind the entire application; it will be removed from the main shell so data and controls regain focus.

The authentication experience becomes a **clean dark-to-cream split**. The left side is typography-led with a restrained grid and status markers rather than a large character watermark. The right side is a warm paper-like form panel with a crisp border, large field rhythm, and a single high-contrast CTA. This is intentionally more editorial and less “gaming / neon VPN”.

## Visual changes

| Area | V1 / current legacy | Redesign v2 |
|---|---|---|
| App shell | Dark 248px sidebar + light topbar | Light navigation rail + white content workspace |
| Primary color | Blue gradients and glow | Indigo `#5b5ce2`, mostly flat and controlled |
| Background | Pale blue with large watermark | Warm gray canvas, no full-screen artwork |
| Cards | Rounded, shadow-heavy, gradient surfaces | 12–16px radius, thin keyline, mostly shadowless |
| Dashboard hero | Image-forward carousel | Dark editorial banner with a clean signal frame |
| Auth | Anime background + glass card | Typography-led dark rail + cream form panel |
| Motion | Generic hover / fade | Staggered route entrance, underline active state, subtle lift only where useful |

## Design read

```yaml
artifact: VPN account workspace with auth, dashboard, plans and account tools
 audience: Vietnamese subscribers and operators who need fast daily status checks
 visual-language: editorial operations workspace / quiet signal
 mode: overhaul
 visual-variance: 8/10
 motion-intensity: 3/10
 information-density: 5/10
 asset-dependence: 2/10
 brand-fidelity: 7/10
```

## System

Use `#F6F6F3` for the canvas, `#FFFFFF` for primary surfaces, `#111318` for graphite type, `#5B5CE2` for primary actions, and `#23B7A5` for online state. Use Sora for titles and Inter for readable body text. Keep 4px spacing units, but use 24–32px section breathing room. Use 12px controls, 14px cards, and 18px only for the main auth shell. Use borders first; shadows only on popovers, modals, and the support control.

Motion is deliberately restrained. Route content fades and rises 10px over 320ms, dashboard blocks stagger by 40ms through CSS variables, nav items slide 2px on hover, and CTAs lift 1px. No decorative continuous animation on the main shell. The reduced-motion preference remains a hard override.

## Implementation boundary

Keep the existing vanilla JavaScript, route hashes, field IDs, API behavior, and static deployment. Replace the previous redesign layer rather than stacking another override on top of it. The implementation will use one new stylesheet loaded last, plus only the minimum HTML change needed to remove the full-screen watermark element from the visual layer.

## Preview debug note

The first browser preview after linking v2 still reported the deleted `refresh.css` in `document.styleSheets`, so it was using a cached HTML/CSS snapshot rather than the current `refresh-v2.css`. The v2 file is present in the repo and the index edit was applied; a hard reload is required before judging the visual result.

## v2 visual checkpoint

After cache-busting the page URL, the new stylesheet loaded correctly. The auth surface now has a near-black editorial background with a subtle grid, indigo/cyan signal accents, a typography-led left rail, and a warm cream form panel. The full-screen anime watermark is gone from this surface, making the change materially different from the legacy UI.

## Theme validation

The dark theme was toggled at runtime and the auth card/input returned distinct dark surface values (`#171a22` and `#0f1117`) while retaining readable light text and the indigo/cyan signal accents. This confirms the theme is defined as its own visual treatment rather than only a light-theme inversion.
