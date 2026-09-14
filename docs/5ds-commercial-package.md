# 5DS commercial package — Libya Global Reports

**Status:** Paper package only. No billing, accounts, or UI work is authorised by this document.  
**Date:** 14 September 2026  
**Product path:** [apps/libya-global-reports](../)  
**Decision:** Public board stays free. After year 1, organisations may pay for depth (alerts, archive, sector packs, seats). Not a full-site paywall. Not ads.  
**Prices:** Not set. Do not treat any figure below as a quote. Set prices only after named organisational conversations.

**Confidence:** Sequence (trust before billing) is high. Packaging names are directional. Price, volume, and named buyers are unknown.

---

## 1. Executive summary

Libya Global Reports (LGR) is a professional news and intelligence board for people working in oil and gas, the UN and humanitarian sector, telecommunications, and logistics. It answers four questions: what changed in Libya, where it matters, what the operational implications are, and what to watch next.

The problem is not a missing dashboard widget. Libyan operational context is fragmented, often unverified, and easy to over-claim. The MVP already encodes honesty (SAMPLE labels, no nationwide parallel FX, no risk scores). It does not yet encode **trust**, because published items are still fictional demonstration data.

Expected value is decision time saved and fewer false “all clear” readings. Target readers are desk officers and operations staff. Target **buyers** (after year 1) are organisations that already pay for those desks, not individual consumers.

Final outcome: a free public board that professionals actually use, plus an optional paid depth layer that does not hide the public record.

---

## 2. Project charter

| Field | Content |
| --- | --- |
| Name | Libya Global Reports — free year to paid depth |
| Background | Static Astro MVP exists. Year-1 constraints: free public access, ~USD 15/month operating cap excluding domain and editorial labour, no ads, no accounts, no CMS, no mobile app. |
| Problem | SAMPLE content cannot be sold. Collection is only reliable via a local fixture. Official/operator feeds are mostly unverified or blocked. Willingness to pay requires a habit of real, attributed briefings. |
| Objectives | (1) Publish non-demo coverage on a stated cadence. (2) Hold the year-1 free promise. (3) Define paid SKUs on paper. (4) After month 12 and trust gates, offer organisational depth without paywalling the board. |
| In scope | Editorial operations, source rights, static deploy, paper SKUs, waitlist conversations, later thin paid layer on existing schemas. |
| Out of scope | Ads, consumer paywall of the homepage, native mobile app, merging into `apps/web`, invented prices or customers, auto-publish of scrapes or AI, risk scores, live tickers. |
| Assumptions | Founder is editor-of-record at first. Arabic/RTL is later. LGR remains its own deployable. Editorial labour stays outside the USD 15 cap. |
| Constraints | Year 1 free. USD 15/month ops until revenue. Drafts never auto-publish. Only http(s) source URLs. No API keys in the browser. |
| Stakeholders | Sponsor/founder; editor; technical maintainer; public readers; future org buyers; source publishers (ReliefWeb, CBL, NOC, UNSMIL, media). |
| Success | Non-demo RSS items exist; named professional readers exist; written paid-depth offer exists **before** payment code. |
| Major risks | Empty board after demo off; source-term breach; undici `fetch` 406 (mitigated by `node:https`); paywall pressure before month 12; ops cost creeping above USD 15. |
| Governance | Founder is accountable. Editor approves publication. No steering committee until a second person joins. |
| Approval gates | See Deliver and section 10. Billing engineering is blocked until Gate D. |

---

## 3. 5DS breakdown

### Define

**Diagnosis.** Professionals need a thin, honest Libya board. The product shape is right; the **content and collection** are not yet a product. Selling depth on SAMPLE would destroy the only asset (credibility).

**Stakeholder map**

- Public reader — uses the board unpaid; job is “what changed / where / so what / watch next”.
- Desk lead (oil, logistics, telecom, humanitarian) — may become a champion buyer later.
- Org buyer (security, operations, or information manager) — pays after year 1 if depth is cheaper than building an internal clip.
- Source publishers — constrain reuse; not customers.
- Founder/editor — scarce labour.

**Requirements**

- Functional: validated JSON content; publication filters; location-specific FX; missing-data honesty; RSS of approved non-demo only.
- Year-1: no accounts required to read the board.
- Year-2: paid depth must not remove public articles from the free board.
- Compliance: respect robots and source terms; no paywall-bypass collection; corrections remain visible.
- Security: no secrets in client bundles; sanitised untrusted excerpts.

**Current state.** Astro static site; Zod schemas; git editorial workflow; demo flag on; ReliefWeb RSS verified. Undici `fetch` received HTTP 406 on 10 and 14 September 2026; `node:https` with the same identifying collector User-Agent received HTTP 200 on 14 September 2026. Fixture collector works. Deploy workflow exists but no public origin is live until the host is enabled.

