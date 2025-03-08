import datetime
from db import Users
from db import Tasks
from db import get_db
from jwt_encode_decode import encode_jwt
from jwt_encode_decode import decode_jwt
from jwt_encode_decode import get_auth_bearer
import fastapi
import fastapi.security
import fastapi.encoders
import fastapi.exceptions
import fastapi.staticfiles
import fastapi.middleware.cors
import starlette.status
import bcrypt
import pydantic

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_credentials = True,
    allow_methods = ["GET", "POST", "PUT", "DELETE"],
    allow_headers = ["Authorization"],
    expose_headers = ["Authorization"]
)


class EmailValidator(pydantic.BaseModel):
    email: pydantic.EmailStr

@app.exception_handler(fastapi.exceptions.RequestValidationError)
def validation_exception_handler(request: fastapi.Request, exc: fastapi.exceptions.RequestValidationError):
    return fastapi.responses.JSONResponse({"error": "VALIDATION_ERROR"}, status_code = starlette.status.HTTP_400_BAD_REQUEST)


@app.post("/login")
def post_login(login_input = fastapi.Form(min_length=1, max_length=30), password_input = fastapi.Form(min_length=6, max_length=30), db = fastapi.Depends(get_db)):
    user = db.query(Users).filter(Users.login == login_input).first()
    if user is None:
        return fastapi.responses.JSONResponse({"error": "INCORRECT_LOGIN_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    password = user.password
    try:
        if bcrypt.checkpw(password_input.encode(), password.encode()):
            payload = {"user_id": user.id}
            token = encode_jwt(payload)
            return fastapi.responses.JSONResponse({"message": "AUTHORIZATION_SUCCESS"}, headers={"Authorization": "Bearer " + token})
        else:
            return fastapi.responses.JSONResponse({"error": "INCORRECT_PASSWORD_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    except:
        return fastapi.responses.JSONResponse({"error": "INCORRECT_PASSWORD_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)


@app.post("/register")
def register(login_input = fastapi.Form(min_length=1, max_length=30), password_input = fastapi.Form(min_length=6, max_length=30), email_input = fastapi.Form(min_length=1, max_length=100), db = fastapi.Depends(get_db)):
    if db.query(Users).filter(Users.login == login_input).first() is not None:
        return fastapi.responses.JSONResponse({"error": "LOGIN_ALREADY_TAKEN_ERROR"}, status_code = starlette.status.HTTP_409_CONFLICT)
    if db.query(Users).filter(Users.email == email_input).first() is not None:
        return fastapi.responses.JSONResponse({"error": "EMAIL_ALREADY_TAKEN_ERROR"}, status_code = starlette.status.HTTP_409_CONFLICT)
    try:
        EmailValidator(email=email_input)
    except:
        return fastapi.responses.JSONResponse({"error": "VALIDATION_ERROR"}, status_code=starlette.status.HTTP_400_BAD_REQUEST)
    else:
        password = bcrypt.hashpw(password_input.encode(), bcrypt.gensalt())
        user = Users(login=login_input, password=password.decode(), email=email_input)
        db.add(user)
        db.commit()
        db.refresh(user)
        payload = {"user_id": user.id}
        token = encode_jwt(payload)
        return fastapi.responses.JSONResponse({"message": "AUTHORIZATION_SUCCESS"}, headers={"Authorization": "Bearer " + token})


@app.get("/tasks")
def get_tasks(token = fastapi.Depends(get_auth_bearer), db = fastapi.Depends(get_db)):
    try:
        payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code = starlette.status.HTTP_401_UNAUTHORIZED)
    task_list = db.query(Tasks).filter(Tasks.user_id == payload["user_id"]).all()
    return fastapi.responses.JSONResponse(fastapi.encoders.jsonable_encoder(task_list))


@app.post("/tasks")
def post_tasks(data = fastapi.Body(), token = fastapi.Depends(get_auth_bearer), db = fastapi.Depends(get_db)):
    if len(data["header"]) > 200 or len(data["text"]) > 3000:
        return fastapi.responses.JSONResponse({"error": "VALIDATION_ERROR"}, status_code=starlette.status.HTTP_400_BAD_REQUEST)
    try:
        payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    try:
        if str(data["status_id"]) != "0" and str(data["status_id"]) != "1" and str(data["status_id"]) != "2":
            return fastapi.responses.JSONResponse({"error": "BAD_REQUEST_ERROR"}, status_code=starlette.status.HTTP_400_BAD_REQUEST)
        task = Tasks(header=data["header"], text=data["text"], status_id=data["status_id"], user_id=payload["user_id"], creation_date=datetime.datetime.now(datetime.UTC))
        db.add(task)
        db.commit()
        return fastapi.responses.JSONResponse({"message": "SUCCESS"})
    except:
        return fastapi.responses.JSONResponse({"error": "BAD_REQUEST_ERROR"}, status_code = starlette.status.HTTP_400_BAD_REQUEST)


@app.put("/tasks")
def put_tasks(data = fastapi.Body(), token = fastapi.Depends(get_auth_bearer), db = fastapi.Depends(get_db)):
    if len(data["header"]) > 200 or len(data["text"]) > 3000:
        return fastapi.responses.JSONResponse({"error": "VALIDATION_ERROR"}, status_code=starlette.status.HTTP_400_BAD_REQUEST)
    try:
        payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    try:
        if str(data["status_id"]) != "0" and str(data["status_id"]) != "1" and str(data["status_id"]) != "2":
            return fastapi.responses.JSONResponse({"error": "BAD_REQUEST_ERROR"}, status_code=starlette.status.HTTP_400_BAD_REQUEST)

        task = db.query(Tasks).filter(Tasks.id == data["id"]).first()
        if task is not None:
            if task.user_id != payload["user_id"]:
                return fastapi.responses.JSONResponse({"error": "FORBIDDEN_ERROR"}, status_code=starlette.status.HTTP_403_FORBIDDEN)
            else:
                task.header = data["header"]
                task.text = data["text"]
                task.status_id = data["status_id"]
                db.commit()
                return fastapi.responses.JSONResponse({"message": "SUCCESS"})
        else:
            return fastapi.responses.JSONResponse({"error": "NOT_FOUND_ERROR"}, status_code=starlette.status.HTTP_404_NOT_FOUND)

    except:
        return fastapi.responses.JSONResponse({"error": "BAD_REQUEST_ERROR"}, status_code = starlette.status.HTTP_400_BAD_REQUEST)


@app.delete("/tasks")
def delete_tasks(data = fastapi.Body(), token = fastapi.Depends(get_auth_bearer), db = fastapi.Depends(get_db)):
    try:
        payload = decode_jwt(token)
    except:
        return fastapi.responses.JSONResponse({"error": "UNAUTHORIZED_ERROR"}, status_code=starlette.status.HTTP_401_UNAUTHORIZED)
    try:
        task = db.query(Tasks).filter(Tasks.id == data["id"]).first()
        if task is not None:
            if task.user_id != payload["user_id"]:
                return fastapi.responses.JSONResponse({"error": "FORBIDDEN_ERROR"}, status_code=starlette.status.HTTP_403_FORBIDDEN)
            else:
                db.delete(task)
                db.commit()
                return fastapi.responses.JSONResponse({"message": "SUCCESS"})
        else:
            return fastapi.responses.JSONResponse({"error": "NOT_FOUND_ERROR"}, status_code=starlette.status.HTTP_404_NOT_FOUND)
    except:
        return fastapi.responses.JSONResponse({"error": "BAD_REQUEST_ERROR"}, status_code = starlette.status.HTTP_400_BAD_REQUEST)
