# Phase A status — 14 September 2026

Gate A target: public HTTPS origin + non-demo items in `/rss.xml`. SAMPLE labels stay on (`showDemoContent` remains true) even though ≥5 real articles exist.

| Gate A item | Status |
| --- | --- |
| Deploy path | Private monorepo Pages is blocked on GitHub Free. Public sibling `libya-global-reports` is the free host. Origin: `https://mohamed-fadel-wd.github.io/libya-global-reports`. |
| SAMPLE vs real coverage | Seven ReliefWeb-attributed articles, briefing `2026-09-14`, outlook `2026-w38` are `demo: false`. SAMPLE articles remain visible. Demo-off is **not** done. |
| Editorial cadence | 14 September 2026 recorded as `published`. |
| Collection | ReliefWeb RSS via `node:https`; drafts stay unpublished until review. |

**Gate A RSS:** seven approved non-demo items after build. **Gate A URL:** the public Pages origin above, once the sibling repo workflow succeeds.
