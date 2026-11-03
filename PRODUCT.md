# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vanilla static HTML/CSS/JS (no build step, no framework, no package.json). Served as Render `runtime: static` with `staticPublishPath: .` and `autoDeployTrigger: commit`. Hash router (`#/route`) over a global `PAGES` registry. Visual truth lives in one stylesheet (`ui.css`). Confirmed constraint for this redesign: **no bundler, no external CDN** — the runtime CSP is `script-src 'self'`, so all motion must be authored in-repo.

## Users

Paying subscribers and prospective buyers of PerralVPN, a Vietnamese consumer VPN service, on desktop and mobile browsers. Many connect over constrained Vietnamese mobile networks (3G/4G, high RTT), which makes first-paint cost a primary user need, not a nice-to-have.

Secondary audience: unauthenticated visitors arriving at `#/login`, `#/register`, `#/forgot-password` to create or recover an account.

## Product Purpose

Self-service account console for a VPN subscription: understand what you paid for, how much quota is left, which nodes are reachable, and what to do when something is wrong. Success = the subscriber resolves their own question (quota, node choice, plan renewal, traffic, referral payout) without contacting support in the Zalo/Telegram group.

## Positioning

The console is operated by the same person who runs the service, so it exposes real operational state (per-node status, live traffic, quota consumption) rather than a marketing abstraction of it. Support is one tap away into the actual human channels (Zalo group, Telegram group), not a ticket queue.

## Operating Context

- Purchase flow: pick plan and cycle → Sepay checkout (`pay.sepay.vn` / `pay-sandbox.sepay.vn`) → order history → success screen.
- Data consumption is monitored on `#/traffic`; node health on `#/node`; plan and node region changes on `#/plan` and `#/changepro`.
- Referral/affiliate activity on `#/invite`.
- Account credentials and password change on `#/account`.
- Setup guidance on `#/knowledge`; client download/activation on `#/application`.
- Bilingual by default: every string routes through `i18n.js` with `vi` and `en`; language choice persists in `localStorage`.
- Light/dark choice persists in `localStorage` as `perralvpn-theme`.

## Capabilities and Constraints

- 11 in-shell routes plus 3 standalone auth routes (`#/login`, `#/register`, `#/forgot-password`) render into `#pageContent` inside `.app-shell`; auth routes strip the shell via `auth-mode` / `body.auth-page`.
- API is a separate backend at `https://api.perral.dpdns.org/api` (`frontend-config.js`), reached through `RealAPI`; unauthenticated users are redirected to `#/login` by the router.
- `mock-data.js` supplies demo state used when the backend is unreachable.
- Runtime CSP (render.yaml) additionally restricts: `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src 'self' https://fonts.gstatic.com data:`, `img-src 'self' data: https://api.dicebear.com`, `connect-src 'self' https://api.perral.dpdns.org`. Any new asset or host must be added there or it will be blocked in production.
- Destructive actions (logout, cancel) go through a confirm dialog (`openConfirm`); feedback goes through `showToast` into `#toastRegion`.
- Sidebar supports desktop collapse and mobile drawer (`sidebar-collapsed`, `mobile-nav-open`, `#sidebarScrim`).
- No service worker, no code splitting, no image pipeline today; avatars are generated as inline SVG data URLs (initials or DiceBear).
- Undecided: whether a service worker / offline shell is wanted later.

## Brand Commitments

- Name: **PerralVPN**, tagline in the sidebar brand block: "Private network".
- Existing mark: four ascending vertical bars (signal/traffic glyph), used as the favicon and sidebar brand mark.
- Brand accent `#C9F24D` acid-lime is a confirmed commitment and carries into the redesign as the single signal colour.
- Vietnamese-first voice (page `lang="vi"`), with full English parity.
- Binding visual reference given by the owner: **rive.app** — for the quality and confidence of its motion. Confirmed resolution: reproduce that motion *feel* with an in-repo CSS/SVG engine, explicitly **not** by shipping the Rive WASM runtime, because the runtime weight contradicts the weak-network requirement and `script-src 'self'`.
- Confirmed theme stance: light and dark are equals; the default follows the operating system, and the toggle stays available.

## Evidence on Hand

- Real route inventory and navigation labels in `state.js` (`NAV_CONFIG`, `ROUTE_LABELS`).
- Full bilingual copy in `i18n.js` (~500 lines) — the source of truth for wording; redesign copy must extend it, not replace it.
- Existing incumbent design system "Ink & Signal" in `ui.css` (token block at the top, ~3,300 lines total) — evidence and anti-reference for the new world, but its DOM hook names are load-bearing and stay.
- Support channel URLs (`ZALO_GROUP_URL`, `TELEGRAM_GROUP_URL`) and payment endpoints already wired in code.
- Absences future work must not fabricate: no testimonials, no customer logos, no benchmark or uptime numbers, no pricing beyond what the backend/`mock-data.js` returns, no privacy-policy or jurisdiction claims.

## Product Principles

1. **State is the product.** Every screen should answer a live operational question in seconds; decoration that delays that answer is removed.
2. **Earn the connection.** On a slow Vietnamese mobile network the console must still paint, still be readable, and still be usable; motion never blocks content.
3. **One signal colour.** Attention is rationed through the lime signal; status uses its own small semantic set and never competes.
4. **Bilingual and persistent.** Vietnamese leads, English equals; theme, language, sidebar and route state survive reload.
5. **Human escape hatch.** Any place a user can get stuck offers the real support channel in one tap.

## Accessibility & Inclusion

WCAG 2.1 AA: body/placeholder text ≥4.5:1 and large text ≥3:1 in both themes, visible keyboard focus, skip link, `aria-live` on route content and toasts, colour never the only status carrier, and full `prefers-reduced-motion` fallback for all authored motion. Reduced-data conditions are treated as an inclusion requirement (`navigator.connection`, `saveData`).
