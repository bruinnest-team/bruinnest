# Team Git Workflow Guide

## 1. Purpose

This document defines the Git workflow for the BruinNest team. Its goals are:

- keep the repository history clean and easy to review
- make branch ownership clear
- reduce merge conflicts
- ensure every change is traceable to a teammate and a specific feature

## 2. Branching Model

### 2.1 Permanent Branches

- `main`: final release branch; must always stay stable and runnable
- `develop`: shared integration branch for daily team development

Rules:

- never push directly to `main`
- never push directly to `develop`
- all feature work must go through a pull request

### 2.2 Working Branches

Each teammate should develop on their own feature branch:

- `feature/<short-feature-name>`

Examples:

- `feature/login`
- `feature/profile-search`
- `feature/message-polling`

Optional branch types for clearer history:

- `fix/<short-fix-name>`
- `docs/<short-doc-name>`
- `refactor/<short-refactor-name>`

## 3. Repository Structure

```text
project-root/
├── client/       # frontend application
├── server/       # backend application
├── docs/         # project documentation
├── .gitignore
└── README.md
```

## 4. Initial Local Setup

Each teammate should configure Git locally so commits are traceable.

```bash
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
git config --global pull.rebase true
```

## 5. Daily Development Workflow

Follow this sequence for each new task or feature.

### Step 1. Update local `develop`

```bash
git switch develop
git pull
```

### Step 2. Create a new working branch

```bash
git switch -c feature/<short-feature-name>
```

### Step 3. Make changes locally

Check what changed before committing:

```bash
git status
```

### Step 4. Stage files intentionally

```bash
git add client/
git add server/
git add docs/
```

Avoid using `git add .` blindly if unrelated files are also modified.

### Step 5. Commit with a meaningful message

```bash
git commit -m "feat: add user profile search filters"
```

### Step 6. Push your branch

```bash
git push -u origin feature/<short-feature-name>
```

### Step 7. Open a pull request into `develop`

Every pull request must:

- target `develop`, not `main`
- have a clear title
- include a short summary of what changed
- mention any testing performed

### Step 8. Merge after review

At least one teammate should review the PR before merge whenever possible.

### Step 9. Clean up merged branches

After the PR is merged, delete stale branches locally and remotely if they are no longer needed.

## 6. Syncing With Team Changes

If your feature branch has been open for a while, sync it with the latest `develop`.

```bash
git switch develop
git pull
git switch feature/<short-feature-name>
git merge develop
```

If merge conflicts happen:

1. resolve the conflicts manually
2. run `git status`
3. stage the resolved files
4. commit the merge

Example:

```bash
git add .
git commit -m "merge: sync latest develop into feature/profile-search"
```

## 7. Commit Message Standard

All commit messages must be written in English and follow this format:

```text
<type>: <short summary>
```

Examples:

- `feat: add login form validation`
- `fix: prevent duplicate conversation creation`
- `docs: split MVP spec into database and API docs`
- `refactor: move SQL logic into repositories`

### 7.1 Allowed Commit Types

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation change
- `refactor`: code restructuring without changing behavior
- `style`: formatting or styling-only change
- `test`: tests added or updated
- `chore`: tooling, configuration, or maintenance work
- `merge`: merge commit for branch synchronization when needed

### 7.2 Commit Message Rules

Every commit message should:

- use English
- start with a valid type prefix
- use the imperative mood
- describe the main change clearly
- stay concise

Good examples:

- `feat: add profile detail endpoint`
- `fix: reject login for unverified users`
- `docs: update backend architecture guide`

Bad examples:

- `update`
- `fix bug`
- `changed stuff`
- `final version`
- `misc`

### 7.3 Commit Scope Guidelines

Each commit should represent one logical change.

Preferred:

- one commit for profile search
- one commit for message unread count
- one commit for documentation updates

Avoid:

- mixing frontend, backend, database, and docs changes in one unrelated commit
- committing half-finished work unless the branch is private and the commit is clearly labeled

## 8. Pull Request Guidelines

PR titles should also use the same general convention when possible:

- `feat: add profile search endpoint`
- `fix: correct unread message count`
- `docs: update MVP API specification`

A PR description should include:

1. a short summary of the change
2. affected areas, such as `client`, `server`, or `docs`
3. how the change was tested
4. any follow-up work still needed

## 9. Team Rules

The following rules are mandatory:

1. do not push directly to `main`
2. do not push directly to `develop`
3. work only on your own branch unless coordinating explicitly with a teammate
4. make small, reviewable commits
5. do not commit secrets, `.env` files, `node_modules`, build output, or local IDE settings
6. do not use vague commit messages
7. do not open large PRs that mix unrelated work

## 10. Recommended Habits

To keep the workflow healthy:

- pull from `develop` before starting new work
- commit early and often
- write PRs small enough to review quickly
- keep documentation changes in sync with code changes
- update branch names and commit titles so they reflect the actual work

## 11. Summary

The required workflow is:

1. pull latest `develop`
2. create a feature branch
3. make focused changes
4. commit with a clear English message
5. push the branch
6. open a PR into `develop`
7. merge after review

This workflow keeps the repository stable, readable, and easier for the entire team to manage.

