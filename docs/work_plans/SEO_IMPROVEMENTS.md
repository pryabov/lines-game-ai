# SEO Improvements Plan

**Date:** 2026-04-06
**Authors:** SEO Specialist + Tech Lead
**Status:** Planned
**Domain:** https://lines98.fun

---

## SEO Audit Summary

### What's Working

- Meta tags present (title, description, OG, Twitter Card)
- `robots.txt` with sitemap reference
- Canonical tag pointing to `https://lines98.fun`
- JSON-LD structured data (WebApplication)
- PWA manifest with game categories
- Cache headers well-configured (`_headers`)
- `_redirects` properly serves static SEO files without SPA rewrite
- `document.documentElement.lang` updates dynamically per language
- Web Vitals tracking (CLS, FCP, LCP, TTFB)
- GDPR-compliant analytics (consent-first)

### Critical Issues Found

| # | Severity | Issue | File(s) |
|---|----------|-------|---------|
| 1 | **CRITICAL** | Fake `aggregateRating` in JSON-LD — fabricated `4.8 / 153 reviews`. Google can issue a manual penalty and remove the site from search results | `public/index.html:63-68` |
| 2 | **CRITICAL** | No hreflang tags — 7 languages supported but no `<link rel="alternate" hreflang>` tags. Google/Bing cannot discover language variants | `public/index.html` |
| 3 | **HIGH** | Sitemap has only 1 URL, no language variants, stale `lastmod` (2025-10-07) | `public/sitemap.xml` |
| 4 | **HIGH** | OG/Twitter image URLs are relative (`logo512.png` instead of `https://lines98.fun/logo512.png`) — social previews break on most platforms | `public/index.html:20,26` |
| 5 | **HIGH** | `<noscript>` only says "enable JavaScript" — should contain meaningful game description for bots that don't execute JS | `public/index.html:80` |
| 6 | **MEDIUM** | `screenshot` in JSON-LD points to `logo512.png` — should be an actual gameplay screenshot | `public/index.html:64` |
| 7 | **MEDIUM** | No IndexNow support for Bing — Bing prioritizes IndexNow-enabled sites for faster indexing | N/A |
| 8 | **MEDIUM** | Missing `inLanguage` field in JSON-LD — should declare all 7 supported languages | `public/index.html:51-71` |
| 9 | **MEDIUM** | No dynamic meta tags per language — title/description remain English regardless of `?lang=` | `public/index.html` |
| 10 | **LOW** | `keywords` meta tag has no ranking impact (ignored by Google since 2009) — harmless but useless | `public/index.html:12` |

---

## Implementation Plan

### Priority 1 — Fix Critical / Dangerous Issues

#### Task 1.1: Remove fake aggregateRating from JSON-LD

- **File:** `public/index.html:63-68`
- **Action:** Delete the entire `aggregateRating` block
- **Why:** Fabricated review data violates Google's structured data guidelines. Can trigger a manual action resulting in complete removal from search results
- **Risk if skipped:** Manual penalty from Google

#### Task 1.2: Fix OG/Twitter image URLs to absolute paths

- **File:** `public/index.html:20,26`
- **Action:**
  - `og:image`: `content="logo512.png"` → `content="https://lines98.fun/logo512.png"`
  - `twitter:image`: `content="logo512.png"` → `content="https://lines98.fun/logo512.png"`
  - `screenshot` in JSON-LD: `"logo512.png"` → `"https://lines98.fun/logo512.png"`
- **Why:** Social platforms (Facebook, Twitter, Discord, Telegram) resolve OG images relative to the sharer's domain or not at all. Absolute URLs are required by the OG spec.

---

### Priority 2 — Multilingual SEO (hreflang)

#### Task 2.1: Add dynamic hreflang tags via React

- **File:** Create `src/hooks/useSEO.ts`
- **Action:** Build a hook that injects into `<head>`:
  - `<link rel="alternate" hreflang="en" href="https://lines98.fun/">`
  - `<link rel="alternate" hreflang="ru" href="https://lines98.fun/?lang=ru">`
  - `<link rel="alternate" hreflang="es" href="https://lines98.fun/?lang=es">`
  - `<link rel="alternate" hreflang="de" href="https://lines98.fun/?lang=de">`
  - `<link rel="alternate" hreflang="pl" href="https://lines98.fun/?lang=pl">`
  - `<link rel="alternate" hreflang="zh" href="https://lines98.fun/?lang=zh">`
  - `<link rel="alternate" hreflang="ja" href="https://lines98.fun/?lang=ja">`
  - `<link rel="alternate" hreflang="x-default" href="https://lines98.fun/">`
