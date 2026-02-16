/* =====================================================
   ================= THEME HANDLING ====================
   مسؤول عن تحميل الثيم من localStorage
   وتبديله بين dark / light
===================================================== */

const colorTheam = document.querySelector("header .bg-color i");
const locStor_Theam_StrongKey = "theam";

/* Load saved theme on startup */
const savedTheme = localStorage.getItem(locStor_Theam_StrongKey);
if (savedTheme) {
    const localTheam = JSON.parse(savedTheme);
    document.body.classList.add(localTheam.theamColor);
    colorTheam.classList.add(localTheam.theamIcon);
}

/* Toggle theme and persist to localStorage */
function changeTheamColor() {
    const isDark = document.body.classList.contains("dark");

    // Toggle body classes
    document.body.classList.toggle("light", isDark);
    document.body.classList.toggle("dark", !isDark);

    // Toggle icon
    colorTheam.classList.toggle("fa-moon", isDark);
    colorTheam.classList.toggle("fa-sun", !isDark);

    // Extract icon class (fa-sun / fa-moon)
    const iconClassName = [...colorTheam.classList]
        .find(cls => cls.startsWith("fa-") && cls !== "fa-solid");

    const theamObj = {
        theamColor: document.body.className,
        theamIcon: iconClassName
    };

    localStorage.setItem(locStor_Theam_StrongKey, JSON.stringify(theamObj));
}

colorTheam.addEventListener("click", changeTheamColor);


/* =====================================================
   ================= DOM REFERENCES ====================
===================================================== */

const label = document.querySelector("form label");
const submitInputBtn = document.querySelector("form input[type='submit']");
const textInput = document.querySelector("form input[type='text']");
const taskFundation = document.querySelector(".tasks-fundation");
const tasksLeftCounter = document.querySelector(".show-left-items span");
const btnsLis = document.querySelectorAll(".btns-status button");
const localStorage_Strong_key = "ToDo_V1";

let errorDiv = document.querySelector(".error");


/* =====================================================
   ================= ERROR HANDLING ====================
===================================================== */

/* Show validation error */
function showErrorMsg() {
    if (errorDiv) return;

    errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = "Input Filed cannot be empty..!!";

    taskFundation.appendChild(errorDiv);

    textInput.classList.add("inputError");
    label.classList.add("labError");
}

/* Hide validation error */
function hideErrorMsg() {
    if (!errorDiv) return;

    errorDiv.remove();
    errorDiv = null;

    textInput.classList.remove("inputError");
    label.classList.remove("labError");
}


/* =====================================================
   ================= TASK BUTTONS ======================
   إنشاء أزرار التعديل والحذف
===================================================== */

function createMainBtns() {
    const wrapper = document.createElement("div");
    wrapper.className = "main-buttons";

    wrapper.innerHTML = `
        <button><i class="fa-solid fa-pen-to-square"></i></button>
        <button><i class="fa-solid fa-trash-can"></i></button>
    `;

    return wrapper;
}

function createEditBtns() {
    const wrapper = document.createElement("div");
    wrapper.className = "edit-buttons";
    wrapper.setAttribute("hidden", "");

    wrapper.innerHTML = `
        <button class="save-btn">save</button>
        <button><i class="fa-solid fa-xmark"></i></button>
    `;

    return wrapper;
}


/* =====================================================
   ================= CREATE TASK ELEMENT ===============
   يحول كائن todo إلى عنصر DOM كامل
===================================================== */

function createTask(todo) {
    const task = document.createElement("div");
    task.className = "task";
    task.dataset.id = todo.id;
    task.dataset.status = todo.status;

    const checkSpan = document.createElement("span");
    task.appendChild(checkSpan);

    const taskTitle = document.createElement("div");
    taskTitle.className = "task-text";
    taskTitle.textContent = todo.title;
    task.appendChild(taskTitle);

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = todo.title;
    editInput.className = "edit-input";
    editInput.setAttribute("hidden", "");
    task.appendChild(editInput);

    task.append(createMainBtns(), createEditBtns());

    /* Apply completed state */
    if (todo.status === "done") {
        checkSpan.classList.add("done");
        checkSpan.innerHTML = `<i class="fa-solid fa-check"></i>`;
        taskTitle.classList.add("done");
    }

    return task;
}


