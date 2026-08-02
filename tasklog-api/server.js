// server.js
// Tasklog API — a small CRUD backend for one resource: tasks.
// Data persists to data.json on disk (simple file-based store, no
// database engine needed).

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// ---------- routes ----------

// GET /api/tasks — list all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// GET /api/tasks/:id — a single task
app.get('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

// POST /api/tasks — create a task
app.post('/api/tasks', (req, res) => {
  const error = validateTaskInput(req.body);
  if (error) return res.status(400).json({ error });

  const tasks = readTasks();
  const task = {
    id: crypto.randomUUID(),
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
app.put('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
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

// DELETE /api/tasks/:id — delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
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
