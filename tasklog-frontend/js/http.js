// http.js
// The one place that knows how to talk to the backend over HTTP:
// builds the URL, attaches the auth token when present, and turns
// network/API failures into consistent Error objects the rest of the
// app can handle the same way everywhere.
//
// IMPORTANT: change BASE_URL to your backend's URL if you ever run the
// frontend from somewhere other than the same machine as the backend.
import { getToken } from './authStore.js';

export const BASE_URL = 'http://localhost:4000';

export async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
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
