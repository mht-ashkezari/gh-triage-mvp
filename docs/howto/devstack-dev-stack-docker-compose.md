# 🐳 DEVSTACK — Local Development Stack (Docker Compose)

## What & Why
This step ( **DEVSTACK**) introduces a fully reproducible **local development stack** for the `gh-triage-mvp` project.  
It provides all required backend services—**Postgres**, **Redis**, **Azurite**, **OpenTelemetry Collector**, and **Jaeger**—so developers can test and run the app locally with production-like parity.

The goal is to make `docker compose up` → `pnpm dev` → `Jaeger UI` a seamless local workflow, consistent with the plan’s quick-start sequence.

---

## 🧩 Prerequisites
- **Docker ≥ 24.x** and **Docker Compose v2**
- **Node 20 + pnpm 9.x**
- **Make sure ports** `5432`, `6379`, `10000`, `4317`, and `16686` are free  
- Optional services (profiles):
  - `cosmos` → Azure Cosmos DB Emulator  
  - `vector` → Qdrant Vector DB  
  - `llm` → WireMock-based mock for OpenAI-like completions  

---

## 🏗️ Stack Overview

| Service                   | Purpose                          | Port(s)                  | Notes                                                  |
| ------------------------- | -------------------------------- | ------------------------ | ------------------------------------------------------ |
| **postgres**              | Main application database        | 5432                     | User: `postgres`, Password: `devpass`, DB: `triage`    |
| **redis**                 | Queue/cache backend              | 6379                     | In-memory, no persistence                              |
| **azurite**               | Azure Blob Storage emulator      | 10000–10001              | Data volume under `/data`                              |
| **otel-collector**        | Collects OpenTelemetry traces    | 4317 (gRPC), 4318 (HTTP) | Exports to Jaeger                                      |
| **jaeger**                | Trace visualization UI           | 16686                    | Visit [http://localhost:16686](http://localhost:16686) |
| *(profiles)* **cosmos**   | Cosmos DB emulator               | 8081                     | Heavy; run with `--profile cosmos`                     |
| *(profiles)* **qdrant**   | Vector DB for embedding search   | 6333                     | Optional for MLOps steps                               |
| *(profiles)* **llm-mock** | WireMock service mocking LLM API | 8080                     | Returns deterministic responses                        |

---

## ⚙️ Setup & Run

### 1️⃣ Copy environment template
```bash
cp infra/docker/.env.docker.example infra/docker/.env
pnpm devstack:up
pnpm -w i && pnpm -w dev
open http://localhost:16686   # Jaeger
pnpm test:devstack