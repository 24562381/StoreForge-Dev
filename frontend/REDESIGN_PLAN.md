# StoreForge Storefront — Redesign, Hardening & SEO Plan

**Status:** Phase 0 (audit/run) and Phase 1 (this plan) are complete. No storefront source file has been changed. Phase 2 is intentionally blocked pending explicit approval.

**Scope:** Customer-facing storefront only — everything under `/home/agent/StoreForge-v1-main/frontend/`.

**Hard constraints accepted for Phase 2**

- Do not modify `backend/`, `admin/`, root `.env*`, root `package.json`, `docker-compose*`, root scripts, or root docs.
- Do not change API endpoints, request/response shapes, setting keys, translation keys, or routes.
- Do not remove or add customer-visible copy, sections, badges, fields, buttons, links, or features. Restyle only.
- Preserve all conditional logic, including settings-driven visibility, pricing, stock, payment, language and auth states.
- Preserve fragile behavior: CSS `<link ?v=N>` cache busting, `sw.js` cache versioning, the `/catalog` route quirk (fixed as a link only), `WorldMapFeaturedSection` 860 px behavior, `body.menu-open`, the language pill, sliders, drawers, modals, image fallback, and PWA install/update flow.
- No new npm dependency without approval.

---

## Approved amendments (2026-10-21)

This section records the user's approval and supersedes any conflicting recommendation or baseline statement below.

- **Git:** the project is now a git repository. Work is on branch `frontend-redesign`; use `git diff --name-only` for scope checks and commit after each slice (2A–2F). Do not push.
- **Sanitizer:** in-house allow-list serializer approved. Completely drop the contents of `script`, `style`, `svg`, `math`, `iframe`, `textarea`, `noscript`, and `template`; rebuild output only from the allow-list. Show the OWASP-style payload-corpus output before moving past 2A.
- **Admin token:** remove `sf_admin_token`/`sf_admin_user`, Authorization attachment and the `/admin` redirect from the storefront. Approved.
- **Caching:** 30 s public-read caching approved. Read backend checkout/order code read-only and confirm server-side price/stock recomputation before relying on cached storefront prices.
- **Canonical domain:** single domain `https://YOUR-DOMAIN.com` via configuration. Never trust `x-forwarded-host`; fall back safely if the env var is missing; the build must not crash.
- **Search SEO:** noindex `/search` when it has `q`, sort, price or any filter params. Keep `/search?category=<slug>` with no other params indexable, self-canonical, with a unique title/description derived from existing category data, and keep those category URLs in the sitemap. A hidden h1 must reuse existing visible text or an existing `t()` key.
- **URL privacy:** scrub `token`/`phone` from the URL after read; keep the existing order-session behavior but set the client-side order-session cookie lifetime to 24 h; do not change backend token expiry; keep sessionStorage minimal.
- **Links:** `/catalog` → `/products`; `/privacy-policy` → `/privacy`. Approved.
- **bKash:** HTTPS only, exact host suffix with a dot boundary (`evilbkash.com` must fail). Use the real production/sandbox hosts found read-only in backend config; keep same-origin callbacks; test simulator and real-config paths.
- **CSP/HSTS:** `style-src-attr 'unsafe-inline'` approved. CSP ships as **Report-Only** first, switchable by env var; enforce only after Playwright shows zero violations. HSTS: `max-age=15552000`, no `includeSubDomains`, no `preload`, production over HTTPS only.
- **Fonts:** system-first, no external font requests; use the Bangla-capable body stack for headings when `html lang="bn"`.
- **Docker:** add a new `frontend/Dockerfile.prod`; do not modify the existing `frontend/Dockerfile`. Document build-context assumptions at the top.
- **Audit deferral:** dev-only Tailwind-chain findings are deferred. Approved.
- **hreflang:** do not add hreflang; fix `html lang` and `og:locale` only. Approved.
- **Browser QA:** install Playwright/Chromium outside the project (e.g. `/tmp`) so `package.json`/`package-lock.json` stay untouched. Run Lighthouse and axe. Capture before/after screenshots of every route at 360/768/1280 in BN and EN. Enforce CSP only after zero violations.
- **Skip link:** not approved; do not add one.
- **Images:** keep the original `public/images/product-main.jpg`; add generated variants beside it. Use srcset only where variants exist; otherwise add width/height, aspect-ratio and fetchpriority.
- **CSS splitting:** do it last and only if before/after screenshots match on every route; skip on any regression.
- **Cleanup:** stop/remove test services started for this work when finished and report what was started/stopped.
- **Review gates:** stop after 2A (security) and 2C (design shell) with diff summary and screenshots.

The statements below that say “no git repository”, “noindex all `/search*`”, “7-day session”, “Dockerfile optional”, “CSP enforcing immediately”, or “no browser tooling” are baseline history and are superseded by this amendment.

---

## 1. Executive summary

The storefront is functional and the production build passes, but it is carrying a large amount of accumulated CSS, duplicated metadata/fetches, unsafe storefront admin-token code, a regex “sanitizer”, origin-host trust, and an over-broad service worker. The redesign will be **surgical rather than a rewrite**: keep the component tree, classes, keys and interactions; replace the visual layer with a coherent warm-wood design system; split CSS by route; harden trust boundaries; make metadata/SEO route-specific; and optimize the few genuinely large assets.

Highest-impact work, in order:

1. **Security:** replace regex `sanitizeHtml`, remove `sf_admin_token`/admin redirect behavior, fix canonical host injection, add CSP/HSTS/COOP/frame protections, fix bKash open-redirect risk, harden PWA icon/SW behavior.
2. **SEO correctness:** per-route metadata/canonical/OG, remove the inherited canonical `/`, fix duplicate product title suffix, add missing `<h1>`s, noindex private/search pages, correct sitemap/robots, escape JSON-LD.
3. **Performance:** route-level CSS, dedupe `icons.css`, add responsive WebP/AVIF hero images, add image dimensions/lazy loading, dedupe server fetches, 30 s public-read caching.
4. **Visual redesign:** refined editorial “warm walnut + parchment + muted gold” system; consistent cards/forms/buttons; responsive polish at 320–1440 px; reduced motion and accessible focus states.
5. **PWA/privacy:** SW v12 deny-list, no private-route caching, no precached `/`, bounded caches, externalized offline page, URL token scrubbing.

Expected outcomes (measured in Phase 3, not promised blindly):

- Home CSS transfer from ~96.6 KB gzip to roughly 55–65 KB gzip on first visit; ~200–340 KB less raw CSS parsed on home.
- Hero LCP asset from **797 KB** to a responsive WebP/AVIF set (target <150 KB on mobile, <250 KB on desktop at 1×/2×).
- 30–60 s maximum admin-content staleness with fewer duplicate backend requests per page.
- One canonical, one viewport, one manifest, one theme-color, one `<h1>` per page, and a unique title/description on every route.

---

## 2. Baseline evidence (Phase 0)

### 2.1 Runtime and build

| Item | Baseline |
|---|---|
| Framework | Next.js 16.4.0, React 19.3, Turbopack production build |
| Install | `npm ci` succeeded, 703 packages |
| Build | `npm run build` passed; all storefront routes are dynamic |
| Runtime | Postgres test container on `:5432`; NestJS backend `:8585`; production Next server `:3000` |
| Data | Non-destructive `prisma db push`, `prisma generate`, local test seed used for QA (credentials intentionally omitted) |
| Browser tooling | No Chrome/Chromium, Lighthouse, or Playwright available |
| Version control | Project root is **not a git repo**; `git status`/`git diff` unavailable |

### 2.2 Size and delivery measurements

| Metric | Baseline |
|---|---|
| Public CSS (13 linked stylesheets) | **544,947 bytes** raw; **87,991 bytes** gzip. All files under `public/css/` total 554,458 bytes; the extra `main.css`/`tiptapeditor.css` are not linked by the storefront layout. |
| Compiled Tailwind CSS | 59.8 KB |
| Static JS in build | 1,043,666 bytes raw; 308,670 bytes gzip; `.next/static` ≈ 1.2 MB |
| Home first load | 10 JS chunks: **716 KB raw / 214 KB gzip** |
| Home CSS | **96.6 KB gzip** across 14 stylesheets including Tailwind |
| Home HTML | 29,315 bytes gzip |
| Home TTFB | ~0.083–0.168 s locally |
| Home LCP image | `product-main.jpg`, **797,092 bytes**, 1376×768 |
| Public images | ~804 KB total; public icons ~176 KB |

### 2.3 Content baseline

- **422** unique static `t()` keys; **21** dynamic key patterns.
- **98** unique direct `settings.*` keys; **18** additional dynamic policy setting keys (`policy_{privacy|terms|returns}_{title|sub|content}_{bn|en}`).
- **53** static keys rely on fallback text because they are not present in the 433-key dictionary. They must remain byte-for-byte identical.
- Payment simulator/status screens and some policy defaults contain hardcoded visible text and no `t()` keys. They are content-frozen in this work.
- Full page → component → key → settings inventory is in **Appendix A** (generated from source).

### 2.4 CSS versions currently live

`globals.css?v=21.0`, `icons.css?v=25.0`, `header-footer.css?v=57.0`, `home.css?v=63.0`, `products.css?v=49.0`, `product-details.css?v=52.0`, `search.css?v=48.0`, `cart.css?v=21.0`, `checkout.css?v=23.0`, `confirmation.css?v=56.0`, `track.css?v=21.0`, `payment.css?v=21.0`, `policy.css?v=21.0`; service worker cache `sf-storefront-v11`.

### 2.5 Baseline manifest

A 144-file manifest excluding `node_modules` and `.next` is stored at `/tmp/sf_baseline_manifest.txt`. Because the project is not a git repository, final scope verification will compare a fresh manifest against this file, plus report tool-generated `next-env.d.ts` changes. `next-env.d.ts` was changed by the Next build (296 → 288 bytes); it is generated, not hand-edited. `AGENTS.md` was generated by `next dev` and is already part of the baseline.

---

## 3. Audit findings

### 3.1 Architecture, routes, and data flow

Routes present: `/`, `/products`, `/products/[slug]`, `/search`, `/cart`, `/checkout`, `/track`, `/order/confirmation`, `/order/confirmation/[number]`, `/privacy`, `/terms`, `/return-policy`, `/payment/bkash/simulator`, `/payment/bkash/status/[orderNumber]`, plus `not-found`.

