# GetEmoji Project Organization

Reference document for Claude agents working on the getemoji codebase. All paths are relative to the project root `D:\code\github\pryabov\getemoji`.

---

## A. Project Overview

**What it does:** GetEmoji is a browser-based emoji search, browse, and copy tool. Users can search 3600+ emojis, apply skin tone modifiers, copy emojis to clipboard with one click, and switch between languages. The site also has static content pages for emoji release notes and OS-specific support guides.

**Tech stack:**
- React 18 with TypeScript (strict mode)
- Material UI 5 (MUI) for all UI components
- react-router-dom v7 for client-side routing
- i18next / react-i18next for internationalization (4 languages: en, es, ru, pt)
- Webpack 5 (custom config, no CRA/Vite)
- SCSS for custom styles
- Google Analytics (gtag.js) for analytics, with cookie consent

**Deployment target:** Static SPA built to `dist/`. The canonical domain is `https://getemoji.ai`. Uses `historyApiFallback` in dev and expects server-side rewrite rules in production for SPA routing.

---

## B. Directory Structure

```
src/
  index.tsx              # Entry point: React root, BrowserRouter, MUI ThemeProvider
  App.tsx                # All route definitions, page view tracking, privacy dialog
  i18n.ts                # i18next config, language detection (URL param > localStorage > browser)
  styles/main.scss       # Global SCSS styles

  components/
    home/                # Home page (emoji browser)
      HomePage.tsx       # Main page: search + grid + skin tone selector
      EmojiGrid.tsx      # Renders categories/subgroups, uses search index for filtering
      EmojiCategory.tsx  # Renders one category with its subgroups
      EmojiSubgroup.tsx  # Renders one subgroup's emojis
      EmojiCard.tsx      # Individual emoji tile (click to copy)
      SearchBar.tsx      # Search input
      SkinToneSelector.tsx # Skin tone picker
      index.ts           # Barrel: exports HomePage

    shared/              # Reusable components used across all pages
      Header.tsx         # App bar with nav menus (Guides, Releases) and language selector
      Footer.tsx         # Site-wide footer with links
      BaseLayout.tsx     # Standard sub-page layout: Header + SEO + Breadcrumbs + Content + Ad + Footer
      SEOTags.tsx        # Sets document.title, meta tags, og: tags, canonical URL, hreflang
      AdPlaceholder.tsx  # Ad slot placeholder
      ClickableEmojiTile.tsx  # Reusable emoji display tile (used in release pages)
      ExternalLink.tsx   # External link component with rel=noopener
      CookieConsentBanner.tsx # GDPR/CCPA cookie consent
      PrivacyPolicy.tsx  # Privacy policy dialog
      index.ts           # Barrel exports for all shared components

    releases/            # Emoji release notes section
      ReleasesIndex.tsx  # Index page listing all release versions
      pages/
        index.tsx        # PAGE SELECTOR: language-aware wrappers that pick en/es/pt component
        en/              # English release page components (one per version)
        es/              # Spanish release page components (one per version)
        pt/              # Portuguese release page components (one per version)

    support/             # OS emoji guides section
      SupportIndex.tsx   # Index page listing all support guides
      pages/
        index.tsx        # PAGE SELECTOR: language-aware wrappers for support pages
        en/              # English support pages (Windows, MacOS, Linux)
        es/              # Spanish support pages
        pt/              # Portuguese support pages

  config/
    emoji.json           # The emoji dataset (3600+ emojis, categories, subgroups, skin tones)

  types/
    emoji.ts             # TypeScript interfaces: Emoji, EmojiCategory, EmojiSubgroup, EmojiData, SkinTone

  utils/
    analytics.ts         # Thin wrapper around gtag(): trackEvent, trackPageView, updateConsent
    searchIndex.ts       # Builds a Map<emojiChar, searchText> from all locale translations
    skinToneUtils.ts     # Skin tone localStorage persistence and modifier application
    twemojiUtils.ts      # Twemoji rendering helpers

  locales/
    en/translation.json  # English translations
    es/translation.json  # Spanish translations
    ru/translation.json  # Russian translations
    pt/translation.json  # Portuguese translations

  __tests__/
    setup.ts                      # Global test setup: mocks for clipboard, matchMedia, meta tags
    helpers/
      renderWithProviders.tsx      # Test wrapper: MemoryRouter + ThemeProvider + I18nextProvider
      mockEmojiData.ts             # Minimal emoji dataset (2 categories, 6 emojis)
      mockTranslations.ts          # Translation subsets for en, es, ru, pt
    integration/
      home/                        # search.test, copy-emoji.test, skin-tone.test, popular-emojis.test
      navigation/                  # routing.test, language.test
      seo/                         # seo-tags.test
      consent/                     # cookie-consent.test, privacy-policy.test
      pages/                       # support-pages.test, release-pages.test

public/                  # Static assets copied to dist/ (robots.txt, sitemap.xml, favicons, images)
scripts/                 # Build helper scripts (sitemap updater, zip creator, favicon converter)
webpack.config.js        # Webpack configuration
tsconfig.json            # TypeScript configuration
```

