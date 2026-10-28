# Project Status and Development Roadmap

Last reviewed: 2026-10-28

This file is the working checklist for the YK Stitches repository. Update it when tasks are completed or priorities change. A change is not considered complete just because code was committed: CI must pass on the relevant commit.

## Current project goal

Improve YK Stitches into a maintainable, reliable tailoring storefront and atelier management app, while keeping fresh-clone installation, formatting, tests, and production builds dependable. Avoid merging dependency upgrades until they are compatible and all required checks pass.

## Current CI and dependency status

- [x] Fixed the Prettier failure in `.github/dependabot.yml` and the stale CSRF test expectation.
- [x] Merged the compatible dependency updates after each branch passed CI.
- [x] Confirmed a green CI run for the merged dependency updates.
- [x] Added a production dependency audit to the local check and GitHub Actions workflow.
- [x] Remediated the currently reported npm audit findings with compatible dependency updates; `npm audit --omit=dev` reports zero vulnerabilities.
- [ ] Keep the format file list and its intentional scope documented; expand it only with an accompanying formatting review.

## Completed work

- [x] Added GitHub Actions CI workflow with dependency installation, TypeScript check, Prettier validation, automated tests, and production build.
- [x] Added Docker Compose support and deployment/onboarding documentation.
- [x] Modularized selected UI components and added project quality-check scripts.
- [x] Added order integration test coverage in PR #5 (the demo-login test setup was corrected).
- [x] Added product CRUD integration tests and a `/healthz` endpoint in PR #6.
- [x] Added weekly Dependabot configuration.
- [x] Identified that `@vitejs/plugin-react@6` requires Vite 8 while this app currently uses Vite 6; do not merge that upgrade without a coordinated toolchain upgrade.
- [x] Identified a product integration test expectation mismatch: unauthenticated writes are rejected by CSRF middleware with 403 before reaching the route, rather than 401.

These items describe work committed or diagnosed. They do not mean every current branch or pull request is passing CI.

## Completed roadmap work

- [x] Merged PR #13 after correcting the CSRF test expectation and formatting configuration.
- [x] Confirmed Dependabot ignores incompatible major upgrades such as Vite plugin React v6 while the app remains on Vite 6.
- [x] Reviewed and merged compatible dependency updates only after their CI checks passed.
- [x] Confirmed the repository has no open pull requests as of 2026-10-28.

## Dependency PR cleanup

The 2026-10-28 review found and resolved the outstanding dependency PR queue. PRs #7, #9, #13, and #15–#19 were merged after passing CI. PRs #8 and #10 were closed because newer compatible replacement PRs superseded them. PRs #11 and #12 remain closed because their major upgrades require a coordinated toolchain review.

- [x] Rechecked the open PR list before acting; no open PRs remain.
- [x] Closed PR #11 (`@vitejs/plugin-react` v6) and PR #12 (TypeScript 7) because those major upgrades need compatibility review. If GitHub has since changed their state, verify before relying on this note.
- [x] Inspected the exact failed steps for the previous dependency PRs and fixed the shared test/formatting causes.
- [ ] Reduce duplicate CI runs where possible, but retain meaningful validation on pull requests and the default branch.

## Remaining engineering tasks

### Priority 1 — CI reliability and dependency safety

- [x] Resolve the Prettier failure in `.github/dependabot.yml` and get a full green CI run.
- [x] Ensure formatter and CI use the same Prettier version and configuration.
- [x] Add an automated production dependency audit to CI and review audit findings rather than blindly applying major upgrades.
- [x] Confirm the supported Node.js version is consistent across README, Docker, CI, and package engines (`>=20`, CI uses 22, Docker uses 20).
- [ ] Reduce duplicate CI runs where possible without weakening pull-request or default-branch validation.

### Priority 2 — Test coverage and application correctness

- [x] Fix the failing dependency-PR test expectation based on the actual CSRF middleware response.
- [ ] Expand integration tests for authentication/authorization, CSRF, orders, product CRUD, and customer/staff boundaries.
- [ ] Add a coverage threshold gradually, based on stable existing coverage rather than an arbitrary jump.
- [ ] Verify that the test suite is deterministic and cleans up servers/resources even on failure.

### Priority 3 — Architecture and maintainability

- [ ] Break the large `server.ts` into route, middleware, validation, and service modules in small reviewed changes.
- [ ] Continue splitting oversized UI components into focused components/hooks.
- [ ] Add structured logging and consistent error handling without leaking secrets or personal data.
- [ ] Document API contracts and environment variables, keeping `.env.example` aligned with actual configuration.

### Priority 4 — Production readiness and security

- [ ] Replace in-memory persistence with a properly configured persistent database for production.
- [ ] Integrate a real payment provider with verified webhooks and idempotency before accepting real payments.
- [ ] Validate uploads and store files safely rather than trusting inline base64 data URLs.
- [ ] Review authorization for every sensitive endpoint and add regression tests.
- [ ] Configure monitoring, error tracking, alerting, TLS/reverse-proxy settings, secret rotation, and dependency auditing.
- [ ] Complete and legally review customer policies before public launch.

## Definition of done

A task is complete only when:

1. The change is committed to a focused branch/PR.
2. Prettier and type checks pass.
3. Automated tests pass.
4. The production build passes.
5. The relevant CI run is green on the final commit.
6. Any remaining limitations or deployment requirements are documented.

## Working rule

Do not say a fix is resolved until the relevant CI run confirms it. If a check fails, read the latest log, identify the exact file/error, apply the smallest robust fix, and verify again before moving on.
