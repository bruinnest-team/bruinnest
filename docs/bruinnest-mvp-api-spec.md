# BruinNest MVP API Specification

## 1. Document Purpose

This document defines the backend API contract for the BruinNest MVP. It covers the external API surface for `US-1` through `US-5`:

- account registration and login
- profile creation and update
- browse and search
- roommate detail page
- direct messaging

This document is intended to be used by both frontend and backend developers during implementation.

## 2. Scope

### 2.1 Included in MVP

The MVP API covers:

1. registration and verification
2. login, logout, and session lookup
3. profile creation and update
4. browse and search endpoints
5. roommate detail endpoint
6. one-to-one messaging endpoints
7. unread message summary

### 2.2 Deferred Beyond MVP

The following features are not included in the current API contract:

- housing integration endpoints
- favorites endpoints
- notification center endpoints
- compatibility questionnaire endpoints
- compatibility score endpoints
- map endpoints
- agreement generation endpoints

## 3. Technical Context

The API assumes the following implementation choices:

- backend: `Node.js + Express + JavaScript`
- database: `SQLite + better-sqlite3`
- authentication: `express-session`
- frontend requests: `fetch`
- message updates: polling in the MVP phase

## 4. API Conventions

### 4.1 Base Rules

- All endpoints use the `/api` prefix.
- Protected endpoints require a valid session.
- Unauthenticated access to protected endpoints returns `401 Unauthorized`.
- All request bodies and query parameters must be validated on the server.
- All responses are JSON.

### 4.2 Response Format

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 8 characters and contain a digit."
  }
}
```

### 4.3 Authentication Model

The MVP uses session-based authentication with `express-session`.

After successful login or successful registration verification, the server creates a session for the user. The frontend must send requests with credentials enabled when accessing protected endpoints.

## 5. Authentication Endpoints

### `POST /api/auth/register`

Purpose: start the registration flow by validating email and password and then sending a verification code.

Request body:

```json
{
  "email": "student@example.com",
  "password": "abc12345"
}
```

Validation rules:

- email must be valid
- password must be at least 8 characters
- password must contain at least one digit
- email must not already exist
- a new verification code cannot be resent within 60 seconds

Success response:

```json
{
  "success": true,
  "data": {
    "message": "Verification code sent"
  }
}
```

### `POST /api/auth/verify`

Purpose: complete registration with the verification code.

Request body:

```json
{
  "email": "student@example.com",
  "password": "abc12345",
  "code": "123456"
}
```

Server behavior:

- validate the latest unconsumed valid code for the email
- hash the password with `bcrypt`
- create the user record
- mark the verification row as consumed
- create a login session

Success response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com"
    },
    "needsProfileSetup": true
  }
}
```

### `POST /api/auth/login`

Purpose: log in an existing verified user.

Request body:

```json
{
  "email": "student@example.com",
  "password": "abc12345"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com"
    },
    "profileCompleted": false
  }
}
```

### `POST /api/auth/logout`

Purpose: destroy the current session.

Success response:

```json
{
  "success": true,
  "data": {
    "message": "Logged out"
  }
}
```

### `GET /api/auth/me`

Purpose: return the current authenticated user and profile completion state.

Success response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com"
    },
    "profileCompleted": true
  }
}
```

## 6. Profile Endpoints

### `POST /api/profile`

Purpose: create the initial profile for the current user.

Request body:

```json
{
  "displayName": "Alice",
  "gender": "female",
  "graduationYear": 2027,
  "budgetMin": 900,
  "budgetMax": 1300,
  "moveInDate": "2026-09-01",
  "bio": "Quiet and tidy UCLA student."
}
```

Server behavior:

- require authentication
- create the current user's profile
- set `profile_completed = 1` when all required fields are present

Success response:

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "profileCompleted": true
  }
}
```

### `GET /api/profile/me`

Purpose: return the current user's editable profile.