---

## C. Component Architecture

### Shared Components (`src/components/shared/`)
All reusable UI exported via barrel `src/components/shared/index.ts`. Import as `@components/shared`.

**BaseLayout** is the standard wrapper for sub-pages (releases, support). It provides:
- SEOTags (title, description)
- Header
- Breadcrumbs (configurable via props)
- 9/3 grid layout (content + ad sidebar)
- Footer

The **HomePage** does NOT use BaseLayout -- it has its own layout with a full-width emoji grid.

### Per-Language Static Page Pattern
Release pages and support pages have full static content (not driven by translation keys). Each language has its own complete component file:

```
releases/pages/en/Emoji16Release.tsx   # Full English article
releases/pages/es/Emoji16Release.tsx   # Full Spanish article
```

Each language directory has a barrel `index.ts` exporting all its page components.

### Page Selector Pattern
The `pages/index.tsx` file in both `releases/` and `support/` implements the language-switching logic:

1. Imports all language variants of each page
2. Creates a `Record<string, React.ComponentType>` mapping language codes to components
3. Exports a wrapper component (e.g., `Emoji16ReleasePage`) that:
   - Reads `i18n.language` via `useTranslation()`
   - Picks the matching component, falls back to English
   - Renders it

This pattern means adding a new language to static pages requires: creating the language directory with page files, adding a barrel export, and registering in the page selector maps.

**Important:** Russian (`ru`) is supported for the home page (via translation.json) but does NOT yet have static release/support pages. The page selector falls back to English for unsupported languages.

---

## D. Data Flow

### Emoji Data Pipeline

1. **Source:** `src/config/emoji.json` -- contains `specVersion`, `skinToneOptions[]`, and `categories[]`
2. **Types:** Defined in `src/types/emoji.ts`:
   - `Emoji` has `char`, `nameKey` (i18n key), `keywords` (array of i18n keys), `supportsSkinTone`
   - `EmojiCategory` has `nameKey`, optional `subgroups[]`, optional `emojis[]`
   - `EmojiSubgroup` has `nameKey` and `emojis[]`
3. **Import:** `HomePage` imports `emojiData from '@config/emoji.json'`
4. **Search Index:** `EmojiGrid` calls `buildSearchIndex(data)` which:
   - Flattens all emojis from categories/subgroups
   - For each emoji, resolves `nameKey` and all `keywords` against ALL locale translation files (en, es, ru)
   - Joins resolved strings into one lowercase text blob per emoji
   - Returns `Map<emojiChar, searchText>` -- this enables cross-language search
5. **Filtering:** `EmojiGrid` filters emojis by checking if the search text contains the query
6. **Rendering:** `EmojiGrid` -> `EmojiCategory` -> `EmojiSubgroup` -> `EmojiCard`
7. **Copy:** `EmojiCard` click copies the emoji character to clipboard

### Translation Key Model
The emoji data file does NOT contain display strings. Instead it contains i18n keys like `"emoji.grinningFace"`. At render time, `useTranslation().t(nameKey)` resolves the key to the current locale string. This means:
- Adding a new emoji requires adding its name/keyword keys to ALL translation files
- The search index pre-resolves all locales so search works regardless of active language

---

## E. Routing

