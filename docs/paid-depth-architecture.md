# Paid depth — frontend architecture (plan only)

**Status:** Paper only. **Do not implement** accounts, billing, alerts, or archive until Gate D: month 12 **and** Gates A–C in `docs/5ds-commercial-package.md`.  
**Input SKUs:** public board (free), daily email, archive 90, sector pack, org seats, alerts. **No prices.**  
**Date:** 14 September 2026

This packet exists because the operating plan asked for an architecture note after Phase A work started. It is **not** authorisation to build paid surfaces now. Year-1 posture stays: static HTML, no accounts, ~USD 15/month ops, no keys in the browser, no mix into `apps/web`.

---

## Architecture Brief — Libya Global Reports paid depth

- **Rendering:** Static MPA for the public board (keep Astro `dist/`). Paid depth is a **separate authenticated app** that **reads** the same published JSON (or a build-time index of it). Do not turn the public board into an SSR/SaaS render of the homepage.
- **Structure:** Two deployables, one content model — `apps/libya-global-reports` stays the public static site; a future `apps/lgr-depth` (name TBD) holds session, billing, and depth UI. Not a package inside `apps/web`.
- **Boundaries:**
  1. Public pages import `src/lib/*` and `content/*.json` only. They never import auth, Stripe, or secret env vars.
  2. Depth app may import **types** and **pure functions** from LGR (`schemas.ts`, `publication.ts`, `currency.ts`) via a shared folder later; it may not scrape public HTML as source of truth.
  3. `apps/web` (TEDx archive) is a foreign system: no shared session, no shared Vercel project assumed, no shared analytics.
  4. Collector drafts remain unpublished until an editor writes `content/` records. Paid depth never sees `editorialStatus` other than `published` and never sees `demo: true`.
  5. Browser bundles contain no API keys. Billing and alert dispatch stay server-side.
- **Conventions:** Existing kebab `content/*.json` and Zod schemas remain canonical. Depth features are keyed by `article.id`, `briefing.id`, `observation.id`. Avoid barrel files. Auth/i18n/billing live only in the depth app.
- **Risks:** (1) Paywalling the homepage under deadline pressure. (2) Putting secrets in Astro `src/` that ships to `dist/`. (3) Email/alerts COGS breaking a silent USD 15 year-1 cap — record as year-2 COGS, do not start in year 1.
- **Next step:** After Gate D, `security-hardener` for session/CSP/secrets, then `api-contract-designer` only if a paid API is actually sold. Not `component-architect` first.

---

## Frontend Architecture Plan

### Surfaces

| Surface | Job | Year 1 | After Gate D |
| --- | --- | --- | --- |
| `/`, `/articles/[slug]`, `/methodology`, `/sources`, `/weekly` | Public board: what changed, where, implications, watch next | Static, free, no login | Unchanged job; still free. Same-day public HTML remains. Paid must not hide these records. |
| `/rss.xml`, `/sitemap.xml` | Habit and discovery | Approved **non-demo** only | Still public for non-demo published items |
| Daily email | Inbox briefing | Optional third-party newsletter **or** RSS-only (cost/privacy undecided). No first-party accounts if that blows the USD 15 cap | May become a paid/bundled SKU; still generated from the same briefing JSON |
| Archive 90 | Search last 90 days | Not built | Authenticated route in depth app; index of published non-demo articles |
| Sector pack | Oil / humanitarian / telecom / logistics bundle | Not built | Filter over `Article.sectors`; export or saved view, not a second CMS |
| Org seats | Named users, shared watch list | Not built | Seat table in depth app; does not fork articles |
| Alerts | Notice on **published** items | Not built | Server job matches keywords/IDs; send from backend; never auto-publish |

Empty, disputed, and missing-data states on the public board stay as they are. Depth does not “complete” missing official rates.

### Boundaries

```
content/*.json  →  buildBoard()  →  public Astro pages + RSS
                     ↘
                 published index (Gate D) → depth app (auth, archive, seats, alerts)
```

- **Public origin** remains a static host (`docs/deploy.md`). Depth app may be a small Node/hosted app **after** year 1; its COGS is year-2, not a quiet MVP break.
- **Access control** attaches to SKUs, not to `Article` rows. A paying org sees speed, memory, packing, and seats — not exclusive facts withheld from RSS.
- **Identity:** Depth users are organisation seats. Public readers stay anonymous. Do not require login to read `/`.
- **Data:** Reuse `Article`, `DailyBriefing`, `IndicatorObservation`, `Source`. Add depth-only tables later: `Organization`, `Seat`, `AlertSubscription`, `Entitlement`. Do not add risk scores or live tickers.
- **Collection** stays git + CLI. Paid depth does not become a CMS that auto-publishes ReliefWeb.

### Risks

- **Performance:** Keep public JS as progressive enhancement. Archive search belongs on the depth origin so the public `dist/` stays small.
- **Accessibility:** Public board already no-JS readable except search/filters. Depth forms must not be the only path to the day’s facts.
- **Content pipeline:** Demo leak into paid archive would sell SAMPLE. Filter `demo === false && editorialStatus === "published"` at the index builder, same as RSS.
- **Security:** No Stripe/keys in `apps/libya-global-reports/src`. CSP in `public/_headers` stays form-action none on the public board; depth app gets its own headers.
- **Product:** Same-day delay vs same content for paid “speed” is still open. Do not implement a delay without a written offer.

### Unknowns (do not fill)

- Billing vendor, auth vendor, email vendor.
- Prices and which SKU sells first.
- Whether archive is 90 calendar days or 90 publishing days.

## Implementation freeze

No login, Stripe, paywalled homepage, native app, or merge into `apps/web` in this packet. Revisit only after Gate D.
