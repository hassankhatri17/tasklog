# Tasklog (Week 2 | Task 1 — frontend)

A task tracker UI connected to a real backend you own — not a public
API. The matching backend lives in a separate folder: `tasklog-api`.

## Framework choice

Plain **HTML / CSS / vanilla JS**, native ES modules, no build step —
consistent with the earlier tasks. State management is a small hand-rolled
pub-sub store (`js/store.js`) rather than a library: the task explicitly
allows local state, and a store this size (four actions, one shared
object) doesn't need Redux/Zustand to stay organized.

## Structure

```
tasklog-frontend/
├── index.html                 # shell: fonts, CSS, js/main.js
├── css/
│   ├── tokens.css             # design tokens
│   └── styles.css             # base styles, components, responsive rules
├── js/
│   ├── api.js                 # fetch wrapper for the backend (BASE_URL lives here)
│   ├── store.js                # shared state: tasks, loading, error, pendingIds
│   ├── main.js                 # renders once, wires store subscription
│   └── components/
│       ├── header.js
│       ├── taskform.js        # create form — owns its own submit UI directly
│       ├── tasklist.js        # list, loading/error/empty states, inline edit
│       └── footer.js
└── README.md
```

## How state management works

`store.js` holds one object: `{ tasks, loading, error, pendingIds }`.
Every action (`loadTasks`, `createTask`, `toggleComplete`, `editTask`,
`deleteTask`) goes through the store, never touches the API directly from
a component, and every change calls a single `setState()` that notifies
subscribers. `main.js` subscribes once and re-renders the task list on
every change.

The **create form** is the one exception, on purpose: it manages its own
loading/error UI directly via DOM updates instead of going through the
shared store's re-render cycle. This is deliberate — if the form fully
re-rendered every time *any* task changed elsewhere (e.g. someone
deletes an unrelated task), the user could lose whatever they were
mid-typing in the title field. Keeping the form's transient submit state
local avoids that.

## How the task requirements are met

- **CRUD from the UI** — create (form), read (list + loading/error/empty
  states), update (checkbox toggle + inline edit), delete (icon button)
  are all wired to the real backend.
- **Loading and error states on every action** — the initial list fetch
  shows a skeleton; toggling/editing/deleting a task shows a spinner on
  *that specific row* (via `pendingIds`) so other rows stay interactive;
  create shows a spinner in the submit button; any failure shows a
  friendly, specific message (not a raw error object) with a retry
  option where relevant.
- **State management** — see above.

## Running locally (both projects)

Terminal 1 — backend:
```bash
cd tasklog-api
npm install
npm start
```

Terminal 2 — frontend:
```bash
cd tasklog-frontend
python3 -m http.server 8080
```
Open `http://localhost:8080`. With `BASE_URL` in `js/api.js` pointing at
`http://localhost:4000`, the app talks to your local backend directly.

**To see the error state without touching the backend:** stop the
backend server (Ctrl+C in its terminal) while the frontend is open, then
try adding, editing, or deleting a task — you'll see the friendly
"couldn't reach the server" message this app is built to show.
