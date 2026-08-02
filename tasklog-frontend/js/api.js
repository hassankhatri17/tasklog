// api.js
// All network calls to the Tasklog backend live here.
//
const BASE_URL = 'http://localhost:4000';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    throw new Error('NETWORK');
  }

  let body = null;
  try { body = await response.json(); } catch (_) { /* no body */ }

  if (!response.ok) {
    const message = body?.error || `Request failed (status ${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return body;
}

export const api = {
  list: () => request('/api/tasks'),
  create: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
