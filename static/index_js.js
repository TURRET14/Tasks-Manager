const backendService = "http://localhost:8000";
var userLogin;

var calendar = flatpickr("#filter_date", {"dateFormat": "d.m.Y", "locale": "ru",  "allowInput": true, "disableMobile": true});

async function getUserLogin() {
    var auth_token = localStorage.getItem("auth_token");
    try {
        var response = await fetch(backendService + "/get_current_user_login", { method: "GET", headers: { "Authorization": "Bearer " + auth_token } });
    }
    catch {
        alert("Ошибка соединения с сервером. Попробуйте позже.");
    }
    if (response.ok) {
        var responseJson = await response.json();
        userLogin = String(responseJson);
        document.getElementById("display_login").textContent = userLogin;
    }
    else {
        alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
        throw Error("REDIRECT_IN_PROGRESS");
    }
}

var idSortAsc = true;
var creatorSortAsc = true;
var statusSortAsc = true;
var dateSortAsc = true;
var tasks = new Array();
var allTasks = new Array();

document.getElementById("dialog_add_task").addEventListener("close", (event) => {document.getElementById("add_task_form").reset(); document.getElementById("assigned_list").innerHTML = "";});
document.getElementById("dialog_change_task").addEventListener("close", (event) => {document.getElementById("change_task_form").reset(); document.getElementById("change_assigned_list").innerHTML = "";});


document.getElementById("close_button_add").addEventListener("click", (event) => document.getElementById("dialog_add_task").close());
document.getElementById("close_button_change").addEventListener("click", (event) => document.getElementById("dialog_change_task").close());


async function dateChecked(event) {
    if (event.currentTarget.checked == true) {
        document.getElementById("filter_date").removeAttribute("disabled");
    }
    else {
        document.getElementById("filter_date").setAttribute("disabled", "");
    }
}

document.getElementById("is_date_enabled").addEventListener("click", dateChecked);

