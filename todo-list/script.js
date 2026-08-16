const STORAGE_KEY = "taskflow_tasks_v1";
const THEME_KEY = "taskflow_theme_v1";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentFilter = "all";

const $ = (id) => document.getElementById(id);
const taskForm = $("taskForm");
const taskInput = $("taskInput");
const priority = $("priority");
const taskList = $("taskList");
const emptyState = $("emptyState");
const searchInput = $("searchInput");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function priorityLabel(value) {
  return { high: "مهم", normal: "عادی", low: "کم" }[value] || "عادی";
}

function render() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = tasks.filter(task => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);
    const matchesSearch = task.title.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  taskList.innerHTML = filtered.map(task => `
    <article class="task ${task.completed ? "completed" : ""}" data-id="${task.id}">
      <button class="check" aria-label="تغییر وضعیت">${task.completed ? "✓" : ""}</button>
      <div class="task-content">
        <span class="task-title">${escapeHTML(task.title)}</span>
        <span class="priority ${task.priority}">${priorityLabel(task.priority)}</span>
      </div>
      <div class="task-actions">
        <button class="action edit" aria-label="ویرایش">✎</button>
        <button class="action delete" aria-label="حذف">×</button>
      </div>
    </article>
  `).join("");

  emptyState.style.display = filtered.length ? "none" : "block";

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  $("totalCount").textContent = total;
  $("activeCount").textContent = active;
  $("completedCount").textContent = completed;
  $("remainingText").textContent = `${active} کار باقی مانده`;
  $("progressPercent").textContent = `${percent}%`;
  $("progressRing").style.background =
    `conic-gradient(var(--accent) ${percent * 3.6}deg, var(--border) 0deg)`;
  $("progressText").textContent =
    percent === 100 && total ? "عالی بود! 🎉" : percent ? `${percent}% کامل شده` : "شروع کن!";
}

taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now().toString(),
    title,
    priority: priority.value,
    completed: false,
    createdAt: Date.now()
  });

  save();
  taskInput.value = "";
  priority.value = "normal";
  render();
  taskInput.focus();
});

taskList.addEventListener("click", e => {
  const item = e.target.closest(".task");
  if (!item) return;
  const task = tasks.find(t => t.id === item.dataset.id);
  if (!task) return;

  if (e.target.closest(".check")) {
    task.completed = !task.completed;
  }

  if (e.target.closest(".delete")) {
    tasks = tasks.filter(t => t.id !== task.id);
  }

  if (e.target.closest(".edit")) {
    const updated = prompt("عنوان جدید کار:", task.title);
    if (updated !== null && updated.trim()) task.title = updated.trim();
  }

  save();
  render();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", render);

$("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  save();
  render();
});

function loadTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "light") {
    document.body.classList.add("light");
    $("themeToggle").textContent = "☀";
  }
}
$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  localStorage.setItem(THEME_KEY, light ? "light" : "dark");
  $("themeToggle").textContent = light ? "☀" : "☾";
});

loadTheme();
render();
