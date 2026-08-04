// store.js
// A minimal pub-sub state store. Components never touch the API
// directly except through these actions, and never mutate `state`
// directly — every change goes through setState so subscribers always
// see a consistent snapshot. This is "local state" as the task allows,
// just centralized instead of scattered across components.

import { api } from './api.js';
import { clearSession } from './authStore.js';

// If a request comes back 401 mid-session (expired/invalid token), there's
// no reasonable in-app recovery — send the user back to login. Returns
// true if it handled the error (caller should stop, since we're navigating
// away), false otherwise.
function handleAuthError(err) {
  if (err.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

let state = {
  tasks: [],
  loading: true,      // initial list fetch
  error: null,         // error loading the list
  pendingIds: new Set(), // task ids currently updating/deleting
};

const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export async function loadTasks() {
  setState({ loading: true, error: null });
  try {
    const tasks = await api.list();
    setState({ tasks, loading: false });
  } catch (err) {
    if (handleAuthError(err)) return;
    setState({ loading: false, error: friendlyMessage(err) });
  }
}

export async function createTask({ title, description }) {
  try {
    const task = await api.create({ title, description });
    setState({ tasks: [task, ...state.tasks] });
    return { ok: true };
  } catch (err) {
    if (handleAuthError(err)) return { ok: false, error: 'Redirecting to login…' };
    return { ok: false, error: friendlyMessage(err) };
  }
}

export async function toggleComplete(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  markPending(id, true);
  try {
    const updated = await api.update(id, { completed: !task.completed });
    setState({ tasks: state.tasks.map(t => (t.id === id ? updated : t)) });
  } catch (err) {
    if (handleAuthError(err)) return;
    setState({ error: friendlyMessage(err) });
  } finally {
    markPending(id, false);
  }
}

export async function editTask(id, { title, description }) {
  markPending(id, true);
  try {
    const updated = await api.update(id, { title, description });
    setState({ tasks: state.tasks.map(t => (t.id === id ? updated : t)) });
    return true;
  } catch (err) {
    if (handleAuthError(err)) return false;
    setState({ error: friendlyMessage(err) });
    return false;
  } finally {
    markPending(id, false);
  }
}

export async function deleteTask(id) {
  markPending(id, true);
  try {
    await api.remove(id);
    setState({ tasks: state.tasks.filter(t => t.id !== id) });
  } catch (err) {
    if (handleAuthError(err)) return;
    setState({ error: friendlyMessage(err) });
    markPending(id, false);
  }
}

function markPending(id, isPending) {
  const next = new Set(state.pendingIds);
  if (isPending) next.add(id); else next.delete(id);
  setState({ pendingIds: next });
}

function friendlyMessage(err) {
  if (err.message === 'NETWORK') {
    return "Couldn't reach the Tasklog server. Check that the backend is running and the API URL is correct.";
  }
  if (err.status === 404) return 'That task no longer exists — it may have already been deleted.';
  if (err.status === 400) return err.message;
  return 'Something unexpected went wrong. Please try again.';
}
