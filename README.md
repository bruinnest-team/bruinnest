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
- seeded MVP data for local development
- a local housing dataset in `server/database/data/`
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
npm run db:seed
npm run dev
```

Backend notes:

- Copy `.env.example` to `.env` before starting the server for the first time.
- `DATABASE_PATH` is resolved relative to the `server/` directory when you run backend commands there.
- The backend automatically initializes the SQLite database from `database/schema.sql` on startup.
- Run `npm run db:seed` to load local test users, profiles, and messaging data for backend integration.
- Seeded users share the demo password `Password123!` for local auth and API testing.
- Update `SESSION_SECRET` in `.env` before shared testing or deployment. Do not keep the default `change-me` value.

Frontend notes:

- Configure the frontend API base URL in `client/.env` if needed.
- The frontend should send authenticated requests with credentials enabled.
- Phase 2 screens such as questionnaire, favorites, housing, and map discovery depend on the newer API and database contracts described in `docs/`.

## Product Scope Notes

The current planned implementation keeps two user stories deferred for a later phase:

- `US-10` Roommate Group / Housing Party
- `US-11` Roommate Agreement Template Generator

The current design also intentionally keeps polling as the update strategy for messages and notifications rather than introducing WebSocket transport.
