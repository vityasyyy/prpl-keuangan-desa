# Test Types Mapping

This file lists the test files found in the `backend` project and identifies their test type (Unit / Integration / E2E) with a short rationale.

- `src/repository/apbd/apbd.repo.test.js` : Unit test
  - Rationale: Exercises repository functions and expects specific DB-query behavior; dependencies are mocked in tests (no real HTTP server).

- `src/service/apbd/apbd.service.test.js` : Unit test
  - Rationale: Tests service/business logic functions in isolation. Repository/database calls are mocked.

- `src/api/handler/apbd/apbd.handler.test.js` : Integration test (HTTP → handler level)
  - Rationale: Uses `express` + `supertest` to make HTTP requests against the router/handler stack. The service layer is mocked, so this is an integration test for routing, middleware, and handler wiring (not a full E2E that touches the DB).

Notes & next steps:
- No E2E tests detected. End-to-end tests would exercise the full stack (HTTP → handler → service → repository → real/test DB).
- If you want E2E tests, I can add a `tests/e2e` folder and provide an example that runs against a test Postgres instance (using Docker Compose or a test container).
- If you prefer, I can also add a short header comment at the top of each test file to label its type in-place.
