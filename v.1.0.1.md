# KrishiOS Enterprise — Client-First Engineering & Implementation Specification

**Project:** KrishiOS  
**Architecture:** Offline-first, client-compute-first, edge-assisted, event-driven  
**Primary platform:** Android APK + Progressive Web Application  
**Frontend:** React 19, Vite, TypeScript  
**Primary development agent:** Antigravity  
**Infrastructure philosophy:** Zero-cost-first, open standards, minimal persistent backend  
**Quality target:** Enterprise-grade security, reliability, observability, maintainability and extensibility.

---

# 1. Engineering Mission

Build KrishiOS as a modular agricultural intelligence platform that executes the maximum possible amount of application logic locally on the farmer's device.

The application must remain useful without an internet connection.

The architecture must minimize recurring backend computation by utilizing:

1. Browser and Android device computation.
2. IndexedDB and local persistent storage.
3. Web Workers and WebAssembly.
4. Precomputed and versioned public datasets.
5. Shared GitHub Actions batch pipelines.
6. Static CDN distribution.
7. A minimal secure Cloudflare Worker gateway.
8. Supabase authentication and private object storage only where necessary.

GitHub Actions must operate as a shared asynchronous data-processing and maintenance platform, not as a real-time per-user API server.

The implementation must prioritize actual functionality over mock interfaces, fabricated datasets, simulated API responses or superficial demonstrations.

# 2. Non-Negotiable Architecture Principles

## 2.1 Client-first execution

All deterministic and device-compatible computations must execute locally.

The following operations must not require backend computation:

- Image preprocessing.
- Crop disease inference.
- Image quality assessment.
- Entropy calculation.
- Irrigation calculations.
- Haversine distance calculation.
- Mandi net realization calculations.
- Crop growth-stage estimation.
- Cached market searches.
- Local voice intent matching.
- Offline data persistence.
- Local notification scheduling where supported.

## 2.2 Offline-first operation

Every major feature must have a defined offline operating mode.

The application must distinguish:

- Available offline.
- Available with cached data.
- Available with limited functionality.
- Requires internet connectivity.
- Requires authentication.
- Requires server-side verification.

Never display an operation as available offline when it actually requires a network request.

## 2.3 Zero-trust security

The frontend is untrusted.

Never trust:

- Farmer IDs supplied by the frontend.
- Client-side authorization decisions.
- Client-supplied market prices presented as verified.
- Client-generated ownership claims.
- Client-side API secrets.
- LLM-generated database instructions.
- Unvalidated offline synchronization payloads.

## 2.4 Deterministic business logic

Scientific and financial calculations must use deterministic TypeScript modules.

LLMs must never be responsible for:

- Calculating irrigation quantities.
- Calculating Mandi profitability.
- Determining actual market prices.
- Creating verified crop diagnoses.
- Authorizing database mutations.
- Making financial settlement decisions.

## 2.5 Modular monorepo

Use pnpm workspaces with strict package boundaries.

Proposed structure:

