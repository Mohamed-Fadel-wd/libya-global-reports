# Deploy — Libya Global Reports

Static `dist/` from `npm run build`. This app is a separate deployable from `apps/web`. Do not attach it to the TEDx Vercel project without checking hobby-plan limits.

Year-1 host should stay on a **free static tier**. Confirm the host’s build minutes and bandwidth before calling it free. If a host starts charging, stop or move.

## Before any public build

1. Set `LGR_SITE_URL` to the public **HTTPS** origin (no trailing slash).
2. If the site is not at the domain root (GitHub project Pages), set `LGR_BASE_PATH` to that prefix (example: `/libyan-data-bank`). Root deploys use `/`.
3. Leave `LGR_SHOW_DEMO=true` until the demo-off gate in `docs/editorial-cadence.md` passes.
4. `npm test && npm run validate && npm run build`.

`public/_headers` is honoured by Cloudflare Pages and Netlify. GitHub Pages does not apply `_headers` automatically.

## GitHub Pages (workflow already in the monorepo)

Workflow: `.github/workflows/lgr-pages.yml`.

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. Run **LGR pages** via `workflow_dispatch`. Push-to-`main` deploy stays commented until you confirm Pages and Actions limits.
3. Expected project URL for the **private monorepo** is blocked on GitHub Free (Pages needs a public repository). The public origin is the sibling repo **libya-global-reports**: `https://mohamed-fadel-wd.github.io/libya-global-reports` with `LGR_BASE_PATH=/libya-global-reports`.

The workflow does not publish drafts. It only builds committed `content/`.

## Cloudflare Pages or Netlify

Create a project whose root is `apps/libya-global-reports` (or set the app directory equivalently).

- Build command: `npm run build`
- Publish directory: `dist`
- Environment: `LGR_SITE_URL=https://<your-pages-host>`, `LGR_BASE_PATH=/`, `LGR_SHOW_DEMO=true` until the gate.

`netlify.toml` in this app folder matches that layout.

## After the first public origin exists

Update `content/settings.json` `siteUrl` **or** keep relying on `LGR_SITE_URL` at build time so RSS and canonical links are not `localhost`.
