# BruinNest API Specification

## 1. Document Purpose

This document defines the backend API contract for BruinNest across both the completed MVP and the current enhancement scope.

It covers the external API surface for:

- `US-1` through `US-5` in Phase 1 / MVP
- `US-6`, `US-7`, `US-8`, `US-9`, and `US-12` in the current Phase 2 scope
- avatar upload as a profile extension within `US-2`

This document is intended to be used by both frontend and backend developers during implementation.

## 2. Scope

### 2.1 Included in the Current API Contract

The current API covers:

1. registration and verification
2. login, logout, and session lookup
3. profile creation and update
4. avatar upload
5. browse and search endpoints
6. roommate detail endpoint
7. one-to-one messaging endpoints
8. unread message summary
9. compatibility questionnaire endpoints
10. compatibility score lookup
11. favorites endpoints
12. notification center endpoints
13. housing search and housing-link endpoints
14. map data endpoints for linked housing discovery

### 2.2 Deferred Beyond the Current Scope

The following features are intentionally excluded from the current API contract:

- group matching / housing party endpoints
- roommate agreement generation endpoints

### 2.3 Additions Since MVP

Compared with the original Phase 1 / MVP API contract, the current scope adds the following endpoint groups:

- avatar upload endpoint
- questionnaire endpoints
- compatibility score endpoint
- favorites endpoints
- notifications endpoints
- housing search and link endpoints
- housing map endpoint

These additions are called out again in the endpoint sections below so that readers can quickly distinguish the MVP foundation from Phase 2 extensions.

## 3. Technical Context

The API assumes the following implementation choices:

- backend: `Node.js + Express + JavaScript`
- database: `SQLite + better-sqlite3`
- authentication: `express-session`
- frontend requests: `fetch` through a wrapper layer
- message updates: polling
- notification updates: polling
- avatar upload transport: `multipart/form-data`

## 4. API Conventions

### 4.1 Base Rules

- All endpoints use the `/api` prefix.
- Protected endpoints require a valid session.
- Unauthenticated access to protected endpoints returns `401 Unauthorized`.
- All request bodies and query parameters must be validated on the server.
- All responses are JSON unless the endpoint explicitly accepts file upload input.

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

BruinNest uses session-based authentication with `express-session`.

After successful login or successful registration verification, the server creates a session for the user. The frontend must send requests with credentials enabled when accessing protected endpoints.

### 4.4 File Upload Conventions

Avatar upload uses `multipart/form-data`.

Rules:

- the uploaded file should be an image
- file validation and size limits must be enforced on the server
- the API stores the resulting file path or URL in the database and returns that URL in JSON responses

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

## 6. Profile Endpoints (Extended in Phase 2)

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
    "avatarUrl": "/uploads/avatars/1-1717191000.jpg",
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

### `PUT /api/profile/me/avatar` (Added in Phase 2)

Purpose: upload or replace the current user's avatar image.

Request body:

- `multipart/form-data`
- field name: `avatar`

Behavior:

- require authentication
- validate image type and size
- save the uploaded file
- update `profiles.avatar_url`

Success response:

