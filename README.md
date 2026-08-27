# Vincent Castro API

A TypeScript and Express REST API for portfolio projects.

## Setup

```bash
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default.

## Endpoints

- `GET /health`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Create and update requests expect JSON with `image_url`, `project_name`, `description`, and `tech_stack`. The current service uses an in-memory store; replace the `ProjectStore` implementation in `src/services/project.service.ts` when connecting Supabase/PostgreSQL.

Set `AUTH_TOKEN` in `.env` to require a Bearer token for write endpoints. Leave it empty for local development.

## Scripts

```bash
npm run dev
npm run build
npm start
```