**Pain points.** No public URL. No real articles. Manual FX/infra. Disabled media/official adapters. No named readers.

**Business objectives.** Trust, then habit, then named orgs, then paid depth.

**Data requirements.** Articles, briefings, outlooks, indicator observations, source register — already modelled in `src/lib/schemas.ts`. Paid layer should **reference** those IDs, not fork a second news model.

**Definition of success.** Gate language in section 10. Not traffic vanity.

### Design

**Future state (year 2).** Public static board unchanged in job. Paid orgs receive: faster or bundled email, 90-day archive search, sector-filtered packs, optional alerts, seat admin. Same underlying records.

**SKU catalogue (names only — no prices)**

| SKU | Who | What | Year 1 | Year 2 |
| --- | --- | --- | --- | --- |
| Public board | Anyone | Same-day public HTML + RSS of approved non-demo items | Free | Free |
| Daily email | Individual or org | Briefing in the inbox | Optional free newsletter **or** RSS-only (cost/privacy undecided) | Paid or bundled into seats |
| Archive 90 | Org | Search and retrieve last 90 days of approved items | Not built | Paid |
| Sector pack | Org | Oil / humanitarian / telecom / logistics bundle | Not built | Paid |
| Org seats | Org | Named users, shared watch list | Not built | Paid |
| Alerts | Org | Threshold or keyword notices on published items | Not built | Optional paid |

**Process (main):** Source enabled and reviewed → collect to draft queue → editor verifies → structured article/observation with `editorialStatus: published` and `demo: false` → build → public board + RSS.

**Exception:** Collector fails or robots unread → fail closed → editor may still publish from manual sources.

**Approval:** Only editor sets `published`. AI/collector output stays `draft`.

**Data flow:** `content/*.json` → `buildBoard()` → static pages. Year-2 paid app reads the same published JSON or a generated index; it does not scrape the public HTML as a source of truth.

**Operating model.** Editor publishes. Maintainer owns collectors, build, deploy. Founder owns year-1 free promise and any later commercial offer.

**Tools (year 1).** Git, Node 20, Astro, static host, RSS. Newsletter tool only if it stays inside the ops cap and privacy bar. **Tools (year 2).** Accounts and billing TBD after SKU conversations — not selected here.

**Control points.** Source `enabled` + `reviewStatus`; publication filters; demo excluded from RSS; FX comparability rules; contact href sanitisation.

### Display

See section 5 (internal operating dashboard — not a public analytics product). Year 1 default remains **no visitor analytics/cookies** on the public board.

### Deliver

See sections 6 and 10. Billing code is a Phase D task, blocked by gates.

### Document

See section 11. This file is the commercial charter. Editorial cadence lives in `editorial-cadence.md`. Architecture for paid depth lives in `paid-depth-architecture.md` (plan only).

---

## 4. Process flows

**Main (coverage):** Start → Collect or manual note → Draft in `editorial/drafts/` → Editor verifies primary document → Write `content/articles` or `observations` → `demo: false` only if real → `npm run validate` → build → public pages + RSS → End.

**Exception (collection blocked):** Start → Adapter fail-closed (robots unread / HTTP 406) → Log warning → Do not invent a feed → Editor uses manual source row → same approval path → End.

**Approval:** Draft → Editor decision: publish / hold / withdraw → If publish: timestamps in Africa/Tripoli, confidence rationale, source URLs → Build. No second approver until a second editor exists.

**Data:** Observation time ≠ collection time → FX premium only if pair, unit, and alignment window match → Else “Not calculated” with reason.

**Reporting (internal, monthly):** Non-demo article count, named-reader count, ops spend vs USD 15, source enablement changes, gate status. Not a public dashboard.

---

## 5. Dashboard package (internal ops — not public)

**Name:** LGR operating review  
**Audience:** Founder / editor  
**Purpose:** See whether trust and cadence exist before anyone talks about charging.  
**Pages:** Coverage; Sources; Commercial gates.  
**Implementation:** Spreadsheet or markdown log. Do **not** add public analytics to the board in year 1.

### KPI framework

**Tree (leading → lagging)**

- Leading: publishing days kept; drafts reviewed; sources reviewed; collector success (yes/no per adapter).
- Lagging: non-demo articles in RSS; named professional readers; org conversations; (year 2) paying orgs.

**Cadence:** Weekly coverage check. Monthly numbers. Quarterly Gate C/D review.

### Metrics dictionary

Targets marked **unknown** are not commitments.

