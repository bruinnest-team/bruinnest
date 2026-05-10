# BruinNest

BruinNest is the MVP codebase for a roommate-matching web app.

This repository is initialized for the `US-1` to `US-5` MVP scope:

- account registration and login
- profile creation and update
- browse and search
- roommate detail page
- direct messaging

## Planned Stack

- frontend: `React`, `Vite`, `JavaScript`, `React Router`, `fetch`
- backend: `Node.js`, `Express`, `SQLite`, `better-sqlite3`
- auth: `express-session`

## Repository Layout

```text
bruinnest/
├── client/   # frontend app skeleton
├── server/   # backend app skeleton
└── docs/     # repo-local project documentation
```

Empty directories are tracked with `.gitkeep` during initialization.

## Initialization Status

This repository now includes:

- a Vite + React frontend initialization in `client/`
- an npm + Express backend initialization in `server/`
- placeholder folders for feature modules
- shared ignore rules
- environment variable templates

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
npm run dev
```

Business logic and the final MVP schema can be added in follow-up commits by module.
