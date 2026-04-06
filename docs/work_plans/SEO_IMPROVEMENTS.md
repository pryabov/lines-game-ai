# SEO Improvements Plan

**Date:** 2026-04-06
**Last reviewed:** 2026-04-06 (TL + 2 SEO Specialists)
**Authors:** SEO Specialist + Tech Lead
**Status:** Phase 1 Complete — Phase 2 Planned
**Domain:** https://lines98.fun

---

## Phase 1 — Completed

These tasks have been implemented and verified (`yarn test` + `yarn build` pass).

| # | Task | Status |
|---|------|--------|
| 1.1 | Remove fake `aggregateRating` from JSON-LD | Done |
| 1.2 | Fix OG/Twitter image URLs to absolute paths | Done |
| 2.1 | Dynamic hreflang tags via `useSEO` hook (7 langs + x-default) | Done |
| 2.2 | Sitemap with hreflang language variants | Done |
| 2.3 | `?lang=` URL parameter support in `useLanguage` | Done |
| 3.1 | Rich `<noscript>` fallback in all 7 languages | Done |
| 3.2 | Clean JSON-LD (url, genre, inLanguage, no fake ratings) | Done |
| 5.1 | SEO translations in all 7 language files + dynamic meta tags | Done |

---

## Phase 2 — Re-Audit Findings

A full re-audit was performed by TL + 2 SEO Specialists on 2026-04-06. The following issues were found in the current implementation.

### Issues Found

| # | Severity | Issue | File(s) |
|---|----------|-------|---------|
| 1 | **HIGH** | Canonical URL trailing slash inconsistency: static HTML uses `https://lines98.fun` (no slash), React `useSEO` produces `https://lines98.fun/` (with slash), sitemap uses trailing slash. Google may treat these as different URLs | `public/index.html:33`, `src/hooks/useSEO.ts:10`, `public/sitemap.xml:5` |
| 2 | **HIGH** | No static hreflang tags in `<head>` — hreflang is only injected via JavaScript. Non-JS crawlers (Bing, Yandex, some social) miss all hreflang signals | `public/index.html` |
| 3 | **HIGH** | Static meta description and OG descriptions differ from dynamic React values — causes content flicker between page load and React hydration. Crawlers that snapshot early get different content than late | `public/index.html:10,17,25` vs `src/translations/en.ts:85-87` |
| 4 | **HIGH** | Missing `og:locale` and `og:locale:alternate` — Facebook/social platforms cannot determine content language for shares | `src/hooks/useSEO.ts`, `public/index.html` |
| 5 | **MEDIUM** | URL does not reflect language for returning localStorage users — user with `ru` in localStorage visits bare URL, sees Russian content but URL stays English. Shared URL gives recipients English | `src/hooks/useLanguage.tsx:48-62` |
| 6 | **MEDIUM** | `viewport` meta has `user-scalable=no` — accessibility failure (WCAG 2.1), can negatively impact Google mobile-friendliness score | `public/index.html:7` |
| 7 | **MEDIUM** | Tasks 4.1 (IndexNow) and 4.2 (Bing Webmaster) from Phase 1 were not implemented | N/A |
| 8 | **MEDIUM** | Missing `Strict-Transport-Security` (HSTS) header — HTTPS is a ranking signal, HSTS enforces it | `public/_headers` |
| 9 | **MEDIUM** | No explicit cache-control for `index.html` — crawlers may get stale HTML | `public/_headers` |
| 10 | **MEDIUM** | Dead code in `src/translations/index.ts` — `LANGUAGE_STORAGE_KEY` and `getInitialLanguage()` use wrong localStorage key, never called | `src/translations/index.ts:57-63` |
| 11 | **LOW** | `manifest.json` uses relative `start_url` (`"./"`) and `scope` (`"./"`) — should be absolute | `public/manifest.json:24-25` |
| 12 | **LOW** | JSON-LD `screenshot` still uses logo instead of actual gameplay screenshot | `public/index.html:68` |
| 13 | **LOW** | SEO test coverage is incomplete — no tests for canonical update, meta description update, OG tags, or non-EN language scenarios | `src/__tests__/integration/seo.test.tsx` |

---

## Phase 2 — Implementation Plan

### Priority 1 — Fix URL and Meta Consistency

#### Task 6.1: Normalize trailing slash across all URLs

- **Files:** `public/index.html:33,19,56`, `src/hooks/useSEO.ts:10`
- **Action:**
  - Change canonical in `index.html` from `https://lines98.fun` to `https://lines98.fun/`
  - Change `og:url` in `index.html` from `https://lines98.fun` to `https://lines98.fun/`
  - Change JSON-LD `url` from `https://lines98.fun` to `https://lines98.fun/`
  - Verify `useSEO.ts` `getLanguageUrl` already uses trailing slash (it does)
  - Verify sitemap already uses trailing slash (it does)
