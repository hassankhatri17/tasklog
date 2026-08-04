# Tasklog

Built for Week 2, Task 1 of my Full-Stack Web Developer internship at
NeuroFive Solutions.

A task tracker with a frontend connected to a real backend I built myself
— not a public API. Kept as a **monorepo**: one repo, two independent
projects.

## Structure

```
tasklog/
├── README.md
├── tasklog-api/          # Express backend — see tasklog-api/README.md
│   ├── server.js
│   ├── package.json
│   ├── data.json
│   └── README.md
└── tasklog-frontend/      # Vanilla JS frontend — see tasklog-frontend/README.md
    ├── index.html
    ├── css/
    ├── js/
    └── README.md
```

Each subfolder has its own detailed README (stack choice, endpoints,
component structure, state management). This top-level README only
covers what's specific to running both together.

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
Open `http://localhost:8080` — full CRUD works against your local
backend immediately, since `tasklog-frontend/js/api.js`'s `BASE_URL`
defaults to `http://localhost:4000`.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Tasklog monorepo (API + frontend)"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Or upload via GitHub's web UI: create the repo, then drag in both
`tasklog-api` and `tasklog-frontend` folders together in one upload —
just make sure both folders land as real folders at the repo root, not
flattened.