- Also update `<link rel="canonical">` dynamically:
  - English: `https://lines98.fun/`
  - Other languages: `https://lines98.fun/?lang=xx`
- Also update `<title>` and `<meta name="description">` with translated values per language
- **Why:** Without hreflang, Google/Bing treat all language variants as duplicate content. Bing especially relies on HTML hreflang tags.

#### Task 2.2: Update sitemap with language variants

- **File:** `public/sitemap.xml`
- **Action:** Replace with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://lines98.fun/</loc>
    <lastmod>2026-04-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://lines98.fun/"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://lines98.fun/?lang=ru"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://lines98.fun/?lang=es"/>
    <xhtml:link rel="alternate" hreflang="de" href="https://lines98.fun/?lang=de"/>
    <xhtml:link rel="alternate" hreflang="pl" href="https://lines98.fun/?lang=pl"/>
    <xhtml:link rel="alternate" hreflang="zh" href="https://lines98.fun/?lang=zh"/>
    <xhtml:link rel="alternate" hreflang="ja" href="https://lines98.fun/?lang=ja"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://lines98.fun/"/>
  </url>
</urlset>
```

- **Why:** Sitemaps with hreflang annotations are the most reliable way for Google to discover language variants of a page.

#### Task 2.3: Support `?lang=` parameter in URL

- **File:** `src/hooks/useLanguage.tsx`, `src/translations/index.ts`
- **Action:**
  - On page load, check `?lang=` URL param **before** localStorage and browser detection
  - On language change, update URL to include `?lang=xx` (bare URL for English)
  - Detection priority: `?lang=` param → localStorage → `navigator.language` → `'en'`
- **Why:** Gives search engines crawlable, linkable URLs for each language. Currently language is invisible to crawlers (stored only in localStorage).

---

### Priority 3 — Improve Crawlable Content

#### Task 3.1: Enhance `<noscript>` fallback content

- **File:** `public/index.html:80`
- **Action:** Replace `<noscript>You need to enable JavaScript to run this app.</noscript>` with:

```html
<noscript>
  <h1>Lines Game - Free Online Color Matching Puzzle</h1>
  <p>Lines Game is a free online color matching puzzle game. Move colorful balls
     on a 9x9 grid to form lines of 5 or more same-color balls. Score points
     and challenge your strategic thinking!</p>
  <h2>How to Play</h2>
  <ul>
    <li>Click a ball to select it, then click an empty cell to move it</li>
    <li>Balls can only move if there is a clear path (no obstacles)</li>
    <li>Form lines of 5 or more balls of the same color to score points</li>
    <li>3 new random balls appear after each move</li>
    <li>The game ends when the board is completely filled</li>
  </ul>
  <h2>Scoring</h2>
  <ul>
    <li>5 balls in a line: 10 points</li>
    <li>6 balls: 12 points</li>
    <li>7 balls: 18 points</li>
    <li>8 balls: 28 points</li>
    <li>9 balls: 42 points</li>
  </ul>
  <p>Please enable JavaScript to play the game.</p>
</noscript>
```

- **Why:** Some crawlers (especially Bing) may not fully execute JavaScript. Rich `<noscript>` content provides fallback text for indexing.

#### Task 3.2: Fix JSON-LD structured data

- **File:** `public/index.html:51-71`
- **Action:** Replace JSON-LD with:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Lines Game",
  "url": "https://lines98.fun",
  "applicationCategory": "GameApplication",
  "genre": "Puzzle",
  "operatingSystem": "Web Browser",
  "browserRequirements": "Requires JavaScript",
  "description": "A free online color matching puzzle game. Connect colorful balls on a 9x9 grid to form lines of 5 or more and score points.",
  "inLanguage": ["en", "ru", "es", "de", "pl", "zh", "ja"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "screenshot": "https://lines98.fun/logo512.png"
}
```

