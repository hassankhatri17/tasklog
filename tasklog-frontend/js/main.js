// main.js
import { Header } from './components/header.js';
import { TaskForm, mountTaskForm } from './components/taskform.js';
import { TaskList, mountTaskList } from './components/tasklist.js';
import { Footer } from './components/footer.js';
import { subscribe, loadTasks } from './store.js';

function renderList() {
  document.getElementById('task-list-root').innerHTML = TaskList();
}

function init() {
  const app = document.getElementById('app');
  app.innerHTML = [
    Header(),
    '<div id="task-form-root"></div>',
    '<main class="container"><div id="task-list-root"></div></main>',
    Footer(),
  ].join('');

  // The form is rendered once and manages its own submit UI directly
  // (see taskform.js) — it does not get wiped by unrelated list re-renders.
  document.getElementById('task-form-root').innerHTML = TaskForm();
  mountTaskForm();

  // The list re-renders every time shared task state changes (load,
  // toggle, edit, delete). mountTaskList attaches one delegated listener
  // to the stable #task-list-root wrapper, so it survives every
  // innerHTML swap of its children.
  mountTaskList(renderList);
  subscribe(renderList);

  loadTasks();
}

document.addEventListener('DOMContentLoaded', init);
