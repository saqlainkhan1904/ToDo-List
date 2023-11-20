const taskInput = document.querySelector('#task-input');
const addTaskBtn = document.querySelector('#addTaskBtn');
const taskContainer = document.querySelector('.task-container');
const tasks = document.getElementsByClassName('task');
const removeAllBtn = document.querySelector('#removeAllBtn');

// Button class
class Button {
    #isDone = false;
    #id;
    #icon;
    #doneIcon;

    constructor(id, icon, doneIcon, isDone) {
        this.#id = id;
        this.#icon = icon;
        this.#doneIcon = doneIcon;
        this.#isDone = isDone
    }

    get id() {
        return this.#id;
    }

    get icon() {
        return this.#isDone ? this.#doneIcon : this.#icon;
    }
}

function addTask(content, isDone = false, isRestored = false) {
    if (content === "") return; // exit if user input is blank
    
    const li = document.createElement('li');
    isDone ? li.classList.add('task', 'done') : li.classList.add('task');

    const p = document.createElement('p');
    p.textContent = content;
    taskInput.value = ''; // clear the input

    const markDoneBtnObj = new Button('markDoneBtn', `<i class="fa-regular fa-circle"></i>`, `<i class="fa-solid fa-circle-check"></i>`, isDone);
    const editBtnObj = new Button('editBtn', `<i class="fa-solid fa-pen-to-square"></i>`);
    const removeBtnObj = new Button('removeBtn', `<i class="fa-solid fa-trash-can"></i>`);

    let markDoneBtn, editBtn, removeBtn;
    
    // create button elements and assign id for each
    [markDoneBtn, editBtn, removeBtn] = [markDoneBtnObj, editBtnObj, removeBtnObj]
        .map(obj => {
            const button = document.createElement('button');
            button.setAttribute('id', obj.id);
            button.innerHTML = obj.icon;
            return button;
        });
        
    [markDoneBtn, p, editBtn, removeBtn].forEach(elem => li.appendChild(elem));

    if (isRestored) {
        li.style.animation = "slideUp 1s"; // add restore animation
        taskContainer.appendChild(li);
    } else {
        taskContainer.prepend(li);
        saveTasks();
    }
}

function displayEditPage(content, task) {
    const container = document.createElement('div');
    container.classList.add('edit-container');

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('id', 'task-edit');
    input.setAttribute('placeholder', 'Edit your task');
    input.value = content;
    input.addEventListener('keydown', (e) => {
        if (e.key === "Enter") editTask(input.value, task);
    })

    const editBtnObj = new Button('doneBtn', `<i class="fa-solid fa-check"></i>`);
    const editBtn = document.createElement('button');
    editBtn.setAttribute('id', editBtnObj.id);
    editBtn.innerHTML = editBtnObj.icon;
    editBtn.addEventListener('click', () => editTask(input.value, task));

    [input, editBtn].forEach(elem => container.appendChild(elem));

    document.body.append(container);
}

function editTask(newContent, task) {
    if (newContent === "") return;

    const taskContent = task.firstChild.nextElementSibling;
    const editContainer = document.querySelector('.edit-container');

    taskContent.textContent = newContent;
    editContainer.classList.add('hide');
    saveTasks();
    setTimeout(() => editContainer.remove(), 300);
}

function manageTask(e) {
    const target = e.target;
    const parent = target.parentElement;

    // Removing the task
    if (target.matches('button#removeBtn')) {
        parent.classList.add('removed');
        setTimeout(() => {
            parent.remove();
        }, 1100);

    // Marking the task as done
    } else if (target.matches('button#markDoneBtn')) {
        if (parent.classList.contains('done')) {
            target.innerHTML = `<i class="fa-regular fa-circle"></i>`;
            parent.classList.remove('done');
        } else {
            target.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
            parent.classList.add('done');
        }
    } else if (target.matches('button#editBtn')) {
        displayEditPage(target.previousElementSibling.textContent, parent)
    } else return; // don't save if the target 
                   // matches none of the above conditions

    saveTasks();
}

function saveTasks() {
    const formattedTasks = [...tasks].reduce((result, task) => {
        if (!task.classList.contains('removed')) {
            result.push({ 
                content: task.firstElementChild.nextElementSibling.textContent, 
                isDone: task.classList.contains('done')
            });
        }
        return result;
    }, []);

    localStorage.setItem('data', JSON.stringify(formattedTasks));

    // add remove all button accordingly
    removeAllBtn.classList.toggle('show', formattedTasks.length > 1);
}

(function restoreTasks() {
    const data = localStorage.getItem('data');

    if (!data) return; // exit if no tasks were found

    const tasks = JSON.parse(data);

    // add tasks with nice animation + delay
    tasks.forEach((task, index) => {
        setTimeout(() => {
            addTask(task.content, task.isDone, true);
        }, 100 * index)
    });

    // add remove all button accordingly
    setTimeout(() => {
        removeAllBtn.classList.toggle('show', tasks.length > 1);
    }, tasks.length * 100);
})();

function removeAllTasks() {
    taskContainer.innerHTML = "";
    localStorage.removeItem('data');  // empty task data
    removeAllBtn.classList.remove('show');  // hide the button itself
}

addTaskBtn.addEventListener('click', () => addTask(taskInput.value));
taskInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) addTask(taskInput.value);
});
// manage means marking as done + removing
taskContainer.addEventListener('click', manageTask);
removeAllBtn.addEventListener('click', removeAllTasks);