- **Why:** Google treats `https://lines98.fun` and `https://lines98.fun/` as potentially different URLs. All sources must agree.

#### Task 6.2: Align static HTML meta tags with React English translations

- **Files:** `public/index.html:9-10,16-17,24-25`
- **Action:** Update static meta description, OG description, and Twitter description in `index.html` to match `src/translations/en.ts` seo values exactly:
  - `meta description` → `"Play Lines Game - a free online color matching puzzle. Move colorful balls on a 9x9 grid to form lines of 5 or more and score points."`
  - `og:description` → same as above
  - `twitter:description` → same as above
- **Why:** Prevents content flicker between static HTML and React hydration. Crawlers get consistent content regardless of when they snapshot.

#### Task 6.3: Add static hreflang tags to `<head>` in `index.html`

- **File:** `public/index.html` (after canonical tag, line 33)
- **Action:** Add static `<link>` tags:
  ```html
  <link rel="alternate" hreflang="en" href="https://lines98.fun/" />
  <link rel="alternate" hreflang="ru" href="https://lines98.fun/?lang=ru" />
  <link rel="alternate" hreflang="es" href="https://lines98.fun/?lang=es" />
  <link rel="alternate" hreflang="de" href="https://lines98.fun/?lang=de" />
  <link rel="alternate" hreflang="pl" href="https://lines98.fun/?lang=pl" />
  <link rel="alternate" hreflang="zh" href="https://lines98.fun/?lang=zh" />
  <link rel="alternate" hreflang="ja" href="https://lines98.fun/?lang=ja" />
  <link rel="alternate" hreflang="x-default" href="https://lines98.fun/" />
  ```
- **Why:** Non-JS crawlers (Bing, Yandex, social platforms) cannot execute JavaScript so they miss the React-injected hreflang tags. Static tags provide a fallback.

---

### Priority 2 — Social Sharing & Locale

#### Task 6.4: Add `og:locale` and `og:locale:alternate` support

- **Files:** `public/index.html`, `src/hooks/useSEO.ts`
- **Action:**
  - Add `<meta property="og:locale" content="en_US" />` to static `index.html`
  - In `useSEO.ts`, dynamically update `og:locale` per language using mapping:
    - `en` → `en_US`, `ru` → `ru_RU`, `es` → `es_ES`, `de` → `de_DE`, `pl` → `pl_PL`, `zh` → `zh_CN`, `ja` → `ja_JP`
  - Inject `og:locale:alternate` tags for the other 6 languages
- **Why:** Facebook and social platforms use `og:locale` to determine content language for shares.

---

### Priority 3 — Accessibility & Headers

#### Task 6.5: Remove `user-scalable=no` from viewport meta

- **File:** `public/index.html:7`
- **Action:** Change `user-scalable=no` to remove it:
  - Before: `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />`
  - After: `<meta name="viewport" content="width=device-width, initial-scale=1" />`
- **Why:** `user-scalable=no` prevents zooming, which fails WCAG 2.1 (SC 1.4.4) and can negatively impact Google's mobile-friendliness assessment.

#### Task 6.6: Add HSTS and cache-control headers

- **File:** `public/_headers`
- **Action:**
  - Add to the `/*` rule: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Add explicit rule for HTML:
    ```
    /index.html
      Cache-Control: public, max-age=0, must-revalidate
    ```
- **Why:** HSTS enforces HTTPS (a ranking signal). HTML cache-control ensures crawlers always get the latest version.

---

### Priority 4 — URL Reflects Language for Returning Users

#### Task 6.7: Update URL on init when language comes from localStorage

- **File:** `src/hooks/useLanguage.tsx`
- **Action:** In the initialization `useEffect`, after determining `initialLanguage` from localStorage (not URL), call `updateUrlLanguage(initialLanguage)` so the URL reflects the active language.
- **Why:** A returning Russian user visits bare `https://lines98.fun/`, sees Russian content, but URL stays English. If they share the link, recipients get English. The URL should always reflect the active language.

---

### Priority 5 — Bing Optimizations (Deferred from Phase 1)

#### Task 4.1: Add IndexNow support (carried over)

- **Action:**
  1. Generate an IndexNow API key at https://www.bing.com/indexnow
  2. Create `public/{api-key}.txt` containing the API key
  3. After each deploy, ping: `curl "https://api.indexnow.org/indexnow?url=https://lines98.fun&key={api-key}"`