- `layout.tsx` is `force-dynamic` and fetches settings, categories and the dictionary for every request. Home/product page metadata fetch settings/products again; pages fetch the same data a third time. `SettingsProvider` then calls `refreshSettings()` on mount, adding two more client requests even when SSR already supplied data.
- `manifest.json` and `manifest.webmanifest` both return 200; the layout manually links `/manifest.json` while metadata emits `/manifest.webmanifest`.
- `/api` and `/uploads` are proxied to the backend via rewrites; the PWA icon route forwards an internal microservice token. That token must never reach client output.
- The storefront `api.ts` reads `sf_admin_token` from `localStorage`, attaches it as `Authorization`, and redirects 401s under `/admin` to `/admin/login`. A customer storefront must not have this behavior.
- `fetchApi` accepts absolute URLs and always sets `Content-Type: application/json`; this is an SSRF-shaped surface and would break any future `FormData` call.
- `/catalog` is linked from the home order guide but no such route exists. Checkout links to `/privacy-policy`, but the real route is `/privacy`.
- The `WorldMapFeaturedSection` uses a resize listener and `getBoundingClientRect` to force left-column height to match the right column above 860 px. This is layout-thrashing JS that CSS grid can replace.
- Product/search pages use client wrappers for filters; server pages prefetch initial data. Search fetches up to 50 products client-side to derive filter ranges/counts.

### 3.2 Security

Confirmed or highly likely issues:

1. **Regex sanitizer.** `src/lib/sanitizeHtml.ts` is a 21-line regex filter used for policy HTML, product tabs, Why-Us rich text, and world-map descriptions. It is not an allow-list parser and is bypassable with malformed markup, encoded schemes, SVG/MathML, and mutation XSS.
2. **Canonical host poisoning.** `resolveSiteUrl()` trusts `x-forwarded-host`/`host`; `curl -H 'X-Forwarded-Host: evil.example'` produces `https://evil.example` in canonical. `x-forwarded-proto` is also unvalidated.
3. **Storefront admin token.** `sf_admin_token` in `localStorage`, attached to public requests, plus admin login redirect. This leaks an admin credential surface into the public app and violates least privilege.
4. **Weak headers.** No CSP, HSTS, COOP, `frame-ancestors`, `object-src`, `base-uri`, `form-action`, or private-route `no-store`; `X-Frame-Options: SAMEORIGIN` exists. `poweredByHeader` is already false.
5. **Open redirect.** bKash responses assign `window.location.href = bkashRes.bkashURL` directly in checkout and payment status. A compromised/misconfigured API response can navigate customers off-site.
6. **PWA icon content type.** `/api/pwa/icon` trusts the backend `Content-Type`; an SVG or HTML response can become same-origin stored XSS if served inline. The tenant/host cache maps are unbounded.
7. **Service worker over-caching.** `sw.js` caches every navigation and page HTML, including `/checkout`, `/order`, `/track`, `/payment`, and query-bearing URLs; it precaches `/` (wrong language for one of BN/EN), caches CSS without `?v`, and has no size cap.
8. **URL PII.** Confirmation/track links accept `token` and `phone` in the query string; these end up in browser history, referrers, screenshots and shared links.
9. **Inline code.** Two custom `<style>` blocks (`LanguageToggle`, `ProductWarningCard`) and `offline.html` inline styles/`onclick` complicate a strict CSP. 77 `style={{...}}` attributes remain; most are dynamic positioning/progress values.
10. **Blank-target links.** Checkout policy links and several other internal `target="_blank"` links lack `rel="noopener noreferrer"`; one FAQ link uses only `noreferrer`.
11. **JSON-LD injection.** Both home and product JSON-LD use raw `JSON.stringify` in `dangerouslySetInnerHTML`; a product/store string containing `</script>` can break out.
12. **Debug output.** Client `console.*` calls exist in PWA, settings, language, cart, custom-map and SW code. Some log raw errors or settings-parse failures.

`npm audit --omit=dev` reports **0** vulnerabilities. Full audit reports **5 high** dev-only findings through the Tailwind 3 chain (`braces`, `chokidar`, `fast-glob`, `micromatch`); the only offered fix is a breaking Tailwind 4 upgrade. No production dependency vulnerability was found.

### 3.3 SEO / metadata

- Only `/` and `/products/[slug]` have page-specific metadata. Everything else inherits the root title/description and **canonical `/`**, and is indexable.
- Product title is double-suffixed: `3D Wooden World Map | StoreForge | StoreForge`.
- `/products`, `/search`, and `/order/confirmation` have **zero `<h1>`** elements; `/products` uses `<h2>`, search has only a count `<strong>`, confirmation auth states use `<h2>`.
- Root layout emits two viewport tags (manual + Next default), manually links `/manifest.json` while metadata emits `/manifest.webmanifest`, and duplicates manifest/apple-touch-icon links.
- No `alternates.languages`/hreflang. Because language is cookie-only and produces no distinct URLs, adding hreflang would be inaccurate unless language-specific URLs are approved (see §10).
- `og:locale` is always `bn_BD` even when the cookie renders English.
- `sitemap.ts` includes `/track` and category `/search?category=...` URLs; it marks static/category entries with `lastModified: now` and forces dynamic generation.
- `robots.ts` allows `/search`, `/track`, `/cart`, `/checkout`, `/order/*`, `/payment/*` and only excludes `/api` and `/admin`.
- 404 is correctly `noindex` with one `<h1>`.
- No `<html lang>` update on client language switch; it remains the server-rendered value until navigation/reload.

### 3.4 Performance / rendering

- 14 render-blocking stylesheets on every route, most irrelevant to the current page (e.g. `track.css` on home). `icons.css` is 264,444 bytes and contains **356** `mask-image` declarations versus **178** `-webkit-mask-image` duplicates; roughly half the file is repeated.
- Public CSS is not minified; only Tailwind output is.
- Hero image is a 797 KB JPEG used for the hero, featured card and a product card; no `srcset`, dimensions, or modern format. All 19 `<img>` elements lack `width`/`height`; 18 lack `loading`; 18 lack a same-line `alt`.
- 77 inline style objects across 18 files; 42+ `!important` usages; breakpoints are fragmented across 340/360/420/480/576/600/640/680/767/768/820/860/900/991/992/1023/1024/1080/1150/1200/1366, plus `100vw` backdrop sizing.
- No route HTML caching; dynamic rendering is appropriate for private pages but unnecessary for public catalog pages, which pay repeated backend calls.
- `WorldMapFeaturedSection` reads layout on resize and writes heights, causing layout thrash and potential hydration jank.
- Modals (`CustomMapModal`, `TrackReviewModal`) are statically imported even when unused; PWA install UI ships on every route. These are low-risk lazy-load candidates.
- `images.unoptimized: true` means no Next image optimization; manual responsive images are the lower-risk path.

### 3.5 Accessibility / interaction

- Missing/weak `<h1>` hierarchy on products/search/confirmation; heading order varies by section.
- Cart quantity buttons are 24–28 px; several mobile controls fall below the 44×44 px target.
- Header mobile drawer does not add `body.menu-open`; the CSS scroll lock exists but is only used by the cart drawer, so background scroll is not reliably locked.
- Modal/drawer focus trapping and focus restore are not centralized; Escape behavior varies.
- Forms lack `autocomplete`, `inputmode`, `maxLength`; checkout inputs are 14 px, triggering iOS zoom on focus.
- Error/status messages are not consistently announced (no `aria-live`/`aria-describedby` where validation occurs).
- Many icon-only controls rely on visual context; labels/titles exist in some places but not all.
- `prefers-reduced-motion` is not respected globally.
- Gold-on-parchment combinations need contrast verification; some muted text is likely below 4.5:1.

### 3.6 PWA / offline

- SW `sf-storefront-v11` precaches `/`, offline page, some CSS without `?v`, images, and manifest.
- Network-first navigation falls back to any cached page regardless of private route; cache keys include query strings, so confirmation tokens could be persisted.
- `offline.html` has inline styles and an inline `onclick` reload; it cannot work under a strict CSP without externalizing or allowing hashes.
- The install banner is fixed near the bottom and can overlap the floating WhatsApp button on non-product pages.
- `manifest.ts` and `/api/pwa/icon` both need host/content-type/cache-size hardening.

### 3.7 Design/visual audit

- The palette is already wood/gold, but surfaces, borders, radii and shadows vary between Tailwind utilities and hand-written CSS. Cards use multiple max widths and radii; buttons mix gradients, gold, and flat styles.
- The header is dense on mobile; the language pill, search and cart CTA compete for width.
- Product cards cap at 255 px, which makes desktop grids feel undersized and leaves large gutters at 1280+.
- Product detail has a strong two-column desktop structure but inconsistent warning/guarantee card styling and `!important` overrides.
- Checkout/order/track use small form controls and inconsistent panel treatments; private pages feel less “premium” than home/product.
- Policy pages are readable but lack a consistent editorial rhythm; the sidebar/contact card is already present and will be retained.
- The bKash simulator intentionally mimics a third-party payment surface; it will not be rebranded, only made responsive/safe.

---

## 4. Design direction

### 4.1 Concept

**“Quiet luxury for handcrafted wood.”** Editorial serif headlines, warm parchment surfaces, walnut ink, restrained gold hairlines, generous whitespace, and tactile cards. The storefront should feel like a woodcraft atelier, not a generic e-commerce template.

Principles:

- Warmth without sepia: off-white parchment, deep espresso, muted brass — not bright yellow or glossy brown.
- Craft detail: thin double borders, small engraved-style labels, subtle grain gradients (CSS only, no new images).
- One accent per view: gold is a highlight, not a fill color.
- Content first: product photography and existing copy lead; decoration never competes.
- Calm motion: short, confident fades/lifts; no parallax, autoplay, or bouncy animation.
- No new copy, badges, sections, or features. Existing content keeps its hierarchy.

### 4.2 Design tokens

Tokens will extend the existing `:root` in `public/css/globals.css`; existing variable names are kept to avoid breaking page CSS.

**Color**

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#FAF7F1` | page background |
| `--color-surface` | `#FFFDF9` | cards, header |
| `--color-surface-soft` | `#F2EAE0` | alternate panels |
| `--wood-dark` | `#2A1B12` | headings, footer |
| `--wood-rich` | `#4A2E1D` | primary buttons |
| `--wood-accent` | `#7B4B2A` | links, active nav |
| `--wood-gold` | `#B9853F` | hairlines, icons |
| `--accent-gold` | `#D9B26A` | small highlights |
| `--color-text-main` | `#231A14` | body text |
| `--color-text-muted` | `#6F6257` | secondary text |
| `--color-border` | `#E4D8C8` | default border |
| `--success` | `#2F6B4F` | stock/success |
| `--danger` | `#A33A2B` | errors/out-of-stock |
| `--focus` | `#8A5A2B` | focus ring |

Contrast rule: body text must reach ≥4.5:1; large display text ≥3:1. Gold text is only used on dark espresso or with a darker ink variant.

**Typography**

