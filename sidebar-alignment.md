# Sidebar alignment fix

The sidebar issue is an optical alignment problem rather than a navigation logic problem. The brand row, group labels, nav icons, active background and text are using different horizontal origins and icon boxes. The fix standardizes one content rail: 12px outer inset, a 22px icon column, a 12px icon-to-label gap, and a fixed 42px navigation row. Group labels use the same text origin as the labels, while the active item keeps the same left/right inset as every other item.

The brand row uses a 66px header with a 34px mark and the same 18px horizontal optical inset. The icon wrapper is explicitly 22px wide with centered SVGs and a consistent 18px drawing box. Labels are allowed to shrink without changing icon position. The collapse button follows the same rail when expanded and centers only when collapsed.

The rules will be applied as a small final stylesheet. It will not change route logic, labels, API behavior, or mobile page content. Responsive rules only change width and visibility; they do not redefine the alignment grid.

## Browser check

The cache-busted dashboard route without authentication rendered the sidebar and showed the new single-rail alignment visually. The page content correctly remained empty because the route requires an authenticated user. A DOM bounding-box probe returned zero-sized content for the not-authenticated render, so final alignment validation relies on the visible sidebar screenshot and static rule inspection rather than that probe.

## Live verification

The live domain loads `sidebar-alignment.css?v=sidebar-align-1`, so this is not a stale stylesheet issue. In the unauthenticated live state, `.sidebar` is intentionally `display:none` and its measured bounds are zero; the visible sidebar screenshot provided by the user is therefore from the authenticated desktop shell. Alignment must be validated against the authenticated render, not the logged-out route.
