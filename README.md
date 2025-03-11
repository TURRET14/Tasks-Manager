<h1>Простой менеджер задач.</h1>

Backend - FastAPI, Работа с БД, Модели ORM - SQLAlchemy

БД - PostgreSQL

Frontend - HTML, CSS, JS


Функционал:
1. Регистрация пользователей.
2. Авторизация пользователей.
3. Просмотр задач.
4. Создание задач.
5. Изменение задач.
6. Удаление задач.
7. Сортировка задач по дате и по статусу.
8. Фильтрация задач по дате и по статусу.

У каждой задачи может быть название, текст и статус. Уникальный ID и дата создания заполняются автоматически на сервере.

Для сортировки задач по дате или по статусу нужно нажать на соответствующий заголовок таблицы.

В меню фильтрации можно сортировать как по одному параметру, так и по обоим. Для применения фильтрации нужно нажать на кнопку фильтровать.

Получить доступ или изменить чужие задачи невозможно.

Пароли хешируются с помощью алгоритма bcrypt с добавлением случайной соли.

Реализована система JWT токенов.

Для изменения задачи нужно нажать на нее, появится соответствующее модальное окно. Тут же можно и удалить задачу.

Для добавления задачи нужно нажать на соответствующую кнопку сверху страницы, появится соответствующее модальное окно.


<h2>Страница авторизации</h2>


![](https://github.com/TURRET14/Img-Storage/blob/main/Login.png)

<h2>Главная страница</h2>

![](https://github.com/TURRET14/Img-Storage/blob/main/Main.png)

<h2>Диалог добавления задачи</h2>

![](https://github.com/TURRET14/Img-Storage/blob/main/Add.png)

<h2>Диалог изменения задачи</h2>

![](https://github.com/TURRET14/Img-Storage/blob/main/Change.png)


<h1>Краткая документация API.</h1>

В проекте два сервера. Первый - сервер Frontend, обрабатывает запросы на получение веб-страниц логина и заметок. Находится в файле frontend_service.py. Второй - сервер Backend, находится в файле main.py, обрабатывает запросы с веб-страниц на получение, добавление, изменение и добавление заметок, а так же запросы на регистрацию и вход. Предполагается, что сервер Фронтенда будет работать на http://localhost:3000, а сервер Бэкенда - на http://localhost:8000. Исходя из этого был настроен CORS на бэкэнде и адреса запросов к бэкенду с фронтенда. Но поменять это несложно - в переменной backendService в index_js.js и login_js.js нужно поменять адрес на новый адрес бэкенда, а на бэкэнде в main.py в параметре CORS allow_origins указать новый адрес фронтенда.

Пример запуска серверов:

Бэкенд:
uvicorn main:app --host 0.0.0.0 --port 8000

Фронтенд:
uvicorn frontend_service:app --host 0.0.0.0 --port 3000


<h3>Формат Payload JWT токена:</h3>
{
"user_id": <ID пользователя>,
"exp": <Время истечения токена>
}


<h3>Формат .env файла:</h3>

SECRET_KEY=<Секретный ключ, используемый JWT>

ALGORITHM=<Алгоритм, используемый JWT>

ACCESS_TOKEN_EXPIRE_MINUTES=<Время истечения JWT токена>

SQLALCHEMY_DATABASE_URL=<Строка подключения к БД>


<h2>Endpoints:</h2>
<h2>Frontend:</h2>

<h3>1. @app.get("/")</h3>

Возвращает главную страницу.

Параметры: Нет

<h3>2. @app.get("/login")</h3>

Возвращает страницу авторизации.

Параметры: Нет

<h2>Backend:</h2>

<h3>1. @app.post("/login")</h3>

Отвечает за логин пользователей в систему. Если все нормально, возвращает JWT токен в заголовке запроса, статусный код 200. Если пароль или логин неверны, возвращает ошибку 401 с соответствующим сообщением. 

Параметры:

login_input = fastapi.Form(min_length=1, max_length=30) - Логин

password_input = fastapi.Form(min_length=6, max_length=30) - Пароль

Зависимости:

db = fastapi.Depends(get_db)) - Получение сессии БД

<h3>2. @app.post("/register")</h3>

Отвечает за регистрацию пользователей. Если все нормально, возвращает JWT токен в заголовке запроса, статусный код 200. Если логин или эл. почта уже заняты, возвращает ошибку 409 с соответствующим сообщением.

Параметры:

login_input = fastapi.Form(min_length=1, max_length=30) - Логин

password_input = fastapi.Form(min_length=6, max_length=30) - Пароль

email_input = fastapi.Form(min_length=1) - Электронная почта

Зависимости:

db = fastapi.Depends(get_db)

<h3>3. @app.get("/tasks")</h3>

Отвечает за получение задач. Выдает задачи того пользователя, ID которого указан в JWT токене со статусным кодом 200, если все нормально. Если JWT токен невалиден/истек - возвращает ошибку 401.

Параметры:

Нет

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>
db = fastapi.Depends(get_db) - Получение сессии БД

<h3>4. @app.post("/tasks")</h3>

Отвечает за добавление новой задачи. Добавляет задачу тому пользователю, ID которого указан в JWT токене, и если операция успешна, возвращает статусный код 200. Если JWT токен невалиден/истек - возвращает ошибку 401.

Параметры:

header : str = fastapi.Body(max_length=200) - Заголовок задачи

text : str = fastapi.Body(max_length=3000) - Текст задачи

status_id : int = fastapi.Body(ge=0, le=2) - ID статуса задачи

Формат тела запроса (JSON):

{
"header": <Текст заголовка задачи>,
"text": <Текст задачи>,
"status_id": <ID статуса задачи>
}

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>

db = fastapi.Depends(get_db)) - Получение сессии БД

<h3>5. @app.put("/tasks")</h3>

Отвечает за изменение существующей задачи. Из тела запроса получает ID задачи и ее новые данные. Если эта задача не принадлежит пользователю, ID которого указан в JWT токене, возвращает статусный код 403. Если токен невалиден/истек - возвращает статусный код 401. Если заметка не найдена - возвращает статусный код 404. Если операция завершается успешно, возвращает статусный код 200. 

Параметры:

id : int = fastapi.Body() - Уникальный ID задачи

header : str = fastapi.Body(max_length=200) - Заголовок задачи

text : str = fastapi.Body(max_length=3000) - Текст задачи

status_id : int = fastapi.Body(ge=0, le=2) - ID статуса задачи

Формат тела запроса (JSON):

{
"id": <ID задачи>,
"header": <Текст заголовка задачи>,
"text": <Текст задачи>,
"status_id": <ID статуса задачи>
}

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>

db = fastapi.Depends(get_db)) - Получение сессии БД

<h3>6. @app.delete("/tasks")</h3>

Отвечает за удаление существующей задачи. Из тела запроса получает ID задачи для удаления. Если эта задача не принадлежит пользователю, ID которого указан в JWT токене, возвращает статусный код 403. Если токен невалиден/истек - возвращает статусный код 401. Если заметка не найдена - возвращает статусный код 404. Если операция завершается успешно, возвращает статусный код 200.

Параметры:

id : int = fastapi.Body() - Уникальный ID задачи

Формат тела запроса (JSON):

{
"id": <ID задачи>
}

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>

db = fastapi.Depends(get_db)) - Получение сессии БД