```text
krishios/
├── apps/
│   ├── web/
│   ├── api/
│   └── android/
│
├── packages/
│   ├── shared/
│   ├── domain/
│   ├── vision/
│   ├── irrigation/
│   ├── marketplace/
│   ├── voice/
│   ├── storage/
│   ├── sync/
│   ├── analytics/
│   ├── localization/
│   └── testing/
│
├── pipelines/
│   ├── market-ingestion/
│   ├── weather-ingestion/
│   ├── data-normalization/
│   ├── data-bucketing/
│   ├── model-validation/
│   ├── dataset-publication/
│   └── maintenance/
│
├── infrastructure/
│   ├── cloudflare/
│   ├── supabase/
│   ├── neon/
│   └── schemas/
│
├── .github/
│   ├── workflows/
│   ├── actions/
│   └── dependabot.yml
│
├── docs/
│   ├── architecture/
│   ├── security/
│   ├── api/
│   ├── data/
│   ├── testing/
│   └── deployment/
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

Keep the Android native project generated and managed by Capacitor. Do not manually duplicate the web application's business logic inside Android.

# 3. Technology Selection

## Frontend

- React 19.
- Vite.
- TypeScript strict mode.
- Tailwind CSS.
- Accessible component architecture.
- TanStack Query for remote query lifecycle where useful.
- Zustand or an equivalent lightweight state manager.
- Dexie.js for IndexedDB.
- vite-plugin-pwa for PWA lifecycle.

## Local computation

- Web Workers.
- WebAssembly.
- TensorFlow Lite-compatible inference runtime after compatibility benchmarking.
- Native Android TFLite integration as an optional optimization.
- Pure TypeScript scientific engines.
- Turf.js or a lightweight geospatial implementation where appropriate.

## Backend and authentication

- Cloudflare Workers.
- Hono.
- Supabase Auth.
- Supabase private Storage.
- Neon PostgreSQL only for durable shared records that genuinely need central persistence.
- Drizzle ORM.

## Data processing

- GitHub Actions.
- Node.js.
- Python for data science and model preparation.
- Zod for validation.
- Parquet for internal analytical datasets where appropriate.
- Compressed JSON for client-facing data.
- SHA-256 content verification.

## Android

- CapacitorJS.
- Capacitor Camera.
- Capacitor Geolocation.
- Capacitor Preferences.
- Android Studio.
- Gradle.
- Native TFLite only if performance benchmarks justify the additional integration.

Pin compatible package versions. Do not blindly install latest versions of every dependency.

# 4. Runtime Architecture

Establish three independent execution environments.

## Environment A: Client Runtime

Responsibilities:

- Rendering.
- Local authentication state.
- Offline persistence.
- Computer vision.
- Irrigation engine.
- Mandi calculations.
- Local search.
- Voice capture and local parsing.
- Cached dataset consumption.
- Mutation outbox.
- User preferences.

Client modules must not import database credentials or privileged infrastructure clients.

## Environment B: GitHub Actions Runtime

Responsibilities:

- Scheduled public data collection.
- Data normalization.
- Market price aggregation.
- Data quality verification.
- Geographic bucketing.
- Dataset compression.
- Static dataset publication.
- Model evaluation.
- Model quantization.
- Security scanning.
- Dependency maintenance.
- Automated release preparation.

The pipeline must support batch execution across multiple regions, crops and commodities.

Do not start one workflow for each farmer.

## Environment C: Secure Gateway

Responsibilities:

- JWT verification.
- Ownership verification.
- Sensitive synchronization.
- Protected object storage operations.
- Rate limiting.
- Request validation.
- Controlled AI inference.
- Administrative operations.

Do not proxy deterministic calculations through the gateway.

# 5. Phase 0 — Repository Audit and Architecture Foundation

Before writing application code, inspect the repository and existing deployment.

Tasks:

1. Inspect all existing source files.
2. Identify reusable implementations.
3. Inspect dependencies and package versions.
4. Inspect GitHub Actions configuration.
5. Inspect environment-variable usage.
6. Inspect existing API endpoints.
7. Inspect database schemas.
8. Identify duplicated business logic.
9. Identify security weaknesses.
10. Produce an architecture decision record.

Deliverables:

- Architecture document.
- Dependency inventory.
- Security threat model.
- Feature dependency graph.
- Implementation backlog.
- Risk register.

Acceptance criteria:

- No existing implementation is overwritten without inspection.
- Every critical dependency has a documented purpose.
- No secrets are committed.
- No unsupported architecture assumption is treated as fact.

# 6. Phase 1 — Domain Contracts and Data Architecture

Create strict shared contracts before implementing the UI.

Domain entities:

- Farmer.
- CropProfile.
- CropPlot.
- CropVariety.
- DiseaseCatalogEntry.
- CropScan.
- IrrigationProfile.
- IrrigationSchedule.
- SoilProfile.
- Mandi.
- MarketPrice.
- MandiQuote.
- VoiceIntent.
- SyncMutation.
- DatasetManifest.
- ModelManifest.

Every entity must include:

- Stable identifiers.
- Schema version.
- Creation timestamp.
- Update timestamp where appropriate.
- Ownership information where applicable.
- Validation rules.
- Explicit optionality.

Implement Zod schemas.

Implement database migrations and Dexie schema migrations independently.

Do not assume IndexedDB and PostgreSQL have identical persistence requirements.

Acceptance criteria:

- Strict type checking.
- Schema validation tests.
- Migration tests.
- Foreign-key verification.
- Ownership relationship verification.
- No implicit `any`.
- No uncontrolled type assertions.

# 7. Phase 2 — Local Persistence and Offline Infrastructure

Build the offline storage foundation.

Dexie stores:

```text
farmers
cropPlots
localScans
cachedDiseases
cachedMandiPrices
cachedWeather
irrigationProfiles
irrigationQueue
syncOutbox
syncConflicts
datasetManifests
modelManifests
appMetadata
```

Requirements:

1. Versioned IndexedDB migrations.
2. Transactional local operations.
3. Unique mutation IDs.
4. Durable sync queue.
5. Retry counters.
6. Exponential backoff.
7. Conflict detection.
8. Storage quota monitoring.
9. Cache expiration.
10. Recovery after application termination.

Implement an outbox pattern.

Each mutation must contain:

- Mutation UUID.
- Entity identifier.
- Operation type.
- Payload.
- Schema version.
- Client timestamp.
- Sequence number.
- Retry count.
- Synchronization status.

Synchronization must support partial success.

Never delete the entire batch when one mutation succeeds.

Do not treat the browser `online` event as proof that the internet or backend is reachable.

Implement a real connectivity probe and server acknowledgement.

Background Sync is optional enhancement, not a mandatory dependency.

Acceptance criteria:

- Full application reload preserves local records.
- Airplane-mode operations work.
- Duplicate mutations are prevented.
- Failed synchronization preserves records.
- Partial acknowledgements are handled.
- Schema upgrades do not destroy user data.

# 8. Phase 3 — GitHub Actions Shared Data Pipeline

This is a core architectural component.

Build an independent pipeline system with reproducible stages.

## 8.1 Pipeline structure

```text
Source Collection
       |
       v
