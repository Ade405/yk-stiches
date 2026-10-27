# Project Status and Development Roadmap

Last reviewed: 2026-10-27

This file is the working checklist for the YK Stitches repository. Update it when tasks are completed or priorities change. A change is not considered complete just because code was committed: CI must pass on the relevant commit.

## Current project goal

Improve YK Stitches into a maintainable, reliable tailoring storefront and atelier management app, while keeping fresh-clone installation, formatting, tests, and production builds dependable. Avoid merging dependency upgrades until they are compatible and all required checks pass.

## Current blocker: CI formatting check

- [ ] **Fix the Prettier failure for `.github/dependabot.yml` once and verify it.** A recent run on PR #13 failed at the formatting step; tests and production build were skipped. Copilot reported that Prettier flags `.github/dependabot.yml`.
- [ ] Run the exact repository formatter against every file listed by `format:check`, commit the formatter's output, then rerun CI.
- [ ] Make the formatting check harder to regress: keep one authoritative list of files (or use a consistent Prettier config/ignore strategy), and ensure all relevant project/config files are included.
- [ ] Confirm a green full CI run for the final commit: type-check, format check, tests, and production build.

**Important:** The current formatting issue is not considered resolved until the latest run passes. Do not merge PR #13 while required checks are failing.

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

## In progress

- [ ] **PR #13 — Stabilize CI and prevent incompatible dependency upgrades:** [open PR](https://github.com/Ade405/yk-stiches/pull/13). Contains a product-test expectation correction and Dependabot restrictions. Its latest observed CI run failed at formatting; reformat and verify before merging.
- [ ] Confirm that the Dependabot configuration change prevents unwanted major upgrades after it lands on the default branch.
- [ ] Review all open dependency PRs individually and close, update, or merge only after checking compatibility and CI.

## Dependency PR cleanup

At the last review, the open PR list contained #7–#13 (seven open PRs, not nine). The PRs included updates for Zod (#7), Lucide React (#8), TSX (#9), Express and its types (#10), the React Vite plugin (#11), TypeScript (#12), and the CI/Dependabot fix (#13).

- [ ] Recheck the current open PR list before acting; the count can change.
- [x] Closed PR #11 (`@vitejs/plugin-react` v6) and PR #12 (TypeScript 7) because those major upgrades need compatibility review. If GitHub has since changed their state, verify before relying on this note.
- [ ] For #7–#10, inspect the exact failed step and error, fix only genuine compatibility/test issues, and rerun checks. Do not merge solely because GitHub reports the PR is mergeable.
- [ ] Reduce duplicate CI runs where possible, but retain meaningful validation on pull requests and the default branch.

## Remaining engineering tasks

### Priority 1 — CI reliability and dependency safety
- [ ] Resolve the Prettier failure in `.github/dependabot.yml` and get a full green CI run.
- [ ] Ensure formatter and CI use the same Prettier version and configuration.
- [ ] Consider a dedicated CI step that checks formatting across all tracked supported files, with intentional exclusions documented.
- [ ] Add an automated dependency audit to CI and review audit findings rather than blindly applying major upgrades.
- [ ] Confirm the supported Node.js version is consistent across README, Docker, CI, and package engines.

### Priority 2 — Test coverage and application correctness
- [ ] Fix any remaining failing tests in dependency PRs based on their actual logs.
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
