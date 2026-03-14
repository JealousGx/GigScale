# GigScale

**AI-powered freelancer profile optimization** for Upwork and Fiverr. Analyze your profile, get actionable suggestions, and rewrite your content for better visibility and conversions.

## Features

- **Deep profile analysis** — Visibility, conversion, trust, and completeness metrics
- **AI-powered suggestions** — Prioritized, actionable recommendations for your niche
- **Smart rewrite engine** — Headlines, descriptions, and gig copy optimized for search and conversions
- **Multi-platform** — Upwork and Fiverr from a single dashboard
- **Credits-based usage** — Transparent billing with optional plans

## Tech stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Auth:** [Better Auth](https://www.better-auth.com/)
- **Database:** MySQL (TiDB Cloud) with [Drizzle ORM](https://orm.drizzle.team/)
- **UI:** React 19, Tailwind CSS, Radix UI, Motion
- **State:** Zustand, TanStack Query

## Getting started

### Prerequisites

- Node.js **≥ 23**
- pnpm **10.x** (or use the version from `packageManager` in `package.json`)

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database (optional, for full app)

```bash
pnpm db:setup    # Start DB with Docker
pnpm db:push     # Push schema
pnpm db:studio   # Open Drizzle Studio (optional)
```

### Build and start

```bash
pnpm build
pnpm start
```

## Scripts

| Command        | Description                       |
| -------------- | --------------------------------- |
| `pnpm dev`     | Start dev server                  |
| `pnpm build`   | Run migrations + production build |
| `pnpm start`   | Start production server           |
| `pnpm lint`    | Run Biome check                   |
| `pnpm format`  | Format with Biome                 |
| `pnpm analyze` | Build with bundle analysis        |

## Environment

Copy `.env.example` to `.env.local` and set:

- `DATABASE_*` — MySQL connection (for DB-backed features)
- `BETTER_AUTH_*` / `AUTH_*` — Auth and OAuth providers
- `NEXT_PUBLIC_*` — Public URLs, feature flags, and API endpoints

See `.env.example` for the full list.

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs)
