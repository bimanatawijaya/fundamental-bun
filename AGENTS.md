# Memory

## Project Overview

Bun + TypeScript learning project (`belajar-bun-fundamental`), with a Prisma 8 ORM
data layer on MySQL. Entry points are loose `*.ts` files at the repo root
(`index.ts`, `server.ts`, `express.ts`, `hash.ts`, ...) plus `packages/*` workspaces.

`CLAUDE.md` in this repo is the memory file for Claude Code, not for Command Code.
Runtime conventions below are the subset that matters here.

## Runtime Conventions (Bun)

- Use `bun <file>` instead of `node`/`ts-node`.
- Use `bun install`, `bun test`, `bun check` (typecheck), `bun run <script>`,
  `bunx <pkg>` — not npm/npx/jest/tsc equivalents.
- Bun loads `.env` automatically; never add `dotenv`.
- Prefer built-ins over packages: `Bun.serve()` over express, `bun:sqlite` over
  better-sqlite3, `Bun.sql` over pg, `Bun.file` over `node:fs` read/write.

## Prisma 8 — Contract Workflow (important)

This project uses Prisma 8 (`prisma@^8.0.0-rc.34`, `@prisma/orm-mysql@8.0.0-rc.24`),
which is a different model from Prisma 5/6: **it does not generate a client**.
Everything flows from an emitted contract.

Config lives in `prisma.config.ts`:

- `contract: "prisma/schema.prisma"` — the contract source I edit (PSL).
- `db.connection: process.env["DATABASE_URL"]` — connection comes from `.env`.
- `migrations.dir: "prisma/migrations"`.

`prisma contract emit` writes two generated artefacts next to nothing else —
they are colocated in `prisma/`:

- `prisma/schema.json` — canonical, content-hashed Contract IR (planner + runtime read it).
- `prisma/schema.d.ts` — the generated TypeScript types.

Never edit those two files by hand; always edit `prisma/schema.prisma` and re-emit.

### Rule: emit after EVERY contract edit

`migration plan` reads `prisma/schema.json`, not `prisma/schema.prisma`. If I change
the schema and skip `contract emit`, the planner works from the stale contract and
says "no changes" (or plans the wrong delta). Snapshots in
`prisma/migrations/snapshots/<storageHash>/` are keyed by the hash produced by emit,
so an un-emitted change has no node in the graph at all.

### Standard loop

```bash
# 1. edit prisma/schema.prisma
bunx prisma contract emit                              # regenerate schema.json + schema.d.ts
bunx prisma migration plan --name add_<thing>           # plan the delta from the current db ref
bunx prisma db migrate --db "$DATABASE_URL"            # apply
bunx prisma db verify --db "$DATABASE_URL"             # confirm no drift
```

### Fast iteration loop (while still experimenting)

```bash
bunx prisma contract emit
bunx prisma db update --db "$DATABASE_URL" --dry-run    # inspect first
bunx prisma db update --db "$DATABASE_URL"              # pushes contract, no migration history, advances db ref
```

Once the schema settles, run `migration plan` + `db migrate` and commit
`prisma/migrations/`.

### On-disk layout

```
prisma/
├── schema.prisma          ← source I edit
├── schema.json            ← emitted, do not edit
├── schema.d.ts            ← emitted, do not edit
└── migrations/
    ├── snapshots/<hash>/contract.json + contract.d.ts   ← content-addressed store
    └── app/
        ├── refs/db.json                                    ← { hash, invariants } of the applied state
        └── <timestamp>_<slug>/{migration.json,migration.ts,ops.json}
```

`migration.json` carries `from` → `to` contract hashes, `migrationHash`, and
`providedInvariants`; `ops.json` holds the SQL with precheck/execute/postcheck arrays.
A `from: null` bundle is a greenfield/baseline migration.

### Gotchas

- Prisma 8 does **not** apply pending migrations at app startup. Run
  `prisma db migrate` from the deploy pipeline before the app boots.
- Plain `db migrate` advances the DB marker but leaves the `db` ref behind; refresh
  with `db update` (a no-op on an already-current DB) or pass `--advance-ref db`.
- `migration plan` with no `db` ref and no `--from` in a project that already has
  migrations refuses with `MIGRATION.PLAN_ORIGIN_UNKNOWN` — it will not silently
  emit a full-create migration.
- `MIGRATION.PRECHECK_FAILED` against a database that is already ahead means the DB
  drifted; adopt it via `db sign` (after `contract infer`) instead of replaying history.
- Prisma 8 bundles its own docs/skill at
  `node_modules/.bun/@prisma+orm-mysql@*/node_modules/@prisma/orm-mysql/skills/prisma-8/`
  — read `references/migrations.md` and `references/contract.md` there before guessing
  at a CLI behavior.