| Metric | Definition | Formula | Grain | Source | Owner | Target | Cadence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Non-demo published articles | Approved items with `demo: false` and `editorialStatus: published` | Count | All-time and last 30 days | `content/articles` | Editor | Unknown until cadence is chosen | Monthly |
| RSS eligibility | Items that may appear on `/rss.xml` | Count of published ∧ ¬demo | Feed | Build | Editor | > 0 before demo off | Per build |
| Publishing-day kept | Briefing published or explicit “no verified update” recorded | Binary per scheduled day | Day | Git / log | Editor | Unknown | Weekly |
| SAMPLE still on | `showDemoContent` | Boolean | Site | `settings.json` | Editor | false (set 14 Sep 2026) | Per release |
| Collector allowed | Adapter completed without robots/bot block | Boolean per run | Run | CLI log | Maintainer | ReliefWeb or equivalent = true | Per collect |
| Named readers | Professionals who opted in to be listed internally | Count, tagged by sector | Person | Private list (not on site) | Founder | 10–30 before Gate C | Monthly |
| Org conversations | Distinct organisations spoken to about depth | Count | Org | Private notes | Founder | ≥ 3 before Gate D | Quarterly |
| Ops spend | Cash operating cost excluding domain and editorial labour | Sum USD | Calendar month | Bank / invoices | Founder | ≤ 15 in year 1 | Monthly |
| Year-1 free held | Public board readable without payment | Boolean | Site | Product | Founder | true through month 12 | Quarterly |

Do not use visit counts as a year-1 success metric; the public board has no analytics by default.

---

## 6. Task package

| Phase | Task | Owner role | Priority | Duration hint | Depends on | Deliverable | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | Deploy static `dist/` to a free host; set `LGR_SITE_URL` | Maintainer | High | 1–2 days | Build succeeds | Public HTTPS origin | Canonical/RSS URLs are HTTPS; site loads |
| A | Publish 5–10 real approved articles; then consider demo off | Editor | High | Weeks | Verified sources | Non-demo JSON + RSS items | `demo: false` items in RSS; SAMPLE banner off only after that |
| A | Run editorial cadence | Editor | High | Ongoing | — | Briefing / outlook / “no verified update” | Weekly ritual exists in git history |
| A | Make collection allowed (honest UA, fail closed, no browser spoof) | Maintainer | High | 1–3 days | Source terms | Working adapter or documented block | Fixture always works; live adapter either collects or fails closed with a clear log |
| B | Rights review before enabling media RSS | Editor | High | Per source | Legal read of terms | Source register updates | Libya Herald stays disabled until terms allow this board |
| B | Manual CBL/NOC/operator observations | Editor | Med | Ongoing | Primary documents | Observation JSON | Missing fields stay “Not reported” |
| B | RSS and optional free email habit | Founder | Med | 1 week | Public URL | Documented channel | No accounts if that blows USD 15 cap |
| B | Named-reader list (four sectors) | Founder | Med | Ongoing | Public URL | Private list | No paywall |
| C | Write paid-depth offer (no prices until conversations) | Founder | Med | 1 week | Gate B | One-pager | SKUs match this catalogue |
| C | Org waitlist conversations | Founder | Med | Months | Offer | Notes | ≥ 3 orgs before billing design |
| C | Year-2 COGS note if ops must exceed USD 15 | Founder | Med | 1 day | Honest cost log | Budget note | Not a silent MVP break |
| D | Architect then implement paid depth | Maintainer | Low until gates | After month 12 | Gates A–C | Auth/billing plan then code | Public board remains free; no keys in browser |

---

## 7. RAID log

| Type | Description | Impact | Probability | Owner | Mitigation / response | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Risk | Demo turned off before real articles exist | Empty board, credibility loss | High if rushed | Editor | Gate: 5–10 real items first | Open |
| Risk | ReliefWeb / CDNs block Node collectors | No draft inflow | High for undici `fetch` (HTTP 406 observed). Low for `node:https` with the identifying UA (HTTP 200 on 14 Sep 2026). | Maintainer | Use `node:http/https` only; never spoof a browser UA; fail closed; fixture remains | Mitigated |
| Risk | Media RSS enabled against personal-use terms | Legal and reputational | Med | Editor | Keep disabled until written reuse permission | Open |
| Risk | Pressure to paywall or add ads before month 12 | Breaks charter | Med | Founder | Escalate; refuse | Open |
| Risk | Invented prices in sales talk | Unsellable or underpriced | Med | Founder | Prices only after conversations | Open |
| Risk | Year-2 auth/email exceeds USD 15 COGS | Margin unknown | High if built naively | Founder | Record as year-2 COGS; cheap hosts first | Open |
| Assumption | Founder remains editor-of-record in year 1 | Cadence depends on one person | — | Founder | Named deputy if cadence is daily | Open |
| Assumption | Public board remaining free is acceptable to buyers | Depth SKUs may be enough | — | Founder | Test in conversations | Open |
| Issue | Published corpus is SAMPLE | Cannot monetise | Certain | Editor | Phase A coverage | Open |
| Issue | No public `LGR_SITE_URL` | No shareable product | Certain until Pages/host enabled | Maintainer | Workflow + `docs/deploy.md`; origin still not live from this change set | Open |
| Dependency | Verified official FX/terminal/outage feeds | Manual labour until then | — | Editor | Manual observations | Open |
| Dependency | Org conversations before billing engineering | Packet 3 / Phase D | — | Founder | Gate D | Open |