- Display/serif: `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Noto Serif Bengali", "Kalpurush", "SolaimanLipi", serif`.
- Body/UI: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", "Kalpurush", "SolaimanLipi", Arial, sans-serif`.
- Mono (order IDs): `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
- Remove the unused `'Inter'` and `'Cinzel'` names; no external font requests. This is a no-network-font decision because no licensed WOFF2 files are in the repo.
- Fluid scale: `0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25, 2.75, 3.5rem` via `clamp()`.
- Heading line-height 1.12–1.2; body 1.65; Bangla body 1.75; Bangla headings 1.35.
- Display letter-spacing `-0.02em`; small caps/eyebrow `0.08em`.

**Spacing, radius, shadow**

- 4 px base; page gutters 16/24/32 px; section vertical rhythm `clamp(56px, 7vw, 96px)`.
- Container 1200 px standard, 1280 px for wide catalog; reading width 72ch for policy copy.
- Radius: 6 px inputs, 10 px buttons, 14 px cards, 20 px feature panels, 999 px pills.
- Shadows: warm and shallow (`0 2px 8px rgba(42,27,18,.04)`, `0 14px 34px -18px rgba(42,27,18,.28)`); no black/gray drop shadows.
- Borders: 1 px `--color-border`; featured panels use a 1 px gold line inset by 6 px (pseudo-element), not an extra wrapper.

**Motion**

- Durations 160/240/360 ms; easing `cubic-bezier(.22,1,.36,1)`.
- Hover: card lift 2 px, image scale 1.02, border/color change.
- Drawers/modals: translate/fade, 240 ms; backdrop 180 ms.
- `@media (prefers-reduced-motion: reduce)` disables transforms, smooth scrolling, pulse/skeleton animation and slider autoplay if any.

**Breakpoints**

Canonical set: **360, 480, 640, 768, 860 (component-specific), 1024, 1280, 1440 max**. Legacy values will be mapped during touched-file refactors; no mass find/replace. The 860 px featured-map behavior is preserved until replaced by grid, then verified at 820/860/861/1024. The 992/1023 product-tab boundary will become 1024 only after tab behavior is verified.

### 4.3 Component language

- **Buttons:** primary walnut gradient with 1 px highlight; secondary parchment with walnut border; tertiary text link with animated gold underline. Min height 44 px, 14–15 px label, 8/18 px padding. Disabled uses 45% opacity and no hover lift. Focus uses 2 px `--focus` ring with 2 px offset.
- **Cards:** 1 px warm border, 14 px radius, surface background, optional top image at fixed aspect ratio. Hover lift only on interactive cards.
- **Forms:** visible label above control; 44–48 px height; 16 px font on mobile (prevents iOS zoom); 8 px radius; 2 px focus ring; error text + `aria-invalid` + `aria-describedby`; no placeholder-as-label.
- **Badges/pills:** existing copy only; 11–12 px uppercase tracking; parchment/gold or stock/error tones.
- **Section header:** existing eyebrow/title/subtitle order; serif title, muted subtitle, 8–12 px label.
- **Drawer/modal:** warm overlay, 420 px cart drawer / 560–680 px modal, sticky header/footer, close target 44 px, focus trap, Escape close, body scroll lock via `body.menu-open`.
- **Product card:** fluid width with a 4:3 image well, category/eyebrow, serif name, price row, rating, stock hint, full-card link plus separate add-to-cart button. Preserve all current conditional labels and fallback text.
- **Tabs/accordion:** keyboard-operable, visible focus, animated panel without layout jump; preserve existing tab labels.
- **Empty/loading states:** existing text/icons, warmer skeleton; no new copy.
- **Tables:** horizontal scroll wrappers on mobile; order/receipt tables remain semantically tables.
- **Icons:** keep Font Awesome classes and existing lucide icons; do not replace the icon system. Dedupe the CSS mask declarations, do not change glyph names.

### 4.4 Accessibility rules

- Exactly one `<h1>` per page; section headings remain in DOM order.
- Landmarks: header/nav/main/footer; drawers/modals use `role="dialog"`, `aria-modal`, labelled titles.
- All icon-only buttons get accessible names; decorative icons `aria-hidden="true"`.
- All images: meaningful `alt` from existing product/category data, or `alt=""` only when decorative; add `width`/`height`, `loading`, `decoding`.
- Visible `:focus-visible` for every interactive element; no focus removal.
- Touch targets ≥44 px on mobile; cart quantity and close controls enlarged.
- `aria-live="polite"` for cart updates, form errors and status changes; do not add visible copy.
- Reduced motion honored; no autoplay; no keyboard traps.
- Avoid new skip-link copy because the brief forbids extra visible text; use semantic landmarks and correct heading order instead. If the user wants a visible-on-focus skip link, it can be added only with approval.

---

## 5. Page-by-page redesign specification

Every page below keeps its current component tree, keys, settings, links, buttons and conditional logic unless explicitly listed as a bug fix. “Restyle” means class/CSS/markup-level visual changes, not content changes.

### 5.1 Global shell

**Header**
- Sticky parchment header with a 1 px gold-tinted bottom border and subtle warm shadow after content begins (CSS only).
- Logo: walnut circular mark + serif wordmark; keep `brandTitle`/`brandSubtitle` settings and existing `title` attributes.
- Desktop nav: existing items and icons; active state = walnut text + gold underline. Keep the category dropdown, but constrain it to viewport and make it keyboard accessible.
- Search: existing form/label/id/query behavior; 44 px height, clear focus ring, submit icon remains labelled.
- Right actions: language pill, cart button, mobile menu. Preserve pill geometry/behavior exactly; migrate its inline styling to CSS classes without changing appearance.
- Mobile drawer: 340 px max/86vw, sticky header/footer, safe-area padding, 44 px rows. Add `body.menu-open`/`html.menu-open` scroll lock with a reference-counted helper shared with the cart drawer; remove on close/unmount. Preserve backdrop click/Escape close.
- Fix any existing duplicate/empty attributes only where they do not alter content.

**Footer**
- Deep espresso background with a restrained CSS grain gradient, parchment text, gold section labels.
- Keep all columns/links/contact rows/social links and their conditional rendering. Keep map/WhatsApp/phone targets and add `rel="noopener noreferrer"` where missing.
- Policy/copyright row remains; no new newsletter, trust badges, or legal copy.

**Floating contact / PWA install**
- WhatsApp button 56 px, safe-area aware, with label; offset above the PWA banner and checkout sticky CTA.
- PWA banner: compact warm card, existing install/dismiss text and buttons, `role="region"`/labelled, close 44 px, no overlap.
- Lazy-load the install banner and modals where it does not affect first paint or SEO.

**Cart drawer**
- 420 px right drawer on desktop, full-width sheet on mobile; sticky header/footer; item image 72 px; quantity stepper 44 px; remove button 44 px; subtotal/discount/shipping/total preserved.
- Preserve close, backdrop, route-change close, empty state, checkout link; add focus trap/restore and `aria-live` for quantity changes.
- Keep `body.menu-open`; coordinate with mobile menu to avoid double-unlock.

### 5.2 Home (`/`)

Order and content are unchanged:

1. **Banner:** full-bleed image inside a warm framed container; 16:9 desktop / 4:3 mobile crop; no overlay copy; preserve `home_banner_image` and alt key. Use responsive `<picture>` with WebP/AVIF and a JPEG fallback; `fetchpriority="high"`, explicit dimensions; CSS aspect ratio prevents CLS.
2. **Intro:** overlapping parchment panel with existing badge/sparkle, one `<h1>`, paragraph and three feature items. Gold rule and serif headline; no new text.
3. **Categories:** existing grid and `category_card_style` capsule/classic modes. Larger image wells, consistent count/name typography, hover lift; links remain `/search?category=...`.
4. **Featured world map:** two-column editorial panel above 860 px, stacked below. Left: product image and existing custom-map highlights. Right: category, title, rating chip, stock chip, size/color selectors, price, CTA, description/clamped text, highlight chips and actions. Replace JS height synchronization with CSS grid stretch; keep the 860 px content order and the same conditional stock/CTA logic. Remove layout-thrashing `resize` measurement; keep only the description overflow fade if it can be measured cheaply.
5. **Why choose us:** preserve both display modes (`paragraph` rich HTML and cards). Editorial prose width, gold rule, four existing feature cards; sanitizer output restyled, no new claims.
6. **Top selling:** existing heading/subtitle and 1–4 product grid; cards fill the container instead of capping at 255 px.
7. **How to order:** four existing steps and CTA. Fix only the broken `/catalog` href to `/products` (pending approval). Restyle as a numbered atelier process with a connecting rule.
8. **Reviews:** existing rating badge, review cards, verified-buyer labels and trust items; preserve any slider behavior and arrows/dots, keyboard support, no autoplay.
9. **FAQ:** existing accordion/details, questions/answers, WhatsApp CTA. Warm cards, 44 px toggles, one-open-at-a-time behavior preserved if present.
10. **Custom map modal:** existing form fields, upload, validation, success/error copy; responsive modal, 16 px inputs, focus trap, no new fields.

**PWA install banner** appears where it currently does, with safe-area positioning.

### 5.3 Products list (`/products`)

- Keep the existing toolbar/filter/sort/exclusive section/grid/pagination and all query-param behavior.
- Change the existing toolbar title from `<h2>` to `<h1>` (same text), preserving the count/result metadata.
- Fluid grid: 1/2/3/4 columns at 360/640/1024/1280; max-width 1280; consistent 14 px radius and 4:3 image wells.
- Skeleton/loading and empty states restyled only. Pagination targets 44 px.
- Canonical base `/products`; page > 1 self-canonical; filter/sort URLs canonicalize to the clean base (pending SEO approval).
- Keep exclusive-card conditional logic and links.

### 5.4 Product detail (`/products/[slug]`)

- Breadcrumbs → gallery → info sidebar → tabs → warning/guarantee cards → similar products → review modal.
- Gallery: 4:3 main well, thumbnails 64–72 px, keyboard/button accessible; preserve fallback image and selected-image logic; explicit dimensions.
- Info sidebar: category eyebrow, one `<h1>` (product name), rating, stock, price/discount, size/color selectors, quantity (44 px), add-to-cart and buy-now, tax note, trust badges. Sticky only on wide screens with `top` offset below header.
- Tabs: preserve labels/panels and all rich text; accessible tablist with arrow-key support; responsive horizontal scroll rather than wrapping into unreadable rows.
- Warning/guarantee cards: move `ProductWarningCard` inline `<style>` into `product-details.css`; preserve exact warning copy/icon/conditions.
- Similar products: existing cards, 1/2/3/4 grid.
- Review flow: preserve order-number/phone/token requirements, validation, success/error text and modal behavior; add focus trap/aria-live and 16 px inputs.
- Fix metadata title double-suffix and JSON-LD escaping; no visible change.

### 5.5 Search (`/search`)

- Keep two-column sidebar + results above 1024 px; mobile filter drawer/accordion at ≤1023 with a 44 px filter trigger.
- Add a **visually hidden** `<h1>` using the existing search label key; no visible new text. Existing results count/heading stays.
- Preserve all filter groups, price slider, color/size/category, sort, reset, query params and no-results state.
- Result cards follow the new ProductCard; grid 1/2/3 columns.
- Loading skeletons and empty state restyled; reset link remains.
- Metadata: `noindex, follow`, self canonical `/search`; all query/filter variants share the noindex policy. Do not add search pages to sitemap.

### 5.6 Cart (`/cart`)

- Existing header/empty state/items list/summary sidebar. Desktop 2-column with sticky summary; mobile stacked with summary after items.
- Item rows: image 88 px, name/variant/colour, unit price, 44 px quantity stepper, remove, line total.
- Preserve promo code, totals, shipping note, checkout CTA and all conditional empty/loading states.
- Add `aria-live` for quantity/cart total changes; keep `body.menu-open` coordination with the drawer.
- `noindex`; no-store; no cart data in service worker.

### 5.7 Checkout (`/checkout`)

- Keep existing header, delivery form, payment section, order summary and place-order flow; no new stepper/fields.
- Two-column layout at ≥1024: form left, sticky summary right; stacked mobile. Surface panels warm white with gold section rules.
- Delivery form: all existing labels/placeholders/required rules. Add `autocomplete` (`name`, `tel`, `email`, `street-address`, `address-level2`, `postal-code`), `inputmode` (`tel`, `email`, `numeric`), `maxLength`, 16 px mobile font, `aria-describedby` for hints/errors, and an error summary that focuses the first invalid field.
- Payment: preserve COD/bKash availability logic, disabled reasons, fee/total calculations and settings. Disable the submit button during submission (already present; retain).
- Promo: preserve input/apply/remove/error and applied discount display.
- Policy checkbox: preserve required validation and both link texts. Fix `/privacy-policy` → `/privacy` (pending approval) and add `rel="noopener noreferrer"` to policy links.
- bKash: validate `bkashURL` before navigation: HTTPS and hostname on an approved bKash allowlist, otherwise show the existing error state; do not add new copy.
- `noindex`, `no-store`.

### 5.8 Order confirmation (`/order/confirmation`, `/order/confirmation/[number]`)

- Preserve auth gate, hero header, actions row, receipt table, delivery info, totals and all conditional states.
- Change the auth-card `<h2>` to `<h1>` (same text) so the page has one heading in every state. Do not render a second h1 when the order hero is visible.
- Receipt: semantic table, tabular numerals, mobile horizontal scroll, print styles that preserve content.
- Actions: track order, print/invoice (existing), WhatsApp/support links; add rel where blank.
- Scrub `token`/`phone` from the address bar after the page reads them, keep the values in existing client state/session; no visual change. `noindex`, `no-store`.

### 5.9 Track (`/track`)

- Keep the hero form (order number/phone/token), order header, timeline, items manifest, delivery/billing info, support bar and review modal.
- Hero: warm panel, clear labels, 16 px inputs, submit disabled only when current logic disables it; preserve validation and error messages.
- Timeline: existing steps/statuses/icons; accessible ordered list, current-step emphasis, no new statuses.
- Items manifest: item rows/images, 44 px actions, responsive stacking.
- Review modal: preserve token/phone requirements and all labels; focus trap, aria-live, no new copy.
- Links generated with `token`/`phone` will be scrubbed from the URL after read and will rely on the existing order session; if session is absent, the current form/entry path remains. `noindex`, `no-store`.

### 5.10 Payment (`/payment/bkash/simulator`, `/payment/bkash/status/[orderNumber]`)

- **Simulator:** preserve bKash visual identity and all hardcoded visible text/buttons/status copy exactly. Only responsive spacing, 44 px controls, safe-area and accessible labels; do not rebrand it as StoreForge.
- **Status:** restyle the existing card/status/actions to the storefront shell while preserving exact wording, status logic, retry/return links and bKash flow. Validate the retry `bkashURL` with the same allowlist as checkout.
- `noindex`, `no-store`; never cache payment responses.

### 5.11 Policy pages (`/privacy`, `/terms`, `/return-policy`)

- Preserve existing PolicyView layout: content panel + policy nav + contact card; no new table of contents or legal copy.
- Editorial reading width ~72ch, serif h2/h3, comfortable paragraph spacing, warm callout blocks for existing content, sticky sidebar on desktop, stacked on mobile.
- Rich text from settings continues through the new strict sanitizer; HTML/markdown branch behavior preserved. Existing default text is unchanged.
- Unique metadata from `policy_*_title`/`policy_*_sub` settings, self canonical, index/follow.
- Policy links in footer/checkout remain; fix only the broken checkout target.

### 5.12 404

- Preserve the existing compass/visual, `not_found_title`/`not_found_desc`, and popular links (Home, Products, Track, Search).
- Center the card, add a restrained gold rule and hover states; no new joke copy or search box.
- Export route-specific `noindex` metadata via a server `not-found.tsx` wrapper while keeping `NotFoundCard` client-side.

### 5.13 PWA / offline

- Manifest: one linked `/manifest.webmanifest`; keep `/manifest.json` as an alias for existing installs. One theme-color, one viewport, correct icons/sizes/purpose.
- SW v12: precache only offline page, fallback image, core icons and versioned core CSS; never precache `/`, private pages or query-bearing URLs. Network-first navigation with offline fallback; stale-while-revalidate only for static assets.
- Deny-list: `/checkout`, `/order`, `/track`, `/payment`, `/cart`, `/api`, any URL with a token/phone/email query, non-GET requests, and cross-origin requests.
- Bound cache entries (e.g. 60) and delete old caches on activate. Remove console output. Keep `skipWaiting`/`clients.claim` semantics but avoid forcing reloads.
- `offline.html`: externalize CSS and the reload handler to small static files (or an external JS file), preserve visible text/layout, add accessible button semantics.
- PWA icon proxy: allow only `image/png`, `image/webp`, `image/jpeg`, `image/x-icon`; reject SVG/HTML; fallback to bundled icon. Cap the host/tenant cache map and validate host.

### 5.14 Motion, responsive and print

- Validate 320/360/375/390/414/768/820/860/1024/1280/1440.
- No horizontal scroll; replace `100vw` backdrops with `inset: 0; width: auto`.
- 44 px mobile targets; 16 px inputs; safe-area padding for sticky header/footer/WhatsApp/PWA banner.
- Print styles for confirmation/receipt and policy pages only; hide nav/drawers/CTA.
- Reduced-motion and high-contrast/forced-colors checks.

---

## 6. Content preservation checklist

### 6.1 Inventory by area (union: 422 static keys, 21 dynamic patterns, 98 direct settings keys)

| Area | Files with content | Static `t()` | Dynamic `t()` | Direct settings | Notes |
|---|---:|---:|---:|---:|---|
| Global shell | 7 | 66 | 6 | 34 | Header/Footer/CartDrawer/ProductCard/LanguageToggle/PwaRegister/layout |
| Home | 10 | 66 | 8 | 71 | Includes page metadata, hero, categories, featured map, why-us, best sellers, order guide, reviews, FAQ, custom map |
| Products list | 5 | 22 | 1 | 0 | Toolbar, exclusive, grid, pagination, page |
| Product detail | 9 | 75 | 10 | 2 | Gallery, info, tabs, warning, guarantee, similar, breadcrumbs, review flow |
| Search | 3 | 25 | 2 | 0 | Sidebar, results, page |
| Cart | 4 | 15 | 0 | 0 | Header, empty, items, summary |
| Checkout | 5 | 67 | 0 | 6 | Header, delivery, payment, summary, wrapper |
| Order confirmation | 8 | 33 | 0 | 2 | Auth, hero, actions, receipt, delivery, wrapper |
| Track | 8 | 106 | 0 | 0 | Hero, header, timeline, items, delivery/billing, support, review |
| Policy pages | 1 | 4 | 0 | 2 | PolicyView + dynamic policy settings |
| 404 | 1 | 7 | 0 | 0 | NotFoundCard |

Group counts can overlap where a shared component/key is used by more than one page; the authoritative union is **422 static keys / 21 dynamic patterns / 98 direct settings keys**.

Additionally, **18 dynamic policy settings keys** are required and are not visible to a static `settings.*` grep:

`policy_privacy_title_bn`, `policy_privacy_title_en`, `policy_privacy_sub_bn`, `policy_privacy_sub_en`, `policy_privacy_content_bn`, `policy_privacy_content_en`,
`policy_terms_title_bn`, `policy_terms_title_en`, `policy_terms_sub_bn`, `policy_terms_sub_en`, `policy_terms_content_bn`, `policy_terms_content_en`,
`policy_returns_title_bn`, `policy_returns_title_en`, `policy_returns_sub_bn`, `policy_returns_sub_en`, `policy_returns_content_bn`, `policy_returns_content_en`.

Payment screens contain hardcoded visible copy and **no `t()` keys**; policy default bodies are also hardcoded in `PolicyView` and must not be edited as part of the redesign.

### 6.2 Content rules

- Every key listed in Appendix A must still be called with the same key string and fallback text.
- Every settings field must still be read with the same key and used under the same condition.
- No new visible copy, labels, placeholders, badges, section headings, buttons, links, or fields.
- No removed conditionals: settings feature flags, stock/discount states, payment availability, language precedence, review auth, empty/loading/error states, PWA install states, and page-level auth gates remain.
- Hardcoded text in payment/policy components is frozen; only markup/styles may change.
- The 53 fallback-only keys (not in the dictionary) must keep their exact fallback strings. See Appendix B.
- Settings precedence (e.g. `*_bn`/`*_en`, `store_name`/`site_name`/`site_title`, contact phone/whatsapp fallbacks) and `formatNum`/digit conversion remain unchanged.
- `t()` calls inside dynamic product/FAQ/category keys retain their exact patterns; no key normalization.

### 6.3 Interaction/feature checklist

Header/nav/search/language/cart/menu; category dropdown; home category cards; featured product selectors/CTA/highlights; custom map form/upload/success; why-us mode switch; best-seller add-to-cart; order-guide CTAs; review slider/navigation; FAQ accordion/WhatsApp; product gallery/selectors/quantity/add-to-cart/buy-now; tabs; review submit; similar products; search filters/sort/price/reset/pagination; cart quantity/remove/promo/checkout; checkout fields/payment/promo/policy/place order; confirmation auth/print/track/support; track form/timeline/items/review; bKash simulator/status/retry/return; policy nav/contact; PWA install/dismiss/update; 404 links; image fallback; offline retry.

---

## 7. Fragile-area register

| Area | Risk | Mandatory handling |
|---|---|---|
| CSS `?v=N` cache busting | Browser/CDN serves stale CSS after deploy | Keep public file URLs; bump each changed file version (+1); update every `<link>`; verify 200 + correct content at the new URL |
| `sw.js` cache version | Old HTML/CSS paired with new assets | Bump `sf-storefront-v11` → `sf-storefront-v12`; delete old caches; no private/language-variant HTML caching |
| `/catalog` quirk | Broken home CTA | Change link to `/products` only after approval; do not create a `/catalog` route |
| `WorldMapFeaturedSection` 860 px | Left/right height coupling; description fade | Replace JS measurement with CSS grid; test 820/860/861/1024; keep content order and clamp/fade |
| `body.menu-open` | Mobile menu scroll lock; cart drawer shares it | Add reference-counted lock helper; test menu → cart → close sequences; never leave body locked |
| Language pill | Large inline style block; geometry/behavior fragile | Preserve DOM/behavior; move styles to CSS class-by-class; test BN/EN at 320–1440 |
| Sliders/reviews | Autoplay/arrows/dots/keyboard | Preserve existing behavior; no autoplay additions; keyboard and reduced-motion checks |
| Drawers/modals | Focus/scroll/backdrop | Shared focus trap/restore; Escape; aria-modal; no body scroll |
| Image fallback | Global capture listener | Keep `data-fallback-applied`; test broken/admin URLs; no loops |
| PWA install/update | Banner overlap; stale SW | Safe-area offset; version bump; no forced reload |
| `next-env.d.ts` | Generated by Next; not a source edit | Do not hand-edit; report tool-generated diff |
| Route-level CSS | Missing page styles if a class is shared | Map shared classes; keep product/global CSS core; test every page; fallback to global link if regressions |
| CSP | Blocks Next/inline styles/scripts | Nonce via proxy; externalize custom `<style>`; `style-src-attr` exception; test HTML/headers; report-only option if no browser |
| Admin token removal | A hidden storefront feature might rely on admin auth | Inventory all `fetchApi` calls; only public endpoints; test every data page as logged-out customer |
| `images.unoptimized` | Next image config assumptions | Use `<picture>`/`srcset` and public assets; do not enable Next image optimization in this phase |
| `force-dynamic` | Caching changes could go stale | Public reads max 30 s; private no-store; verify admin edits ≤60 s |
| No git | Can't prove scope with diff | Baseline manifest comparison + final changed-file list + explicit no-git note |

---

## 8. Implementation plan for Phase 2

Phase 2 is split into verifiable slices. Each slice ends with a build and a focused check; no slice may change API/key/route shapes.

### 2A — Security foundations (no visual redesign)

1. Replace `src/lib/sanitizeHtml.ts` with a strict allow-list tokenizer/serializer (or approved library):
   - allow `p, br, strong, b, em, i, u, s, ul, ol, li, blockquote, h2–h6, a, table, thead, tbody, tfoot, tr, th, td, caption, hr, code, pre, span`;
   - map `h1` → `h2`; drop all unknown tags and all attributes except `href`, `title`, `colspan`, `rowspan`, `scope`;
   - URL allowlist `http:`, `https:`, `mailto:`, `tel:`, same-origin path; reject protocol-relative, `data:`, `javascript:`, control characters and entity-encoded schemes;
   - force `rel="noopener noreferrer"` on `_blank`; drop `_top`/`_parent`/named targets; escape all text and attributes.
2. Harden URL/SEO helpers (`seo.ts`, `urls.ts`): validate http/https, hostnames, ports, credentials; trusted configured site URL; header trust only for validated/allowlisted hosts; no empty production canonical.
3. Remove storefront admin-token logic from `api.ts`: no `sf_admin_token`/`sf_admin_user`, no Authorization, no `/admin` redirect; same-origin relative API paths only; don't set JSON `Content-Type` for `FormData`; keep existing error message shape.
4. Remove `NEXT_PUBLIC_ADMIN_URL` from the client env surface unless still required server-side; verify no admin/internal URL or token is in `.next/static`.
5. Add security headers in `next.config.mjs` and nonce CSP in `proxy.ts`; private-route `Cache-Control: no-store`; `Vary: Cookie` for language variants; HSTS production-only.
6. Validate bKash redirect URLs against an allowlist; keep the existing error/ledger behavior.
7. Harden PWA icon content type/cache and SW v12 deny-list/cap; externalize offline CSS/JS.
8. Escape JSON-LD (`<` → `\u003c`) and add nonce to inline JSON-LD scripts.
9. Remove client `console.*` and SW debug logs; keep only safe server-side error logging if needed.

**Exit check:** build passes; sanitizer payload corpus passes; curl confirms headers/nonce; canonical spoof test fails safely; `grep` finds no `sf_admin_token`/admin URL/internal token in client assets; checkout/track/payment still work.

### 2B — SEO/head/metadata (minimal visible change)

1. Refactor root `layout.tsx`: one viewport, one theme-color, one manifest link, metadata title template, no inherited canonical/robots; dynamic `lang`/`og:locale` from cookie; remove duplicate manual head tags.
2. Add route-level `generateMetadata`/`layout.tsx` for products, search, cart, checkout, track, confirmation, payment, policies and 404 with unique titles/descriptions, canonical, OG/Twitter and robots.
3. Fix product title suffix; add product canonical/OG image dimensions and escaped Product/Breadcrumb JSON-LD; add Store/WebSite/SearchAction/FAQ structured data where content exists.
4. Add missing `<h1>` semantics (products toolbar, hidden search h1, confirmation auth card, not-found wrapper); preserve visible text.
5. Sitemap: only indexable public routes (home, products, product pages, policies); remove `/track` and category search URLs; use real `lastModified`; revalidate 1 h.
6. Robots: disallow private/admin/API/checkout/cart/order/payment/track; keep `/search` crawlable so `noindex` is honored; sitemap URL trusted.
7. Add noindex to search/filter, cart, checkout, track, confirmation, payment and 404; canonical self/base as specified.
8. Verify one title/canonical/description per route, one h1, no duplicate head tags, correct `html lang` in BN/EN, and parseable JSON-LD.

**Exit check:** metadata matrix for all routes; JSON-LD parse test; sitemap/robots URL checks; h1 count; HTML lang switch.

### 2C — Design tokens and global shell

1. Extend `globals.css` tokens (colors/type/spacing/radius/shadow/focus/motion) and base controls.
2. Restyle Header, Footer, CartDrawer, FloatingContact, PWA banner, ProductCard, ExclusiveProductCard, LanguageToggle.
3. Move `LanguageToggle` inline `<style>` and static inline styles into CSS; preserve the pill exactly; keep dynamic styles only where needed.
4. Add shared focus trap/scroll-lock/aria helpers (small internal utilities, no dependency); fix mobile menu scroll lock.
5. Bump `globals.css`, `icons.css`, `header-footer.css`, `products.css` versions; dedupe `icons.css` mask declarations conservatively.

### 2D — Home, catalog, product detail, search

1. Home sections and custom-map modal per §5.2; remove WorldMap height JS in favor of grid; responsive image hero.
2. Products toolbar/grid/pagination and product detail gallery/info/tabs/warning/guarantee/similar.
3. Search filters/results/mobile filter behavior.
4. Fix `/catalog` link (approved) and all image dimensions/lazy/alt gaps in these pages.
5. Bump `home.css`, `products.css`, `product-details.css`, `search.css`.

### 2E — Cart, checkout, confirmation, track, payment, policy, 404

1. Cart/drawer and checkout form/payment/summary, including autocomplete/inputmode/maxLength/16 px inputs and double-submit protection.
2. Fix `/privacy-policy` link and blank-target rels.
3. Confirmation/auth/print, track/timeline/review modal.
4. Payment/policy/404 restyle without copy changes.
5. Bump `cart.css`, `checkout.css`, `confirmation.css`, `track.css`, `payment.css`, `policy.css`.

### 2F — Performance, caching, cleanup, verification

1. Route-level CSS links (core: globals/icons/header-footer/products; add home/details/search/cart/checkout/confirmation/track/payment/policy where needed), keeping `?v` and a fallback to global loading if a regression appears.
2. Generate responsive hero/OG images with transitive `sharp`; add `<picture>`/srcset/sizes, dimensions, `loading`/`decoding`, `fetchpriority` for LCP only.
3. Add 30 s server read caching/dedupe for public settings/categories/dictionary/home/product/catalog; remove duplicate `SettingsProvider` mount fetch when SSR data exists; keep private no-store.
4. Lazy-load only clearly conditional heavy UI (`CustomMapModal`, `TrackReviewModal`, PWA banner) if bundle measurement justifies it.
5. Remove remaining debug output, dead inline styles and unused imports; do not mass-remove `!important` without per-page verification.
6. Optional production Dockerfile: multi-stage `next build`/`next start`, non-root user, `NEXT_TELEMETRY_DISABLED=1`; only if approved. Current Dockerfile runs `next dev`.

---

## 9. Verification plan (Phase 3)

### 9.1 Build and scope

- `npm run build`; `npx tsc --noEmit` (if available); start production server.
- Run the content-inventory script before/after; diff keys/settings: **0 missing, 0 changed**.
- Verify translation dictionary file is untouched; compare every fallback string for the 53 fallback-only keys.
- Compare the final file manifest to `/tmp/sf_baseline_manifest.txt`; list every changed/added file with absolute paths; confirm none outside `frontend/`.
- Report that git is unavailable and that Next generated `next-env.d.ts`/`.next` changes are tooling-only.
- `npm audit --omit=dev` remains 0; record full-audit dev-only findings.

### 9.2 Route/metadata matrix

Check `/`, `/products`, `/products/3d-wooden-world-map`, `/search`, `/search?q=...`, `/search?category=...`, `/cart`, `/checkout`, `/track`, `/track?order=...`, `/order/confirmation`, `/order/confirmation/WM...`, `/privacy`, `/terms`, `/return-policy`, `/payment/bkash/simulator`, `/payment/bkash/status/WM...`, `/does-not-exist`.

For each: status, one `<h1>`, unique title/description, canonical, robots, OG/Twitter, JSON-LD parse, no duplicate viewport/manifest/theme-color, correct `html lang`, no `noindex` on public policy/product pages.

### 9.3 Responsive/language/interaction

- Breakpoints: 320, 360, 375, 390, 414, 768, 820, 860, 1024, 1280, 1440; portrait/landscape; no horizontal scroll; safe-area.
- BN and EN via cookie; check `html lang`, language pill geometry, fallback text, digit conversion, settings precedence, no mixed-language flashes.
- Interactions: header search, category dropdown, mobile drawer + scroll lock, cart drawer, language switch, home selectors/CTAs, custom-map upload, review slider, FAQ, gallery/thumbnails, add-to-cart, tabs, review form, search filters/slider/sort/reset/pagination, cart qty/remove/promo, checkout validation/payment/promo/place order, confirmation auth/print, track lookup/review, bKash retry/return, PWA install/dismiss, offline retry, 404 links.
- Keyboard-only pass and focus visibility; Escape/backdrop; focus restore; reduced-motion.

### 9.4 Security checks

- `curl -I` for CSP/HSTS (prod)/XFO/COOP/nosniff/Referrer/Permissions/private cache/Vary.
- Canonical spoof: `x-forwarded-host: evil.example` must not appear; try credentials/port/newline/encoded hosts.
- CSP nonce present on inline scripts; no CSP console violations if a browser is available.
- Sanitizer corpus (script/img/svg/math/mXSS/encoded schemes/form/style/iframe/target) yields no executable markup; policy/product tabs still render.
- bKash redirect allowlist rejects `javascript:`, `//evil`, `https://evil.example`, credentials, and non-allowlisted hosts.
- PWA icon rejects SVG/HTML and never serves inline markup.
- `grep` client build for `sf_admin_token`, `sf_admin_user`, admin URL, backend URL, `INTERNAL_MICROSERVICE_TOKEN`, `JWT_SECRET`, debug logs.
- SW cache inspection: private routes/query tokens absent; old cache deleted; cache cap.
- localStorage inventory: only cart/lang/public settings remain; no order PII/token beyond approved order session; URL token scrub verified.
- Form attributes and double-submit behavior; no open redirects; all `_blank` links have rel.