All routes defined in `src/App.tsx`:

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Main emoji browser |
| `/support` | `SupportIndex` | Support guides index |
| `/support/windows` | `WindowsSupportPage` | Windows emoji guide (language-switched) |
| `/support/macos` | `MacOSSupportPage` | macOS emoji guide (language-switched) |
| `/support/linux` | `LinuxSupportPage` | Linux emoji guide (language-switched) |
| `/releases` | `ReleasesIndex` | Release notes index |
| `/releases/emoji-16` | `Emoji16ReleasePage` | Emoji 16.0 release (language-switched) |
| `/releases/emoji-15-1` | `Emoji151ReleasePage` | Emoji 15.1 release (language-switched) |
| `/releases/emoji-15` | `Emoji150ReleasePage` | Emoji 15.0 release (language-switched) |
| `/releases/emoji-14` | `Emoji140ReleasePage` | Emoji 14.0 release (language-switched) |
| `/releases/emoji-13-1` | `Emoji131ReleasePage` | Emoji 13.1 release (language-switched) |
| `/releases/emoji-13` | `Emoji130ReleasePage` | Emoji 13.0 release (language-switched) |

**Language selection via URL:** The `?lang=` query parameter is the highest-priority language source. When present, it is persisted to `localStorage`. The app intentionally does NOT auto-add `?lang=` to URLs on mount (to avoid confusing Googlebot). Internal navigation preserves the `?lang=` param if already present via `buildPath`/`buildHref` helpers in Footer, ReleasesIndex, and SupportIndex.

**Global overlays (not routed):**
- `CookieConsentBanner` -- always rendered
- `PrivacyPolicy` -- opened via `#privacy` hash

---

## F. State Management

There is no global state store. State is local and distributed:

| State | Location | Persistence |
|---|---|---|
| i18n language | `i18next` singleton | `localStorage('language')` + `?lang=` URL param |
| Skin tone | `HomePage` local state | `localStorage` via `skinToneUtils.ts` |
| Search query | `HomePage` local state (`useState`) | None (resets on navigation) |
| Privacy dialog open | `App` local state | URL hash `#privacy` |
| Cookie consent | `react-cookie-consent` library | Cookie |
| Analytics consent | gtag consent mode | Updated via `updateConsent()` |

Language detection priority (in `src/i18n.ts`):
1. `?lang=` URL parameter
2. `localStorage('language')`
3. Browser `navigator.language`
4. Fallback: `'en'`

---

## G. Build System

### Webpack Config (`webpack.config.js`)

- **Entry:** `./src/index.tsx`
- **Output:** `dist/` with content hashing in production
- **Loaders:** `ts-loader` for TypeScript, `sass-loader` (modern API) for SCSS, `css-loader`/`style-loader` for CSS
- **Plugins:** `HtmlWebpackPlugin` (template: `public/index.html`), `CopyWebpackPlugin` (copies `public/` to `dist/` except index.html)
- **Dev server:** Port 3000, hot reload, `historyApiFallback` with exclusions for static files (robots.txt, sitemap.xml, images)

### Path Aliases (mirrored in both `webpack.config.js` and `tsconfig.json`)

| Alias | Maps to |
|---|---|
| `@` | `src/` |
| `@components` | `src/components/` |
| `@utils` | `src/utils/` |
| `@appTypes` | `src/types/` |
| `@config` | `src/config/` |

### NPM Scripts (`package.json`)

