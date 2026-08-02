// components/tasklist.js
import { getState, loadTasks, toggleComplete, editTask, deleteTask } from '../store.js';

// UI-only state: which task is currently in inline-edit mode.
// (Not app data, so it doesn't belong in the shared store.)
let editingId = null;

export function TaskList() {
  const { tasks, loading, error, pendingIds } = getState();

  if (loading) return LoadingSkeleton();
  if (error) return ErrorPanel(error);
  if (tasks.length === 0) return EmptyPanel();

  return `
    <ul class="task-list">
      ${tasks.map(t => taskItem(t, pendingIds.has(t.id))).join('')}
    </ul>
  `;
}

function taskItem(task, isPending) {
  if (editingId === task.id) return editItem(task, isPending);

  return `
    <li class="task-item ${task.completed ? 'completed' : ''} ${isPending ? 'is-pending' : ''}">
      <button class="check-btn" data-action="toggle" data-id="${task.id}" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}" ${isPending ? 'disabled' : ''}>
        ${isPending ? '<span class="spinner spinner-sm"></span>' : (task.completed ? checkIcon() : '')}
      </button>
      <div class="task-body">
        <span class="task-title">${escapeHtml(task.title)}</span>
        ${task.description ? `<span class="task-desc">${escapeHtml(task.description)}</span>` : ''}
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit" data-id="${task.id}" aria-label="Edit task" ${isPending ? 'disabled' : ''}>${editIcon()}</button>
        <button class="icon-btn icon-btn-danger" data-action="delete" data-id="${task.id}" aria-label="Delete task" ${isPending ? 'disabled' : ''}>${trashIcon()}</button>
      </div>
    </li>
  `;
}

function editItem(task, isPending) {
  return `
    <li class="task-item editing">
      <div class="edit-form">
        <input type="text" class="edit-title-input" value="${escapeHtml(task.title)}" data-id="${task.id}" maxlength="120" />
        <input type="text" class="edit-desc-input" value="${escapeHtml(task.description || '')}" data-id="${task.id}" placeholder="Note (optional)" />
        <div class="edit-actions">
          <button class="btn btn-primary btn-sm" data-action="save" data-id="${task.id}" ${isPending ? 'disabled' : ''}>
            ${isPending ? '<span class="spinner spinner-sm"></span>' : 'Save'}
          </button>
          <button class="btn btn-ghost btn-sm" data-action="cancel" data-id="${task.id}">Cancel</button>
        </div>
      </div>
    </li>
  `;
}

function LoadingSkeleton() {
  return `
    <div class="loading-panel" role="status" aria-live="polite">
      ${Array.from({ length: 4 }).map(() => `
        <div class="skeleton-item">
          <div class="skeleton-check"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line" style="width: 55%"></div>
            <div class="skeleton-line" style="width: 35%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function ErrorPanel(message) {
  return `
    <div class="state-panel error-panel" role="alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h3>Couldn't load your tasks</h3>
      <p>${message}</p>
      <button class="btn btn-primary" id="retry-btn">Try again</button>
    </div>
  `;
}

function EmptyPanel() {
  return `
    <div class="state-panel empty-panel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <h3>No tasks yet</h3>
      <p>Add your first task above to get started.</p>
    </div>
  `;
}

function checkIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}
function editIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
}
function trashIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function mountTaskList(rerender) {
  const root = document.getElementById('task-list-root');

  root.addEventListener('click', async (e) => {
    if (e.target.id === 'retry-btn') {
      await loadTasks();
      rerender();
      return;
    }

    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === 'toggle') {
      await toggleComplete(id);
      rerender();
    } else if (action === 'edit') {
      editingId = id;
      rerender();
      document.querySelector('.edit-title-input')?.focus();
    } else if (action === 'cancel') {
      editingId = null;
      rerender();
    } else if (action === 'save') {
      const titleInput = document.querySelector(`.edit-title-input[data-id="${id}"]`);
      const descInput = document.querySelector(`.edit-desc-input[data-id="${id}"]`);
      const title = titleInput.value.trim();
      if (!title) { titleInput.focus(); return; }
      const ok = await editTask(id, { title, description: descInput.value.trim() });
      if (ok) editingId = null;
      rerender();
    } else if (action === 'delete') {
      await deleteTask(id);
      rerender();
    }
  });
}

export function resetEditingState() {
  editingId = null;
}