### 9.5 SEO checks

- Titles unique and not double-suffixed; canonicals resolve; no canonical `/` on non-home routes.
- `/products`, `/search`, `/order/confirmation` each have one h1.
- `/search*`, cart, checkout, track, confirmation, payment are `noindex`; policies/products are indexable.
- Sitemap URLs return 200 and are indexable; `/track`/category search absent; robots has no sitemap/private mistakes.
- JSON-LD valid (script breakout test with `</script>` in product/settings strings).
- `html lang` and `og:locale` switch BN/EN; no hreflang unless language URLs are approved.
- 404 noindex and one h1.

### 9.6 Performance checks

- Build sizes, first-load JS by route, public CSS raw/gzip, home stylesheet count.
- Home asset transfer with `curl --compressed`: HTML/CSS/JS; hero image bytes/format/dimensions; `srcset` selection.
- Image audit: all `<img>` have dimensions; below-fold lazy; LCP eager/high priority.
- TTFB with repeated requests; verify 30 s cache behavior and admin update visibility ≤60 s.
- Confirm no layout-thrash resize handlers (WorldMap), no CLS from hero/gallery, no `100vw` overflow.
- Lighthouse/browser cannot run in this environment; if the user can provide Chrome or approve a Playwright install, run Lighthouse/axe/visual screenshots in Phase 3. Otherwise report the limitation and use static/build/curl evidence.

