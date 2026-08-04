// components/header.js
export function Header(user) {
  return `
    <header class="page-header">
      <div class="container page-header-top">
        <div>
          <span class="eyebrow">Full-stack CRUD · your own backend</span>
          <h1>Tasklog</h1>
          <p>A small task tracker talking to a real Express API — create, complete, edit, and delete, all persisted.</p>
        </div>
        <div class="user-badge">
          <span class="user-name">${user?.name ?? ''}</span>
          <button class="btn btn-ghost btn-sm" id="logout-btn">Log out</button>
        </div>
      </div>
    </header>
  `;
}

export function mountHeader(onLogout) {
  document.getElementById('logout-btn').addEventListener('click', onLogout);
}
