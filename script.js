const STORAGE_KEY = 'studyday.tasks.v1';

const form = document.querySelector('[data-testid="form-add-task"]');
const input = document.querySelector('[data-testid="input-task-name"]');
const taskList = document.querySelector('[data-testid="list-study-tasks"]');
const emptyState = document.querySelector('[data-testid="empty-state"]');
const totalCount = document.querySelector('[data-testid="text-total-count"]');
const completedCount = document.querySelector('[data-testid="text-completed-count"]');
const progress = document.querySelector('[data-testid="progress-tasks"]');
const progressFill = document.querySelector('.progress-fill');
const caption = document.querySelector('[data-testid="text-list-caption"]');
const formMessage = document.querySelector('[data-testid="status-form-message"]');
const storageMessage = document.querySelector('[data-testid="status-storage"]');

let storageAvailable = true;
let tasks = readTasks();

function readTasks() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Saved tasks are not a list.');
    return parsed
      .filter((task) => task && typeof task.id === 'string' && typeof task.name === 'string')
      .map((task) => ({ id: task.id, name: task.name, completed: Boolean(task.completed) }));
  } catch {
    storageAvailable = false;
    return [];
  }
}

function persistTasks() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageAvailable = true;
    storageMessage.textContent = '';
  } catch {
    storageAvailable = false;
    storageMessage.textContent = 'Your changes are here for now, but could not be saved on this device.';
  }
}

function createTaskId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeIcon(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}

function renderTask(task) {
  const item = document.createElement('li');
  item.className = `task-item${task.completed ? ' is-complete' : ''}`;
  item.dataset.testid = `row-study-task-${task.id}`;

  const label = document.createElement('label');
  label.className = 'task-check-label';
  label.setAttribute('aria-label', `${task.completed ? 'Mark as not done' : 'Mark as done'}: ${task.name}`);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `${task.completed ? 'Mark as not done' : 'Mark as done'}: ${task.name}`);
  checkbox.dataset.testid = `checkbox-task-${task.id}`;
  checkbox.addEventListener('change', () => {
    tasks = tasks.map((entry) => entry.id === task.id ? { ...entry, completed: checkbox.checked } : entry);
    persistTasks();
    render();
    taskList.querySelector(`[data-testid="checkbox-task-${CSS.escape(task.id)}"]`)?.focus();
    announce(checkbox.checked ? `Completed: ${task.name}` : `Reopened: ${task.name}`);
  });
  label.append(checkbox);

  const name = document.createElement('span');
  name.className = 'task-name';
  name.textContent = task.name;
  name.dataset.testid = `text-task-name-${task.id}`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'delete-button';
  remove.setAttribute('aria-label', `Delete task: ${task.name}`);
  remove.title = 'Delete task';
  remove.dataset.testid = `button-delete-task-${task.id}`;
  remove.append(makeIcon('<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 7h15M9.5 10.5v7m5-7v7M6.5 7l.8 12h9.4l.8-12M9 7V4.8h6V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'));
  remove.addEventListener('click', () => {
    const itemIndex = tasks.findIndex((entry) => entry.id === task.id);
    tasks = tasks.filter((entry) => entry.id !== task.id);
    persistTasks();
    render();
    const nextTask = tasks[Math.min(itemIndex, tasks.length - 1)];
    if (nextTask) taskList.querySelector(`[data-testid="checkbox-task-${CSS.escape(nextTask.id)}"]`)?.focus();
    else input.focus();
    announce(`Deleted: ${task.name}`);
  });

  item.append(label, name, remove);
  return item;
}

function render() {
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  totalCount.textContent = String(total);
  completedCount.textContent = String(completed);
  progress.setAttribute('aria-valuemax', String(total));
  progress.setAttribute('aria-valuenow', String(completed));
  progressFill.style.width = total ? `${(completed / total) * 100}%` : '0%';
  caption.textContent = total ? `${total} ${total === 1 ? 'task' : 'tasks'} on your list` : 'A fresh page';
  emptyState.hidden = total > 0;
  taskList.replaceChildren(...tasks.map(renderTask));
}

function announce(message) {
  formMessage.textContent = message;
  window.setTimeout(() => {
    if (formMessage.textContent === message) formMessage.textContent = '';
  }, 2400);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = input.value.trim();
  if (!name) {
    formMessage.textContent = 'Add a task name to get started.';
    input.focus();
    return;
  }

  tasks = [{ id: createTaskId(), name, completed: false }, ...tasks];
  persistTasks();
  render();
  input.value = '';
  formMessage.textContent = '';
  input.focus();
  announce('Task added to your study list.');
});

if (!storageAvailable) {
  storageMessage.textContent = 'Saved tasks were unavailable, so your list starts fresh on this device.';
}

render();
