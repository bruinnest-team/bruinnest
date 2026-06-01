# BruinNest Specification

## 1. Document Purpose

This document serves as the top-level overview of the BruinNest project specification.

The project specification is organized into the following companion documents:

- `bruinnest-user-story.md`
- `bruinnest-database-spec.md`
- `bruinnest-api-spec.md`
- `bruinnest-backend-architecture.md`
- `bruinnest-frontend-architecture.md`

This structure keeps the project specification clear and allows each area to be maintained independently during development.

## 2. Scope

The current documentation covers:

- Phase 1 / MVP: `US-1` through `US-5`
- Phase 2 / current enhancement scope: `US-6`, `US-7`, `US-8`, `US-9`, and `US-12`
- avatar upload as a profile extension within `US-2`

Deferred items:

- `US-10` Roommate Group / Housing Party
- `US-11` Roommate Agreement Template Generator

## 3. Document Map

### `bruinnest-user-story.md`

Use this document for:

- product requirements
- acceptance criteria
- dependency relationships between user stories
- phase scope tracking

### `bruinnest-database-spec.md`

Use this document for:

- database tables
- relationship design
- persistence rules
- browse eligibility rules
- schema extension strategy

### `bruinnest-api-spec.md`

Use this document for:

- endpoint definitions
- request and response contracts
- authentication behavior
- avatar upload behavior
- compatibility, favorites, notifications, housing, and map API behavior
- frontend-backend integration expectations

### `bruinnest-backend-architecture.md`

Use this document for:

- backend layering rules
- module ownership
- service and repository boundaries
- import script and cross-module coordination guidance

### `bruinnest-frontend-architecture.md`

Use this document for:

- frontend layering rules
- page and feature organization
- API wrapper responsibilities
- state management and polling strategy

## 4. Related Documents

The following documents should be read together:

- `bruinnest-user-story.md`
- `bruinnest-database-spec.md`
- `bruinnest-api-spec.md`
- `bruinnest-backend-architecture.md`
- `bruinnest-frontend-architecture.md`

## 5. Implementation Order

Recommended implementation order:

1. align user stories and project scope
2. define database schema and persistence rules
3. define API contracts
4. define backend architecture
5. define frontend architecture
6. implement and refine feature modules

## 6. Acceptance Alignment

This specification is intended to support the current planned BruinNest user-story set:

- `US-1`: registration, verification, login, protected access
- `US-2`: profile setup and update
- `US-3`: browse, filter, and keyword search
- `US-4`: roommate detail page
- `US-5`: direct messaging with polling-based refresh
- `US-6`: housing search and profile linkage
- `US-7`: compatibility questionnaire and score lookup
- `US-8`: in-app notifications
- `US-9`: saved roommate profiles
- `US-12`: map display of compatible linked housing

Together, these documents define the current implementation baseline for BruinNest.
