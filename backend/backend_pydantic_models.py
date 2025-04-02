import pydantic
from datetime import datetime

class LoginForm(pydantic.BaseModel):
    login_input : str = pydantic.Field(min_length=1, max_length=30)
    password_input : str = pydantic.Field(min_length=6, max_length=30)

class RegisterForm(pydantic.BaseModel):
    login_input: str = pydantic.Field(min_length=1, max_length=30)
    password_input: str = pydantic.Field(min_length=6, max_length=30)
    email_input : pydantic.EmailStr

class PostTasksForm(pydantic.BaseModel):
    task_header : str = pydantic.Field(max_length=200)
    task_text : str = pydantic.Field(max_length=3000)
    task_status_id : int = pydantic.Field(ge=0, le=2),
    task_assigned_user_login: str = pydantic.Field()

class PutTasksForm(pydantic.BaseModel):
    task_id : int = pydantic.Field()
    task_header: str = pydantic.Field(max_length=200)
    task_text: str = pydantic.Field(max_length=3000)
    task_status_id: int = pydantic.Field(ge=0, le=2)
    task_assigned_user_login : str = pydantic.Field()

class DeleteTasksForm(pydantic.BaseModel):
    task_id : int = pydantic.Field()

class TaskResponse(pydantic.BaseModel):
    id: int
    header: str
    text: str
    status_id: int
    creator_user_login: str
    assigned_user_login : str | None
    creation_date: datetime