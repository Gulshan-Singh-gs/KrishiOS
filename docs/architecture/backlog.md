# Implementation Backlog & Delivery Register

## Phase 0: Foundations & Audit (Completed)
- [x] Repository discovery and zero-trust verification.
- [x] Resolution of test harness compatibility with IndexedDB.
- [x] Architecture documentation, ADRs, and dependency mapping.

## Phase 1: Complete Domain Contracts (In Progress)
- [ ] Implement all 16 canonical domain entities in `@krishios/shared`.
- [ ] Full Zod validation and comprehensive test assertions.

## Phase 2: Dexie v2 Offline Storage
- [ ] Migrate database schema to include all 13 required stores.
- [ ] Implement robust outbox engine with exponential backoff and conflict tracking.

## Phase 3: GitHub Actions Data Pipelines
- [ ] Batch processing scripts for market & weather data.
- [ ] Reusable workflow files and matrix ingestion.

## Phase 4 & 5: Agronomic Engines
- [ ] Mandi NRV engine with vehicle cost models and haversine fallback labeling.
- [ ] FAO-56 Penman-Monteith full hydrological engine.

## Phase 6 & 7: Vision & Voice
- [ ] Laplacian blur and exposure quality checks.
- [ ] Vernacular dialect normalization and intent parsing.

## Phase 8 & 9: Gateway & Full Application UI
- [ ] Hono gateway with JWT verification and signed sync.
- [ ] Modern responsive multi-tab PWA UI in Tailwind CSS.