Raw Data Validation
       |
       v
Normalization
       |
       v
Deduplication
       |
       v
Regional Bucketing
       |
       v
Commodity Partitioning
       |
       v
Historical Aggregation
       |
       v
Data Quality Verification
       |
       v
Compression + Hashing
       |
       v
Immutable Dataset Publication
       |
       v
Client Manifest Update
```

## 8.2 Workflow organization

Create separate reusable workflows:

```text
market-ingestion.yml
weather-ingestion.yml
dataset-normalization.yml
market-bucketing.yml
dataset-publication.yml
model-validation.yml
model-release.yml
security-audit.yml
dependency-audit.yml
release.yml
```

Use reusable workflows and composite actions for shared operations.

## 8.3 Trigger strategy

Use:

- Scheduled triggers for daily ingestion.
- Manual dispatch for administrative reruns.
- Repository dispatch for authorized cross-pipeline events.
- Push triggers for code and schema changes.
- Release triggers for validated model and dataset publication.

Do not expose unrestricted workflow triggers to application users.

Do not embed PATs or GitHub App private keys in the client.

If an application operation needs to request a pipeline:

1. The client submits a request to the minimal secure gateway.
2. The gateway authenticates the user.
3. It validates whether the operation is allowed.
4. It applies rate limits and deduplication.
5. It records a job request.
6. An authorized pipeline mechanism processes the request.
7. The client retrieves the result through a controlled read interface.

Prefer scheduled batch processing for non-urgent requests.

## 8.4 Multi-client batching

Do not partition jobs by individual farmer unless absolutely necessary.

Partition shared public data using:

```text
region
commodity
market
date
dataset-version
```

Example:

```text
Punjab
 ├── Wheat
 │    ├── Market A
 │    ├── Market B
 │    └── Market C
 ├── Rice
 └── Cotton
