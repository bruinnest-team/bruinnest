# BruinNest User Story Documentation

# 1. Project Overview

## 1.1 Project Description

BruinNest is a web platform for UCLA students who are actively searching for compatible roommates for off-campus housing. Unlike general housing sites, BruinNest assumes users already have a target apartment or unit in mind (or are actively browsing listings on sites like Zillow and Apartments.com) and need to find the right people to share it with. Students register with their email, build a personal profile with living preferences, link their target housing units from a catalog of publicly available rental listings near UCLA, and discover compatible roommates through a lifestyle questionnaire and matching algorithm. A built-in direct messaging system lets potential roommates communicate without exchanging personal contact info. By restricting the platform to verified UCLA students, BruinNest creates a trusted, campus-specific community for one of the most stressful parts of college life.

## 1.2 Current Project Scope

The BruinNest requirements are organized into three practical delivery phases:

- **Phase 1: MVP** covers `US-1` through `US-5`, including registration/login, profile setup, browse/search, roommate detail, and direct messaging.
- **Phase 2: Current enhancement scope** focuses on `US-6`, `US-7`, `US-8`, `US-9`, and `US-12`, covering housing linkage, compatibility scoring, notifications, favorites, and map-based housing discovery.
- **Phase 3: Deferred scope** currently leaves `US-10` and `US-11` for a later iteration.

# 2. User Stories

## 2.1 Must Have (Core Functionalities)

### US-1: Account Registration

**User Role**: As a new user

**User Goal**: I want to create an account using my email address

**Benefit**: so that I can link the privacy of the account to my email.

**Dependency**: None. All other stories will depend on this.

#### Acceptance Criteria

1. Given a new user enters an email that hasn't been used to create an account, when they set a password that meets strength requirements (≥8 characters and includes a number) and confirm, then the system tries to send a verification code to the user's email and refuses to send another code until 60 seconds later.

2. Given that the system has sent the verification code, when the user enters the correct code, then the account is successfully created and the user is redirected to the profile setup page.

3. Given that a user enters an email that already exists, when they submit the registration form, then the system displays an error message and refuses to create the account.

4. Given that a registered user enter valid credentials on the login page, when they click to login, then they are redirected to the homepage.

5. Given that a visitor is unauthenticated, when they attempt to access any protected route (browse, messaging, profile), then they are redirected to the login page.

### US-2: Personal Profile Setup

**User Role**: As a registered user

**User Goal**: I want to fill out my personal profile with my name, gender, graduation year, budget range, move-in date, and a short bio

**Benefit**: so that other users can learn about me and evaluate whether we'd be compatible roommates.

**Dependency**: Depends on US-1.

#### Acceptance Criteria

1. Given an authenticated user with an incomplete profile, when they navigate to the profile setup page, then they see a form with fields for display name, gender, graduation year, monthly budget range, preferred move-in date, and bio.

2. Given an authenticated user with an incomplete profile, when they fill out all required fields and submits, then the profile is saved and the user's card becomes visible in the browse page.

3. Given an authenticated user who wants to update their profile, when they edit any field and save, then the changes are reflected immediately on their public profile.

4. Given an authenticated user who has not completed the required profile fields, when other users browse the platform, then the incomplete profile does not appear in search results.

### US-3: Browse & Search Roommate Profiles

**User Role**: As a user looking for roommates

**User Goal**: I want to browse and search through other users' profiles with filters for gender, budget range, move-in date, and graduation year

**Benefit**: so that I can find potential roommates who match my basic requirements.

**Dependency**: Depends on US-1 and US-2.

#### Acceptance Criteria

1. Given an authenticated user on the browse page, when the page loads, then a paginated list of roommate profile cards is displayed, each showing name, gender, graduation year, budget, and a short bio preview.

2. Given a user who applies filters (e.g., gender = female, budget = $800-$1200), when the filters are submitted, then only profiles matching all selected criteria are displayed, and results update without a full page reload.

3. Given a user who types a keyword in the search bar, when the search is executed, then the server performs a text search across names, bios, and housing preferences and returns matching profiles.

4. Given a search or filter that returns no results, when the page renders, then a "No roommates found matching your criteria" message is displayed.

### US-4: View Roommate Detail Page

**User Role**: As a user

**User Goal**: I want to click on a roommate profile card to see their full profile including bio, lifestyle preferences, linked housing unit, and compatibility info

**Benefit**: so that I can decide whether to reach out.

**Dependency**: Depends on US-1, US-2, and US-3.

#### Acceptance Criteria

1. Given an authenticated user who clicks on a profile card, when the detail page loads, then it displays the user's full name, gender, graduation year, budget, move-in date, bio, and any linked housing unit info.

2. Given a detail page for a user who has linked a housing unit (see US-6), when the page renders, then the linked unit's address, rent, and photos are displayed.

3. Given the detail page, when the viewer is a different user, then a "Send Message" button is visible.

### US-5: Direct Messaging

**User Role**: As a user

**User Goal**: I want to send direct messages to a potential roommate in real time

**Benefit**: so that we can discuss living arrangements without exchanging personal contact information.

**Dependency**: Depends on US-1, US-2, US-3, and US-4.

#### Acceptance Criteria

1. Given an authenticated user viewing another user's profile, when they click "Send Message" and type a message, then the message is delivered to the recipient in real time via WebSocket.

2. Given two users with an existing conversation, when either user reopens the conversation, then the full message history is loaded and displayed in chronological order.

3. Given a user with multiple conversations, when they visit the "Messages" page, then all conversations are listed with the most recent message preview and timestamp.

4. Given a user who receives a new message, when they are on any page of the app, then an unread message badge appears on the Messages icon in the navigation bar.

## 2.2 Should Have (Advanced Essential Functionalities)

