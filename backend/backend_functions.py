import datetime
from backend.backend_db import Users
from backend.backend_db import Tasks
from backend.backend_jwt import encode_jwt
import fastapi
import fastapi.encoders
import starlette.status
import bcrypt
import sqlalchemy.orm
from backend import backend_pydantic_models

def post_login_function(data : backend_pydantic_models.LoginForm, db_session : sqlalchemy.orm.session.Session):
    user = db_session.query(Users).filter(Users.login == data.login_input).first()
    if user is None:
        return fastapi.responses.JSONResponse({"error": "INCORRECT_LOGIN_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    password = user.password
    try:
        if bcrypt.checkpw(data.password_input.encode(), password.encode()):
            payload = {"user_id": user.id}
            token = encode_jwt(payload)
            return fastapi.responses.JSONResponse({"message": "AUTHORIZATION_SUCCESS"}, headers={"Authorization": "Bearer " + token})
        else:
            return fastapi.responses.JSONResponse({"error": "INCORRECT_PASSWORD_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    except:
        return fastapi.responses.JSONResponse({"error": "INCORRECT_PASSWORD_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

def post_register_function(data : backend_pydantic_models.RegisterForm, db_session : sqlalchemy.orm.session.Session):
    if db_session.query(Users).filter(Users.login == data.login_input).first() is not None:
        return fastapi.responses.JSONResponse({"error": "LOGIN_ALREADY_TAKEN_ERROR"}, status_code = starlette.status.HTTP_409_CONFLICT)
    if db_session.query(Users).filter(Users.email == data.email_input).first() is not None:
        return fastapi.responses.JSONResponse({"error": "EMAIL_ALREADY_TAKEN_ERROR"}, status_code = starlette.status.HTTP_409_CONFLICT)
    else:
        password = bcrypt.hashpw(data.password_input.encode(), bcrypt.gensalt())
        user = Users(login=data.login_input, password=password.decode(), email=data.email_input)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        payload = {"user_id": user.id}
        token = encode_jwt(payload)
        return fastapi.responses.JSONResponse({"message": "AUTHORIZATION_SUCCESS"}, headers={"Authorization": "Bearer " + token})

def get_tasks_function(token_payload : dict, db_session : sqlalchemy.orm.session.Session):
    if db_session.query(Users).filter(Users.id == token_payload["user_id"]).first() is not None:
        CreatorUsers = sqlalchemy.orm.aliased(Users)
        AssignedUsers = sqlalchemy.orm.aliased(Users)
        return db_session.query(Tasks.id, Tasks.header, Tasks.text, Tasks.status_id, CreatorUsers.login.label("creator_user_login"), AssignedUsers.login.label("assigned_user_login"), Tasks.creation_date).filter(sqlalchemy.or_(Tasks.user_id == token_payload["user_id"], Tasks.assigned_user_id == token_payload["user_id"])).outerjoin(CreatorUsers, CreatorUsers.id == Tasks.user_id).outerjoin(AssignedUsers, AssignedUsers.id == Tasks.assigned_user_id).all()
    else:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

def post_tasks_function(data : backend_pydantic_models.PostTasksForm, token_payload : dict, db_session : sqlalchemy.orm.session.Session):
    if db_session.query(Users).filter(Users.id == token_payload["user_id"]).first() is not None:
        assigned_user_id = db_session.query(Users.id).filter(Users.login == data.task_assigned_user_login).scalar()
        task = Tasks(header=data.task_header, text=data.task_text, status_id=data.task_status_id, user_id=token_payload["user_id"], assigned_user_id = assigned_user_id, creation_date=datetime.datetime.now(datetime.UTC))
        db_session.add(task)
        db_session.commit()
        return fastapi.responses.JSONResponse({"message": "SUCCESS"})
    else:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)

def put_tasks_function(data : backend_pydantic_models.PutTasksForm, token_payload : dict, db_session : sqlalchemy.orm.session.Session):
    task = db_session.query(Tasks).filter(Tasks.id == data.task_id).first()
    if task is not None:
        if task.user_id != token_payload["user_id"]:
            return fastapi.responses.JSONResponse({"error": "FORBIDDEN_ERROR"}, status_code=starlette.status.HTTP_403_FORBIDDEN)
        else:
            assigned_user_id = db_session.query(Users.id).filter(Users.login == data.task_assigned_user_login).scalar()
            task.header = data.task_header
            task.text = data.task_text
            task.status_id = data.task_status_id
            task.assigned_user_id = assigned_user_id
            db_session.commit()
            return fastapi.responses.JSONResponse({"message": "SUCCESS"})
    else:
        return fastapi.responses.JSONResponse({"error": "NOT_FOUND_ERROR"}, status_code=starlette.status.HTTP_404_NOT_FOUND)

def delete_tasks_function(data : backend_pydantic_models.DeleteTasksForm, token_payload : dict, db_session : sqlalchemy.orm.session.Session):
    task = db_session.query(Tasks).filter(Tasks.id == data.task_id).first()
    if task is not None:
        if task.user_id != token_payload["user_id"]:
            return fastapi.responses.JSONResponse({"error": "FORBIDDEN_ERROR"}, status_code=starlette.status.HTTP_403_FORBIDDEN)
        else:
            db_session.delete(task)
            db_session.commit()
            return fastapi.responses.JSONResponse({"message": "SUCCESS"})
    else:
        return fastapi.responses.JSONResponse({"error": "NOT_FOUND_ERROR"}, status_code=starlette.status.HTTP_404_NOT_FOUND)

def get_user_id_function(token_payload : dict):
    return token_payload["user_id"]

def get_user_login_function(token_payload : dict, db_session : sqlalchemy.orm.session.Session):
    return db_session.query(Users.login).filter(Users.id == token_payload["user_id"]).scalar()
