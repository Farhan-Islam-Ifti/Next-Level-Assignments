# DevPulse

DevPulse is an internal tech issue and feature tracker API for software teams. It allows team members to report bugs, suggest feature requests, view reported issues, and coordinate issue resolution with role-based permissions.

## Live URL

```txt
https://devpulse-vert-seven.vercel.app
```

## Features

- User registration and login
- JWT-based authentication
- Role-based authorization
- Contributor and maintainer roles
- Create bug reports and feature requests
- View all issues
- View a single issue
- Filter issues by type and status
- Sort issues by newest or oldest
- Contributors can update only their own open issues
- Maintainers can update any issue
- Maintainers can change issue workflow status
- Maintainers can delete issues
- PostgreSQL database
- Raw SQL using native `pg`
- No ORM
- No query builder
- No SQL JOINs
- CORS configured
- Vercel deployment ready

## Tech Stack

- Node.js 24.x or higher
- TypeScript
- Express.js
- PostgreSQL
- Native `pg` driver
- Raw SQL
- bcrypt
- jsonwebtoken
- http-status-codes
- cors
- dotenv

## Architecture

The project follows modular architecture.

```txt
devpulse/
  api/
    index.ts
  src/
    config/
      env.ts
    db/
      pool.ts
      schema.sql
    middleware/
      auth.middleware.ts
    modules/
      auth/
        auth.routes.ts
        auth.service.ts
        auth.types.ts
      issues/
        issues.routes.ts
        issues.service.ts
        issues.types.ts
    types/
      domain.ts
      express.d.ts
    utils/
      api-response.ts
      app-error.ts
      async-handler.ts
      error-handler.ts
      validators.ts
    app.ts
    server.ts
  package.json
  tsconfig.json
  vercel.json
```

## Environment Variables

Create a `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Required variables:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=verify-full
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

Do not commit the real `.env` file. Real secrets should be kept only in local `.env` and Vercel Environment Variables.

## Database Setup

Use NeonDB, Supabase, ElephantSQL, or local PostgreSQL.

The project uses the following tables:

### users

| Field | Type | Requirement |
| --- | --- | --- |
| id | SERIAL | Primary key |
| name | VARCHAR(120) | Required |
| email | VARCHAR(180) | Required and unique |
| password | TEXT | Required and hashed |
| role | VARCHAR(20) | contributor or maintainer |
| created_at | TIMESTAMPTZ | Auto generated |
| updated_at | TIMESTAMPTZ | Auto refreshed |

### issues

| Field | Type | Requirement |
| --- | --- | --- |
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required, max 150 characters |
| description | TEXT | Required, min 20 characters |
| type | VARCHAR(30) | bug or feature_request |
| status | VARCHAR(30) | open, in_progress, resolved |
| reporter_id | INTEGER | User id from JWT |
| created_at | TIMESTAMPTZ | Auto generated |
| updated_at | TIMESTAMPTZ | Auto refreshed |

Run the SQL from:

```txt
src/db/schema.sql
```

For NeonDB, paste the SQL into Neon SQL Editor and run it.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Base local URL:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/health
```

## Deployment

The backend is deployed on Vercel.

Important Vercel settings:

```txt
Root Directory: devpulse
Framework Preset: Other
Install Command: npm install
Build Command: npm run build
Output Directory: leave empty
```

Environment variables required in Vercel:

```env
DATABASE_URL=your_neon_pooled_database_url
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

Do not add `PORT` in Vercel.

## Authentication Header

Protected routes require JWT in this exact format:

```txt
Authorization: <JWT_TOKEN>
```

## API Endpoints

### 1. User Registration

```txt
POST /api/auth/signup
```

Access: Public

Request body:

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

### 2. User Login

```txt
POST /api/auth/login
```

Access: Public

Request body:

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

### 3. Create Issue

```txt
POST /api/issues
```

Access: Authenticated users

Headers:

```txt
Authorization: <JWT_TOKEN>
```

Request body:

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

Success response:

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

### 4. Get All Issues

```txt
GET /api/issues?sort=newest
```

Access: Public

Optional query parameters:

| Param | Values | Default |
| --- | --- | --- |
| sort | newest, oldest | newest |
| type | bug, feature_request | none |
| status | open, in_progress, resolved | none |

Success response:

```json
{
  "success": true,
  "message": "Issues retrived successfully",
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

### 5. Get Single Issue

```txt
GET /api/issues/:id
```

Access: Public

Success response:

```json
{
  "success": true,
  "message": "Issue retrived successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

### 6. Update Issue

```txt
PATCH /api/issues/:id
```

Access:

- Maintainer can update any issue
- Contributor can update own issue only if issue status is `open`

Headers:

```txt
Authorization: <JWT_TOKEN>
```

Request body:

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

Maintainers can also update issue status:

```json
{
  "status": "in_progress"
}
```

Success response:

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

### 7. Delete Issue

```txt
DELETE /api/issues/:id
```

Access: Maintainer only

Headers:

```txt
Authorization: <JWT_TOKEN>
```

Success response:

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

## Standard Success Response

```json
{
  "success": true,
  "message": "Operation description",
  "data": "Response data"
}
```

## Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

## Testing Deployed API

Health check:

```bash
curl https://devpulse-vert-seven.vercel.app/health
```

Signup:

```bash
curl -X POST https://devpulse-vert-seven.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john.doe@devpulse.com","password":"securePassword123","role":"contributor"}'
```

Login:

```bash
curl -X POST https://devpulse-vert-seven.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@devpulse.com","password":"securePassword123"}'
```

Create issue:

```bash
curl -X POST https://devpulse-vert-seven.vercel.app/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: <JWT_TOKEN>" \
  -d '{"title":"Database connection timeout under load","description":"Pool exhausts after 50+ concurrent queries, causing 500 errors","type":"bug"}'
```

Get all issues:

```bash
curl "https://devpulse-vert-seven.vercel.app/api/issues?sort=newest"
```

## Notes

Reporter information is included without SQL JOINs.

Implementation flow:

1. Fetch issues using raw SQL.
2. Fetch reporter data separately using raw SQL.
3. Attach reporter data in application logic.

This keeps the implementation compliant with the no-JOIN requirement.
