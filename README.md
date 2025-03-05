**Простой менеджер задач.**

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


**Страница авторизации**
![](https://github.com/TURRET14/Img-Storage/blob/main/Login.png)

**Главная страница**
![](https://github.com/TURRET14/Img-Storage/blob/main/Main.png)

**Диалог добавления задачи**
![](https://github.com/TURRET14/Img-Storage/blob/main/Add.png)

**Диалог изменения задачи**
![](https://github.com/TURRET14/Img-Storage/blob/main/Change.png)


Краткая документация API.

Объект класса FastAPI - app.
Пример запуска: uvicorn main:app

Endpoints:

Frontend:

1. @app.get("/")

Возвращает главную страницу.

Параметры: Нет

2. @app.get("/login")

Возвращает страницу авторизации.

Параметры: Нет

Backend:

1. @app.post("/login")

Отвечает за логин пользователей в систему. Если все нормально, возвращает JWT токен в заголовке запроса, статусный код 200. Если пароль или логин неверны, возвращает ошибку 401 с соответствующим сообщением. 

Параметры:

login_input = fastapi.Form(min_length=1, max_length=30) - Логин

password_input = fastapi.Form(min_length=6, max_length=30) - Пароль

Зависимости:

db = fastapi.Depends(get_db)) - Получение сессии БД

2. @app.post("/register")

Отвечает за регистрацию пользователей. Если все нормально, возвращает JWT токен в заголовке запроса, статусный код 200. Если логин или эл. почта уже заняты, возвращает ошибку 409 с соответствующим сообщением.

Параметры:

login_input = fastapi.Form(min_length=1, max_length=30) - Логин

password_input = fastapi.Form(min_length=6, max_length=30) - Пароль

email_input = fastapi.Form(min_length=1) - Электронная почта

Зависимости:

db = fastapi.Depends(get_db)

3. @app.get("/tasks")

Отвечает за получение задач. Выдает задачи того пользователя, ID которого указан в JWT токене со статусным кодом 200, если все нормально. Если JWT токен невалиден/истек - возвращает ошибку 401.

Параметры:

Нет

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>
db = fastapi.Depends(get_db) - Получение сессии БД

4. @app.post("/tasks")

Отвечает за добавление новой задачи. Добавляет задачу тому пользователю, ID которого указан в JWT токене, и если операция успешна, возвращает статусный код 200. Если JWT токен невалиден/истек - возвращает ошибку 401.

Параметры:

data = fastapi.Body() - Тело запроса

Формат:

{
"header": <Текст заголовка задачи>,
"text": <Текст задачи>,
"status_id": <ID статуса задачи>
}

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>

db = fastapi.Depends(get_db)) - Получение сессии БД

5. @app.put("/tasks")

Отвечает за изменение существующей задачи. Из тела запроса получает ID задачи и ее новые данные. Если эта задача не принадлежит пользователю, ID которого указан в JWT токене, возвращает статусный код 403. Если токен невалиден/истек - возвращает статусный код 401. Если заметка не найдена - возвращает статусный код 404. Если операция завершается успешно, возвращает статусный код 200. 

Параметры:

data = fastapi.Body() - Тело запроса

Формат:

{
"id": <ID задачи>,
"header": <Текст заголовка задачи>,
"text": <Текст задачи>,
"status_id": <ID статуса задачи>
}

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>

db = fastapi.Depends(get_db)) - Получение сессии БД

6. @app.delete("/tasks")

Отвечает за удаление существующей задачи. Из тела запроса получает ID задачи для удаления. Если эта задача не принадлежит пользователю, ID которого указан в JWT токене, возвращает статусный код 403. Если токен невалиден/истек - возвращает статусный код 401. Если заметка не найдена - возвращает статусный код 404. Если операция завершается успешно, возвращает статусный код 200.

Параметры:

data = fastapi.Body() - Тело запроса

Формат:

{
"id": <ID задачи>
}

Зависимости:

token = fastapi.Depends(get_auth_bearer) - Получение JWT Токена из заголовка запроса в формате Authorization: Bearer <JWT>

db = fastapi.Depends(get_db)) - Получение сессии БД


Формат Payload JWT токена:
{
"user_id": <ID пользователя>,
"exp": <Время истечения токена>
}

Формат .env файла:

SECRET_KEY="VerySecretKey"

ALGORITHM=<Алгоритм, используемый JWT>

ACCESS_TOKEN_EXPIRE_MINUTES=<Время истечения JWT токена>

SQLALCHEMY_DATABASE_URL=<Строка подключения к БД>

Сам API FastAPI вместе со всеми Эндпоинтами находится в файле main.py

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
python-multipart

Используемая версия языка - Python 3.13

