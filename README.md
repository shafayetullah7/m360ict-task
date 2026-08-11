# Vehicle Rental Management Backend

Node.js + TypeScript API for staff-authenticated vehicle and rental management, with overlap detection, server-side pricing, and monthly revenue reports.

## Tech Stack

- **Runtime:** Node.js 22, TypeScript (strict)
- **Framework:** Express 5
- **Database:** PostgreSQL 16, Knex
- **Auth:** argon2 + JWT (Bearer)
- **Validation:** Joi
- **Uploads:** Multer (vehicle photos)

## Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io/) (Corepack enabled)
- PostgreSQL 16, or Docker

## Quick Start

### 1. Clone and install

```bash
cd m360-task
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` if needed. With Docker Compose Postgres, use `DB_PORT=5444`.

### 3. Start PostgreSQL

**Docker (recommended):**

```bash
docker compose up -d postgres
```

**Or** use a local Postgres instance and set `DB_HOST`, `DB_PORT`, etc.

### 4. Database setup

```bash
pnpm migrate
pnpm seed
```

### 5. Run the API

```bash
pnpm dev
```

Server: `http://localhost:4000`

Production build:

```bash
pnpm build
pnpm start
```

## Seed Credentials

After `pnpm seed`:

| Field | Value |
|-------|-------|
| Email | `staff@example.com` |
| Password | `password123` |

Seed data includes 3 vehicles, in-month rentals, a **month-boundary** rental (Jul 29–Aug 3), and a cancelled rental for report testing.

## Authentication

Protected routes require:

```http
Authorization: Bearer <token>
```

Login:

```bash
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password123"}'
```

Login is rate-limited (20 attempts per 15 minutes per IP).

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | No | Staff login |
| `GET` | `/vehicles` | Yes | List vehicles (paginated) |
| `GET` | `/vehicles/:id` | Yes | Get vehicle |
| `POST` | `/vehicles` | Yes | Create vehicle (+ optional `photo`) |
| `PUT` | `/vehicles/:id` | Yes | Update vehicle (+ optional `photo`) |
| `DELETE` | `/vehicles/:id` | Yes | Soft-delete vehicle |
| `GET` | `/rentals` | Yes | List rentals (filters: `vehicle_id`, `status`, dates) |
| `GET` | `/rentals/:id` | Yes | Get rental |
| `POST` | `/rentals` | Yes | Create rental |
| `PUT` | `/rentals/:id` | Yes | Update rental |
| `DELETE` | `/rentals/:id` | Yes | Cancel rental |
| `GET` | `/reports/rentals?month=YYYY-MM` | Yes | Monthly report per vehicle |

Vehicle photos are served at `/uploads/<filename>`.

## Example Requests

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password123"}' | jq -r '.token')

# List vehicles
curl -s "http://localhost:4000/vehicles?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Create rental (total_amount computed server-side)
curl -s -X POST http://localhost:4000/rentals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "customer_name": "Jane Doe",
    "customer_phone": "555-0100",
    "start_date": "2026-10-01",
    "end_date": "2026-10-03"
  }'

# Monthly report
curl -s "http://localhost:4000/reports/rentals?month=2026-08" \
  -H "Authorization: Bearer $TOKEN"
```

## Business Logic

### Rental overlap

A vehicle cannot have overlapping rentals when status is `booked` or `ongoing`. Overlap uses inclusive dates:

```text
existing.start_date <= new.end_date AND existing.end_date >= new.start_date
```

`cancelled` and `completed` rentals do not block new bookings. Adjacent dates (e.g. ends Aug 5, starts Aug 6) are allowed.

Overlap checks use raw SQL in `RentalRepository`. Rental create uses a DB transaction with `FOR UPDATE` on the vehicle row.

### Pricing

```text
total_amount = daily_rate × countRentalDays(start_date, end_date)
```

Same-day rental = 1 day. Client cannot set `total_amount`; it is always computed on create/update when dates or vehicle change.

### Monthly reports

`GET /reports/rentals?month=YYYY-MM` aggregates per vehicle using raw SQL:

- **Days in month:** clip each rental to the calendar month  
  `LEAST(end_date, month_end) - GREATEST(start_date, month_start) + 1`
- **Revenue:** `daily_rate × clipped_days`, summed per vehicle
- **Cancelled** rentals excluded; soft-deleted vehicles excluded
- **Example:** Jul 29–Aug 3 counts as **3 days in August** (Aug 1–3), not 6

Response includes `vehicles[]` and `top_vehicle` (highest revenue). Optional `vehicle_id` filter.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (ts-node-dev) |
| `pnpm build` | TypeScript compile |
| `pnpm start` | Run compiled server |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm format` | Prettier |
| `pnpm migrate` | Run migrations |
| `pnpm migrate:rollback` | Rollback last migration batch |
| `pnpm seed` | Run seeds |

## Project Structure

```text
src/
├── config/          # env, db
├── db/migrations/   # Knex migrations
├── db/seeds/        # Seed data
├── middleware/      # auth, validate, upload, errors, rate limit
├── repositories/    # Knex data access (raw SQL for overlap + reports)
├── routes/          # Thin HTTP handlers
├── services/        # Business logic
├── types/           # TypeScript DTOs
├── utils/           # date/rental helpers, errors
├── app.ts
└── server.ts
```

Routes do not import Knex directly; they delegate to services.

## Docker

```bash
docker compose up -d postgres   # Postgres on localhost:5444
docker compose up -d            # Postgres + app (port 4000)
```

Ensure `.env` matches compose credentials (`postgres` / `postgres`, port `5444` on host).

## Error Responses

```json
{ "error": { "message": "Human-readable message" } }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Missing/invalid JWT |
| 404 | Resource not found |
| 409 | Conflict (overlap, duplicate plate) |
| 429 | Login rate limit |
| 500 | Internal server error |

## Development Notes

- Planning docs live outside this repo (`VEHICLE_RENTAL_BACKEND_10_PHASE_PLAN.md` in parent folder).
- `.env` is gitignored; never commit secrets.
- `knexfile.ts` is TypeScript-only; compiled `knexfile.js` is gitignored.