| Script | What it does |
|---|---|
| `yarn start` | Dev server on port 3000 |
| `yarn build` | Update sitemap + production webpack build |
| `yarn build:zip` | Build + create zip archive |
| `yarn test` | Run all integration tests (Vitest) |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn format` | Prettier |

---

## H. Key Patterns (How-To Guide)

### How to add a new page

1. Create the component file in the appropriate directory under `src/components/`
2. If it is a sub-page (not the home page), use `BaseLayout` for consistent layout:
   ```tsx
   import { BaseLayout } from '@components/shared';
   export const MyPage = () => (
     <BaseLayout title="SEO Title" description="SEO description" breadcrumbs={[{ label: 'My Page' }]}>
       {/* content */}
     </BaseLayout>
   );
   ```
3. Add a `<Route>` in `src/App.tsx`
4. Add navigation links in `Header.tsx` and/or `Footer.tsx` as appropriate
5. Add any needed translation keys to all locale files

### How to add a new language

1. Create `src/locales/{lang}/translation.json` -- copy from `en/translation.json` and translate all values
2. Register in `src/i18n.ts`:
   - Add import: `import xxTranslation from './locales/xx/translation.json'`
   - Add to `resources` object
   - Add `'xx'` to the `supportedLanguages` array
3. Add to `src/utils/searchIndex.ts` -- import the new locale and add to the `locales` array
4. Add to `Header.tsx` `languages` array: `{ code: 'xx', name: 'Native Name' }`
5. (Optional) Create per-language static pages under `releases/pages/xx/` and `support/pages/xx/`, and register them in the respective `pages/index.tsx` page selectors. If omitted, English pages are used as fallback.

### How to add a new emoji release page

1. Create the English page: `src/components/releases/pages/en/Emoji170Release.tsx`
   - Use `BaseLayout` with `ClickableEmojiTile` and `ExternalLink` from shared
   - Include SEO-friendly content: new emoji table, release date, descriptions
2. Export from `src/components/releases/pages/en/index.ts`
3. Create translated versions in `es/` (and other language dirs), export from their `index.ts`
4. Register in `src/components/releases/pages/index.tsx`:
   - Import all language variants
   - Create the `emoji170Pages` record mapping
   - Export `Emoji170ReleasePage` wrapper component
   - Add to the `releases` array at the top with `isLatest: true` (update previous latest to `false`)
5. Add route in `src/App.tsx`: `<Route path="/releases/emoji-17" element={<Emoji170ReleasePage />} />`
6. Add to `Header.tsx` `releasePages` array
7. Add to `Footer.tsx` `footerLinks` if desired
8. Add to `ReleasesIndex.tsx` `releaseLinks` array
9. Add translation keys for nav labels (e.g., `nav.emoji170`, `releases.emoji170Label`) to all locale files

### How to add translation keys

1. Add the key to `src/locales/en/translation.json` (English is the source of truth and fallback)
2. Add the same key with translated values to `es/translation.json`, `ru/translation.json`, and `pt/translation.json`
3. Keys are nested JSON objects accessed with dot notation: `t('releases.seoTitle')`
4. For emoji data keys (used in `emoji.json`), the key must also exist in all locales for search to work across languages

### How to add analytics events

Use `trackEvent` from `src/utils/analytics.ts`:

```tsx
import { trackEvent } from '@utils/analytics';

// Fire a custom event
trackEvent('emoji_copy', { emoji: char, category: 'smileys' });
```

Available functions:
- `trackEvent(name, params?)` -- custom GA4 event
- `trackPageView(path)` -- already called automatically on route changes in `App.tsx`
- `updateConsent(granted)` -- update analytics/ad consent (called by CookieConsentBanner)

All analytics functions are no-ops if `gtag` is not loaded (safe for dev/testing).

---

## I. Integration Testing

### Stack

- **Vitest** -- test runner with jsdom environment
- **React Testing Library** -- DOM queries by accessible role/text
- **@testing-library/user-event** -- realistic user interaction simulation
- **jsdom** -- browser-like DOM environment

Config in `vitest.config.ts` mirrors the Webpack path aliases.

### Test Architecture

Tests are organized by user journey in `src/__tests__/integration/`:

| Directory | Test Files | What They Cover |
|-----------|-----------|-----------------|
| `home/` | search, copy-emoji, skin-tone, popular-emojis | Core emoji browser functionality |
| `navigation/` | routing, language | Header/footer nav, language switching |
| `seo/` | seo-tags | Meta tags, canonical, hreflang |
| `consent/` | cookie-consent, privacy-policy | GDPR consent, privacy dialog |
| `pages/` | support-pages, release-pages | Support/release index pages |

### Test Helpers (`src/__tests__/helpers/`)

- **`renderWithProviders(ui, options?)`** -- wraps component in MemoryRouter + ThemeProvider + I18nextProvider with mock translations for all 4 languages. Accepts `{ route, language }` options.
- **`mockEmojiData`** -- minimal dataset with 2 categories, 6 emojis (includes skin-tone-supporting emojis)
- **`mockTranslations`** -- translation subsets for en, es, ru, pt with distinct values per language

### Mocking Strategy

Tests mock these modules to isolate from real data:
- `@config/emoji.json` -- returns `mockEmojiData`
- `@utils/searchIndex` -- returns Map built from mock translations
- `@utils/analytics` -- stubs `trackEvent`, `trackPageView`, `updateConsent`
- `@/i18n` -- stubs `loadTranslation`

### How to add tests for a new feature

1. Identify which journey the feature belongs to (or create a new journey)
2. Add test cases to the appropriate `.test.tsx` file
3. If the feature uses new translation keys, add them to `mockTranslations.ts` for all 4 languages
4. If the feature uses new emoji data, add entries to `mockEmojiData.ts`
5. Run `yarn test` to verify
6. Document the journey in `USER_JOURNEYS.md`
