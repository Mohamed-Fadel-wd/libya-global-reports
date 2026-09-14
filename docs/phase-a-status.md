# Phase A status — 14 September 2026

Gate A target: public HTTPS origin + non-demo items in `/rss.xml`. SAMPLE labels stay on until an editor turns demo off (gate already has ≥5 real articles; **do not** flip `showDemoContent` in this step).

| Gate A item | Status |
| --- | --- |
| Deploy path for static `dist/` | Workflow `.github/workflows/lgr-pages.yml`. Expected origin: `https://mohamed-fadel-wd.github.io/libyan-data-bank`. Live check is recorded after Pages deploy. |
| SAMPLE replaced with real coverage | **Partial.** Seven ReliefWeb-attributed articles, briefing `2026-09-14`, outlook `2026-w38` are `demo: false`. SAMPLE articles remain visible. Demo-off is **not** done. |
| Editorial cadence | Publishing day 14 September 2026 recorded as `published`. |
| Collection that is allowed to run | ReliefWeb RSS via `node:https`; drafts remain unpublished until review. |

**Gate A RSS half:** `/rss.xml` includes the seven approved non-demo articles after build. **Gate A URL half:** depends on GitHub Pages being enabled and the workflow succeeding.