```

Use a matrix strategy for independent partitions.

Control concurrency to avoid duplicate ingestion.

Use deterministic partition keys and idempotent upserts.

For large workloads:

- Avoid excessive matrix fan-out.
- Avoid repeated API downloads.
- Reuse normalized source data.
- Process partitions in bounded batches.
- Merge results deterministically.
- Preserve failed partition information.
- Retry only failed partitions.

## 8.5 Caching strategy

Use separate caches for separate purposes.

**Dependency cache**

- pnpm store.
- Python dependencies.
- Build tool caches.

**Pipeline cache**

- Normalized source datasets.
- Intermediate market aggregations.
- Model preprocessing outputs.

**Application cache**

- Static public datasets.
- Versioned model files.
- Local user records.

Application runtime cache must not depend on GitHub Actions cache availability.

Use content-addressed keys:

```text
market:{region}:{commodity}:{date}:{schemaVersion}
model:{crop}:{version}:{sha256}
dataset:{partition}:{contentHash}
```

Cache invalidation must be deterministic.

Use immutable published data versions and a small mutable manifest pointer.

## 8.6 Dataset publication

Produce:

- Dataset manifest.
- Dataset schema version.
- Data source.
- Retrieval timestamp.
- Source date.
- Record count.
- Partition identifier.
- Content checksum.
- Validation status.

Prefer compressed JSON for client consumption.

Do not publish private farmer information through public repositories or public artifacts.

Do not commit large changing datasets directly into the source repository.

Use an appropriate static distribution layer, such as Cloudflare Pages or object storage.

Acceptance criteria:

- Re-running the same pipeline does not duplicate records.
- Failed source ingestion does not silently replace valid data with empty datasets.
- Published datasets pass schema validation.
- Every partition is independently verifiable.
- Clients can update only the partitions they need.
- Historical datasets remain reproducible.

# 9. Phase 4 — Mandi Market Intelligence Engine

Implement a pure TypeScript engine.

Inputs:

- Farmer coordinates.
- Crop and grade.
- Quantity.
- Mandi market coordinates.
- Minimum, maximum and modal prices.
- Road distance where available.
- Estimated transport tariff.
- Applicable fees.
- Handling costs.
- Vehicle capacity.

Implement:

1. Market price normalization.
2. Geographic filtering.
3. Road-distance integration where a reliable source exists.
4. Haversine fallback with explicit approximation label.
5. Transport cost calculation.
6. Net realization calculation.
7. Per-quintal comparison.
8. Market ranking.
9. Price freshness validation.
10. Historical price comparison.

Use a configurable cost model.

Do not hardcode a universal road tortuosity factor and present it as actual distance.

Display:

- Market name.
- Reported modal price.
- Reported price date.
- Distance type.
- Estimated transport expense.
- Estimated deductions.
- Estimated net realization.
- Per-quintal net realization.
- Data freshness.

Never claim a market price is a guaranteed selling price.

Tests must cover:

- Missing prices.
- Stale records.
- Zero quantity.
- Negative inputs.
- Different vehicle capacities.
- Duplicate markets.
- Different cost assumptions.
- Missing road routes.

# 10. Phase 5 — Agro-Hydrological Engine

Implement FAO-56 calculations in an independent package.

Functions:

```text
calculateSaturationVaporPressure()
calculateActualVaporPressure()
calculateVaporPressureDeficit()
calculateNetRadiation()
calculateReferenceEvapotranspiration()
calculateCropEvapotranspiration()
calculateTotalAvailableWater()
calculateReadilyAvailableWater()
calculateRootZoneDepletion()
calculateNetIrrigationRequirement()
calculateGrossIrrigationRequirement()
calculatePumpRuntime()
```

Inputs:

- Meteorological conditions.
- Crop coefficients.
- Growth stage.
- Elevation or atmospheric pressure.
- Root-zone depth.
- Soil field capacity.
- Permanent wilting point.
- Current soil moisture.
- Effective rainfall.
- Irrigation efficiency.
- Field area.
- Pump discharge rate.

Support missing-input handling according to documented FAO procedures.

Never invent missing meteorological values without labelling the estimation method.

Distinguish modelled soil moisture from actual sensor measurements.

Return:

- ET0.
- ETc.
- Soil-water deficit.
- Recommended irrigation depth.
- Estimated volume.
- Pump runtime where pump specifications exist.
- Input completeness.
- Confidence/quality indicators.
- Assumptions.

All units must be explicit.

Test against published FAO-56 benchmark datasets and independent agronomic review.

# 11. Phase 6 — Edge Computer Vision

The disease classifier must be independently validated.

First, establish a model selection process.

Evaluate:

- Model architecture.
- Model license.
- Training dataset license.
- Dataset provenance.
- Crop coverage.
- Disease-class coverage.
- Field-image generalization.
- Quantization compatibility.
- Inference memory.
- Android WebView compatibility.

Do not select a model merely because it is lightweight.

Implement:

```text
vision/
 ├── preprocessing/
 ├── quality/
 ├── segmentation/
 ├── inference/
 ├── uncertainty/
 ├── explainability/
 ├── model-registry/
 └── validation/
