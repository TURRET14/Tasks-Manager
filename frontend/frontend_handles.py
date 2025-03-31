import fastapi

router = fastapi.APIRouter()

# Возвращает главную страницу.
@router.get("/", response_class=fastapi.responses.FileResponse, description="Возвращает главную страницу.")
def root():
    return fastapi.responses.FileResponse("static/index.html")

# Возвращает страницу авторизации.
@router.get("/login", response_class=fastapi.responses.FileResponse, description="Возвращает страницу авторизации.")
def get_login():
    return fastapi.responses.FileResponse("static/login.html")