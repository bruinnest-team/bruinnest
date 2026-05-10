# BruinNest MVP Specification

## 1. Document Purpose

This document serves as the top-level overview of the BruinNest MVP specification.

The MVP specification is organized into the following companion documents:

- `bruinnest-mvp-database-spec.md`
- `bruinnest-mvp-api-spec.md`

This structure keeps the project specification clear and allows each area to be maintained independently during development.

## 2. Scope

The MVP specification covers `US-1` through `US-5`:

- account registration and login
- personal profile setup and update
- browse and search roommate profiles
- roommate detail page
- direct messaging

## 3. Document Map

### `bruinnest-mvp-database-spec.md`

Use this document for:

- database tables
- relationship design
- persistence rules
- browse eligibility rules
- schema extension strategy

### `bruinnest-mvp-api-spec.md`

Use this document for:

- endpoint definitions
- request and response contracts
- authentication behavior
- browse and messaging API behavior
- frontend-backend integration expectations

## 4. Related Documents

The following documents should be read together:

- `bruinnest-mvp-database-spec.md`
- `bruinnest-mvp-api-spec.md`
- `bruinnest-backend-architecture.md`

## 5. Implementation Order

Recommended implementation order:

1. authentication and session setup
2. profile creation and update
3. browse and search endpoint
4. roommate detail endpoint
5. conversation creation and message history
6. unread badge polling

## 6. Acceptance Alignment

This specification is intended to support the MVP subset of the BruinNest user stories:

- `US-1`: registration, verification, login, protected access
- `US-2`: profile setup and update
- `US-3`: browse, filter, and keyword search
- `US-4`: roommate detail page
- `US-5`: direct messaging with polling-based refresh in the MVP phase

Together, these documents define the first implementation baseline for the BruinNest MVP.
