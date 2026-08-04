# Tasklog (Week 2 | Task 2 — full-stack monorepo with auth)

A task tracker with a frontend connected to a real backend I built
myself, now with real user accounts (signup, login, JWT sessions, a
protected task page). Kept as a **monorepo**: one repo, two independent
projects that run together locally. This builds directly on Week 2 |
Task 1's Tasklog project — same app, accounts added on top.

## Structure

```
tasklog/
├── README.md
├── tasklog-api/          # Express backend — see tasklog-api/README.md
│   ├── server.js
│   ├── auth.js            # user storage, password hashing, JWT, auth middleware
│   ├── package.json
│   ├── data.json          # tasks
│   ├── users.json         # accounts
│   └── README.md
└── tasklog-frontend/      # Vanilla JS frontend — see tasklog-frontend/README.md
    ├── index.html          # protected task page
    ├── login.html
    ├── signup.html
    ├── css/
    ├── js/
    └── README.md
```

Each subfolder has its own detailed README (stack choice, endpoints,
component structure, state management, auth flow). This top-level README
only covers what's specific to running both together as a monorepo.

## Running both locally

Terminal 1 — backend:
```bash
cd tasklog-api
npm install
npm start
```
Runs on `http://localhost:4000`.

Terminal 2 — frontend:
```bash
cd tasklog-frontend
npx serve -l 8080
```
Open `http://localhost:8080/signup.html` first (there's no account yet,
and `index.html` will redirect you there anyway). Full CRUD works
against your local backend immediately after you create an account,
since `tasklog-frontend/js/http.js`'s `BASE_URL` defaults to
`http://localhost:4000`.

## Trying the full auth flow

1. Go to `signup.html`, create an account
2. You land on `index.html` (the protected task page) automatically,
   showing your name in the header
3. Add a task or two
4. Click **Log out** in the header
5. Try opening `index.html` directly — you'll be redirected straight
   back to `login.html`, since there's no valid session anymore
6. Log back in — your tasks are still there

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Add user accounts: signup, login, JWT auth, protected task page"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Or upload via GitHub's web UI: open your existing `tasklog` repo, drag in
the new/changed files (see each subfolder's README for exactly which
ones changed), commit.
