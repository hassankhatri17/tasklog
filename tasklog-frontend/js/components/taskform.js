// components/taskform.js
import { createTask } from '../store.js';

export function TaskForm() {
  return `
    <form class="task-form container" id="task-form">
      <div class="form-row">
        <input type="text" id="title-input" placeholder="What needs doing?" aria-label="Task title" autocomplete="off" maxlength="120" />
        <button type="submit" class="btn btn-primary" id="submit-btn">Add task</button>
      </div>
      <input type="text" id="description-input" placeholder="Add a note (optional)" aria-label="Task description" autocomplete="off" />
      <p class="form-error" id="form-error" role="alert" hidden></p>
    </form>
  `;
}

// This component is rendered once and never fully re-rendered afterwards
// (see main.js) — it updates its own DOM directly on submit, so the user
// never loses focus or in-progress typing due to unrelated app state
// changes (e.g. deleting a different task elsewhere on the page).
export function mountTaskForm() {
  const form = document.getElementById('task-form');
  const titleInput = document.getElementById('title-input');
  const descInput = document.getElementById('description-input');
  const submitBtn = document.getElementById('submit-btn');
  const errorEl = document.getElementById('form-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }
    const description = descInput.value.trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Adding…';
    errorEl.hidden = true;

    const result = await createTask({ title, description });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Add task';

    if (result.ok) {
      titleInput.value = '';
      descInput.value = '';
      titleInput.focus();
    } else {
      errorEl.textContent = result.error;
      errorEl.hidden = false;
    }
  });
}
