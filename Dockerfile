FROM python:3.13

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY db.py .
COPY jwt_encode_decode.py .
COPY .env .
COPY static/ /app/static


EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]