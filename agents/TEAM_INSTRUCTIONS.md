# Agent Team Work Instructions — getemoji

---

## Team Composition

| Role | Count | Model | Responsibility |
|------|-------|-------|---------------|
| **TL** | 1 | opus | Plans work, assigns tasks with zero file overlap, makes architecture decisions, final review |
| **FE Developer** | 2 | sonnet | Implements code changes, cross-checks the other dev's work |
| **Translator** | 1 | sonnet | Translates content (JSON keys, static page components), preserves JSX structure |
| **SEO Specialist** | 1 | opus | Audits sitemap, hreflang, canonical, meta tags, crawlability |
| **Knowledge Keeper** | 1 | sonnet | After each sprint, updates all `.claude/agents/` docs based on what changed |

---

## Workflow

### Phase 1: TL Plans
- Read all relevant files, produce task split for FE Dev 1 and FE Dev 2 with **zero file overlap**
- List translation requirements for the Translator
- All agents receive `CHANGE_LOG.md` logging instructions (see Logging section)

### Phase 2: Implementation (parallel)
- FE Dev 1 + FE Dev 2 + Translator work simultaneously
- Each agent reads files before editing

### Phase 3: Cross-checks (MANDATORY, parallel)
Not optional. Must happen after every implementation.
- **FE Dev 1 reviews ALL of FE Dev 2's files** — PASS/FAIL per file
- **FE Dev 2 reviews ALL of FE Dev 1's files** — PASS/FAIL per file
- SEO Specialist audits all changes
- Translator verifies quality in files they didn't create

### Phase 4: Fix + verify
- Fix any issues from Phase 3
- Run `yarn tsc --noEmit` + `yarn build` + `yarn lint` + `yarn test` (no NEW errors, all tests pass)
- TL does not approve until cross-check results are logged

### Phase 5: Knowledge update
- **Knowledge Keeper** reads `CHANGE_LOG.md` and updates all `.claude/agents/` docs
- Updates `project-organization.md` if structure/routes/patterns changed
- Adds new pitfalls discovered during cross-checks
- Removes outdated info

---

## Architecture Rules

### i18n
- **Languages:** EN (default), ES, RU, PT
- **Detection:** `?lang=` param > localStorage > `navigator.language` > `'en'`
- **`?lang=` is NOT auto-added on page load** — prevents GSC "redirect" issue. Only added when user changes language via dropdown.
- **All navigation links** must preserve `?lang=` if present. Use `useLocation()` + `URLSearchParams`.
- **SSR guard:** `src/i18n.ts` starts with `if (typeof window === 'undefined') return 'en';` — do not remove.

### Canonical / hreflang
- **Canonical:** bare path for EN, `?lang=xx` for non-EN
- **hreflang EN:** bare path (matches canonical). **ES/RU:** `?lang=es` / `?lang=ru`
- **x-default:** bare path. **Sitemap `<loc>`:** bare path.
- Must be consistent across `SEOTags.tsx`, `public/sitemap.xml`, `public/index.html`
- **Only advertise hreflang for languages with actual content.** No `hreflang="ru"` on pages without Russian components.

### Static pages (releases, support)
- Per-language component folders: `pages/en/`, `pages/es/`
- `pages/index.tsx` maps language codes to components, falls back to English
- To add a language: create `pages/xx/` folder, add imports + `xx:` entries to page mappings

### Translation files
- **Location:** `src/locales/{en,es,ru,pt}/translation.json`
- **EN is source of truth** — never modify EN to match other languages
- New keys must be added to **all 4 locale files** simultaneously
- **Spanish:** lowercase titles except first word + proper nouns ("Ver todos los lanzamientos", not "Ver Todos los Lanzamientos")
- **Brand names untranslated:** GetEmoji, Emoji 16.0, Windows, macOS, Linux, Unicode

### Navigation
- **Header:** `component="a"` + `href` (crawlability) + `e.preventDefault()` + `navigate()` (SPA). Arrays use `labelKey` not `label`.
- **Footer:** plain `<a href>` (NOT `<Link>`) for JS-independent crawlability
- **All text via `t()` keys** — no hardcoded strings
- **Every page passes translated `title`/`description` to `<SEOTags>`**

### Analytics
- Use `src/utils/analytics.ts`: `trackEvent()`, `updateConsent()`, `trackPageView()`
- Never use `(window as any).gtag` directly

---

## File Ownership (parallel work)

| Category | FE Dev 1 | FE Dev 2 |
|----------|----------|----------|
| Release pages | `releases/pages/*`, `ReleasesIndex.tsx` | — |
| Support pages | — | `support/pages/*`, `SupportIndex.tsx` |
| Shared components | `Header.tsx`, `SEOTags.tsx` | `Footer.tsx`, `BaseLayout.tsx` |
| Translation JSON | Keys under `releases.*`, `nav.*` | Keys under `support.*`, `footer.*` |
| Sitemap | Release entries | Support entries |

Both devs edit the same JSON files but under **different top-level sections**.

---

## Logging

**Every agent logs to `CHANGE_LOG.md`.** Format:

```
## [Role] — Phase X

- [Role] Modified `file.tsx` — description (line if relevant)
- [Role] Created `file.tsx` — description
```

Cross-check results:
```
- [FE Dev 1 → Dev 2] Reviewed `Footer.tsx` — PASS
- [FE Dev 2 → Dev 1] Reviewed `Header.tsx` — FAIL: missing t() on line 42
```

Log after each phase: implementation, cross-check, fixes.

---

## Known Issues (MANDATORY reading)

**Every agent must read `docs/known-issues/INDEX.md` before starting work.** Read the area files relevant to your task (testing, mui, i18n, seo, state-storage). When you encounter a new pitfall during implementation, add it to the relevant area file and note it in CHANGE_LOG.md.

---

## Pitfalls

1. Don't auto-add `?lang=` on page load — GSC "redirect" issue
2. Don't advertise `hreflang` for languages without content
3. Don't use English title-case in Spanish
4. Don't use `<Link>` in Footer — use `<a href>` for crawlability
5. Don't hardcode strings — use `t()` keys
6. Don't run `scripts/updateSitemap.js` — it's a no-op
7. Always run `yarn test` after changes — all integration tests must pass
8. When adding new translation keys, also add them to `src/__tests__/helpers/mockTranslations.ts` for all 4 languages
9. When adding new UI features, add corresponding test cases to the relevant journey test file
10. When discovering new pitfalls, add them to `docs/known-issues/` under the relevant area file