<h1>Комментарии</h1>

В файле db.py находятся модели ORM двух таблиц - users и tasks в виде классов Users и Tasks соответственно. Так же там находится движок и генератор сессий, который используется в зависимостях Эндпоинтов.

Строка подключения к БД находится в .env файле.

В файле jwt_encode_decode.py находится функции encode_jwt и decode_jwt. Первая служит для создания JWT токена с добавлением времени его истечения. Вторая для проверки валидности JWT токена и получения из него информации.

Так же тут находится зависимость get_auth_bearer, которая используется в Эндпоинтах для получения JWT токена из заголовка запроса.

Секретный ключ и алгоритм, как и время истечения так же считываются из .env файла.

Запросы к API на стороне фронтенда выполняются через JS Fetch API.

Модули Python, используемые в проекте:
fastapi, 
uvicorn, 
sqlalchemy, 
python-dotenv, 
pyjwt, 
bcrypt, 
psycopg2-binary, 
python-multipart,
pydantic,
email-validator

Используемая версия языка - Python 3.13
Скрипт SQL для создания таблиц, с которыми работает сервис приложен в файле init.sql. Именно он используется при создании контейнера Docker PostgreSQL.

Приложено два файла Dockerfile - DockerfileFrontend и DockerfileBackend. Первый отвечает за создание образа Docker сервера фронтенда, а второй бэкенда.

Также приложен файл docker-compose.yml, который отвечает за сетевое взаимодействие и создание трех контейнеров на основании данных образов и образа PostgreSQL. После запуска, к контейнеру фронтенда благодаря пробросу портов можно получить доступ через http://localhost:3000, а к контейнеру бэкенда - через http://localhost:8000. При этом они без проблем взаимодействуют друг с другом и сервис в целом работает должным образом.


Файлы с требуемыми зависимостями Python для бэкенда и фронтенда requirements_backend.txt и requirements_frontend.txt также приложены.

Ссылка на образ сервиса Фронтенда в Docker Hub: https://hub.docker.com/repository/docker/turret14/task_manager_frontend/general

Ссылка на образ сервиса Бэкэнда в Docker Hub: https://hub.docker.com/repository/docker/turret14/task_manager_backend/general


Unit-тесты находятся в файле unit_testing.py. При выполнении все тесты завершились успешно.

Сами тесты при выполнении работают с локальной базой данных SQLite. После выполнения каждого теста база данных очищается.

Зависимость get_db, используемая в Эндпоинтах, переопределяется и возвращает новую сессию этой же локальной базы данных SQLite.
