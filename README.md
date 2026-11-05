<div align="center">

# 🌾 KrishiOS

### Offline-first agricultural intelligence for farmers

**Practical tools for crop decisions, irrigation planning, market discovery, and farm records—designed to keep useful work close to the farmer’s device.**

[![GitHub](https://img.shields.io/badge/GitHub-KrishiOS-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Gulshan-Singh-gs/KrishiOS)
[![Git](https://img.shields.io/badge/Git-version--controlled-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-React%20%2B%20edge%20API-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12.8.1-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-web%20%2B%20Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

[Explore the repository](https://github.com/Gulshan-Singh-gs/KrishiOS) · [Architecture](docs/architecture/architecture.md) · [Security notes](docs/security/threat-model.md)

</div>

---

## About KrishiOS

KrishiOS is an agricultural intelligence project built around a **client-first, offline-minded** approach. It brings farm-focused tools into one application, with deterministic calculations and locally stored data intended to remain useful when connectivity is limited.

The current web interface includes a dashboard, mandi comparison, irrigation tools, crop scanner, voice assistant, and sync center. The repository also contains shared TypeScript contracts, a Cloudflare Workers API, and initial market and weather data-processing pipelines.

> **Development status:** KrishiOS is under active development. Some integrations and gateway routes are scaffolding or placeholders, not production services. In particular, do not treat demo API responses, sample dataset URLs, or model predictions as verified agricultural advice, live market quotes, or a secure production deployment. Review the [architecture](docs/architecture/architecture.md), [threat model](docs/security/threat-model.md), and implementation before relying on any feature.

## Features

- **Dashboard and sync center** — application status, connectivity state, and locally queued mutations.
- **Mandi comparison** — a workspace for comparing market opportunities and estimated net realization.
- **Irrigation tools** — a dedicated interface for locally computed irrigation guidance.
- **Crop scanner** — image-quality checks and an edge-vision integration point; model predictions require independent validation and should not be treated as confirmed diagnoses.
- **Vernacular voice assistant** — intended for agricultural queries in Punjabi, Hindi, Hinglish, and English.
- **Offline-minded storage** — IndexedDB persistence and an outbox-oriented sync workflow.
- **Shared data pipelines** — initial market and weather normalization, validation, compression, and manifest generation.

Feature availability depends on the state of the implementation, device capabilities, and data connectivity. Consult the source and docs before depending on a capability operationally.

## Technology

| Area | Technologies |
| --- | --- |
| Web application | React 19, Vite, TypeScript, Tailwind CSS |
| Android foundation | Capacitor 7 |
| Local persistence | Dexie, IndexedDB |
| Vision | TensorFlow.js / TFLite integration |
| API | Hono on Cloudflare Workers |
| Shared contracts | TypeScript, Zod |
| Data layer | Neon serverless driver, Drizzle ORM |
| Pipelines | TypeScript, Node.js, GitHub Actions |
| Workspace | pnpm monorepo |
| Tests | Vitest |

## Repository layout

```text
KrishiOS/
├── apps/
│   ├── web/                    # React PWA and Capacitor-ready application
│   └── api/                    # Hono API / Cloudflare Worker
├── packages/
│   └── shared/                 # Shared schemas, contracts, and domain utilities
├── pipelines/
│   ├── market-ingestion/       # Market-price normalization and dataset packaging
│   └── weather-ingestion/      # Weather normalization and dataset packaging
├── docs/
│   ├── architecture/           # Architecture decisions and planning
│   └── security/               # Threat model and security notes
├── .github/workflows/          # CI, ingestion, and audit workflows
├── v.1.0.1.md                  # Engineering and implementation specification
├── package.json
└── pnpm-workspace.yaml
```

## Getting started

### Prerequisites

- Node.js compatible with the repository’s dependencies
- Corepack and pnpm `12.8.1`
- Git

### Clone and install

```bash
git clone https://github.com/Gulshan-Singh-gs/KrishiOS.git
cd KrishiOS
corepack enable
corepack prepare pnpm@12.8.1 --activate
pnpm install
```

### Run the web app and API

The root scripts currently provide build, test, type-check, and lint tasks. Run the applications individually in separate terminals:

```bash
pnpm --filter @krishios/web dev
```

```bash
pnpm --filter @krishios/api dev
```

The web dev server and API may require environment/configuration setup depending on the feature you are working on. Review the app configuration and Wrangler settings before connecting external services. Do not assume placeholder URLs or mock responses represent deployed services.

## Workspace commands

Run from the repository root:

| Command | Description |
| --- | --- |
| `pnpm build` | Build all workspace packages that define a build script |
| `pnpm test` | Run workspace tests |
| `pnpm typecheck` | Type-check workspace packages |
| `pnpm lint` | Run configured lint tasks |
| `pnpm --filter @krishios/web dev` | Start the web development server |
| `pnpm --filter @krishios/api dev` | Start the API with Wrangler |
| `pnpm --filter @krishios/api db:check` | Check Drizzle migrations/schema configuration |

## Architecture principles

KrishiOS is designed around three execution areas:

1. **Client application:** offline persistence, local interface, and device-compatible deterministic calculations.
2. **Batch pipelines:** shared ingestion and preparation of public data rather than per-farmer real-time jobs.
3. **Minimal API gateway:** controlled network services and synchronization where needed.

Scientific calculations and business rules should be deterministic and transparent. Data should include its source and freshness where possible, and estimated values should be labelled as estimates. Market prices are not guaranteed selling prices, and software output is not a substitute for qualified agronomic advice.

## Security and privacy

The API and integrations are still evolving. Before using this project with real farmer accounts or sensitive data:

- Review and address the findings in the [threat model](docs/security/threat-model.md).
- Verify JWT signatures, issuer, audience, and expiry on the server; decoding a token is not authentication.
- Replace mock endpoints, URLs, and upload flows with properly authenticated and authorized implementations.
- Keep secrets out of the web bundle, source control, logs, and GitHub Actions output.
- Validate ownership and all incoming sync mutations server-side.
- Avoid publishing personal, location-sensitive, or otherwise private farmer data in public datasets or artifacts.

## Documentation

- [Architecture overview](docs/architecture/architecture.md)
- [Client-first architecture decision](docs/architecture/adr-001-client-first.md)
- [Engineering specification](v.1.0.1.md)
- [Security threat model](docs/security/threat-model.md)
- [Architecture backlog](docs/architecture/backlog.md)
- [Dependency inventory](docs/architecture/dependencies.md)
- [Feature dependency graph](docs/architecture/feature-graph.md)
- [Risk register](docs/architecture/risk-register.md)

## Contributing

Issues and pull requests are welcome. To contribute:

1. Check the [existing issues](https://github.com/Gulshan-Singh-gs/KrishiOS/issues) and describe the problem or improvement.
2. Keep deterministic agricultural calculations independently testable and document units, inputs, and assumptions.
3. Add tests for changed logic, especially offline persistence, synchronization, and data normalization.
4. Do not use real personal or farm data in tests, screenshots, logs, or fixtures.
5. Run relevant checks before opening a pull request:

   ```bash
   pnpm test
   pnpm typecheck
   pnpm build
   ```

## License

No license file is currently present in this repository. Unless a license is added, standard copyright applies and reuse is not automatically granted.

---

<div align="center">

🌱 **Local-first tools. Transparent data. Farmer-centered design.**

</div>
