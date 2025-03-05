async function postLogin(event) {
    event.preventDefault();
    var data = new FormData(document.getElementById("login"));
    var response = await fetch("/login", { method: "POST", body: data });
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
    var data = new FormData(document.getElementById("register"));
    var response = await fetch("/register", { method: "POST", body: data });
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