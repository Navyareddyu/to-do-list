const STORAGE_KEY = 'todo-list-tasks';

const addForm = document.getElementById('addForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const filters = document.getElementById('filters');
const countEl = document.getElementById('count');
const clearCompletedBtn = document.getElementById('clearCompleted');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = currentFilter === 'all'
      ? 'No tasks yet. Add one above.'
      : currentFilter === 'active'
        ? 'No active tasks.'
        : 'No completed tasks.';
    taskList.appendChild(empty);
    return;
  }

  filtered.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const label = document.createElement('span');
    label.className = 'task-label';
    label.textContent = task.text;
    label.addEventListener('click', () => toggleTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    li.append(checkbox, label, deleteBtn);
    taskList.appendChild(li);
  });

  updateCount();
}

function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter((t) => !t.done);
  if (currentFilter === 'completed') return tasks.filter((t) => t.done);
  return tasks;
}

function updateCount() {
  const left = tasks.filter((t) => !t.done).length;
  countEl.textContent = left === 1 ? '1 item left' : `${left} items left`;
  clearCompletedBtn.style.visibility = tasks.some((t) => t.done) ? 'visible' : 'hidden';
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  tasks.push({
    id: Date.now().toString(),
    text: trimmed,
    done: false,
  });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filters.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderTasks();
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  renderTasks();
});

renderTasks();
updateCount();