- **Changes:**
  - Removed fabricated `aggregateRating`
  - Added `url`, `genre`, `browserRequirements`, `inLanguage`
  - Fixed `screenshot` to absolute URL
- **Why:** Clean structured data improves rich result eligibility without penalty risk.

---

### Priority 4 — Bing-Specific Optimizations

#### Task 4.1: Add IndexNow support

- **Action:**
  1. Generate an IndexNow API key at https://www.bing.com/indexnow
  2. Create `public/{api-key}.txt` containing the API key
  3. Add the key to `robots.txt` or document the post-deploy ping command
  4. After each deploy, ping: `curl "https://api.indexnow.org/indexnow?url=https://lines98.fun&key={api-key}"`
- **Why:** IndexNow notifies Bing (and Yandex, Seznam, Naver) immediately after content changes. Sites using IndexNow get re-crawled within minutes instead of days.

#### Task 4.2: Register in Bing Webmaster Tools

- **Action:**
  - Register https://lines98.fun in Bing Webmaster Tools
  - Add verification meta tag to `public/index.html`:
    `<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_KEY" />`
  - Submit sitemap URL
- **Why:** Bing Webmaster Tools provides crawl diagnostics, indexing status, and the ability to submit URLs directly.

---

### Priority 5 — Dynamic Meta Tags per Language

#### Task 5.1: Translate meta tags per language

- **File:** `src/hooks/useSEO.ts` (same hook from Task 2.1)
- **Action:**
  - Add `seo` section to each translation file (`src/translations/*.ts`) with translated `title` and `description`
  - The `useSEO` hook dynamically updates `<title>`, `<meta name="description">`, `og:title`, `og:description` based on current language
- **Example keys:**
  ```typescript
  seo: {
    title: 'Lines Game - Free Online Color Matching Puzzle Game',
    description: 'Play Lines Game - move colorful balls to form lines and score points.',
    ogTitle: 'Lines Game - Color Matching Puzzle',
  }
  ```
- **Why:** Search engines index the meta content they see at crawl time. If a Russian user searches "игра линии", the Russian meta description will appear in results, improving CTR.

---

## File Assignment (zero overlap for parallel work)

| Task | File(s) | Owner |
|------|---------|-------|
| 1.1, 1.2, 3.1, 3.2, 4.2 | `public/index.html` | Game Dev 1 |
| 2.2 | `public/sitemap.xml` | Game Dev 1 |
| 4.1 | `public/{key}.txt`, `robots.txt` update | Game Dev 1 |
| 2.1, 5.1 | New `src/hooks/useSEO.ts` | Game Dev 2 |
| 2.3 | `src/hooks/useLanguage.tsx` | Game Dev 2 |
| 5.1 (translations) | `src/translations/*.ts` — `seo` section only | Translator |

---

## Verification Checklist

After implementation, verify:

- [ ] `yarn type-check` passes
- [ ] `yarn build` succeeds
- [ ] No `aggregateRating` in built `dist/index.html` JSON-LD
- [ ] OG image URLs are absolute (`https://lines98.fun/logo512.png`)
- [ ] View page source shows hreflang tags for all 7 languages + x-default
- [ ] `sitemap.xml` contains `xhtml:link` alternates for all languages
- [ ] Visiting `https://lines98.fun/?lang=ru` updates canonical to `?lang=ru`
- [ ] `<noscript>` contains game description (test with JS disabled in browser)
- [ ] Google Rich Results Test passes on JSON-LD (https://search.google.com/test/rich-results)
- [ ] Submit updated sitemap to Google Search Console
- [ ] Submit updated sitemap to Bing Webmaster Tools
- [ ] IndexNow key file accessible at `https://lines98.fun/{key}.txt`

---

## Post-Launch Monitoring

- **Google Search Console:** Check indexing status, crawl errors, hreflang issues in International Targeting report
- **Bing Webmaster Tools:** Check crawl stats, SEO reports, IndexNow submission status
- **Rich Results:** Re-test JSON-LD after deploy
- **Core Web Vitals:** Monitor LCP, CLS, INP in Search Console
- **Language coverage:** Verify all 7 language URLs appear in search results over the following weeks
