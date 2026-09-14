# Libya Global Reports

Daily context for decisions in Libya.

A free professional news and intelligence board for people working in oil and gas, the UN and humanitarian sector, telecommunications, and logistics.

This is a **separate static app** from the Libyan TEDx Archive in `apps/web`. It does not use that Next.js stack, Vercel analytics, or the Postgres API. The board is static HTML so it can sit on free hosting within a **$15/month** operating cap (excluding domain and editorial labour).

## What this MVP does

- Publishes an editorial dashboard: briefing, regional watch, currency board, infrastructure watch, oil/politics/UN, weekly outlook, methodology and sources.
- Validates structured JSON during `npm run validate` and `npm run build`.
- Collects **drafts only** from enabled, reviewed sources. Nothing is auto-published.
- Works with demo/sample content clearly labelled **SAMPLE** until the demo-off gate in `docs/editorial-cadence.md`.
- Works with JavaScript disabled, except for search/filters and the mobile menu.

Operating plan (paper): [docs/5ds-commercial-package.md](docs/5ds-commercial-package.md), [docs/audience-analysis.md](docs/audience-analysis.md), [docs/editorial-cadence.md](docs/editorial-cadence.md), [docs/deploy.md](docs/deploy.md), [docs/phase-a-status.md](docs/phase-a-status.md). Paid-depth **code** is blocked until Gate D; the architecture note is [docs/paid-depth-architecture.md](docs/paid-depth-architecture.md).

## Local setup

Requires Node.js 20+.

```bash
cd apps/libya-global-reports
cp .env.example .env   # optional
npm install
npm test
npm run validate
npm run dev
```

Open http://localhost:4321

Other commands:

```bash
npm run build      # type-check and production build
npm run preview    # serve dist locally
npm run collect -- --adapter=fixture-reliefweb
npm run collect -- --adapter=reliefweb-libya-rss
```

## Adding and reviewing sources

Edit `content/sources.json` (about 15 slots are filled as a register, most disabled).

A source may be collected only when **all** of these are true:

- `enabled: true`
- `reviewStatus: "reviewed"`
- `adapter` points at a registered collector
- robots/terms notes say the endpoint is allowed

Do not invent feeds. If an endpoint was not verified, leave `enabled: false` and write what is missing in `reuseNotes`.

Verified in this MVP:

- ReliefWeb Libya RSS `https://reliefweb.int/updates/rss.xml?advanced-search=%28PC140%29` — adapter **enabled**. Collectors use Node’s native `https` client and an identifying `LibyaGlobalReports/…` User-Agent. Undici `fetch` still receives HTTP 406; do **not** spoof a browser UA. Fail closed on robots unread or HTTP errors. Drafts only.
- Local XML fixture — **enabled** and remains the offline collection demo.
- Libya Herald `https://libyaherald.com/feed` exists, but reuse terms limit RSS to personal/non-commercial use — **disabled**.
- ReliefWeb API v2 — **disabled** until a pre-approved `appname` is issued (unregistered calls returned 403).
- UNSMIL, CBL, NOC, operator sites — **disabled**; no suitable public feed verified.

## Collecting drafts

```bash
npm run collect -- --adapter=fixture-reliefweb
```

Writes JSON into `editorial/drafts/queue/`. Collectors store title, canonical URL, timestamp and a short excerpt. They do not republish full articles.

An optional workflow template lives at `ops/collect.yml`. It is **not** installed in `.github/workflows`, has **no schedule**, and even after you copy it you must uncomment the cron and remove the documented guards. GitHub Actions is free for public repositories; private free plans have a monthly minute cap. Confirm that before claiming scheduled collection is free for your repo.

## Approving content

1. Open a draft in `editorial/drafts/queue/` or the worked example `editorial/drafts/example-ready-to-review.json`.
2. Verify the source document yourself. Do not paste copyrighted body text into the site.
3. Create a new file in `content/articles/` (or `content/observations/`) that matches the Zod schemas in `src/lib/schemas.ts`.
4. Set `editorialStatus` to `"published"` only when an editor has signed off. Draft, review and withdrawn records never appear on the site.
5. Set `demo` to `false` only for real, reviewed reporting. Demo records can appear on the site with SAMPLE labels but **never** enter `/rss.xml`.
6. Run `npm run validate` and `npm run build`.

There is no admin UI and no login. Publication is a git change.

## Removing demo mode

Do not turn SAMPLE off until at least **five** approved non-demo articles exist (prefer ten). `npm run validate` refuses a non-demo build before that gate.

