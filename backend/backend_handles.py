from backend.backend_db import get_db
from backend.backend_jwt import decode_jwt
from backend.backend_jwt import get_auth_bearer
import fastapi
import starlette.status
from backend import backend_functions
from backend import backend_pydantic_models


router = fastapi.APIRouter()


# Отвечает за логин пользователей в систему.
@router.post("/login", response_class=fastapi.responses.JSONResponse, description="Отвечает за логин пользователей в систему.")
def post_login(data : backend_pydantic_models.LoginForm, db_session = fastapi.Depends(get_db)):
    try:
        return backend_functions.post_login_function(data, db_session)
    except:
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)


# Отвечает за регистрацию пользователей.
@router.post("/register", response_class=fastapi.responses.JSONResponse, description="Отвечает за регистрацию пользователей.")
def register(data : backend_pydantic_models.RegisterForm, db_session = fastapi.Depends(get_db)):
    try:
        return backend_functions.post_register_function(data, db_session)
    except:
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)


# Отвечает за получение задач.
@router.get("/tasks", response_model=list[backend_pydantic_models.TaskResponse], response_class=fastapi.responses.JSONResponse, description="Отвечает за получение задач.")
def get_tasks(token = fastapi.Depends(get_auth_bearer), db_session = fastapi.Depends(get_db)):
    try:
        token_payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code = starlette.status.HTTP_401_UNAUTHORIZED)

    try:
        return backend_functions.get_tasks_function(token_payload, db_session)
    except:
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)


# Отвечает за добавление новой задачи.
@router.post("/tasks", response_class=fastapi.responses.JSONResponse, description="Отвечает за добавление новой задачи.")
def post_tasks(data : backend_pydantic_models.PostTasksForm, token = fastapi.Depends(get_auth_bearer), db_session = fastapi.Depends(get_db)):
    try:
        token_payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

    try:
        return backend_functions.post_tasks_function(data, token_payload, db_session)
    except:
        print("Exception Occured")
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)


# Отвечает за изменение существующей задачи.
@router.put("/tasks", response_class=fastapi.responses.JSONResponse, description="Отвечает за изменение существующей задачи.")
def put_tasks(data : backend_pydantic_models.PutTasksForm, token = fastapi.Depends(get_auth_bearer), db_session = fastapi.Depends(get_db)):
    try:
        token_payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

    try:
        return backend_functions.put_tasks_function(data, token_payload, db_session)
    except:
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)


# Отвечает за удаление существующей задачи.
@router.delete("/tasks", response_class=fastapi.responses.JSONResponse, description="Отвечает за удаление существующей задачи.")
def delete_tasks(data : backend_pydantic_models.DeleteTasksForm, token = fastapi.Depends(get_auth_bearer), db_session = fastapi.Depends(get_db)):
    try:
        token_payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

    try:
        return backend_functions.delete_tasks_function(data, token_payload, db_session)
    except:
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)


# Возвращает логин текущего пользователя.
@router.get("/get_current_user_login", response_class=fastapi.responses.JSONResponse, description="Возвращает логин текущего пользователя.")
def get_id(token = fastapi.Depends(get_auth_bearer), db_session = fastapi.Depends(get_db)):
    try:
        token_payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

    try:
        return backend_functions.get_user_login_function(token_payload, db_session)
    except:
        return fastapi.responses.JSONResponse({"error": "INTERNAL_SERVER_ERROR"}, status_code=starlette.status.HTTP_500_INTERNAL_SERVER_ERROR)