---

## 8. RACI

Roles: **S** sponsor/founder, **E** editor, **M** technical maintainer, **B** future org buyer (consulted only). One Accountable per row.

| Deliverable / decision | S | E | M | B |
| --- | --- | --- | --- | --- |
| Year-1 free promise | A | C | I | I |
| Publish / withdraw an article | I | A | C | I |
| Enable a source | C | A | R | I |
| Collector behaviour and deploy | I | C | A | I |
| Turn SAMPLE off | C | A | R | I |
| Paid SKU names | A | C | I | C |
| Prices | A | I | I | C |
| Start billing engineering | A | C | R | I |
| Ads or full-site paywall | A (must refuse per charter) | C | I | I |

Until a second person is named, S and E and M may be the same human; still keep the decision names separate.

---

## 9. Governance model

- **Sponsor:** Founder — year-1 promise, commercial offer, Gate D.
- **Owner:** Editor — publication truth.
- **Working team:** Editor + maintainer.
- **Steering committee:** N/A until a second accountable person exists.
- **Cadence:** Weekly 15-minute ops; monthly metrics; quarterly gate review. Intensity light until non-demo coverage exists, then standard.
- **Decision rights:** Editor on copy; maintainer on runtime; founder on money and promises.
- **Escalation:** Source terms would make the public board non-compliant; ops would break USD 15/month; request to paywall or advertise before month 12.

---

## 10. Implementation roadmap

Relative to **14 September 2026**. Calendar dates are planning aids, not measured commitments.

| Horizon | Window | Quick wins | Strategic |
| --- | --- | --- | --- |
| 30 days | to 14 Oct 2026 | Public URL; fixture collect in habit; first real articles if sources allow | Do not turn SAMPLE off early |
| 60 days | to 13 Nov 2026 | Cadence visible in git; collector status known | Named readers start (private) |
| 90 days | to 13 Dec 2026 | SAMPLE off only if Gate A met | RSS habit; still no accounts |
| Long-term | months 6–12 | Paper offer; waitlist | Gate C |
| After month 12 | from 14 Sep 2027 | Paid depth if gates pass | Thin layer on existing schemas |

**Gates (billing engineering is blocked until all of A–C plus month 12)**

- **Gate A (Phase A):** Public HTTPS origin + at least one non-demo week in RSS.
- **Gate B (Phase B):** SAMPLE gone; professionals cite or forward; only rights-reviewed sources enabled.
- **Gate C (Phase C):** Written offer; ≥ 3 org conversations; year-1 free promise still held.
- **Gate D (Phase D):** Month 12 reached **and** Gates A–C. Then architecture + implementation of paid depth. Public board stays free.

---

## 11. Documentation package

| Document | Owner | Audience | Approval | Cadence |
| --- | --- | --- | --- | --- |
| This 5DS package | Founder | Founder / future collaborators | Founder | Quarterly |
| `audience-analysis.md` | Founder | Founder | Founder | When buyers change |
| `editorial-cadence.md` | Editor | Editor | Editor | When cadence changes |
| `paid-depth-architecture.md` | Maintainer | Maintainer | Founder | After Gate C, before code |
| App `README.md` | Maintainer | Operators | Maintainer | When commands change |
| Source register JSON | Editor | Public + editor | Editor | Per source change |
| Methodology page | Editor | Public | Editor | When policy changes |

SOPs: collect → review → publish; demo off; deploy. Templates: article JSON, observation JSON, draft queue. No admin user guide until Phase D.

---

## 12. Assumptions and questions

**Assumptions**

- Editorial labour remains founder-led and is excluded from the USD 15 cap (already decided in the MVP).
- Buyers will accept a free public board if depth (speed, archive, seats, alerts) is the paid object.
- Arabic/RTL is not year-1 revenue-critical.
- LGR does not merge into the TEDx archive app.
- No visitor analytics in year 1.

**Prioritised questions for the next version (do not invent answers)**

1. Who is editor-of-record if cadence becomes daily?
2. Year-1 habit: RSS-only, or a specific free newsletter tool that stays inside the cap and privacy bar?
3. After conversations: which SKU do organisations actually offer to pay for first?
4. What written reuse permission, if any, can be obtained from English-language Libya media?
5. What is the year-2 COGS ceiling once email + seats exist?
