# Tasklog API (Week 2 | Task 1 — backend)

A small CRUD backend for one resource — **tasks** — built with
Express.js. This is the backend half of Week 2 | Task 1; the matching frontend
lives in a separate folder: `tasklog-frontend`.

## Stack

**Node.js + Express**, with a plain JSON file (`data.json`) as storage
instead of a database engine — enough to demonstrate real persistence
and full CRUD without adding database setup to the task. `cors` is
enabled so the frontend (running on a different local port) can call it.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check — confirms the server is up |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task — body: `{ title, description }` |
| PUT | `/api/tasks/:id` | Update a task — body: any of `{ title, description, completed }` |
| DELETE | `/api/tasks/:id` | Delete a task |

**Validation:** `title` is required (non-empty, ≤120 characters) on
create, and on update if `title` is included in the request. Missing or
invalid input returns `400` with `{ "error": "<message>" }`. Requests for
a task ID that doesn't exist return `404` with the same error shape, so
the frontend can handle both consistently.

## Example requests

```bash
# create
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","description":"Explain the API"}'

# list
curl http://localhost:4000/api/tasks

# update (mark complete)
curl -X PUT http://localhost:4000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# delete
curl -X DELETE http://localhost:4000/api/tasks/<id>
```

## Running locally

```bash
npm install
npm start
```
Server runs on `http://localhost:4000` by default.

## Connecting the frontend

The frontend's `js/api.js` already points `BASE_URL` at
`http://localhost:4000`, so as long as this server is running, the
frontend will talk to it directly — no extra setup needed.
