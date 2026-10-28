# Express + TypeScript API

A simple Express 5 API made of routes, middleware, centralised error handling, controllers, services and DTOs, backed by PostgreSQL (`pg`).

## Run

```bash
cp .env.example .env      # then set DB_USER / DB_PASSWORD for your local Postgres
npm install
createdb express_app      # create the local database
npm run db:migrate        # create the users table from db/schema.sql
npm run dev        # tsx watch on http://localhost:3000
npm run build && npm start
```

## Structure

```
src/
├── server.ts                 # starts the HTTP server
├── app.ts                    # middleware order + routers + error handlers
├── config/env.ts             # env vars from .env
├── config/db.ts              # pg connection pool + connectDB()
├── routes/index.ts           # root router: mounts each module
├── modules/
│   └── user/                 # one folder per feature
│       ├── user.controller.ts # router + handlers (HTTP in/out)
│       ├── user.service.ts   # business logic + SQL queries via the pg pool
│       ├── user.interface.ts # TypeScript interfaces for the module
│       └── user.dto.ts       # zod request schemas + response types
├── middlewares/
│   ├── requestLogger.ts      # logs method, url, status, duration
│   ├── validate.ts           # validates req.body against a DTO schema
│   ├── notFound.ts           # 404 for unmatched routes
│   └── errorHandler.ts       # turns every error into a JSON response
└── errors/AppError.ts        # typed errors (400/404/409)
db/schema.sql                 # table definitions, applied by npm run db:migrate
scripts/migrate.ts            # runs schema.sql using the .env connection
```

## Request lifecycle

`requestLogger → express.json → controller route → validateBody → handler → service`

If anything throws, rejects or calls `next(err)`, Express skips straight to `errorHandler`. Unmatched routes hit `notFoundHandler`, which forwards a `NotFoundError` to the same handler.

## Endpoints

| Method | Path                     |                                |
|--------|--------------------------|--------------------------------|
| GET    | /api/health              | liveness                       |
| GET    | /api/users               | list                           |
| GET    | /api/users/:id           | get one                        |
| POST   | /api/users               | `{ "name", "email" }`          |
| PATCH  | /api/users/:id           | partial update                 |
| DELETE | /api/users/:id           | delete                         |
| GET    | /api/demo/async-error    | async handler that rejects     |

`GET /api/demo/async-error` returns a JSON 500 and the server keeps running. Express 5 sends rejected promises to the error handler, so controllers don't need `try/catch`.

## Adding a module

1. Create `src/modules/<name>/` with `<name>.controller.ts` (exports a Router), `<name>.service.ts`, `<name>.interface.ts` and `<name>.dto.ts`.
2. Mount the router in `src/routes/index.ts`: `router.use('/<name>', <name>Controller)`.
