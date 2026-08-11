# Vehicle Rental Management Backend

REST API for staff to manage vehicles and rentals: JWT auth, overlap-safe bookings, server-side pricing, and monthly revenue reports.

**Base URL:** `http://localhost:4000`

---

## Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io/) (`corepack enable`)
- PostgreSQL 16 — local install, remote server, or Docker (see below)

---

## How to run

### Option 1 — App on your machine + external Postgres

Use any Postgres you control (local install, cloud, or **only** the Compose Postgres container while the app runs on the host).

```bash
cd m360-task
pnpm install
cp .env.example .env
```

Edit `.env` for your database:

| Variable | Example (local Postgres) | Example (Compose Postgres on host) |
|----------|------------------------|-------------------------------------|
| `DB_HOST` | `localhost` | `localhost` |
| `DB_PORT` | `5432` | `5444` |
| `DB_USER` / `DB_PASSWORD` | your credentials | `postgres` / `postgres` |
| `DB_NAME` | `express_ts_db` | `express_ts_db` |
| `JWT_SECRET` | min 32 characters | min 32 characters |

If you only need Postgres in Docker:

```bash
docker compose up -d postgres
```

Then set `DB_PORT=5444` in `.env` and continue:

```bash
pnpm db:setup    # migrate + seed
pnpm dev         # http://localhost:4000
```

Production-style run:

```bash
pnpm build && pnpm start
```

### Option 2 — Full stack in Docker (app + Postgres)

```bash
cd m360-task
cp .env.example .env   # defaults work with Compose Postgres on :5444
pnpm docker:setup      # build, start containers, migrate + seed inside app
```

API: `http://localhost:4000`

Step by step:

```bash
pnpm docker:up
pnpm docker:db:setup
```

Inside the app container, DB host is `postgres:5432` (set automatically). `docker:migrate` / `docker:seed` run Knex inside that container.

Stop the stack:

```bash
pnpm docker:down
```

**Troubleshooting:** If the container is up but the API fails after dependency changes:

```bash
docker compose exec -e CI=true app pnpm install
docker compose restart app
```

---

## Seed data

After seeding (`pnpm seed` or `pnpm docker:seed`):

| Email | Password |
|-------|----------|
| `staff@example.com` | `password123` |

Includes 3 vehicles, in-month rentals, a **Jul 29–Aug 3** boundary rental, and a cancelled rental. Seeding is **idempotent** — re-running skips if data already exists.

---

## Authentication

Protected routes require:

```http
Authorization: Bearer <token>
```

```bash
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password123"}'
```

Response: `{ "success": true, "status": 200, "message": "Login successful", "data": { "token", "staff": { "id", "email", "name" } } }`

Login is rate-limited (20 requests / 15 minutes per IP).

---

## API reference

All JSON responses use the same envelope:

```json
{
  "success": true,
  "status": 200,
  "message": "Human-readable message",
  "data": { ... } | null
}
```

- **Success:** `success` is `true`; `data` holds the payload (entity, list, report, etc.).
- **Error:** `success` is `false`; `data` is `null`; `message` describes the problem.

HTTP status codes: **400** (validation), **401** (auth), **404**, **409** (conflict), **429** (rate limit), **500**.

Error example:

```json
{
  "success": false,
  "status": 404,
  "message": "Vehicle not found",
  "data": null
}
```

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | Health check |

### Auth

| Method | Path | Body | Response `data` |
|--------|------|------|-----------------|
| `POST` | `/auth/login` | `{ "email", "password" }` | `{ "token", "staff": { "id", "email", "name" } }` |

### Vehicles

Photos: multipart field `photo` (JPEG, PNG, WebP, max 5MB). Stored in `./uploads/`; served at `/uploads/<filename>`.

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/vehicles` | Query: `page` (default 1), `limit` (default 10, max 100), `category`, `search` (name) |
| `GET` | `/vehicles/:id` | 404 if missing or soft-deleted |
| `POST` | `/vehicles` | Body or form: `name`, `plate_number`, `category`, `daily_rate`; optional `photo` |
| `PUT` | `/vehicles/:id` | Partial update; optional new `photo` replaces old file |
| `DELETE` | `/vehicles/:id` | Soft delete (`deleted_at`); **200** |

List `data` shape:

```json
{
  "data": [{ "id", "name", "plate_number", "category", "daily_rate", "photo_path", ... }],
  "meta": { "page", "limit", "total" }
}
```

### Rentals

Dates: `YYYY-MM-DD`. `total_amount` is **always computed server-side** (`daily_rate × days`); same start/end = 1 day.

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/rentals` | Query: `page` (default 1), `limit` (default 10, max 100), `vehicle_id`, `status`, `start_date`, `end_date` (overlap-style filter) |
| `GET` | `/rentals/:id` | |
| `POST` | `/rentals` | Body: `vehicle_id`, `customer_name`, `customer_phone`, `start_date`, `end_date` → **409** if overlap with `booked`/`ongoing` |
| `PUT` | `/rentals/:id` | Partial update; overlap re-checked when dates/vehicle/status affect active bookings |
| `DELETE` | `/rentals/:id` | Sets `status` to `cancelled`; **200** |

List `data` shape:

```json
{
  "data": [{ "id", "vehicle_id", "customer_name", "start_date", "end_date", "total_amount", "status", ... }],
  "meta": { "page", "limit", "total" }
}
```

Create body (example):

```json
{
  "vehicle_id": 1,
  "customer_name": "Jane Doe",
  "customer_phone": "555-0100",
  "start_date": "2026-10-01",
  "end_date": "2026-10-03"
}
```

### Reports

| Method | Path | Query | Response `data` |
|--------|------|-------|-----------------|
| `GET` | `/reports/rentals` | `month` (`YYYY-MM`, required), optional `vehicle_id` | See below |

Per vehicle: `id`, `name`, `total_bookings`, `days_rented`, `revenue`. Only days **inside the requested month** count (e.g. Jul 29–Aug 3 → **3** days in August). Cancelled rentals excluded. Includes `top_vehicle` (highest revenue).

Report `data` shape:

```json
{
  "month": "2026-08",
  "vehicles": [{ "id", "name", "total_bookings", "days_rented", "revenue" }],
  "top_vehicle": { "id", "name", "revenue" }
}
```

---

## Business rules (summary)

- **Overlap:** Only `booked` and `ongoing` block new bookings. Condition: `existing.start ≤ new.end AND existing.end ≥ new.start`. Checked on create and update (raw SQL + transactions/advisory locks).
- **Pricing:** `total_amount = daily_rate × inclusive days`.
- **Reports:** Revenue = `daily_rate × days in month`; clipped to calendar month boundaries.

---

## Useful commands

| Command | Description |
|---------|-------------|
| `pnpm dev` / `pnpm start` | Run API (dev / production build) |
| `pnpm db:setup` | Migrate + seed (host, uses `.env`) |
| `pnpm migrate` / `pnpm seed` | Database only (host) |
| `pnpm docker:setup` | Up + migrate + seed (containers) |
| `pnpm docker:up` / `pnpm docker:down` | Start / stop Compose stack |
| `pnpm docker:migrate` / `pnpm docker:seed` | Migrate / seed inside app container |
| `pnpm lint` / `pnpm build` | Lint / compile |

---

## Project layout

`src/routes` → `src/controllers` → `src/services` → `src/repositories` (Knex + raw SQL for overlap and reports). Config via `.env` / `.env.example`. Migrations and seeds in `src/db/`.
