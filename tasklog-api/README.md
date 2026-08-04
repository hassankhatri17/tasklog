# Tasklog API (Week 2 | Task 2 — backend with auth)

A CRUD backend for **tasks**, now with real user accounts — signup,
login, and per-user data — built with Express.js. This is the backend
half of Week 2 | Task 2; the matching frontend lives in a separate
folder: `tasklog-frontend`.

## Stack

**Node.js + Express**, with plain JSON files (`data.json` for tasks,
`users.json` for accounts) as storage instead of a database engine —
enough to demonstrate real persistence and full CRUD without adding
database setup to the task. `cors` is enabled so the frontend (running on
a different local port) can call it. `bcryptjs` hashes passwords;
`jsonwebtoken` issues and verifies session tokens.

## Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account — body: `{ name, email, password }`. Returns `{ token, user }`. |
| POST | `/api/auth/login` | Log in — body: `{ email, password }`. Returns `{ token, user }`. |
| GET | `/api/auth/me` | Returns `{ user }` for the current token — used by the frontend to check "is my session still valid?" |

**Signup validation:** name required; email must match a valid format;
password must be ≥8 characters and include at least one letter and one
number. Signing up with an email already in use returns `409`.

**Login:** returns a generic `"Incorrect email or password."` message on
either a wrong email *or* wrong password (not which one) — deliberate,
so a failed login attempt can't be used to discover which emails have
accounts.

### Tasks — all require a valid token

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check — confirms the server is up (no auth needed) |
| GET | `/api/tasks` | List the logged-in user's tasks only |
| GET | `/api/tasks/:id` | Get one task (must belong to the logged-in user) |
| POST | `/api/tasks` | Create a task, owned by the logged-in user — body: `{ title, description }` |
| PUT | `/api/tasks/:id` | Update a task you own — body: any of `{ title, description, completed }` |
| DELETE | `/api/tasks/:id` | Delete a task you own |

Send the token as `Authorization: Bearer <token>` on every task request.
Missing or invalid tokens return `401`. Tasks belonging to another user
return `404` (not `403`) when you try to access them directly by ID —
this avoids confirming to an attacker that a given task ID exists at all.

**Task validation:** `title` is required (non-empty, ≤120 characters) on
create, and on update if `title` is included in the request.

## Example requests

```bash
# sign up
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Hassan","email":"hassan@example.com","password":"secret123"}'
# -> { "token": "...", "user": { "id": "...", "name": "Hassan", "email": "..." } }

# log in
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hassan@example.com","password":"secret123"}'

# create a task (needs the token from signup/login)
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Write README","description":"Explain the API"}'

# list your tasks
curl http://localhost:4000/api/tasks -H "Authorization: Bearer <token>"

# update (mark complete)
curl -X PUT http://localhost:4000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"completed":true}'

# delete
curl -X DELETE http://localhost:4000/api/tasks/<id> \
  -H "Authorization: Bearer <token>"
```

## Running locally

```bash
npm install
npm start
```
Server runs on `http://localhost:4000` by default.

## Connecting the frontend

The frontend's `js/http.js` already points `BASE_URL` at
`http://localhost:4000`, so as long as this server is running, the
frontend will talk to it directly — no extra setup needed.