### 9.7 PWA/offline

- Manifest linked once; `/manifest.json` alias still 200; icons valid sizes/purpose.
- SW registers, updates from v11→v12, clears old cache, offline page loads; home offline does not show wrong language; private routes absent.
- Offline page works under CSP; retry button accessible.
- PWA install/dismiss works; banner does not overlap WhatsApp/CTAs.

---

## 10. Decisions and questions requiring approval

Recommended defaults are listed first. If the plan is approved as written, I will use these defaults. Any change to the defaults needs an explicit answer.

1. **Sanitizer**
   - **Recommended:** in-house allow-list tokenizer/serializer, no dependency, shared by server/client, with the payload corpus and tests above.
   - Alternative: add `sanitize-html` + a client sanitizer (`dompurify`), which is battle-tested but adds dependencies, bundle weight and SSR complexity.
   - **Question: approve the in-house sanitizer, or approve the dependency?**

2. **Storefront admin-token removal**
   - Remove `getAdminToken`, `setCachedAdminToken`, `sf_admin_token`, `sf_admin_user`, `Authorization` attachment and `/admin/login` redirect from the storefront.
   - **Question: approve?** (No admin feature is intentionally exposed in the storefront.)

3. **Public-read caching**
   - **Recommended:** 30 s revalidate for settings/categories/dictionary/home/product/catalog server reads; React `cache()` request dedupe; private no-store; sitemap 1 h.
   - **Question: approve 30 s freshness?** This keeps admin changes within 30–60 s, as required, but not instant on every request.

