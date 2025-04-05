import fastapi
import fastapi.middleware.cors
import starlette.status
from backend.backend_handles import router
import uvicorn

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_credentials = True,
    allow_methods = ["GET", "POST", "PUT", "DELETE"],
    allow_headers = ["Authorization"],
    expose_headers = ["Authorization"]
)

# Обработка ошибок валидации.
@app.exception_handler(fastapi.exceptions.RequestValidationError)
def validation_exception_handler(request: fastapi.Request, exc: fastapi.exceptions.RequestValidationError):
    return fastapi.responses.JSONResponse({"error": "VALIDATION_ERROR"}, status_code = starlette.status.HTTP_400_BAD_REQUEST)

app.include_router(router)