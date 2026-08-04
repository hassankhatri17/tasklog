// server.js
// Tasklog API — a CRUD backend for tasks, with real user accounts.
// Data persists to data.json / users.json on disk (simple file-based
// store, no database engine needed).

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// ---------- tiny file-based "database" ----------
function readTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ---------- validation ----------
function validateTaskInput(body) {
  if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
    return 'A task title is required.';
  }
  if (body.title.length > 120) {
    return 'Title must be 120 characters or fewer.';
  }
  return null;
}

// ---------- auth routes ----------

// POST /api/auth/signup — create an account, return a token immediately
app.post('/api/auth/signup', (req, res) => {
  const error = auth.validateSignupInput(req.body);
  if (error) return res.status(400).json({ error });

  const users = auth.readUsers();
  const email = req.body.email.trim().toLowerCase();

  if (users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: auth.crypto.randomUUID(),
    name: req.body.name.trim(),
    email,
    passwordHash: auth.hashPassword(req.body.password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  auth.writeUsers(users);

  const token = auth.signToken(user);
  res.status(201).json({ token, user: auth.publicUser(user) });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const error = auth.validateLoginInput(req.body);
  if (error) return res.status(400).json({ error });

  const users = auth.readUsers();
  const email = req.body.email.trim().toLowerCase();
  const user = users.find(u => u.email === email);

  // Same generic message whether the email or the password was wrong —
  // don't reveal which one, so an attacker can't use this to find valid emails.
  const invalidMessage = 'Incorrect email or password.';
  if (!user) return res.status(401).json({ error: invalidMessage });

  const ok = auth.checkPassword(req.body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: invalidMessage });

  const token = auth.signToken(user);
  res.json({ token, user: auth.publicUser(user) });
});

// GET /api/auth/me — used by the frontend to check "is my token still valid?"
app.get('/api/auth/me', auth.requireAuth, (req, res) => {
  const users = auth.readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
  res.json({ user: auth.publicUser(user) });
});

// ---------- routes ----------

// GET /api/tasks — list tasks belonging to the logged-in user
app.get('/api/tasks', auth.requireAuth, (req, res) => {
  const tasks = readTasks().filter(t => t.userId === req.user.id);
  res.json(tasks);
});

// GET /api/tasks/:id — a single task (only if it belongs to this user)
app.get('/api/tasks/:id', auth.requireAuth, (req, res) => {
  const task = readTasks().find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

// POST /api/tasks — create a task, owned by the logged-in user
app.post('/api/tasks', auth.requireAuth, (req, res) => {
  const error = validateTaskInput(req.body);
  if (error) return res.status(400).json({ error });

  const tasks = readTasks();
  const task = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    title: req.body.title.trim(),
    description: (req.body.description || '').trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

// PUT /api/tasks/:id — update a task (title, description, and/or completed)
// Only the task's owner can update it.
app.put('/api/tasks/:id', auth.requireAuth, (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found.' });

  if (req.body.title !== undefined) {
    const error = validateTaskInput(req.body);
    if (error) return res.status(400).json({ error });
    tasks[index].title = req.body.title.trim();
  }
  if (req.body.description !== undefined) {
    tasks[index].description = String(req.body.description).trim();
  }
  if (req.body.completed !== undefined) {
    tasks[index].completed = Boolean(req.body.completed);
  }
  tasks[index].updatedAt = new Date().toISOString();

  writeTasks(tasks);
  res.json(tasks[index]);
});

// DELETE /api/tasks/:id — delete a task (only if it belongs to this user)
app.delete('/api/tasks/:id', auth.requireAuth, (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found.' });

  const [removed] = tasks.splice(index, 1);
  writeTasks(tasks);
  res.json(removed);
});

// health check — confirms the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Tasklog API running on port ${PORT}`);
});
