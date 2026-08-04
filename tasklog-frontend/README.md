# Tasklog (Week 2 | Task 2 — frontend with auth)

A task tracker UI connected to a real backend you own, now with real
user accounts — signup, login, and a protected task page. The matching
backend lives in a separate folder: `tasklog-api`.

## Framework choice

Plain **HTML / CSS / vanilla JS**, native ES modules, no build step —
consistent with the earlier task. State management is a small hand-rolled
pub-sub store (`js/store.js`) rather than a library.

## Structure

```
tasklog-frontend/
├── index.html                 # the protected task page — see main.js
├── login.html                  # public
├── signup.html                 # public
├── css/
│   ├── tokens.css             # design tokens
│   ├── styles.css             # base styles, components, responsive rules
│   └── auth.css                # layout for login/signup pages
├── js/
│   ├── http.js                 # shared fetch wrapper — BASE_URL lives here, attaches the token automatically
│   ├── api.js                  # task network calls (thin wrapper over http.js)
│   ├── authApi.js              # signup/login/me network calls
│   ├── authStore.js            # the only file that touches localStorage — token + cached user
│   ├── validate.js             # client-side validation, mirrors backend rules
│   ├── store.js                 # shared task state: tasks, loading, error, pendingIds
│   ├── main.js                  # index.html's entry point — guards the protected route
│   ├── loginPage.js             # login.html's entry point
│   ├── signupPage.js            # signup.html's entry point
│   └── components/
│       ├── header.js           # now shows the user's name + logout button
│       ├── taskform.js         # create form — owns its own submit UI directly
│       ├── tasklist.js         # list, loading/error/empty states, inline edit
│       └── footer.js
└── README.md
```

## How the protected route actually works

`index.html` is the app's one protected page. `main.js` guards it in two
layers, on every load:

1. **Is there a token at all?** (`isLoggedIn()` in `authStore.js`) — if
   not, redirect to `login.html` immediately, before rendering anything.
2. **Is the token actually still valid?** A token can exist in
   `localStorage` but no longer be usable — expired, or the account was
   deleted. So `main.js` calls `GET /api/auth/me` before rendering the
   real UI. If that fails, it clears the stored token and redirects to
   `login.html`. While this check is in flight, a small "Checking your
   session…" message shows instead of a blank page or a flash of task
   content that isn't really the user's yet.

This same check also runs mid-session: if any task request comes back
`401` (e.g. the token expired while the user was using the app),
`store.js` clears the session and redirects to `login.html`
automatically — the user is never left staring at a broken screen with
an invalid token.

## Where the token lives

`authStore.js` is the **only** file that touches `localStorage` directly.
Everything else — `main.js`, `store.js`, `http.js` — asks this module for
the token instead of reading storage itself. `http.js` attaches it to
every request automatically as `Authorization: Bearer <token>`, so no
component or page has to remember to do that itself.

## Client-side validation

`validate.js` mirrors the backend's rules (see `tasklog-api/auth.js`) so
signup/login show inline errors immediately, without a round trip:
- Name required (signup)
- Valid email format
- Password ≥8 characters, at least one letter and one number (signup)
- Confirm password must match (signup)

This is genuinely just for UX — the backend re-validates everything
regardless, since client-side checks can always be bypassed and are
never the real security boundary.

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
re-rendered every time *any* task changed elsewhere, the user could lose
whatever they were mid-typing in the title field.

## How the task requirements are met

- **Signup/login forms with client-side validation** — `login.html` /
  `signup.html`, validated field-by-field on blur and on submit.
- **Backend that hashes passwords and issues a token** — see
  `tasklog-api`: bcrypt hashing, JWT issued on signup/login.
- **Token stored securely on the frontend, attached to requests** —
  `authStore.js` + `http.js`, as above. ("Securely" here means: isolated
  to one module, never logged, never put in the URL — `localStorage` is
  the standard mechanism for this in a plain frontend with no
  server-rendered session; it's vulnerable to XSS same as any client-side
  token storage, which is a real trade-off worth knowing rather than
  glossing over.)
- **Protected page redirecting unauthenticated users** — `index.html` /
  `main.js`, as above.
- **Logout that properly clears the session** — the header's logout
  button calls `clearSession()` (wipes the token and cached user from
  `localStorage`) and redirects to `login.html`.

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
npx serve -l 8080
```
Open `http://localhost:8080/signup.html` first (since `index.html` will
just redirect you there anyway with no account yet).

**To see the error state without touching auth:** stop the backend
server (Ctrl+C in its terminal) while the frontend is open, then try
adding/editing/deleting a task — you'll see the friendly "couldn't reach
the server" message.

**To see the "blocked from protected page" state:** log in, then open
DevTools → Application/Storage tab → clear `localStorage` (or just call
`localStorage.clear()` in the console) → refresh `index.html` — you'll be
redirected straight to `login.html`, the same as if you'd never logged in.