/* =====================================================
   ================= STORAGE HELPERS ===================
===================================================== */

const loadTodos = () => {
    try {
        return JSON.parse(localStorage.getItem(localStorage_Strong_key)) || [];
    } catch {
        return [];
    }
};

const saveTodo = (todos) =>
    localStorage.setItem(localStorage_Strong_key, JSON.stringify(todos));


/* =====================================================
   ================= RENDER FUNCTION ===================
   يعيد بناء قائمة المهام بالكامل
===================================================== */

function render() {
    taskFundation.innerHTML = "";
    const todos = loadTodos();

    if (!todos.length) {
        taskFundation.textContent = "No Tasks yet...";
        tasksLeftCounter.textContent = 0;
        return;
    }

    // Render tasks
    todos.forEach(todo => taskFundation.appendChild(createTask(todo)));

    // Count remaining (اختصرناها بسطر واحد)
    tasksLeftCounter.textContent =
        todos.filter(t => t.status === "todo").length;
}


/* =====================================================
   ================= ADD NEW TASK ======================
===================================================== */

submitInputBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const value = textInput.value.trim();
    if (!value) return showErrorMsg();

    hideErrorMsg();

    const todos = loadTodos();
    todos.push({ id: Date.now(), title: value, status: "todo" });

    saveTodo(todos);
    render();
    textInput.value = "";
});


/* =====================================================
   ================= EDIT TASK =========================
===================================================== */

function saveEdit(todos, id, task) {
    const editInput = task.querySelector(".edit-input");
    const newTitle = editInput.value.trim();

    if (!newTitle) {
        showErrorMsg();
        editInput.focus();
        return;
    }

    todos = todos.map(t =>
        t.id === id ? { ...t, title: newTitle } : t
    );

    saveTodo(todos);
    render();
}


/* =====================================================
   ================= TASK ACTIONS ======================
   Event Delegation لمعالجة كل الأزرار
===================================================== */

taskFundation.addEventListener("click", (e) => {
    const task = e.target.closest(".task");
    if (!task) return;

    const id = Number(task.dataset.id);
    let todos = loadTodos();

    /* Delete */
    if (e.target.classList.contains("fa-trash-can")) {
        saveTodo(todos.filter(t => t.id !== id));
        return render();
    }

    /* Toggle complete */
    if (e.target.classList.contains("task-text")) {
        todos = todos.map(t =>
            t.id === id
                ? { ...t, status: t.status === "done" ? "todo" : "done" }
                : t
        );

        saveTodo(todos);
        return render();
    }

    /* Enter edit mode */
    if (e.target.classList.contains("fa-pen-to-square")) {
        task.querySelector(".main-buttons").hidden = true;
        task.querySelector(".edit-buttons").hidden = false;
        task.querySelector(".task-text").hidden = true;
        task.querySelector(".edit-input").hidden = false;
    }

    /* Cancel edit */
    if (e.target.classList.contains("fa-xmark")) {
        task.querySelector(".main-buttons").hidden = false;
        task.querySelector(".edit-buttons").hidden = true;
        task.querySelector(".task-text").hidden = false;
        task.querySelector(".edit-input").hidden = true;
    }

    /* Save edit */
    if (e.target.classList.contains("save-btn")) {
        saveEdit(todos, id, task);
    }
});


/* =====================================================
   ================= FILTER BUTTONS ====================
===================================================== */

btnsLis.forEach(btn => {
    btn.addEventListener("click", () => {

        btnsLis.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tasks = document.querySelectorAll(".tasks-fundation .task");

        tasks.forEach(task => {
            const status = task.dataset.status;

            task.hidden =
                btn.classList.contains("active-btn") && status === "done" ||
                    btn.classList.contains("completed-btn") && status === "todo"
                    ? true
                    : false;
        });
    });
});


/* =====================================================
   ================= CLEAR COMPLETED ===================
===================================================== */

document.querySelector(".clear-btn").addEventListener("click", () => {
    saveTodo(loadTodos().filter(t => t.status !== "done"));
    render();
});


/* Initial render */
document.addEventListener("DOMContentLoaded", render);

/* Remove error on focus */
textInput.addEventListener("focus", hideErrorMsg);