When the gate passes: in `content/settings.json` set `"showDemoContent": false`, or set `LGR_SHOW_DEMO=false` in the environment, then rebuild. Sample articles disappear. Empty/no-verified-update states are expected where coverage is missing.

To delete sample files, remove the `*-sample.json` records under `content/`.

## Editorial cadence

On publishing days, either publish a briefing (and any verified FX/infra rows) or append `no-verified-update` to `editorial/logs/publishing-days.jsonl`. See `docs/editorial-cadence.md`. Collector output never auto-publishes.

## Optional AI

The site does not require AI. `src/lib/ai.ts` is a disabled server-side interface with a request-limit guard and a $10 / $5 reserve configuration. It is not wired to a provider. Do not put API keys in client code. Any future AI text must remain a draft until reviewed. Request limits are **not** the same as verified provider spend.

## Optional deployment (host not enabled by default)

A public origin is **not live** until you enable a host. The deploy path is documented in [docs/deploy.md](docs/deploy.md).

- GitHub Pages: `.github/workflows/lgr-pages.yml` (`workflow_dispatch`). Enable **Settings → Pages → GitHub Actions**, then run the workflow. Push-to-`main` stays commented until you confirm Actions limits. Intended origin: `https://mohamed-fadel-wd.github.io/libyan-data-bank` with `LGR_BASE_PATH=/libyan-data-bank`.
- Cloudflare Pages or Netlify: build `npm run build`, publish `dist/`, set `LGR_SITE_URL`. `netlify.toml` is in this folder.

Confirm the host’s build minutes, bandwidth and Actions limits before calling it free. The existing Vercel project for the TEDx archive is a different app; do not attach this board to it without checking hobby-plan limits.

`public/_headers` is honoured by Cloudflare Pages and Netlify. GitHub Pages does not apply `_headers` automatically.

Set `LGR_SITE_URL` (and `LGR_BASE_PATH` if the site is not at the domain root) before publishing canonical URLs and RSS links. Keep `LGR_SHOW_DEMO=true` until the demo-off gate.

## Expected costs

| Item | Assumption |
| --- | --- |
| Hosting / storage / TLS | $0 on a static free tier, if your plan still allows it |
| Scheduled collection | $0 if GitHub Actions minutes remain within the free allowance; **not enabled** |
| Domain | excluded from the $15 cap, as specified |
| Editorial labour | excluded |
| Paid APIs | none required |
| Optional AI | keep at $0; allowance $10 with $5 reserve if you later enable a provider |
| Operating reserve | $5 unused |

If a host starts charging, stop or move. Do not add analytics, accounts, or a CMS that would blow the cap.

## What works, what stays manual, what needs verified data

**Works**

- Static board, article pages, methodology, source register, weekly outlook.
- Filters and search (progressive enhancement).
- Sample content for west/east/south, four sectors, infrastructure incidents, FX comparison rules, disputed claims, stale and missing observations.
- Publication filters: drafts out of the site; demo out of RSS.
- ReliefWeb Libya RSS collector: robots check, timeouts, retries, caching headers, dedupe, `node:https` identity. Undici `fetch` is not used. Fixture collector remains the offline demo.
- `npm test`, `npm run validate`, `npm run build`.

**Stays manual**

- Writing and approving articles and indicator rows.
- Official CBL rates, NOC notices, operator outage statements.
- Copying drafts from the queue into `content/`.
- Enabling any disabled source after a rights or endpoint review.
- Enabling GitHub Pages or another host and setting the public `LGR_SITE_URL`.
- Copying live ReliefWeb drafts from the queue into `content/` after reading the source.

**Needs verified external data**

- A real official FX table (CBL has HTML only so far).
- NOC/terminal notices (HTTPS to noc.ly failed TLS during verification).
- UNSMIL feed (no RSS found).
- Electricity, water and telecom operator feeds (not verified).
- ReliefWeb API appname if you want the API adapter.
- Any media RSS whose terms allow this public board (Libya Herald feed exists; terms currently block enablement).
- A commodity price feed if you want Brent shown; until then the section stays hidden.

## Content model

JSON files validated by Zod:

- `Source` — `content/sources.json`
- `Article` / event — `content/articles/*.json`
- `DailyBriefing` — `content/briefings/*.json`
- `IndicatorObservation` — `content/observations/*.json`
- `WeeklyOutlook` — `content/outlooks/*.json`

Timestamps are ISO-8601 and displayed in **Africa/Tripoli**. Observation time is a different field from collection time.