4. **Canonical/site URL trust**
   - **Recommended:** use `FRONTEND_URL`/`NEXT_PUBLIC_STORE_URL` as the canonical origin in production; validate request host only if it matches the configured host/allowlist; ignore `x-forwarded-host` spoofing; require env in production.
   - **Question:** is there more than one legitimate customer domain (multi-domain canonical), or should one configured domain always win? If multiple, provide the allowlist.

5. **Search/category SEO**
   - **Recommended:** `noindex, follow` on all `/search*`; remove category `/search?category=` URLs from the sitemap; keep `/search` crawlable so the noindex is visible; do not disallow `/search` in robots.
   - **Question: approve?** This deliberately gives up indexing of category-filter result pages.

6. **Token/phone URLs and order session**
   - **Recommended:** scrub `token`/`phone` from the URL after read; rely on the existing order session for refresh; keep the current order-session behavior unless approved to shorten it. Proposal: reduce token lifetime from 7 days to 24 h, keep order-number/session convenience for 7 days.
   - **Question: approve URL scrubbing and the 24 h token lifetime, or keep 7 days?**

7. **Broken links**
   - `/catalog` → `/products` in the home order guide.
   - `/privacy-policy` → `/privacy` in checkout.
   - **Question: approve these two href-only fixes?**

8. **bKash redirect allowlist**
   - **Recommended:** HTTPS only; allow `*.bkash.com` and `*.bka.sh` (including sandbox hosts) plus the same-origin callback; reject everything else with the existing error state.
   - **Question: confirm the allowed domains**, or restrict to same-origin only?

