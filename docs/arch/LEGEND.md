# Architecture Diagram Legend

Symbols and colors used across all diagrams:

| Symbol                | Meaning                                             |
| --------------------- | --------------------------------------------------- |
| 🟦 Actor / User        | External participant (e.g., Maintainer, GitHub API) |
| 🟩 Service             | Internal component (BFF, Runs, ML, etc.)            |
| 🟨 External Dependency | Third-party API (GitHub, Azure OpenAI)              |
| 🟪 Security            | Key Vault, secrets, identity                        |
| ⚙️ Cylinder            | Persistent data store or message bus                |
| 📈                     | Observability (OTel, Logs, Metrics)                 |

> All diagrams are stored under `docs/arch/releases/v*/` and rendered into `docs/img/v*/`.
