# E-Commerce Analytics Platform

Repository-Driven — Repository v3.0 Ultimate.  
All business rules, formulas, KPIs, and architecture decisions are
governed exclusively by the Repository documents in `docs/repository/`.

## Quick Start

```bash
cp .env.example .env.local   # fill values
pnpm install
pnpm dev
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm test:run` | Vitest unit tests |
| `pnpm db:generate` | Prisma client generation |
| `pnpm db:migrate` | Apply migrations |
| `pnpm verify:bootstrap` | Sprint 0 acceptance checklist |

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready releases only |
| `develop` | Integration branch — all features merge here first |
| `feat/*` | Feature branches — branch from `develop` |
| `fix/*` | Bug fix branches |
| `chore/*` | Tooling / documentation changes |

## Commit Convention

```
<type>(<scope>): <description>

Types: feat | fix | chore | docs | test | refactor | perf | ci
Scope: engine name, module, or area (e.g. financial-engine, auth, i18n)
Examples:
  feat(financial-engine): implement revenue recognition per BR-005
  fix(auth): correct session refresh in middleware
  chore(bootstrap): initialize repository architecture
```

## Repository Documents

All 63 repository documents are version-controlled in `docs/repository/`.
