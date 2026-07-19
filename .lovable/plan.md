## Goal

Build both landing designs as **separate pages**, let an **admin choose which one is shown at `/`**, and adopt their fonts/tokens as the **global theme**.

## Deliverables

### 1. Two landing pages
- `src/pages/landings/VelorahLanding.tsx` — cinematic video hero, glassmorphic nav, single H1, "Begin Journey" CTA. Exact spec from your message (video URL, liquid-glass CSS, fade-rise animations).
- `src/pages/landings/JackLanding.tsx` — hero + marquee + about + services + projects with scroll-driven stacked cards, magnetic portrait, character-reveal text. Exact spec (all 21 GIFs, 3 project cases, Kanit font, gradient hero heading).
- Small reusable pieces under `src/pages/landings/_shared/`: `LiquidGlass.tsx` wrapper, `Magnet.tsx`, `FadeIn.tsx`, `AnimatedText.tsx`, `ContactButton.tsx`, `LiveProjectButton.tsx`, `StackedProjectCards.tsx`.
- Direct routes: `/velorah` and `/jack` (public, both bypass auth like the current landing).

### 2. Admin-controlled `/` selector
- Read a single row from the existing `admin_settings` table with `setting_key = 'active_landing'` and `setting_value` in `{ "velorah", "jack", "default" }`.
- New `src/pages/LandingRouter.tsx` mounted at `/`:
  - Fetch the setting once, cache in memory, subscribe to realtime changes.
  - Render `<VelorahLanding />`, `<JackLanding />`, or the existing `Landing` accordingly.
  - Instant render fallback while loading = current `Landing` (no flash of blank).
- Admin toggle in `src/pages/admin/AdminDashboard.tsx` (or nearest existing admin surface): three-way choice card "Active landing page" → writes the setting via `insert` upsert.
- Seed the setting via SQL migration with default `"default"` so nothing changes until admin flips it.

### 3. Global theme refresh
- Add both font families to `index.html` `<head>`: Instrument Serif + Inter 400/500 and Kanit 300-900.
- Extend `src/index.css` design tokens:
  - CSS vars `--font-display-serif` = Instrument Serif, `--font-display-kanit` = Kanit, `--font-body` = Inter.
  - Global `.liquid-glass` class (spec verbatim).
  - Global `.hero-heading` gradient class (spec verbatim).
  - `@keyframes fade-rise` + `.animate-fade-rise[-delay|-delay-2]` utilities.
- Extend `tailwind.config.ts` `fontFamily`: `serifDisplay`, `kanit`, `body`.
- **Scope color-token changes conservatively**: only add new tokens (`--velorah-bg`, `--jack-bg`). Don't replace `--primary`/`--background` — that would repaint the entire NiranX app you've already built. You said "adopt as global theme" but the two designs conflict with each other and with your Cyber-Tech NiranX theme; adding shared utilities + fonts globally is the safe intersection.

### 4. Sidebar entry
- Add "Landing Pages" group under the existing Home sidebar category with two items: Velorah, Jack (per your rule about adding new features to the sidebar).
- Insert via `sidebar_groups` + `sidebar_pages` seed migration (uses existing custom-sidebar infra).

## Technical notes

- Framer Motion is already installed (used in `SplitScrollStage.tsx`).
- Lucide React already installed.
- The Jack page uses window scroll listeners; wrap in `useEffect` with cleanup and `passive: true`.
- `StackedProjectCards` uses `useScroll({ target, offset: ["start end", "end start"] })` per card + `useTransform` for `scale`, matching the spec's `targetScale = 1 - (total - 1 - i) * 0.03`.
- Both landing pages will be added to `src/components/ProtectedRoute.tsx` public allow-list alongside `/focus-engine`, so unauthenticated visitors can view them.
- SEO: each landing gets its own `<Helmet>` with title + description; `/` uses whichever landing is active.

## Out of scope (say so explicitly)

- Not replacing your Cyber-Tech color palette globally.
- Not building an editor for landing page content — admin just picks which of the three is active.
- Not migrating existing Landing analytics/hooks into the new pages.

Approve and I'll build it in one pass.