```

Required capabilities:

- Image orientation normalization.
- Resolution normalization.
- Blur detection.
- Exposure assessment.
- Leaf visibility assessment.
- Model inference.
- Probability calibration.
- Out-of-distribution detection.
- Diagnostic uncertainty.
- Explainability where technically supported.

Use Web Workers for browser inference.

Evaluate native TFLite for Android only after establishing the WASM baseline.

The application must never present an unvalidated model prediction as a confirmed diagnosis.

Treatment recommendations must come from a reviewed knowledge base, not arbitrary LLM output.

Model manifest:

```json
{
  "modelId": "crop-disease-model",
  "version": "1.0.0",
  "format": "tflite",
  "sha256": "verified-release-checksum",
  "inputShape": [224, 224, 3],
  "labelsVersion": "1.0.0",
  "validationStatus": "approved",
  "minimumAppVersion": "1.0.0"
}
```

The checksum must be generated from the actual released model, never copied from an example.

# 12. Phase 7 — Vernacular Voice Intelligence

Build voice processing as independent modules.

```text
voice/
 ├── capture/
 ├── transcription/
 ├── dialect-normalization/
 ├── intent-classification/
 ├── entity-extraction/
 ├── response-generation/
 ├── speech-output/
 └── evaluation/
```

Execution hierarchy:

1. Local quick-intent matching.
2. Local agricultural lexicon.
3. Local deterministic parsing.
4. Remote transcription when connectivity exists.
5. Remote LLM intent extraction for complex queries.
6. Native or browser speech synthesis with language fallback.

Supported intents:

- MANDI_PRICE_QUERY.
- CROP_DISEASE_QUERY.
- IRRIGATION_QUERY.
- WEATHER_QUERY.
- CROP_INFORMATION_QUERY.
- UNKNOWN.

The LLM must return structured JSON conforming to a strict schema.

The application must verify:

- Intent validity.
- Commodity identity.
- Location extraction.
- Units.
- Crop identity.
- Missing required parameters.

No model-generated instruction may bypass deterministic business logic.

Evaluate using actual Punjabi, Hinglish and noisy rural recordings.

Do not claim 100% language accuracy based on a small synthetic test set.

# 13. Phase 8 — Minimal Secure Gateway

Keep the gateway deliberately small.

Routes:

```text
GET  /health
GET  /api/v1/manifest
GET  /api/v1/datasets/:partition
POST /api/v1/sync
POST /api/v1/voice
POST /api/v1/storage/signed-upload
GET  /api/v1/jobs/:jobId
```

Only implement routes that are actually required.

Security requirements:

- Server-side JWT verification.
- User ownership enforcement.
- Request size limits.
- Schema validation.
- Rate limiting.
- CORS restrictions.
- Secure headers.
- Short-lived signed URLs.
- Secret isolation.
- Structured audit logging.
- Idempotency protection.
- Abuse monitoring.

Use the gateway for sensitive writes and controlled AI operations.

Public market datasets should preferably be delivered through static hosting/CDN without passing through the gateway.

# 14. Phase 9 — PWA and Android Integration

Implement a single shared frontend.

PWA requirements:

- Installable.
- Offline shell.
- Versioned cache.
- Runtime caching.
- Model asset caching.
- Dataset manifest caching.
- Storage quota awareness.
- Recovery from cache eviction.
- Update notification.
- Accessible interface.
- Low-bandwidth operation.

Android requirements:

- Capacitor integration.
- Camera bridge.
- Geolocation bridge.
- Microphone permissions.
- Native back-button handling.
- Permission-denied states.
- App lifecycle recovery.
- Native TTS fallback.
- Local model loading.
- APK signing.
- Release versioning.

The app must never require a cloud connection merely to open its main interface.

# 15. Phase 10 — Enterprise Security and Privacy

Create a formal threat model.

Threat categories:

- Broken access control.
- Cross-user data exposure.
- JWT misuse.
- Secret exposure.
- Malicious uploads.
- Prompt injection.
- API abuse.
- Workflow abuse.
- Dependency compromise.
- Cache poisoning.
- Sync replay.
- Duplicate mutations.
- Data corruption.
- Model tampering.
- GPS and EXIF leakage.
- Supply-chain compromise.

Implement:

- Dependency scanning.
- Secret scanning.
- Static analysis.
- Dependency lockfiles.
- Least-privilege GitHub tokens.
- Pinned third-party Actions by immutable commit SHA.
- Protected release workflows.
- Restricted cache writes.
- No privileged workflows executing untrusted pull-request code.
- Audit logs for protected operations.
- Secure storage policies.
- Retention and deletion policies.

All workflows must follow GitHub Actions security guidance.

# 16. Phase 11 — Testing and Verification

Build testing as a separate engineering programme.

## Unit testing

Vitest.

Test all deterministic calculations and domain functions.

## Integration testing

Test:

- IndexedDB.
- Supabase authentication.
- Storage policies.
- Gateway authorization.
- Neon transactions.
- Dataset retrieval.
- Sync processing.

## End-to-end testing

Playwright.

Test:

- Initial installation.
- Offline launch.
- Crop scanning.
- Irrigation calculation.
- Mandi search.
- Voice interaction.
- Offline mutation creation.
- Reconnection.
- Partial synchronization.
- Application restart.

## Device testing

Test at minimum:

- Low-memory Android device.
- Mid-range Android device.
- Modern Android device.
- Desktop Chrome.
- Mobile Chrome.

## Security testing

Test:

- IDOR.
- Unauthorized endpoints.
- JWT tampering.
- Malformed uploads.
- Oversized requests.
- Replay attacks.
- Rate-limit bypass.
- Workflow trigger abuse.
- Cache poisoning.
- Cross-user synchronization.

## Performance testing

Measure:

- Initial application load.
- Cold and warm model initialization.
- p50 and p95 inference latency.
- Peak memory usage.
- IndexedDB performance.
- Battery consumption.
- Dataset download size.
- Synchronization throughput.

Do not impose a universal 150 ms inference requirement without specifying the target hardware.

Use performance budgets based on real devices.

# 17. Phase 12 — CI/CD and Release Engineering

Build GitHub Actions workflows for:

1. Type checking.
2. Unit tests.
3. Integration tests.
4. Production builds.
5. Security audits.
6. Dependency auditing.
7. PWA validation.
8. Android build verification.
9. Model integrity verification.
10. Dataset schema verification.
11. Release artifact generation.

Use dependency caching and deterministic builds.

Do not run expensive model validation on every frontend commit.

Use path filters and workflow dependencies.

Release workflow:

```text
Commit
  |
  v