async function filter(event) {
    tasks = [...allTasks];
    var statusId = document.getElementById("filter_status").value;
    if (document.getElementById("is_date_enabled").checked == true) {
        var creationDateArray = document.getElementById("filter_date").value.split(".");
        var creationDate = new Date(creationDateArray[2], creationDateArray[1] - 1, creationDateArray[0]);
        if (isNaN(creationDate.getTime()) == false) {
            tasks = tasks.filter(function (task) {
                var taskDate = new Date(task.creation_date);
                if (creationDate.getDate() == taskDate.getDate() && creationDate.getMonth() == taskDate.getMonth() && creationDate.getFullYear() == taskDate.getFullYear()) {
                    return true;
                }
            });
        }
        else {
            alert("Пожалуйста, введите корректную дату.");
            return;
        }
    }
    if (statusId != 3) {
        tasks = tasks.filter((task) => task.status_id == statusId);
    }
    if (document.getElementById("only_my_tasks_filter").checked == true) {
        tasks = tasks.filter(function (task) {
            if (task.creator_user_login == userLogin) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    idSortAsc = true;
    statusSortAsc = true;
    dateSortAsc = true;
    sortByStatus()
}

document.getElementById("filter_button").addEventListener("click", filter);

async function signOut(event) {
    var exitConfirmation = confirm("Вы точно хотите выйти?");
    if (exitConfirmation == true) {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        throw Error("REDIRECT_IN_PROGRESS");
    }
}

document.getElementById("exit_button").addEventListener("click", signOut);


async function sortByStatus(event) {
    idSortAsc = true;
    creatorSortAsc = true;
    dateSortAsc = true;
    tasks.sort(function (task1, task2) {
        if (statusSortAsc == true) {
            return task1.status_id - task2.status_id;
        }
        else {
            return task2.status_id - task1.status_id;
        }
    });
    if (statusSortAsc == true) {
        statusSortAsc = false;
    }
    else {
        statusSortAsc = true;
    }
    putTasks();
}

document.getElementById("status_header").addEventListener("click", sortByStatus);

async function sortByDate(event) {
    idSortAsc = true;
    creatorSortAsc = true;
    statusSortAsc = true;
    tasks.sort(function (task1, task2) {
        if (dateSortAsc == true) {
            return new Date(task1.creation_date) - new Date(task2.creation_date);
        }
        else {
            return new Date(task2.creation_date) - new Date(task1.creation_date);
        }
    });
    if (dateSortAsc == true) {
        dateSortAsc = false;
    }
    else {
        dateSortAsc = true;
    }
    putTasks();
}

document.getElementById("date_header").addEventListener("click", sortByDate);

async function sortByID(event) {
    creatorSortAsc = true;
    statusSortAsc = true;
    dateSortAsc = true;
    tasks.sort(function (task1, task2) {
        if (idSortAsc == true) {
            return task1.id - task2.id;
        }
        else {
            return task2.id - task1.id;
        }
    });
    if (idSortAsc == true) {
        idSortAsc = false;
    }
    else {
        idSortAsc = true;
    }
    putTasks();
}

document.getElementById("id_header").addEventListener("click", sortByID);


async function sortByCreator(event) {
    idSortAsc = true;
    statusSortAsc = true;
    dateSortAsc = true;
    tasks.sort(function (task1, task2) {
         return task1.creator_user_login.localeCompare(task2.creator_user_login)
    });
    if (creatorSortAsc == false) {
        tasks.reverse();
    }
    if (creatorSortAsc == true) {
        creatorSortAsc = false;
    }
    else {
        creatorSortAsc = true;
    }
    putTasks();
}


document.getElementById("creator_header").addEventListener("click", sortByCreator);


async function putTasks() {
    document.getElementById("tasks_table").innerHTML = "";
    for (task of tasks) {
        var row = document.createElement("tr");
        document.getElementById("tasks_table").appendChild(row);
        if (task.creator_user_login == userLogin) {
            row.addEventListener("click", async function (event) {
                document.getElementById("dialog_change_task").showModal();
                document.getElementById("change_id").textContent = event.currentTarget.getElementsByClassName("task_id")[0].textContent;
                document.getElementById("change_header").value = event.currentTarget.getElementsByClassName("task_header")[0].textContent;
                document.getElementById("change_text").value = event.currentTarget.getElementsByClassName("task_text")[0].textContent;
                var status_id = event.currentTarget.getElementsByClassName("task_status_id")[0].textContent;
                switch (status_id) {
                    case "Новая":
                        status_id = 0;
                        break;
                    case "В работе":
                        status_id = 1;
                        break;
                    case "Завершена":
                        status_id = 2;
                        break;
                    default:
                        status_id = 0;
                        break;
                }
                document.getElementById("change_status_id").value = status_id;
                document.getElementById("change_creation_date").textContent = event.currentTarget.getElementsByClassName("task_creation_date")[0].textContent;
                var assignees = event.currentTarget.getElementsByClassName("assignee_login");
                for (assignee of assignees) {
                    var liElement = await addAssignee();
                    liElement.getElementsByClassName("add_assignee")[0].value = assignee.textContent;
                    document.getElementById("change_assigned_list").appendChild(liElement);
                }
            });
        }
        var idCell = document.createElement("td");
        idCell.className = "task_id";
        idCell.textContent = task.id;
        row.appendChild(idCell);
        var headerCell = document.createElement("td");
        headerCell.className = "task_header";
        headerCell.textContent = task.header;
        row.appendChild(headerCell);
        var textCell = document.createElement("td");
        textCell.className = "task_text";
        textCell.textContent = task.text;
        row.appendChild(textCell);
        var creatorCell = document.createElement("td");
        if (task.creator_user_login == userLogin) {
            creatorCell.textContent = task.creator_user_login +  " (Вы)";
        }
        else {
            creatorCell.textContent = task.creator_user_login;
        }
        row.appendChild(creatorCell);
        var assigneeCell = document.createElement("td");
        for (assignee_login of task.assigned_users_logins) {
            var assigneeParagraph = document.createElement("p");
            var assigneeName = document.createElement("span");
            assigneeName.textContent = assignee_login;
            assigneeName.className = "assignee_login";
            assigneeParagraph.appendChild(assigneeName);
            if (assignee_login == userLogin) {
                var assigneePostfix = document.createElement("span");
                assigneePostfix.textContent = " (Вы)";
                assigneeParagraph.appendChild(assigneePostfix);
            }
            assigneeCell.appendChild(assigneeParagraph);
        }
        row.appendChild(assigneeCell);
        var statusCell = document.createElement("td");
        statusCell.className = "task_status_id";
        switch (task.status_id) {
            case 0:
                statusCell.textContent = "Новая";
                break;
            case 1:
                statusCell.textContent = "В работе";
                break;
            case 2:
                statusCell.textContent = "Завершена";
                break;
            default:
                statusCell.textContent = "Нет";
                break;
        }
        row.appendChild(statusCell);
        var creationDateCell = document.createElement("td");
        creationDateCell.className = "task_creation_date";
        creationDateCell.textContent = new Date(task.creation_date).toLocaleString();
        row.appendChild(creationDateCell);
    }
}

async function getData() {
    await getUserLogin();
    statusSortAsc = true;
    dateSortAsc = true;
    var auth_token = localStorage.getItem("auth_token");
    if (auth_token != null) {
        try {
            var tasksRequest = await fetch(backendService + "/tasks", { method: "GET", headers: { "Authorization": "Bearer " + auth_token } });
        }
        catch {
            alert("Ошибка соединения с сервером. Попробуйте позже.");
        }
        if (tasksRequest.ok == true) {
            var jsonResponse = await tasksRequest.json();
            allTasks = jsonResponse;
            tasks = [...allTasks];
            idSortAsc = true;
            sortByID();
        }
        else {
            if (tasksRequest.status == 401) {
                alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
                window.location.href = "/login";
                throw Error("REDIRECT_IN_PROGRESS");
            }
            else {
                alert("Внутренняя ошибка сервера. Перезагрузите страницу.");
            }
        }
    }
    else {
        alert("Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
        throw Error("REDIRECT_IN_PROGRESS");
    }
}

getData();

document.getElementById("add_task").addEventListener("click", (event) => document.getElementById("dialog_add_task").showModal());


document.getElementById("add_task_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    document.getElementById("dialog_add_task").close();
    var form = new FormData(document.getElementById("add_task_form"));
    var formData = {};
    for (entry of form) {
        formData[entry[0]] = entry[1];
    }
    var assignees = document.getElementById("add_task_form").getElementsByClassName("add_assignee");
    formData.task_assigned_users_logins = new Set();
    for (assignee of assignees) {
        formData.task_assigned_users_logins.add(assignee.value);
    }
    formData.task_assigned_users_logins = [...formData.task_assigned_users_logins];
    var formDataJson = JSON.stringify(formData);
    var auth_token = localStorage.getItem("auth_token");
    if (auth_token == null) {
        alert("Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
        throw Error("REDIRECT_IN_PROGRESS");
    }
    try {
        var postResponse = await fetch(backendService + "/tasks", { method: "POST", body: formDataJson, headers: { "Authorization": "Bearer " + auth_token, "Content-Type": "application/json" } });
    }
    catch {
        alert("Ошибка соединения с сервером. Попробуйте позже.");
    }
    if (postResponse.ok == false) {
        if (postResponse.status == 401) {
            alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
            window.location.href = "/login";
            throw Error("REDIRECT_IN_PROGRESS");
        }
        else if (postResponse.status == 400) {
            alert("Ошибка записи данных.");
        }
        else {
            alert("Внутренняя ошибка сервера. Перезагрузите страницу.");
        }
    }
    else {
        getData();
    }
});

document.getElementById("change_task_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    document.getElementById("dialog_change_task").close();
    var taskData = {};
    taskData.task_id = document.getElementById("change_id").textContent;
    taskData.task_header = document.getElementById("change_header").value;
    taskData.task_text = document.getElementById("change_text").value;
    taskData.task_status_id = document.getElementById("change_status_id").value;

    taskData.task_assigned_users_logins = new Set();
    var assignees = document.getElementById("change_task_form").getElementsByClassName("add_assignee");
    for (assignee of assignees) {
        taskData.task_assigned_users_logins.add(assignee.value);
    }
    taskData.task_assigned_users_logins = [...taskData.task_assigned_users_logins];
    var auth_token = localStorage.getItem("auth_token");
    if (auth_token == null) {
        alert("Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
        throw Error("REDIRECT_IN_PROGRESS");
    }
    var taskDataJson = JSON.stringify(taskData);
    try {
        var response = await fetch(backendService + "/tasks", { method: "PUT", body: taskDataJson, headers: { "Authorization": "Bearer " + auth_token, "Content-Type": "application/json" } });
    }
    catch {
        alert("Ошибка соединения с сервером. Попробуйте позже.");
    }
    if (response.ok == false) {
        if (response.status == 401) {
            alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
            window.location.href = "/login";
            throw Error("REDIRECT_IN_PROGRESS");
        }
        else if (response.status == 400) {
            alert("Ошибка записи данных.");
        }
        else if (response.status == 403) {
            alert("Доступ к чужим задачам запрещен.");
        }
        else if (response.status == 404) {
            alert("Задача не найдена!");
        }
        else {
            alert("Внутренняя ошибка сервера. Перезагрузите страницу.");
        }
    }
    else {
        getData();
    }
});

document.getElementById("delete_task").addEventListener("click", async function (event) {
    event.preventDefault();
    var confirmation = confirm("Вы уверены, что хотите удалить задачу?");
    if (confirmation) {
        document.getElementById("dialog_change_task").close();
        var auth_token = localStorage.getItem("auth_token");
        if (auth_token == null) {
            alert("Пожалуйста, авторизуйтесь.");
            window.location.href = "/login";
            throw Error("REDIRECT_IN_PROGRESS");
        }
        var taskDataJson = JSON.stringify({ "task_id": document.getElementById("change_id").textContent });
        try {
            var response = await fetch(backendService + "/tasks", { method: "DELETE", body: taskDataJson, headers: { "Authorization": "Bearer " + auth_token, "Content-Type": "application/json" } });
        }
        catch {
            alert("Ошибка соединения с сервером. Попробуйте позже.");
        }
        if (response.ok == false) {
            if (response.status == 401) {
                alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
                window.location.href = "/login";
                throw Error("REDIRECT_IN_PROGRESS");
            }
            else if (response.status == 400) {
                alert("Ошибка удаления данных.");
            }
            else if (response.status == 403) {
                alert("Доступ к чужим задачам запрещен.");
            }
            else if (response.status == 404) {
                alert("Задача не найдена!");
            }
            else {
                alert("Внутренняя ошибка сервера. Перезагрузите страницу.");
            }
        }
        else {
            getData();
        }
    }
});

document.getElementById("add_assigned_list").addEventListener("click",  async (event) => {
    if (document.getElementById("assigned_list").children.length < 10) {
        var liElement = await addAssignee();
        document.getElementById("assigned_list").appendChild(liElement);
    }
});
document.getElementById("add_assigned_list_change").addEventListener("click",  async (event) => {
    if (document.getElementById("assigned_list").children.length < 10) {
        var liElement = await addAssignee();
        document.getElementById("change_assigned_list").appendChild(liElement);
    }
});

async function addAssignee() {
    var liElement =  document.createElement("li");
    var divElement = document.createElement("div");
    divElement.className = "default_flex";
    var inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("flex_grow_element");
    inputElement.classList.add("add_assignee");
    var buttonElement = document.createElement("button");
    buttonElement.type = "button";
    buttonElement.textContent = "Удалить";
    buttonElement.addEventListener("click", async (event) => {
        event.currentTarget.parentElement.parentElement.remove();
    });
    divElement.appendChild(inputElement);
    divElement.appendChild(buttonElement);
    liElement.appendChild(divElement);
    return liElement;
}