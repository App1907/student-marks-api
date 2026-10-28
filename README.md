# Student & Marks API

Express 5 + TypeScript API for **Student CRUD**, **Marks CRUD**, and **subject-wise averages**, built on the existing layered architecture (routes → controllers → services → repositories → PostgreSQL).

## Quick start (database + server)

### 1. Prerequisites

- Node.js **≥ 20**
- PostgreSQL running locally (Homebrew / Postgres.app / Docker)

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` for your machine. On Homebrew Postgres the macOS username often works with an empty password:

```env
NODE_ENV=local
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=user          # your macOS / Postgres role
DB_PASSWORD=          # empty for peer/trust auth
DB_NAME=student_app
```

### 3. Create the database

```bash
# Homebrew Postgres (no password)
createdb student_app

# Or via psql
psql -U postgres -c "CREATE DATABASE student_app;"
```

### 4. Install, migrate, run

```bash
npm install
npm run db:migrate    # applies db/schema.sql (users, students, marks)
npm run dev           # http://localhost:3000
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000/api/health | Liveness |
| http://localhost:3000/api/docs | Swagger UI |

Production build:

```bash
npm run build && npm start
npm run typecheck
```

### Database connection troubleshooting

| Symptom | Fix |
|---------|-----|
| `connection refused` / `pg_isready` fails | Start Postgres: `brew services start postgresql@18` (or your version) |
| `role "postgres" does not exist` | Set `DB_USER` to your macOS username (`whoami`) |
| `password authentication failed` | Set `DB_PASSWORD`, or use trust/peer for local |
| `database "student_app" does not exist` | Run `createdb student_app` |
| `relation "students" does not exist` | Run `npm run db:migrate` |

Verify connectivity:

```bash
pg_isready -h localhost
psql -U "$DB_USER" -d student_app -c "SELECT 1;"
```

---

## Project structure

```
src/
├── server.ts
├── app.ts                      # middleware order + Swagger + routers
├── config/env.ts               # .env
├── config/db.ts                # pg pool + connectDB()
├── docs/swagger.ts             # OpenAPI + Swagger UI at /api/docs
├── routes/index.ts             # mounts /users, /students, /marks
├── modules/
│   ├── user/                   # existing reference module
│   ├── student/                # controller → service → repository
│   └── mark/                   # controller → service → repository
├── middlewares/                # requestLogger, validate, notFound, errorHandler
└── errors/AppError.ts
db/schema.sql                   # users, students, marks (+ unique + cascade)
scripts/migrate.ts
```

**Layering:** controllers handle HTTP only; services enforce business rules; **only repositories** import `pool` and run SQL (student & mark modules).

**Cascade:** deleting a student removes their marks via `ON DELETE CASCADE`. Duplicate `(student_id, subject)` is blocked by a unique constraint and surfaced as HTTP 409.

---

## API overview

Base path: `/api`  
Success envelope: `{ "success": true, "message": "...", "data": ... }`  
Error envelope: `{ "success": false, "message": "...", "details": ... }`

### Students

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/students` | 201 — create |
| GET | `/api/students` | 200 — list |
| GET | `/api/students/:studentId` | 200 / 404 |
| PUT | `/api/students/:studentId` | 200 / 404 / 409 |
| DELETE | `/api/students/:studentId` | **204** / 404 (cascades marks) |
| GET | `/api/students/:studentId/marks` | optional — marks for one student |

### Marks

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/marks` | 201 — create |
| GET | `/api/marks` | 200 — optional `?studentId=&subject=` |
| GET | `/api/marks/averages/subjects` | 200 — subject averages |
| GET | `/api/marks/:markId` | 200 / 404 |
| PUT | `/api/marks/:markId` | 200 / 404 / 409 |
| DELETE | `/api/marks/:markId` | **204** / 404 |

### Users (existing)

`GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id` — unchanged.

---

## Example requests & responses

### Create student

```bash
curl -s -X POST http://localhost:3000/api/students \
  -H 'Content-Type: application/json' \
  -d '{"name":"Asha Sharma","email":"asha@example.com"}'
```

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 1,
    "name": "Asha Sharma",
    "email": "asha@example.com",
    "createdAt": "2026-10-19T07:00:00.000Z",
    "updatedAt": "2026-10-19T07:00:00.000Z"
  }
}
```

### Create mark

```bash
curl -s -X POST http://localhost:3000/api/marks \
  -H 'Content-Type: application/json' \
  -d '{"studentId":1,"subject":"Mathematics","marks":88}'
```

```json
{
  "success": true,
  "message": "Mark created successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "subject": "Mathematics",
    "marks": 88,
    "createdAt": "2026-10-19T07:00:00.000Z",
    "updatedAt": "2026-10-19T07:00:00.000Z"
  }
}
```

### Subject-wise averages

Given Mathematics `80, 90, 70`, Science `75, 85`, English `60`:

```bash
curl -s http://localhost:3000/api/marks/averages/subjects
```

```json
{
  "success": true,
  "message": "Subject averages fetched successfully",
  "data": [
    { "subject": "English", "averageMarks": 60.0, "totalRecords": 1 },
    { "subject": "Mathematics", "averageMarks": 80.0, "totalRecords": 3 },
    { "subject": "Science", "averageMarks": 80.0, "totalRecords": 2 }
  ]
}
```

Empty marks table → `"data": []`. Missing marks are **not** counted as zero.

### Edge cases (handled)

| Case | Result |
|------|--------|
| Invalid / empty name, email, subject | 400 validation |
| Marks outside 0–100 | 400 |
| Duplicate student email | 409 |
| Duplicate student + subject mark (incl. different casing) | 409 |
| Unknown student when creating/updating mark | 404 |
| Extra unknown fields on create/update body | 400 (strict DTO) |
| Unknown student / mark id | 404 |
| Delete student | 204 + related marks removed |
| Invalid JSON body | 400 |
| Unmatched route | 404 via `notFound` |
| Async throw in handler | 500 via `errorHandler` (Express 5) |

---

## Design decisions

1. **Repositories for student/mark** — SQL stays out of controllers/services; matches the assignment rule while keeping the existing user module intact.
2. **Unique `(student_id, subject)` + service checks** — DB constraint is the source of truth; service maps `23505` → 409.
3. **`ON DELETE CASCADE`** — no orphaned marks after student deletion.
4. **Averages in SQL** — `ROUND(AVG(marks), 2)` grouped by subject; no phantom zeros.
5. **Swagger at `/api/docs`** — interactive docs without changing the core middleware order.
6. **PUT for student/mark updates** — full replace of required fields, as specified (user module still uses PATCH).