Typecheck + Lint
  |
  v
Unit Tests
  |
  v
Security Checks
  |
  v
Build Web Application
  |
  v
PWA Verification
  |
  v
Android Build
  |
  v
Integration Tests
  |
  v
Release Candidate
  |
  v
Verified Production Release
```

Deployment must support rollback.

Never deploy a partially validated release.

# 18. Phase 13 — Observability and Operational Reliability

Implement structured observability without transmitting unnecessary farmer information.

Track:

- Application version.
- Model version.
- Dataset version.
- Feature error rates.
- Synchronization failure rates.
- Cache failures.
- API availability.
- Workflow failures.
- Data ingestion freshness.
- Model inference performance.

Never upload raw leaf images, voice recordings or precise location data for analytics by default.

Implement privacy-conscious opt-in diagnostics.

Maintain a release and incident register.

# 19. Phase 14 — Enterprise Acceptance Criteria

A feature is not complete merely because its interface exists.

It is complete only when:

1. Its business logic is implemented.
2. Its data contract is validated.
3. Its offline behavior is defined.
4. Its failure states are handled.
5. Its security requirements are satisfied.
6. Its automated tests pass.
7. Its performance is measured.
8. Its documentation is updated.
9. Its production build succeeds.
10. Its acceptance criteria are independently verified.

Global release requirements:

- No known critical vulnerabilities.
- No cross-user data access.
- No secrets in client bundles.
- No silent synchronization data loss.
- No unverified disease diagnosis presented as confirmed.
- No unsupported irrigation claims.
- No stale market data presented as current.
- No unvalidated model artifacts.
- No broken offline application shell.
- No unverified release artifacts.

# 20. AI Agent Execution Protocol

The coding agent must follow this protocol throughout implementation.

## Step 1 — Inspect

Read the repository, architecture documents and package configuration.

Never assume that the repository is empty.

## Step 2 — Plan

Create a dependency-aware task graph.

Identify:

- Blocking dependencies.
- Parallelizable modules.
- External credentials required.
- Unknown technical risks.
- Acceptance tests.

## Step 3 — Implement incrementally

Implement one bounded module at a time.

Do not build all UI components before the domain logic works.

Do not implement placeholder APIs as production services.

## Step 4 — Verify continuously

After each module:

- Run typecheck.
- Run relevant unit tests.
- Run relevant integration tests.
- Review changed files.
- Check dependency compatibility.

## Step 5 — Audit

Review security, performance and offline behavior.

Run regression tests after cross-module integration.

## Step 6 — Document

Update architecture decisions, API contracts and setup instructions.

## Step 7 — Report

For every completed task, report:

- Files changed.
- Implementation details.
- Tests executed.
- Test results.
- Known limitations.
- Remaining blockers.

## Parallel agent strategy

Parallelize independent workstreams:

- Agent A: Domain contracts and data architecture.
- Agent B: GitHub Actions data pipelines.
- Agent C: Irrigation and market engines.
- Agent D: Vision engine and model evaluation.
- Agent E: PWA and offline infrastructure.
- Agent F: Security and integration verification.

One lead agent must own:

- Shared contracts.
- Integration decisions.
- Package version compatibility.
- Database migrations.
- Release coordination.

Do not allow multiple agents to independently modify the same shared schema or package configuration without coordination.

# 21. Final Engineering Directive

Build KrishiOS as an offline-capable agricultural operating platform, not a collection of disconnected AI demonstrations.

The primary architectural objective is to make each farmer's device an independent computation node, while GitHub Actions processes shared public information and maintains versioned datasets for all clients.

Use server-side infrastructure only when necessary for security, shared persistence, protected external integrations or operations that cannot be performed safely on-device.

Prioritize deterministic, verifiable and reproducible systems.

Never sacrifice data integrity, security, scientific accuracy or user privacy merely to preserve a zero-cost infrastructure target.

**The final deliverable is a working, secure, tested, installable Android application and PWA with independently verifiable offline functionality—not simply a successful build command.**