### US-6: Link Housing Unit

**User Role**: As a user who has found an apartment near UCLA

**User Goal**: I want to link that housing unit to my profile by searching for it within BruinNest

**Benefit**: so that potential roommates can see exactly which apartment I'm interested in sharing.

**Dependency**: Depends on US-1, US-2, and US-3.

#### Acceptance Criteria

1. Given an authenticated user on the "Link Housing" page, when they search by address or neighborhood near UCLA, then the system searches a local housing catalog of publicly available rental listings and displays matching results with address, rent, bedrooms, and photos (or a placeholder image when no photo is available).

2. Given an authenticated user on the search results page, when the user selects a unit and confirms, then that unit is saved to their profile and visible on their detail page (US-4).

3. Given an authenticated user who has linked a unit, when they visit their own profile, then they can remove or replace the linked unit.

4. Given an authenticated user browsing roommate profiles, when a profile has a linked unit, then a housing unit card is displayed alongside the roommate's info.

### US-7: Roommate Compatibility Questionnaire & Matching Score

**User Role**: As a user

**User Goal**: I want to fill out a lifestyle questionnaire about my sleep schedule, cleanliness, noise tolerance, guest policy, study habits, etc.

**Benefit**: so that the system can calculate a compatibility score between me and other users and help me find the best-fit roommate.

**Dependency**: Depends on US-1, US-2, and US-3.

#### Acceptance Criteria

1. Given an authenticated user, when they navigate to the questionnaire page, then they see about 10 multiple-choice questions covering sleep schedule, cleanliness level, noise preference, smoking/drinking habits, guest policy, and study habits.

2. Given a user who completes and submits the questionnaire, when the answers are saved, then a compatibility score (0-100%) is calculated against every other user who has also completed the questionnaire.

3. Given two users who have both completed the questionnaire, when either views the other's profile, then the compatibility percentage is displayed prominently on the detail page.

4. Given a user on the browse page, when they select "Sort by Compatibility," then profiles are reordered by descending compatibility score.

### US-8: Notifications System

**User Role**: As a user

**User Goal**: I want to receive in-app notifications when I get a new message, when a high-compatibility user joins, or when someone saves my profile

**Benefit**: so that I don't miss important activity.

**Dependency**: Depends on US-1, US-2, US-5, and US-7.

#### Acceptance Criteria

1. Given a user who receives a new direct message, when the message is delivered, then a notification appears in the bell icon dropdown with a preview of the message.

2. Given a user whose compatibility score with a newly joined user is ≥80%, when the new user completes their questionnaire, then a "New high-match roommate!" notification is generated.

3. Given a user with unread notifications, when they click the bell icon, then the notification dropdown shows all recent notifications with timestamps.

4. Given a user viewing notifications, when they click "Mark all as read," then all notifications are cleared from the unread count.

### US-9: Save / Favorite Roommate Profiles

**User Role**: As a user

**User Goal**: I want to save roommate profiles I'm interested in to a favorites list

**Benefit**: so that I can easily revisit and compare them later.

**Dependency**: Depends on US-1, US-2, and US-4.

#### Acceptance Criteria

1. Given an authenticated user viewing another user's profile, when they click the sign symbols "Save", then that profile is added to their favorites list.

2. Given a user with saved profiles, when they visit the "Favorites" page, then all saved profiles are displayed as cards with key info.

3. Given a user who wants to remove a favorite, when they click the heart icon again (or click "Remove" on the favorites page), then the profile is removed from the favorites list immediately.

## 2.3 Nice To Have (Optional Advanced Functionalities)

### US-10: Roommate Group / Housing Party

**User Role**: As a group of 2-3 users who want to room together

**User Goal**: I want to create a "housing party" that links our profiles as a group

**Benefit**: so that we can jointly search for one more roommate or advertise our group to others.

**Dependency**: Depends on US-1, US-2, US-5, and US-6.

#### Acceptance Criteria

1. Given an authenticated user, when they send a "group invite" to another user who accepts, then a housing party is created and visible on both users' profiles.

2. Given a housing party with 2-3 members, when the party appears in browse results, then it is displayed as a group card showing all members' names, combined budget, and linked unit (if any).

3. Given a user browsing, when they filter by "Groups looking for members," then only housing party cards are shown.

### US-11: Roommate Agreement Template Generator

**User Role**: As a user who has found a roommate

**User Goal**: I want to generate a roommate agreement document based on our questionnaire answers

**Benefit**: so that we have a written record of shared expectations before moving in.

**Dependency**: Depends on US-1, US-2, and US-7.

#### Acceptance Criteria

1. Given two users who have messaged each other and both completed the questionnaire, when one user clicks "Generate Agreement," then a pre-filled document is created covering noise, guests, cleaning, and rent-split expectations.

2. Given the generated agreement, when either user views it, then they can download it as a PDF.

### US-12: Map Display of High Matching Score Housing Locations

**User Role**: As a user looking for compatible roommates

**User Goal**: I want to view the housing locations of users with high profile matching scores displayed on an interactive map

**Benefit**: so that I can quickly find and compare nearby housing options from highly compatible matches.

**Dependency**: Depends on US-1, US-2, US-6, and US-7.

#### Acceptance Criteria

1. Given a user with a profile, when they navigate to the map view, then the map loads and displays marker pins for the preferred housing locations of users with the high matching scores.

2. Given a user browsing the map, when they apply filters (e.g., budget, distance, housing type), then the map updates to only show markers for high-matching users that meet the filter criteria.

3. Given multiple high-matching users in the same area, when the map zooms out, then clustered markers are displayed to represent groups of nearby compatible matches.

4. Given a map displaying housing markers, when the user clicks on a marker, then a popup shows the matched user's name, matching score, budget, and housing details.

