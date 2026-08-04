// authStore.js
// The only file that touches localStorage directly for auth. Everything
// else asks this module for the token instead of reading storage itself,
// so if the storage mechanism ever changes, only this file needs to.

const TOKEN_KEY = 'tasklog_token';
const USER_KEY = 'tasklog_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}
