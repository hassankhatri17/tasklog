// main.js
// index.html is the app's one protected route. Before rendering
// anything, this checks for a token, then confirms with the backend
// that the token is actually still valid (not just present) — a token
// could be present but expired, or belong to a deleted account.
import { Header, mountHeader } from './components/header.js';
import { TaskForm, mountTaskForm } from './components/taskform.js';
import { TaskList, mountTaskList } from './components/tasklist.js';
import { Footer } from './components/footer.js';
import { subscribe, loadTasks } from './store.js';
import { authApi } from './authApi.js';
import { isLoggedIn, getToken, setSession, clearSession } from './authStore.js';

function renderList() {
  document.getElementById('task-list-root').innerHTML = TaskList();
}

function renderApp(user) {
  const app = document.getElementById('app');
  app.innerHTML = [
    Header(user),
    '<div id="task-form-root"></div>',
    '<main class="container"><div id="task-list-root"></div></main>',
    Footer(),
  ].join('');

  mountHeader(() => {
    clearSession();
    window.location.href = 'login.html';
  });

  // The form is rendered once and manages its own submit UI directly
  // (see taskform.js) — it does not get wiped by unrelated list re-renders.
  document.getElementById('task-form-root').innerHTML = TaskForm();
  mountTaskForm();

  // The list re-renders every time shared task state changes (load,
  // toggle, edit, delete). mountTaskList attaches one delegated listener
  // to the stable #task-list-root wrapper, so it survives every
  // innerHTML swap of its children.
  mountTaskList(renderList);
  subscribe(renderList);

  loadTasks();
}

function showCheckingSession() {
  document.getElementById('app').innerHTML =
    '<div class="auth-loading-panel">Checking your session…</div>';
}

async function init() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  showCheckingSession();

  try {
    // A token can exist in storage but no longer be valid server-side
    // (expired, or the account was removed) — /api/auth/me is the real
    // check, not just "is there something in localStorage."
    const { user } = await authApi.me();
    setSession(getToken(), user); // refresh cached user info
    renderApp(user);
  } catch (err) {
    clearSession();
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', init);