9. **CSP / styles / HSTS**
   - **Recommended CSP:** nonce-based scripts (Next), `style-src 'self' 'nonce-...'`, `style-src-attr 'unsafe-inline'` for the remaining dynamic style attributes, `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `img-src 'self' data: blob: https:`, `connect-src 'self'`, `worker-src 'self' blob:`.
   - HSTS: `max-age=63072000; includeSubDomains` in production; no `preload` initially.
   - **Questions:** approve the `style-src-attr` exception? Approve HSTS includeSubDomains? Should CSP start as Report-Only for one deploy because no browser is available here?
   - Note: without a browser in this environment, enforcing CSP can still be statically verified, but a real console check is strongly recommended. If you can provide Chrome or approve Playwright in Phase 3, I will test violations.

10. **Fonts**
    - **Recommended:** remove unused `Inter`/`Cinzel` references and use the system-first + Bangla-capable stack above; no external font downloads.
    - **Question:** approve, or self-host licensed WOFF2 files? Self-hosting needs font files/licensing and adds assets.

11. **Production Dockerfile**
    - Current `frontend/Dockerfile` runs `next dev`. **Proposed:** multi-stage build with `next build`/`next start`, non-root user, telemetry off, healthcheck. This is inside `frontend/` and optional.
    - **Question: include this in Phase 2F?**

12. **Dev-only npm audit findings**
    - 5 high findings are dev-only via Tailwind 3; the only fix is a breaking Tailwind 4 upgrade. **Recommended:** defer the major upgrade; keep `npm audit --omit=dev` at 0; document it.
    - **Question: approve deferral?**

13. **hreflang / bilingual SEO**
    - Cookie-only language switching cannot support valid hreflang. **Recommended:** do not add fake hreflang; fix `html lang` and `og:locale` only. Future option: add crawlable `?lang=en`/`/en` URLs, which would require route/param approval.
    - **Question:** is bilingual indexing a goal that justifies language-specific URLs later?

14. **Browser-based visual QA**
    - No Chrome/Lighthouse/Playwright is available. Static/build/curl checks will be done regardless.
    - **Question:** can you provide a browser environment or approve installing Playwright/Chromium for Phase 3 screenshots, Lighthouse and axe checks? This is a verification dependency, not a storefront runtime dependency.

15. **New visible skip link**
    - The brief forbids extra visible text. **Recommended:** no new skip link; use landmarks and heading order.
    - **Question:** if you want a visible-on-focus skip link for accessibility, approve that one exception.

---

## 11. Approval gate

**No Phase 2 source edit will begin until you explicitly approve.** Please reply with either:

- **“Approve the plan as written”** — I will use every recommended default above, including the in-house sanitizer and 30 s caching; or
- a list of changed decisions (for example: “add sanitize-html”, “keep 7-day session”, “only same-origin bKash”, “no Dockerfile”, “skip noindex for categories”).

After approval I will implement in the 2A → 2F order, verify the full matrix, and report the exact changed files under `frontend/` plus the no-git manifest comparison.

---

## Appendix A — Generated content inventory (page → component → every static/dynamic `t()` and `settings.*`)

Generated from the baseline source. Policy content keys are dynamic and are listed separately in §6.1. Payment hardcoded copy is intentionally not in this inventory.


### 404

- `/app/not-found/NotFoundCard.tsx`
  - t(): `nav_all_products`, `nav_home`, `nav_track`, `not_found_desc`, `not_found_title`, `popular_links`, `search_catalog`

### Home

- `/app/CategoryGridSection.tsx`
  - t(): `home_categories_sub`, `home_categories_title`, `home_category_items`
  - dynamic t(): `t(category.${cat.slug}.name)`, `t(category_${cat.slug})`
- `/app/CustomerReviewsSection.tsx`
  - t(): `home_reviews_rating_badge`, `home_reviews_sub`, `home_reviews_title`, `review_verified_buyer`, `trust_cod_inspect`, `trust_cod_inspect_sub`, `trust_real_reviews`, `trust_real_reviews_sub`, `trust_replacement`, `trust_replacement_sub`
- `/app/FaqSection.tsx`
  - t(): `faq_more_questions`, `faq_more_questions_sub`, `home_faq_badge`, `home_faq_sub`, `home_faq_title`, `whatsapp_inquiry_msg`
  - dynamic t(): `t(faq.${faq.id}.answer)`, `t(faq.${faq.id}.answer_en)`, `t(faq.${faq.id}.question)`, `t(faq.${faq.id}.question_en)`
  - settings: `contact_phone`, `contact_whatsapp`, `phone`, `whatsapp`
- `/app/HeroBannerSection.tsx`
  - t(): `home_banner_alt`, `home_banner_label`, `home_feat_1`, `home_feat_2`, `home_feat_3`, `home_headline`, `home_intro_badge`, `home_intro_label`, `home_intro_message`
  - settings: `home_banner_image`, `home_headline`, `home_intro_message`
- `/app/HowToOrderSection.tsx`
  - t(): `guide_step_1_desc`, `guide_step_1_title`, `guide_step_2_desc`, `guide_step_2_title`, `guide_step_3_desc`, `guide_step_3_title`, `guide_step_4_desc`, `guide_step_4_title`, `home_order_call_btn`, `home_order_guide_badge`, `home_order_guide_sub`, `home_order_guide_title`, `home_order_now_cta`
  - settings: `contact_phone`
- `/app/TopSellingProductsSection.tsx`
  - t(): `home_best_sellers_sub`, `home_best_sellers_title`
- `/app/WhyUsSection.tsx`
  - t(): `why_feat_1_desc`, `why_feat_1_title`, `why_feat_2_desc`, `why_feat_2_title`, `why_feat_3_desc`, `why_feat_3_title`, `why_feat_4_desc`, `why_feat_4_title`, `why_us_badge`, `why_us_sub`, `why_us_title`
  - settings: `why_us_badge_bn`, `why_us_badge_en`, `why_us_cards_json`, `why_us_display_mode`, `why_us_paragraph_bn`, `why_us_paragraph_en`, `why_us_sub_bn`, `why_us_sub_en`, `why_us_title_bn`, `why_us_title_en`
- `/app/WorldMapFeaturedSection.tsx`
  - t(): `artisan_craftsmanship_badge`, `custom_map_badge`, `custom_map_banner_btn`, `custom_map_banner_sub`, `custom_map_banner_title`, `featured_product_rating_chip`, `featured_product_stock_chip`, `home_featured_buy_now`, `home_featured_title`, `home_featured_view_details`, `product_select_color_label`, `product_select_size_label`
  - dynamic t(): `t(product_${featuredProduct.id}_name)`
  - settings: `custom_map_banner_btn`, `custom_map_banner_btn_bn`, `custom_map_banner_btn_en`, `custom_map_banner_sub`, `custom_map_banner_sub_bn`, `custom_map_banner_sub_en`, `custom_map_banner_title`, `custom_map_banner_title_bn`, `custom_map_banner_title_en`, `featured_product_badge`, `featured_product_badge_bn`, `featured_product_badge_en`, `featured_product_btn_buy`, `featured_product_btn_buy_bn`, `featured_product_btn_buy_en`, `featured_product_btn_view`, `featured_product_btn_view_bn`, `featured_product_btn_view_en`, `featured_product_description`, `featured_product_description_bn`, `featured_product_description_en`, `featured_product_enabled`, `featured_product_highlights`, `featured_product_highlights_bn`, `featured_product_highlights_en`, `featured_product_image`, `featured_product_price_note`, `featured_product_price_note_bn`, `featured_product_price_note_en`, `featured_product_section_sub`, `featured_product_section_sub_bn`, `featured_product_section_sub_en`, `featured_product_section_subtitle`, `featured_product_section_title`, `featured_product_section_title_bn`, `featured_product_section_title_en`, `featured_product_tagline`, `featured_product_tagline_bn`, `featured_product_tagline_en`, `featured_product_title`, `featured_product_title_bn`, `featured_product_title_en`
- `/app/page.tsx`
  - settings: `home_banner_image`, `meta_description`, `site_description`, `site_name`, `site_subtitle`, `site_title`, `store_favicon_url`, `store_logo_url`, `store_name`, `store_og_image`, `store_tagline`, `store_tagline_en`
- `/app/wrapper.tsx`
  - dynamic t(): `t(product_${prod.id}_name)`
  - settings: `category_card_style`

### Cart

- `/app/cart/CartEmptyState.tsx`
  - t(): `cart_empty_body`, `cart_empty_title`, `home_browse`
- `/app/cart/CartHeader.tsx`
  - t(): `cart_eyebrow`, `cart_items_suffix`, `cart_title`
- `/app/cart/CartItemsList.tsx`
  - t(): `cart_each`, `cart_remove`, `order_label_quantity`
- `/app/cart/CartSummarySidebar.tsx`
  - t(): `cart_calc_at_checkout`, `cart_proceed_checkout`, `order_delivery_charge`, `order_subtotal`, `order_summary_title`, `order_total_payable`

### Checkout

- `/app/checkout/CheckoutDeliveryForm.tsx`
  - t(): `checkout_home_delivery_badge`, `checkout_policy_agree_prefix`, `checkout_policy_agree_suffix`, `common_and`, `order_delivery_dhaka_eta`, `order_delivery_outside_eta`, `order_help_phone`, `order_label_address`, `order_label_area`, `order_label_fullname`, `order_label_location`, `order_label_note`, `order_label_phone`, `order_opt_dhaka`, `order_opt_outside`, `order_phone_digits_hint`, `order_placeholder_address`, `order_placeholder_area`, `order_placeholder_name`, `order_placeholder_note`, `order_placeholder_phone`, `order_sec_delivery_info`, `policy_privacy_title`, `policy_returns_title`, `policy_terms_title`
- `/app/checkout/CheckoutHeader.tsx`
  - t(): `cart_title`, `checkout_back_store`, `checkout_badge_secure`, `checkout_breadcrumb`, `checkout_step_cart`, `checkout_step_confirm`, `checkout_step_info_payment`, `checkout_subtitle`, `checkout_title`
- `/app/checkout/CheckoutOrderSummary.tsx`
  - t(): `cart_edit_btn`, `checkout_guarantee_1`, `checkout_guarantee_2`, `checkout_guarantee_3`, `checkout_promo_placeholder`, `items_count_label`, `order_delivery_charge`, `order_opt_dhaka`, `order_opt_outside`, `order_promo_discount`, `order_subtotal`, `order_summary_title`, `order_total_payable`, `product_save_badge`, `promo_apply_btn`, `promo_flat_discount`, `promo_saved_text`, `remove`
- `/app/checkout/CheckoutPaymentSection.tsx`
  - t(): `checkout_instant_confirm`, `checkout_secure_badge`, `order_bkash_desc`, `order_cod_desc`, `order_payment_bkash`, `order_payment_cod`, `order_sec_payment_method`, `sort_popular`
  - settings: `payment_bkash_instructions`, `payment_cod_instructions`
- `/app/checkout/wrapper.tsx`
  - t(): `cart_empty_title`, `checkout_encryption_note`, `form_required_error`, `order_btn_confirm`, `order_processing`, `payment_all_disabled_error`, `payment_bkash_disabled_error`, `payment_cod_disabled_error`, `policy_acceptance_required_error`
  - settings: `delivery_charge_dhaka`, `delivery_charge_outside`, `payment_bkash_enabled`, `payment_cod_enabled`

### Global shell & components

- `/app/layout.tsx`
  - settings: `home_banner_image`, `meta_description`, `site_description`, `site_name`, `site_subtitle`, `site_title`, `store_banner_image`, `store_favicon_url`, `store_name`, `store_og_image`, `store_tagline`, `store_tagline_en`
- `/components/CartDrawer.tsx`
  - t(): `cart_empty_desc`, `cart_empty_title`, `cart_proceed_checkout`, `cart_return_to_checkout`, `cart_start_shopping`, `close`, `continue_shopping`, `items_count_label`, `nav_cart`, `order_subtotal`, `remove`
- `/components/ExclusiveProductCard.tsx`
  - t(): `badge_exclusive`, `catalog_add_cart`, `in_stock_label`, `product_out_of_stock`, `view_details_label`
  - dynamic t(): `t(category_${catSlug})`, `t(product.${product.slug}.name)`, `t(product_${product.id}_name)`
- `/components/FloatingContact.tsx`
  - t(): `call_customer_care_tooltip`, `pwa_install_btn`, `pwa_install_hint`, `whatsapp_chat_tooltip`, `whatsapp_inquiry_msg`
  - settings: `contact_phone`, `contact_whatsapp`
- `/components/Footer.tsx`
  - t(): `brand_title`, `footer_brand_desc`, `footer_browse_catalog`, `footer_contact_title`, `footer_copyright`, `footer_new_products`, `footer_quick_links_title`, `footer_shopping_title`, `footer_strip_cod_desc`, `footer_strip_cod_title`, `footer_strip_delivery_desc`, `footer_strip_delivery_title`, `footer_strip_guarantee_desc`, `footer_strip_guarantee_title`, `footer_strip_wood_desc`, `footer_strip_wood_title`, `nav_cart`, `nav_home`, `nav_products`, `nav_track`, `sort_best_selling`, `sort_popular`
  - settings: `contact_address`, `contact_email`, `contact_map_url`, `contact_phone`, `contact_phone_secondary`, `contact_whatsapp`, `facebook_url`, `instagram_url`, `site_name`, `site_name_bn`, `site_name_en`, `site_title`, `site_title_bn`, `site_title_en`, `store_description`, `store_description_bn`, `store_description_en`, `store_name`, `store_name_bn`, `store_name_en`, `store_tagline`, `store_tagline_bn`, `store_tagline_en`, `tiktok_url`, `youtube_url`
- `/components/Header.tsx`
  - t(): `brand_subtitle`, `brand_title`, `header_mobile_drawer_lang_label`, `header_order_cta`, `header_search_label`, `header_search_placeholder`, `header_search_submit`, `home_category_items`, `mobile_menu_helpline`, `nav_cart`, `nav_categories`, `nav_dropdown_title`, `nav_home`, `nav_menu_close`, `nav_menu_toggle`, `nav_policies`, `nav_policy_dropdown_title`, `nav_products`, `nav_track`, `nav_view_all`, `policy_privacy_sub`, `policy_privacy_title`, `policy_returns_sub`, `policy_returns_title`, `policy_terms_sub`, `policy_terms_title`
  - dynamic t(): `t(category.${cat.slug}.name)`, `t(category_${cat.slug})`
  - settings: `contact_address`, `contact_map_url`, `contact_phone`, `contact_phone_secondary`, `contact_whatsapp`, `facebook_url`, `instagram_url`, `site_name`, `site_name_bn`, `site_name_en`, `site_subtitle`, `site_subtitle_bn`, `site_subtitle_en`, `site_title`, `site_title_bn`, `site_title_en`, `store_name`, `store_name_bn`, `store_name_en`, `store_tagline`, `store_tagline_bn`, `store_tagline_en`, `tiktok_url`, `youtube_url`
- `/components/ProductCard.tsx`
  - t(): `catalog_add_cart`, `in_stock_label`, `out_of_stock_label`, `product_out_of_stock`, `product_save_badge`, `view_details`
  - dynamic t(): `t(category_${catSlug})`, `t(product.${product.slug}.name)`, `t(product_${product.id}_name)`, `t(product_${product.id}_short_description)`

### Policy pages

- `/components/PolicyView.tsx`
  - t(): `nav_home`, `policy_assistance_desc`, `policy_assistance_title`, `policy_sidebar_nav_title`
  - settings: `contact_phone`, `contact_whatsapp`

### Order confirmation

- `/app/order/confirmation/ConfirmationActionsRow.tsx`
  - t(): `confirm_btn_call`, `confirm_btn_track`, `confirm_btn_whatsapp`
- `/app/order/confirmation/ConfirmationAuthError.tsx`
  - t(): `nav_home`, `nav_track`, `order_security_desc`, `order_security_notice`
- `/app/order/confirmation/ConfirmationDeliveryInfo.tsx`
  - t(): `confirm_delivery_address`, `order_label_address`, `order_label_area`, `order_label_email`, `order_label_fullname`, `order_label_location`, `order_label_note`, `order_label_phone`, `order_opt_dhaka`, `order_opt_outside`
- `/app/order/confirmation/ConfirmationHeroHeader.tsx`
  - t(): `confirm_badge`, `confirm_copied_btn`, `confirm_copy_btn`, `confirm_order_id_label`, `confirm_subtitle`, `confirm_title`, `track_access_code_hint`, `track_access_code_label`
- `/app/order/confirmation/ConfirmationReceiptTable.tsx`
  - t(): `each_item_price`, `items_count_suffix`, `order_delivery_charge`, `order_promo_discount`, `order_subtotal`, `order_summary_title`, `order_total_payable`
- `/app/order/confirmation/[number]/OrderVerifyAuthCard.tsx`
  - t(): `nav_home`, `nav_track`, `order_security_desc`, `order_security_notice`
- `/app/order/confirmation/[number]/wrapper.tsx`
  - t(): `loading`
- `/app/order/confirmation/wrapper.tsx`
  - t(): `loading`
  - settings: `contact_phone`, `contact_whatsapp`

### Products list

- `/app/products/ProductsExclusiveSection.tsx`
  - t(): `exclusive_badge`
- `/app/products/ProductsFilterToolbar.tsx`
  - t(): `all_prices`, `all_products_heading`, `filter_price_title`, `filter_sort_title`, `price_2000_5000`, `price_5000_15000`, `price_above_15000`, `price_under_2000`, `reset_filters`, `search_reset`, `search_results_count`, `sort_best_selling`, `sort_newest`, `sort_popular`, `sort_price_asc`, `sort_price_desc`, `sort_top_rated`, `sort_trending`
- `/app/products/ProductsGridSection.tsx`
  - t(): `search_no_results`, `search_reset`
- `/app/products/ProductsPagination.tsx`
  - t(): `next_page`, `prev_page`
- `/app/products/wrapper.tsx`
  - dynamic t(): `t(product_${prod.id}_name)`

### Product detail

- `/app/products/[slug]/ProductBreadcrumbs.tsx`
  - t(): `nav_home`, `nav_products`
  - dynamic t(): `t(category.${product.category.slug}.name)`
- `/app/products/[slug]/ProductGallerySection.tsx`
  - t(): `product_in_stock`
- `/app/products/[slug]/ProductInfoSidebar.tsx`
  - t(): `cart_added_toast`, `hero_cta_order`, `nav_cart`, `order_label_quantity`, `product_in_stock_ready`, `product_select_color_label`, `product_select_size_label`, `product_tax_note`
  - dynamic t(): `t(category.${product.category.slug}.name)`
- `/app/products/[slug]/ProductSimilarSection.tsx`
  - t(): `details_related_sub`, `details_related_title`, `home_search_link`, `similar_products_eyebrow`
- `/app/products/[slug]/ProductTabsSection.tsx`
  - t(): `heading_write_review`, `order_label_fullname`, `product_in_stock`, `review_hint_order_required`, `review_hint_phone_required`, `review_hint_secret_token`, `review_label_ordernum`, `review_label_phone_req`, `review_label_secret_token`, `review_no_reviews_desc`, `review_placeholder_name`, `review_placeholder_ordernum`, `review_placeholder_phone_req`, `review_placeholder_secret_token`, `review_verified_buyer`, `shipping_tab_care_desc`, `shipping_tab_care_title`, `shipping_tab_delivery_desc`, `shipping_tab_delivery_title`, `shipping_tab_pkg_desc`, `shipping_tab_pkg_title`, `spec_dimensions`, `spec_finish`, `spec_price`, `spec_size`, `spec_status`, `tab_description`, `tab_features`, `tab_reviews`, `tab_shipping`, `tab_specifications`, `track_btn_submit_review`, `track_btn_submitting`, `track_rating_label`, `track_review_text_label`, `track_review_text_placeholder`
  - dynamic t(): `t(product.${slug}.feature.${idx}.desc)`, `t(product.${slug}.feature.${idx}.title)`
- `/app/products/[slug]/ProductWarningCard.tsx`
  - t(): `product_warning_title`
- `/app/products/[slug]/StoreGuaranteeBadges.tsx`
  - t(): `guarantee_cod_desc`, `guarantee_cod_title`, `guarantee_delivery_desc`, `guarantee_delivery_title`, `guarantee_quality_desc`, `guarantee_quality_title`, `guarantee_replacement_desc`, `guarantee_replacement_title`
- `/app/products/[slug]/page.tsx`
  - settings: `site_name`, `store_name`
- `/app/products/[slug]/wrapper.tsx`
  - t(): `home_browse`, `loading`, `network_error_retry`, `product_not_found`, `rating_text_1`, `rating_text_2`, `rating_text_3`, `rating_text_4`, `rating_text_5`, `review_err_generic`, `review_err_name_required`, `review_err_order_required`, `review_err_phone_required`, `review_err_text_required`, `review_err_token_required`, `review_success_submitted`
  - dynamic t(): `t(product.${product.slug}.full_desc)`, `t(product.${product.slug}.name)`, `t(product.${product.slug}.short_desc)`, `t(product.${product.slug}.tagline)`, `t(product.${product.slug}.warning)`, `t(product.${rel.slug}.name)`, `t(product_${rel.id}_name)`

### Search

- `/app/search/SearchResultsGrid.tsx`
  - t(): `search_filtered_label`, `search_no_results`, `search_reset`, `search_results_count`
- `/app/search/SearchSidebarFilters.tsx`
  - t(): `search_action`, `search_all_categories`, `search_all_colors`, `search_all_sizes`, `search_apply`, `search_category_label`, `search_color_label`, `search_filter_active_count`, `search_filters_heading`, `search_max_price`, `search_min_price`, `search_price_heading`, `search_query_label`, `search_query_placeholder`, `search_reset`, `search_size_label`, `search_sort_label`, `search_sort_name`, `search_sort_newest`, `search_sort_price_high`, `search_sort_price_low`, `search_submit_button`
  - dynamic t(): `t(category_${cat.slug})`
- `/app/search/wrapper.tsx`
  - dynamic t(): `t(product_${prod.id}_name)`

### Track order

- `/app/track/TrackDeliveryBillingInfo.tsx`
  - t(): `free_delivery`, `order_delivery_charge`, `order_discount`, `order_label_address`, `order_label_fullname`, `order_label_phone`, `order_payment_status_label`, `order_subtotal`, `order_total_payable`, `payment_method_cod`, `payment_method_online`, `tax_shipping_included`, `track_delivery_address_title`, `track_delivery_note_label`, `track_delivery_sub`, `track_payment_paid_badge`, `track_payment_sub`, `track_payment_summary_title`, `track_payment_unpaid_badge`, `track_privacy_masked_notice`, `verified_contact`, `zone_inside_dhaka`, `zone_outside_dhaka`
- `/app/track/TrackHeroSection.tsx`
  - t(): `loading`, `optional_badge`, `required_badge`, `track_access_code_label`, `track_access_code_placeholder`, `track_badge`, `track_form_order_label`, `track_form_order_placeholder`, `track_form_phone_label`, `track_form_phone_placeholder`, `track_form_submit`, `track_heading`, `track_security_hint`, `track_subheading`
- `/app/track/TrackItemsManifest.tsx`
  - t(): `items_count_label`, `order_label_quantity`, `order_package_items`, `track_btn_review`, `track_reviewed_badge`, `track_verified_parcel`
- `/app/track/TrackOrderHeader.tsx`
  - t(): `copied_success`, `copy_order_number`, `order_number_title`, `zone_inside_dhaka`, `zone_outside_dhaka`
- `/app/track/TrackReviewModal.tsx`
  - t(): `track_modal_cancel_btn`, `track_modal_rating_label`, `track_modal_review_label`, `track_modal_review_placeholder`, `track_modal_submit_btn`, `track_modal_title`, `track_rating_1`, `track_rating_2`, `track_rating_3`, `track_rating_4`, `track_rating_5`
- `/app/track/TrackSupportBar.tsx`
  - t(): `track_browse_catalog_btn`, `track_support_box_desc`, `track_support_box_title`
- `/app/track/TrackTimelineSection.tsx`
  - t(): `track_cod_amount_payable`, `track_eta_inside_dhaka`, `track_eta_outside_dhaka`, `track_order_cancelled_desc`, `track_order_cancelled_title`, `track_prepaid_status`, `track_status_timeline_title`, `track_timeline_done`, `track_timeline_in_progress`, `track_timeline_pending`, `track_zone_label`, `zone_inside_dhaka`, `zone_outside_dhaka`
- `/app/track/wrapper.tsx`
  - t(): `network_error_retry`, `review_err_generic`, `review_success_submitted`, `status_confirmed`, `status_delivered`, `status_pending`, `status_processing`, `status_shipped`, `track_err_missing_credentials`, `track_err_not_found`, `track_error_card_title`, `track_review_feedback_required`, `track_step_confirmed_desc`, `track_step_delivered_desc`, `track_step_pending_desc`, `track_step_processing_desc`, `track_step_shipped_desc`, `track_summary_cancelled_badge`, `track_summary_cancelled_msg`, `track_summary_cancelled_title`, `track_summary_confirmed_badge`, `track_summary_confirmed_msg`, `track_summary_confirmed_title`, `track_summary_delivered_badge`, `track_summary_delivered_msg`, `track_summary_delivered_title`, `track_summary_pending_badge`, `track_summary_pending_msg`, `track_summary_pending_title`, `track_summary_processing_badge`, `track_summary_processing_msg`, `track_summary_processing_title`, `track_summary_shipped_badge`, `track_summary_shipped_msg`, `track_summary_shipped_title`


## Appendix B — Fallback-only keys (not in the 433-key dictionary)

These 53 keys currently rely on their inline fallback text. Their key names and exact fallback strings must be preserved.

`artisan_craftsmanship_badge`, `badge_exclusive`, `cart_edit_btn`, `cart_empty_desc`, `cart_return_to_checkout`, `checkout_guarantee_1`, `checkout_guarantee_2`, `checkout_guarantee_3`, `checkout_policy_agree_prefix`, `checkout_policy_agree_suffix`, `common_and`, `custom_map_badge`, `custom_map_banner_btn`, `custom_map_banner_sub`, `custom_map_banner_title`, `each_item_price`, `featured_product_rating_chip`, `featured_product_stock_chip`, `free_delivery`, `in_stock_label`, `items_count_suffix`, `nav_menu_close`, `nav_menu_toggle`, `order_discount`, `out_of_stock_label`, `payment_all_disabled_error`, `payment_bkash_disabled_error`, `payment_cod_disabled_error`, `policy_acceptance_required_error`, `policy_privacy_sub`, `policy_privacy_title`, `policy_returns_sub`, `policy_returns_title`, `policy_terms_sub`, `policy_terms_title`, `product_warning_title`, `search_action`, `search_submit_button`, `tab_features`, `tax_shipping_included`, `track_zone_label`, `view_details_label`, `why_feat_1_desc`, `why_feat_1_title`, `why_feat_2_desc`, `why_feat_2_title`, `why_feat_3_desc`, `why_feat_3_title`, `why_feat_4_desc`, `why_feat_4_title`, `why_us_badge`, `why_us_sub`, `why_us_title`.