```json
{
  "success": true,
  "data": {
    "avatarUrl": "/uploads/avatars/1-1717191000.jpg"
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
- `sortBy` optional (`latest` or `compatibility`)
- `hasLinkedHousing` optional

Behavior:

- require authentication
- return only profiles with `profile_completed = 1`
- exclude the current user from results
- apply all provided filters using AND logic
- search against `display_name` and `bio`
- when `sortBy=compatibility`, use cached compatibility scores when available

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
        "bioPreview": "Quiet and tidy UCLA student.",
        "avatarUrl": "/uploads/avatars/2-1717191000.jpg",
        "compatibilityScore": 86,
        "hasLinkedHousing": true
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
    "avatarUrl": "/uploads/avatars/2-1717191000.jpg",
    "compatibilityScore": 86,
    "isFavorited": true,
    "linkedHousing": {
      "housingUnitId": 12,
      "name": "Westwood Village Apartments - 1 Bed",
      "addressLine": "1033 Hilgard Ave #406",
      "monthlyRent": 3415,
      "bedrooms": 1,
      "bathrooms": 1,
      "photoUrl": "https://photos.zillowstatic.com/fp/cbf9592240656b16a2909d5c926e0221-p_e.jpg"
    },
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
          "displayName": "Alice",
          "avatarUrl": "/uploads/avatars/2-1717191000.jpg"
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
- when `afterMessageId` is omitted, return the full history
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
- trigger a notification for the recipient

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

## 8. Questionnaire and Compatibility Endpoints (Added in Phase 2)

### `GET /api/questionnaire/me`

Purpose: return the current user's questionnaire answers for editing or review.

Behavior:

- require authentication
- return `404` if the user has not submitted the questionnaire yet

Success response:

```json
{
  "success": true,
  "data": {
    "sleepSchedule": "night_owl",
    "cleanlinessLevel": "very_clean",
    "noiseTolerance": "low",
    "guestPolicy": "occasionally_ok",
    "studyHabits": "quiet_at_home",
    "smokingPreference": "non_smoker_only",
    "drinkingPreference": "okay",
    "sharingPreference": "shared_supplies_ok",
    "petComfort": "okay_with_cats",
    "communicationStyle": "direct_and_frequent"
  }
}
```

### `PUT /api/questionnaire/me`

Purpose: create or update the current user's questionnaire answers.

Request body:

```json
{
  "sleepSchedule": "night_owl",
  "cleanlinessLevel": "very_clean",
  "noiseTolerance": "low",
  "guestPolicy": "occasionally_ok",
  "studyHabits": "quiet_at_home",
  "smokingPreference": "non_smoker_only",
  "drinkingPreference": "okay",
  "sharingPreference": "shared_supplies_ok",
  "petComfort": "okay_with_cats",
  "communicationStyle": "direct_and_frequent"
}
```

Behavior:

- require authentication
- upsert the questionnaire row
- recalculate compatibility scores against other questionnaire-complete users
- trigger high-match notifications where appropriate

Success response:

```json
{
  "success": true,
  "data": {
    "questionnaireCompleted": true,
    "recalculatedUsers": 18
  }
}
```

### `GET /api/compatibility/:userId`

Purpose: return the compatibility score between the current user and another user.

Behavior:

- require authentication
- return `404` if the target profile does not exist
- return `409` or `404` if one or both users have not completed the questionnaire yet, depending on implementation choice

Success response:

```json
{
  "success": true,
  "data": {
    "userId": 2,
    "scorePercent": 86,
    "calculatedAt": "2026-05-31T20:00:00.000Z"
  }
}
```

## 9. Notification Endpoints (Added in Phase 2)

### `GET /api/notifications`

Purpose: return the current user's in-app notifications.

Query parameters:

- `page`
- `pageSize`
- `unreadOnly` optional

Behavior:

- require authentication
- sort notifications by newest first

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 15,
        "type": "new_message",
        "title": "New message from Alice",
        "body": "Hi! Are you still looking for a roommate?",
        "referenceType": "conversation",
        "referenceId": 3,
        "isRead": false,
        "createdAt": "2026-05-31T20:00:00.000Z"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 6
  }
}
```

### `POST /api/notifications/:notificationId/read` (Added in Phase 2)

Purpose: mark one notification as read.

Behavior:

- require authentication
- verify ownership of the notification

Success response:

```json
{
  "success": true,
  "data": {
    "notificationId": 15,
    "isRead": true
  }
}
```

### `POST /api/notifications/read-all` (Added in Phase 2)

Purpose: mark all notifications as read for the current user.

Success response:

```json
{
  "success": true,
  "data": {
    "markedCount": 6
  }
}
```

## 10. Favorites Endpoints (Added in Phase 2)

### `GET /api/favorites`

Purpose: return the current user's saved roommate profiles.

Behavior:

