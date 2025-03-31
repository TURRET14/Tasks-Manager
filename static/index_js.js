var backendService = "http://localhost:8000";

var statusSortAsc = true;
var dateSortAsc = true;
var tasks = new Array();
var allTasks = new Array();

document.getElementById("dialog_add_task").addEventListener("close", (event) => document.getElementById("add_task_form").reset());
document.getElementById("dialog_change_task").addEventListener("close", (event) => document.getElementById("change_task_form").reset());


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
        var creationDate = new Date(document.getElementById("filter_date").value);
        var str = document.getElementById("filter_date").value;
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
    }
}

document.getElementById("exit_button").addEventListener("click", signOut);


async function sortByStatus(event) {
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

async function putTasks() {
    document.getElementById("tasks_table").innerHTML = "";

    for (task of tasks) {
        var row = document.createElement("tr");
        document.getElementById("tasks_table").appendChild(row);
        row.addEventListener("click", function (event) {
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
        });

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
    statusSortAsc = true;
    dateSortAsc = true;
    var auth_token = localStorage.getItem("auth_token");
    if (auth_token != null) {
        var tasksRequest = await fetch(backendService + "/tasks", { method: "GET", headers: { "Authorization": "Bearer " + auth_token } });
        if (tasksRequest.ok == true) {
            var jsonResponse = await tasksRequest.json();
            allTasks = jsonResponse;
            tasks = [...allTasks];
            sortByStatus();
        }
        else {
            if (tasksRequest.status == 401) {
                alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
                window.location.href = "/login";
            }
            else {
                alert("Внутренняя ошибка сервера. Перезагрузите страницу.");
            }
        }
    }
    else {
        alert("Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
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
    var formDataJson = JSON.stringify(formData);
    var auth_token = localStorage.getItem("auth_token");
    if (auth_token == null) {
        alert("Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
        return;
    }
    var postResponse = await fetch(backendService + "/tasks", { method: "POST", body: formDataJson, headers: { "Authorization": "Bearer " + auth_token, "Content-Type": "application/json" } });
    if (postResponse.ok == false) {
        if (postResponse.status == 401) {
            alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
            window.location.href = "/login";
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
    var auth_token = localStorage.getItem("auth_token");
    if (auth_token == null) {
        alert("Пожалуйста, авторизуйтесь.");
        window.location.href = "/login";
        return;
    }
    var taskDataJson = JSON.stringify(taskData);
    var response = await fetch(backendService + "/tasks", { method: "PUT", body: taskDataJson, headers: { "Authorization": "Bearer " + auth_token, "Content-Type": "application/json" } });
    if (response.ok == false) {
        if (response.status == 401) {
            alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
            window.location.href = "/login";
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
        event.preventDefault();
        document.getElementById("dialog_change_task").close();
        var auth_token = localStorage.getItem("auth_token");
        if (auth_token == null) {
            alert("Пожалуйста, авторизуйтесь.");
            window.location.href = "/login";
            return;
        }
        var taskDataJson = JSON.stringify({"task_id": document.getElementById("change_id").textContent});
        var response = await fetch(backendService + "/tasks", { method: "DELETE", body: taskDataJson, headers: { "Authorization": "Bearer " + auth_token, "Content-Type": "application/json" } });
        if (response.ok == false) {
            if (response.status == 401) {
                alert("Сессия авторизации истекла. Пожалуйста, авторизуйтесь.");
                window.location.href = "/login";
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