- **Why:** IndexNow notifies Bing (and Yandex, Seznam, Naver) immediately after content changes.
- **Note:** Requires manual key generation — cannot be automated by agents.

#### Task 4.2: Register in Bing Webmaster Tools (carried over)

- **Action:**
  - Register https://lines98.fun in Bing Webmaster Tools
  - Add `<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_KEY" />` to `public/index.html`
  - Submit sitemap URL
- **Note:** Requires manual registration — cannot be automated by agents.

---

### Priority 6 — Code Cleanup & Tests

#### Task 6.8: Remove dead code from translations/index.ts

- **File:** `src/translations/index.ts:57-63`
- **Action:** Remove `LANGUAGE_STORAGE_KEY` constant and `getInitialLanguage()` function — they use the wrong localStorage key (`lines-game-language` vs actual `lines-game-settings`) and are never called.
- **Why:** Dead code with wrong key is confusing and a maintenance trap.

#### Task 6.9: Fix manifest.json relative URLs

- **File:** `public/manifest.json`
- **Action:** Change `"start_url": "./"` to `"start_url": "/"` and `"scope": "./"` to `"scope": "/"`
- **Why:** Relative URLs can cause issues depending on how the manifest is served.

#### Task 6.10: Expand SEO test coverage

- **File:** `src/__tests__/integration/seo.test.tsx`
- **Action:** Add tests for:
  - Canonical URL updates when language changes to non-EN
  - Meta description updates per language
  - OG title and OG description update per language
  - Non-EN end-to-end scenario: set `?lang=ru` in URL, verify Russian title, description, canonical
  - `og:locale` updates per language (after Task 6.4)
- **Why:** Current SEO tests only verify English defaults. Need coverage for the dynamic language-switching behavior.

---

## File Assignment (zero overlap for parallel work)

| Task | File(s) | Owner |
|------|---------|-------|
| 6.1, 6.2, 6.3, 6.5 | `public/index.html` | Game Dev 1 |
| 6.6 | `public/_headers` | Game Dev 1 |
| 6.9 | `public/manifest.json` | Game Dev 1 |
| 6.4 | `src/hooks/useSEO.ts`, `public/index.html` (og:locale only) | Game Dev 2 |
| 6.7 | `src/hooks/useLanguage.tsx` | Game Dev 2 |
| 6.8 | `src/translations/index.ts` | Game Dev 2 |
| 6.10 | `src/__tests__/integration/seo.test.tsx` | QA |
| 4.1, 4.2 | Manual steps (key generation, registration) | Owner/TL |

---

## Verification Checklist

### Phase 1 (completed)

- [x] `yarn type-check` passes
- [x] `yarn build` succeeds
- [x] No `aggregateRating` in JSON-LD
- [x] OG image URLs are absolute (`https://lines98.fun/logo512.png`)
- [x] React injects hreflang tags for all 7 languages + x-default
- [x] `sitemap.xml` contains `xhtml:link` alternates for all languages
- [x] `?lang=ru` URL updates canonical to `?lang=ru`
- [x] `<noscript>` contains game description in all 7 languages
- [x] SEO translations exist in all 7 language files
- [x] `useSEO` hook wired into `AppContent`

### Phase 2 (after implementation)

- [ ] All URLs use trailing slash consistently (canonical, og:url, JSON-LD url, sitemap)
- [ ] Static meta description matches React English seo.description
- [ ] Static hreflang tags present in `index.html` `<head>`
- [ ] `og:locale` meta tag present and updates per language
- [ ] `user-scalable=no` removed from viewport
- [ ] HSTS header present in `_headers`
- [ ] `index.html` has `Cache-Control: public, max-age=0, must-revalidate`
- [ ] Returning localStorage user's URL reflects their language
- [ ] Dead code removed from `translations/index.ts`
- [ ] `manifest.json` uses absolute start_url and scope
- [ ] SEO tests cover non-EN language scenarios
- [ ] `yarn test` passes
- [ ] `yarn type-check` passes
- [ ] `yarn build` succeeds

---

## Post-Launch Monitoring

- **Google Search Console:** Indexing status, crawl errors, hreflang issues in International Targeting report
- **Bing Webmaster Tools:** Crawl stats, SEO reports, IndexNow submission status (after Task 4.1/4.2)
- **Rich Results:** Re-test JSON-LD after each deploy (https://search.google.com/test/rich-results)
- **Core Web Vitals:** Monitor LCP, CLS, INP — AdSense script may impact LCP
- **Social sharing:** Test OG preview with https://developers.facebook.com/tools/debug/
- **Language coverage:** Verify all 7 `?lang=xx` URLs appear in search results over following weeks