Success response:

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "displayName": "Alice",
    "gender": "female",
    "graduationYear": 2027,
    "budgetMin": 900,
    "budgetMax": 1300,
    "moveInDate": "2026-09-01",
    "bio": "Quiet and tidy UCLA student.",
    "profileCompleted": true
  }
}
```

### `PUT /api/profile/me`

Purpose: update the current user's profile.

Request body:

```json
{
  "displayName": "Alice Chen",
  "gender": "female",
  "graduationYear": 2027,
  "budgetMin": 1000,
  "budgetMax": 1400,
  "moveInDate": "2026-09-15",
  "bio": "Looking for a respectful and organized roommate."
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "profileCompleted": true
  }
}
```

### `GET /api/profiles`

Purpose: return the public browse and search list.

Query parameters:

- `page`
- `pageSize`
- `gender`
- `graduationYear`
- `budgetMin`
- `budgetMax`
- `moveInDate`
- `keyword`

Behavior:

- require authentication
- return only profiles with `profile_completed = 1`
- exclude the current user from results
- apply all provided filters using AND logic
- search against `display_name` and `bio`

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": 2,
        "displayName": "Alice",
        "gender": "female",
        "graduationYear": 2027,
        "budgetMin": 900,
        "budgetMax": 1300,
        "moveInDate": "2026-09-01",
        "bioPreview": "Quiet and tidy UCLA student."
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 24
  }
}
```

### `GET /api/profiles/:userId`

Purpose: return the full public roommate profile for the detail page.

Behavior:

- require authentication
- return `404` if the profile does not exist

Success response:

```json
{
  "success": true,
  "data": {
    "userId": 2,
    "displayName": "Alice",
    "gender": "female",
    "graduationYear": 2027,
    "budgetMin": 900,
    "budgetMax": 1300,
    "moveInDate": "2026-09-01",
    "bio": "Quiet and tidy UCLA student.",
    "canMessage": true
  }
}
```

## 7. Messaging Endpoints

### `POST /api/conversations`

Purpose: create or return a one-to-one conversation with another user.

Request body:

```json
{
  "targetUserId": 2
}
```

Behavior:

- require authentication
- reject self-chat
- if a conversation already exists between the same two users, return the existing conversation
- otherwise create a new conversation and two participant rows

Success response:

```json
{
  "success": true,
  "data": {
    "conversationId": 3
  }
}
```

### `GET /api/conversations`

Purpose: return the current user's conversation list.

Behavior:

- require authentication
- sort conversations by latest activity descending

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "conversationId": 3,
        "otherUser": {
          "userId": 2,
          "displayName": "Alice"
        },
        "lastMessagePreview": "Hi! Are you still looking for a roommate?",
        "lastMessageAt": "2026-05-09T17:00:00Z",
        "unreadCount": 1
      }
    ]
  }
}
```

### `GET /api/conversations/:conversationId/messages`

Purpose: return message history and support incremental polling.

Query parameters:

- `afterMessageId` optional

Behavior:

- require authentication
- verify that the current user belongs to the conversation
- when `afterMessageId` is omitted, return the full history for the MVP
- when `afterMessageId` is provided, return only messages with larger ids
- return messages in chronological order

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "senderUserId": 2,
        "body": "Hi! Are you still looking for a roommate?",
        "createdAt": "2026-05-09T17:00:00Z"
      }
    ]
  }
}
```

### `POST /api/messages`

Purpose: send a message in an existing conversation.

Request body:

```json
{
  "conversationId": 3,
  "body": "Hi! Are you still looking for a roommate?"
}
```

Behavior:

- require authentication
- verify that the sender belongs to the conversation
- insert the message
- update `conversations.updated_at`

Success response:

```json
{
  "success": true,
  "data": {
    "messageId": 10
  }
}
```

### `POST /api/conversations/:conversationId/read`

Purpose: mark a conversation as read for the current user.

Request body:

```json
{
  "lastReadMessageId": 10
}
```

Behavior:

- require authentication
- verify that the current user belongs to the conversation
- update `last_read_message_id` for the corresponding participant row

Success response:

```json
{
  "success": true,
  "data": {
    "conversationId": 3,
    "lastReadMessageId": 10
  }
}
```

### `GET /api/messages/unread-summary`

Purpose: return unread badge data for the navigation bar.

Success response:

```json
{
  "success": true,
  "data": {
    "unreadCount": 4
  }
}
```

## 8. Frontend Integration Notes

The frontend should use a dedicated API wrapper layer instead of calling `fetch` inline in page components.

Recommended module split:

- `client/src/lib/api/auth.js`
- `client/src/lib/api/profile.js`
- `client/src/lib/api/messages.js`

This keeps view logic simpler and leaves room for future adoption of a different request or state-management library.

## 9. Deferred Items and Extension Points

The following decisions are intentional:

1. housing-unit fields are excluded from MVP API responses
2. browse keyword search targets `display_name` and `bio` only
3. polling is the MVP message update strategy
4. favorites, notification center, and compatibility endpoints are deferred

## 10. Summary

The MVP API is centered on three domains:

- authentication
- profiles
- messaging

This contract is intentionally narrow enough for the first delivery while remaining compatible with later feature expansion.
