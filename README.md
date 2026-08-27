# Vincent Castro API

A TypeScript and Express REST API for portfolio projects.

## Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set the Supabase URL, anon key, and service-role key before starting the API. Keep `.env` private; the service-role key must remain on the Express backend.

The API runs at `http://localhost:5000` by default.

## Endpoints

- `GET /health`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Create and update requests use `multipart/form-data` with `project_image` (JPG, JPEG, PNG, or WebP), `project_name`, `description`, and `tech_stack` as a JSON array string. A client `user_id` may be sent but is ignored; ownership comes from the authenticated request user. Images are stored in the `project-images` bucket and responses return their Storage path.

`GET /api/projects` and `GET /api/projects/:id` are public and return projects allowed by the database's public `SELECT` policy. `POST`, `PUT`, and `DELETE` require a Supabase access token in the `Authorization: Bearer <token>` header. The authenticated Supabase user ID is used as `user_id`; any client-provided `user_id` is ignored.

## Scripts

```bash
npm run dev
npm run build
npm start
```