- require authentication
- return favorited users as profile cards suitable for a favorites page

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": 2,
        "displayName": "Alice",
        "avatarUrl": "/uploads/avatars/2-1717191000.jpg",
        "graduationYear": 2027,
        "budgetMin": 900,
        "budgetMax": 1300,
        "favoritedAt": "2026-05-31T20:00:00.000Z"
      }
    ]
  }
}
```

### `POST /api/favorites/:targetUserId`

Purpose: save another user's profile to the current user's favorites.

Behavior:

- require authentication
- reject self-favoriting
- create the favorite row if it does not exist
- optionally trigger a favorite-related notification

Success response:

```json
{
  "success": true,
  "data": {
    "targetUserId": 2,
    "isFavorited": true
  }
}
```

### `DELETE /api/favorites/:targetUserId`

Purpose: remove another user's profile from the current user's favorites.

Behavior:

- require authentication
- delete the favorite row if present

Success response:

```json
{
  "success": true,
  "data": {
    "targetUserId": 2,
    "isFavorited": false
  }
}
```

## 11. Housing and Map Endpoints (Added in Phase 2)

### `GET /api/housing/search`

Purpose: search the local housing catalog that users can link to their profiles.

Query parameters:

- `q` optional address or keyword search
- `neighborhood` optional
- `budgetMin` optional
- `budgetMax` optional
- `bedrooms` optional
- `page`
- `pageSize`

Behavior:

- require authentication
- search imported local listing records rather than calling a live third-party API
- return paginated housing results

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "housingUnitId": 12,
        "externalId": "5XkJC3-1bd",
        "name": "Westwood Village Apartments - 1 Bed",
        "addressLine": "1033 Hilgard Ave #406",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90024",
        "neighborhood": "Westwood",
        "monthlyRent": 3415,
        "bedrooms": 1,
        "bathrooms": 1,
        "lat": 34.0615,
        "lng": -118.4412,
        "photoUrls": [
          "https://photos.zillowstatic.com/fp/cbf9592240656b16a2909d5c926e0221-p_e.jpg"
        ],
        "listingUrl": "https://www.zillow.com/apartments/los-angeles-ca/westwood-village-apartments/5XkJC3/"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 40
  }
}
```

### `GET /api/housing/me/link` (Added in Phase 2)

Purpose: return the housing unit currently linked to the authenticated user's profile.

Behavior:

- require authentication
- return `404` if no housing unit is linked yet

Success response:

```json
{
  "success": true,
  "data": {
    "housingUnitId": 12,
    "name": "Westwood Village Apartments - 1 Bed",
    "addressLine": "1033 Hilgard Ave #406",
    "monthlyRent": 3415,
    "bedrooms": 1,
    "bathrooms": 1,
    "lat": 34.0615,
    "lng": -118.4412
  }
}
```

### `PUT /api/housing/me/link`

Purpose: create or replace the housing unit linked to the current user's profile.

Request body:

```json
{
  "housingUnitId": 12
}
```

Behavior:

- require authentication
- verify that the housing unit exists in the imported catalog
- create or replace the user's current link

Success response:

```json
{
  "success": true,
  "data": {
    "housingUnitId": 12,
    "linked": true
  }
}
```

### `DELETE /api/housing/me/link`

Purpose: remove the current user's linked housing unit.

Success response:

```json
{
  "success": true,
  "data": {
    "linked": false
  }
}
```

### `GET /api/housing/map`

Purpose: return map-ready housing markers for compatible users with linked housing.

Query parameters:

- `minCompatibilityScore` optional
- `budgetMin` optional
- `budgetMax` optional
- `bedrooms` optional

Behavior:

- require authentication
- return only users with linked housing and valid coordinates
- include compatibility score when available

Success response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": 2,
        "displayName": "Alice",
        "compatibilityScore": 86,
        "budgetMin": 900,
        "budgetMax": 1300,
        "housing": {
          "housingUnitId": 12,
          "name": "Westwood Village Apartments - 1 Bed",
          "addressLine": "1033 Hilgard Ave #406",
          "monthlyRent": 3415,
          "bedrooms": 1,
          "bathrooms": 1,
          "lat": 34.0615,
          "lng": -118.4412
        }
      }
    ]
  }
}
```

## 12. Frontend Integration Notes

The frontend should use a dedicated API wrapper layer instead of calling `fetch` inline in page components.

Recommended module split:

- `client/src/lib/api/auth.js`
- `client/src/lib/api/profile.js`
- `client/src/lib/api/messages.js`
- `client/src/lib/api/questionnaire.js`
- `client/src/lib/api/notifications.js`
- `client/src/lib/api/favorites.js`
- `client/src/lib/api/housing.js`

This keeps view logic simpler and leaves room for future adoption of a different request or state-management library.

## 13. Deferred Items and Extension Points

The following decisions are intentional:

1. polling remains the message and notification update strategy for the current project scope
2. housing data is served from a locally imported catalog rather than a live external API during normal app use
3. compatibility sorting depends on cached scores instead of recalculating every comparison in the request path
4. group matching and roommate agreement generation remain deferred

## 14. Summary

The BruinNest API is now centered on six stable domains:

- authentication
- profiles
- messaging
- compatibility
- notifications and favorites
- housing and map discovery

This contract preserves the original MVP API foundation while expanding the system for the current Phase 2 feature set.
