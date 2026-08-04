// validate.js
// Client-side validation mirrors the backend's rules (see auth.js on the
// server) so the user gets instant feedback — but the backend re-checks
// everything regardless, since client-side validation can always be
// bypassed and is never the actual security boundary.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name) {
  if (!name || name.trim() === '') return 'Your name is required.';
  return null;
}

export function validateEmail(email) {
  if (!email || email.trim() === '') return 'Email is required.';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
  return null;
}

export function validateSignupPassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return null;
}

export function validateLoginPassword(password) {
  if (!password) return 'Password is required.';
  return null;
}

export function validateConfirmPassword(password, confirm) {
  if (confirm !== password) return 'Passwords do not match.';
  return null;
}
