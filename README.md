# Speedtest Server Explorer

A fast, searchable interface for exploring the public [Speedtest](https://www.speedtest.net) server network. Browse servers by ISP, city, or country, view their details, and launch a speed test in one click.

## Features

- **Search** — search the Speedtest API by ISP, operator, or city (first word hits the API, extra words refine client-side)
- **Table** — sortable, filterable, paginated server list powered by TanStack Table
- **Server detail** — side panel with host, coordinates, HTTPS status, copy fields, and a direct map link
- **Run speedtest** — one-click button linking to `speedtest.net/server/<id>` for any server
- **Local-first results** — default view uses your IP geolocation (via Cloudflare edge) to return nearby servers
- **URL persistence** — filter, sort, page, and page size are synced to URL params for shareable views
- **Dark / light mode** — system preference detected, manually overridable
- **Keyboard shortcut** — press `/` to focus the table filter input

## How it works

Requests go through a **Cloudflare Worker** that proxies the Speedtest API. The worker reads your geolocation (`lat`/`lon`) from Cloudflare's edge network and passes it to the API, so results are sorted by proximity to you rather than to a fixed data center.

```
Browser → Cloudflare Worker (edge, near you)
             ↓  lat/lon from CF geo-IP
        Speedtest API → servers sorted by distance
```

When you search, the first word is sent to the Speedtest API (single-term only). Any additional words are applied as a local filter on the returned results — so `Orange France` fetches all Orange servers, then narrows to France.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Table | TanStack Table v8 |
| Backend | Cloudflare Workers |
| Deploy | Wrangler |

## Development

```bash
npm install

# Frontend dev server (Vite)
npm run dev

# Worker dev server (Wrangler)
npm run worker:dev
```

Both need to run together for the full experience — Vite proxies `/api/*` to the worker in dev mode.

## Deployment

```bash
npm run deploy
```

This runs `vite build` followed by `wrangler deploy`. The built frontend is served as static assets through the same worker.

## Project structure

```
src/
  App.tsx                        # Main app, table, search, toolbar
  components/
    about-dialog.tsx             # About / how it works dialog
    server-detail-sheet.tsx      # Server detail side panel
    mode-toggle.tsx              # Dark / light mode toggle
    theme-provider.tsx           # Theme context
    ui/                          # shadcn/ui components
worker/
  index.ts                       # Cloudflare Worker — geo-aware API proxy
```

## Disclaimer

This tool is not affiliated with, endorsed by, or connected to Ookla, LLC or Speedtest.net. Server data is sourced from the publicly available Speedtest server API. All trademarks belong to their respective owners.
