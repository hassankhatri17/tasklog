// auth.js
// Everything auth-related lives here: user storage, password hashing,
// JWT issuing/verifying, and the middleware that protects routes.
// Kept separate from server.js the same way api.js is kept separate
// from rendering on the frontend — one file, one concern.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, 'users.json');

// IMPORTANT: set a real JWT_SECRET environment variable if you ever
// deploy this. This fallback only exists so the app still runs locally
// without extra setup.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

// ---------- tiny file-based "database" for users ----------
function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ---------- validation ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupInput({ name, email, password }) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Your name is required.';
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return 'A valid email address is required.';
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return null;
}

function validateLoginInput({ email, password }) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return 'Email is required.';
  }
  if (!password || typeof password !== 'string' || password === '') {
    return 'Password is required.';
  }
  return null;
}

// ---------- password hashing ----------
function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function checkPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// ---------- JWT ----------
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET); // throws if invalid/expired
}

// ---------- middleware ----------
// Attaches req.user = { id, email } on success, or responds 401.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

// ---------- shape returned to the client (never leak passwordHash) ----------
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

module.exports = {
  readUsers,
  writeUsers,
  validateSignupInput,
  validateLoginInput,
  hashPassword,
  checkPassword,
  signToken,
  requireAuth,
  publicUser,
  crypto,
};
