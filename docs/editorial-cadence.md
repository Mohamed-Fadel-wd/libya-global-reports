# Editorial cadence — Libya Global Reports

**Owner:** Editor  
**Timezone:** Africa/Tripoli  
**Purpose:** Keep a stated publishing rhythm without inventing events or auto-publishing collector drafts.

## Publishing days

On each publishing day the editor either publishes **or** records “no verified update”. Silence is not a cadence.

Minimum on a publishing day:

1. One daily briefing (`content/briefings/YYYY-MM-DD.json`) **or** a log row that the day had no verified update.
2. Currency and infrastructure **rows only when a primary document exists**. Missing stays “Not reported”. Do not copy yesterday’s numbers forward.
3. At least one approved article only if a source document was verified that day. Empty essential lists are allowed.

Weekly, every calendar week:

- One weekly outlook (`content/outlooks/`) **or** an explicit “no verified weekly outlook” log row.

## What never happens

- Collector drafts do not become `editorialStatus: "published"` without a human reading the source URL.
- `demo: false` is only for real, reviewed reporting.
- SAMPLE / `showDemoContent: false` only after the demo-off gate (at least five approved non-demo articles; prefer ten).
- No invented feeds, prices, or current events as if they were live.
- Libya Herald and other personal/non-commercial RSS terms stay disabled until written reuse allows this public board.

## Review path

1. `npm run collect -- --adapter=fixture-reliefweb` (always allowed) and/or `--adapter=reliefweb-libya-rss` (live drafts).
2. Open `editorial/drafts/queue/`. Treat items as leads, not copy.
3. Verify the canonical URL. Do not paste copyrighted body text into the site.
4. Write structured JSON under `content/` using the four questions: what happened, where it matters, operational implication, watch next.
5. `npm run validate` then `npm run build`.
6. Append a row to `editorial/logs/publishing-days.jsonl`.

## Recording “no verified update”

Append one JSON line:

```json
{"date":"2026-09-14","kind":"publishing-day","status":"no-verified-update","note":"No primary document cleared review. SAMPLE remains on.","actor":"editor"}
```

Allowed `status` values: `published`, `no-verified-update`.

Allowed `kind` values: `publishing-day`, `weekly-outlook`.

## Demo-off checklist

Only when **all** are true:

- At least five (prefer ten) articles with `demo: false` and `editorialStatus: "published"`.
- Those items appear in `/rss.xml` after a production build.
- A public HTTPS origin is set via `LGR_SITE_URL`.
- Editor accepts an honest empty board if some regions still lack coverage.

Then set `"showDemoContent": false` in `content/settings.json` (or `LGR_SHOW_DEMO=false` at build) and rebuild. `npm run validate` refuses a non-demo build before the gate.
