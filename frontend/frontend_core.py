import fastapi
import fastapi.staticfiles
import fastapi.exceptions
import starlette.status
from frontend.frontend_handles import router

app = fastapi.FastAPI()

app.mount("/static", fastapi.staticfiles.StaticFiles(directory="static"), name="static")

# Обработка ошибок 404.
@app.exception_handler(starlette.status.HTTP_404_NOT_FOUND)
async def not_found_handler(request: fastapi.Request, exc : fastapi.exceptions.HTTPException):
    return fastapi.responses.FileResponse("static/index.html")

app.include_router(router)