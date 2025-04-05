const backendService = "http://localhost:8000";

async function postLogin(event) {
    event.preventDefault();
    var form = new FormData(document.getElementById("login"));
    var formData = {};
    for (entry of form) {
        formData[entry[0]] = entry[1];
    }
    var formDataJson = JSON.stringify(formData);
    try {
        var response = await fetch(backendService + "/login", { method: "POST", body: formDataJson, headers: { "Content-Type": "application/json" } });
    }
    catch {
        alert("Ошибка соединения с сервером. Попробуйте позже.");
        return;
    }
    if (response.ok == false) {
        if (response.status == 401) {
            alert("Неверный логин или пароль!");
        }
        else if (response.status == 400) {
            alert("Ошибка валидации. Пожалуйста, введите корректные данные.");
        }
        else {
            alert("Ошибка сервера!");
        }
        return;
    }
    if (response.headers.has("Authorization")) {
        var header = response.headers.get("Authorization");
        if (header.startsWith("Bearer")) {
            var jwt = header.split(" ")[1];
            localStorage.setItem("auth_token", jwt);
            window.location.href = "/";
        }
        else {
            alert("Ошибка получения данных из ответа сервера. Пожалуйста, попробуйте снова.");
        }
    }
    else {
        alert("Ошибка получения данных из ответа сервера. Пожалуйста, попробуйте снова.");
    }
}
document.getElementById("login").addEventListener("submit", postLogin);


async function postRegister(event) {
    event.preventDefault();
    var form = new FormData(document.getElementById("register"));
    var formData = {};
    for (entry of form) {
        formData[entry[0]] = entry[1];
    }
    var formDataJson = JSON.stringify(formData);
    try {
        var response = await fetch(backendService + "/register", { method: "POST", body: formDataJson, headers: { "Content-Type": "application/json" } });
    }
    catch {
        alert("Ошибка соединения с сервером. Попробуйте позже.");
        return;
    }
    if (response.ok == false) {
        if (response.status == 409) {
            alert("Логин И/Или Электронная почта уже заняты.");
        }
        else if (response.status == 400) {
            alert("Ошибка валидации. Пожалуйста, введите корректные данные.");
        }
        else {
            alert("Ошибка сервера!");
        }
        return;
    }
    if (response.headers.has("Authorization")) {
        var header = response.headers.get("Authorization");
        if (header.startsWith("Bearer ")) {
            var jwt = header.split(" ")[1];
            localStorage.setItem("auth_token", jwt);
            window.location.href = "/";

        }
        else {
            alert("Ошибка получения данных из ответа сервера. Пожалуйста, попробуйте снова.");
        }
    }
    else {
        alert("Ошибка получения данных из ответа сервера. Пожалуйста, попробуйте снова.");
    }
}
document.getElementById("register").addEventListener("submit", postRegister);