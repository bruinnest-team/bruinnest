# BruinNest

BruinNest is a roommate-matching web app for UCLA students looking for compatible roommates and housing options near campus.

The current repository scope includes:

- Phase 1 / MVP: `US-1` through `US-5`
- Phase 2 / current enhancement scope: `US-6`, `US-7`, `US-8`, `US-9`, and `US-12`
- avatar upload as a profile extension within `US-2`

Core product areas include:

- account registration and login
- profile creation, update, and avatar upload
- browse and search
- roommate detail page
- direct messaging
- compatibility questionnaire and score display
- favorites and notifications
- housing search, housing linking, and map-based discovery

## Planned Stack

- frontend: `React`, `Vite`, `JavaScript`, `React Router`, `fetch`, `TanStack Query`
- backend: `Node.js`, `Express`, `SQLite`, `better-sqlite3`
- auth: `express-session`
- uploads: `multipart/form-data` with server-side file handling
- map support: local housing dataset plus frontend map rendering

## Documentation

Project specifications and architecture notes live in `docs/`.

Key documents:

- `docs/bruinnest-user-story.md`
- `docs/bruinnest-database-spec.md`
- `docs/bruinnest-api-spec.md`
- `docs/bruinnest-backend-architecture.md`
- `docs/bruinnest-frontend-architecture.md`
- `docs/README.md`

## Repository Layout

```text
bruinnest/
├── client/   # frontend application
├── server/   # backend application
└── docs/     # project specifications and architecture notes
```

Empty directories are tracked with `.gitkeep` during initialization.

## Current Status

This repository now includes:

- a Vite + React frontend in `client/`
- an Express + SQLite backend in `server/`
- demo seed data for local development and product walkthroughs
- a local housing dataset in `server/database/import-data/westwood-rentals.json`
- detailed database, API, backend, and frontend documentation in `docs/`

## Getting Started

Frontend:

```bash
cd client
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
cp .env.example .env
npm run db:reset
npm run dev
```

Use `npm run db:reset` for the first local setup and whenever you want a clean demo database. It runs, in order: `db:clean`, `housing:import`, and `db:seed`.

### Database scripts

Run these from `server/`:

| Command | Purpose |
|---------|---------|
| `npm run db:reset` | Full reset: delete DB/uploads, import housing, seed demo data |
| `npm run db:clean` | Delete the SQLite database and uploaded avatars |
| `npm run housing:import` | Import listings from `database/import-data/westwood-rentals.json` |
| `npm run db:seed` | Copy seed avatars and load `database/seed.sql` |

`db:seed` assumes housing listings already exist. For a fresh database, use `db:reset` instead of `db:seed` alone.

### Demo account

After seeding, log in with:

- **Email:** `alice@ucla.edu`
- **Password:** `Password123!`

All seeded accounts share the same password. Alice is the primary demo user and includes preloaded browse matches, compatibility scores, favorites, notifications, map markers (via linked roommates), and message threads.

Other seeded users are background profiles for browse, map, and compatibility demos. Avatar placeholders live in `server/database/seed-assets/avatars/` and are copied into `server/uploads/avatars/` during `db:seed`.

Backend notes:

- Copy `.env.example` to `.env` before starting the server for the first time.
- `DATABASE_PATH` is resolved relative to the `server/` directory when you run backend commands there.
- The backend automatically initializes the SQLite database from `database/schema.sql` on startup.
- Demo seed data covers users, profiles, questionnaires, compatibility scores, favorites, notifications, housing links, messaging, and avatar placeholders.
- Update `SESSION_SECRET` in `.env` before shared testing or deployment. Do not keep the default `change-me` value.

Frontend notes:

- Configure the frontend API base URL in `client/.env` if needed.
- The frontend should send authenticated requests with credentials enabled.
- Phase 2 screens such as questionnaire, favorites, housing, and map discovery depend on the newer API and database contracts described in `docs/`.

## E2E Testing

End-to-end tests use [Playwright](https://playwright.dev/) and live in `e2e/`. From the `bruinnest/` root, a single command starts both servers, runs all 10 tests, and shuts everything down:

```bash
npm install
npm run test:e2e
```

On Linux/WSL, install Chromium system dependencies once before running:

```bash
npx playwright install-deps chromium
```

### Test coverage

| # | Feature | What it verifies |
|---|---------|-----------------|
| 1 | Auth | Register triggers verification email step |
| 2 | Auth | Login with valid credentials redirects to browse |
| 3 | Auth | Login with wrong password shows error |
| 4 | Routing | Unauthenticated access to `/browse` redirects to login |
| 5 | Browse | Profile listings are visible after login |
| 6 | Browse | Search by name filters results correctly |
| 7 | Favorites | Favorites page loads for authenticated user |
| 8 | Questionnaire | Questionnaire page loads with dropdown questions |
| 9 | Housing | Housing page loads with search form |
| 10 | Messages | Messages page loads conversation layout |

## Product Scope Notes

The current planned implementation keeps two user stories deferred for a later phase:

- `US-10` Roommate Group / Housing Party
- `US-11` Roommate Agreement Template Generator

The current design also intentionally keeps polling as the update strategy for messages and notifications rather than introducing WebSocket transport.
