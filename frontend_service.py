import fastapi
import fastapi.security
import fastapi.encoders
import fastapi.exceptions
import fastapi.staticfiles
import starlette.status


app = fastapi.FastAPI()

app.mount("/static", fastapi.staticfiles.StaticFiles(directory="static"), name="static")

@app.exception_handler(starlette.status.HTTP_404_NOT_FOUND)
async def not_found_handler(request: fastapi.Request, exc : fastapi.exceptions.HTTPException):
    return fastapi.responses.FileResponse("static/index.html")


# Возвращает главную страницу.
@app.get("/")
def root():
    return fastapi.responses.FileResponse("static/index.html")

# Возвращает страницу авторизации.
@app.get("/login")
def get_login():
    return fastapi.responses.FileResponse("static/login.html")