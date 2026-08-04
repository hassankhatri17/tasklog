// api.js
// Task-related network calls. Auth headers are attached automatically
// by request() in http.js, so this file only knows about tasks.
import { request } from './http.js';

export const api = {
  list: () => request('/api/tasks'),
  create: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
