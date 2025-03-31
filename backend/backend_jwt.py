import jwt
import datetime
import fastapi.security
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

get_auth_bearer = fastapi.security.OAuth2PasswordBearer("login")

def encode_jwt(payload):
        expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
        payload["exp"] = expire
        token = jwt.encode(payload=payload, key=SECRET_KEY, algorithm=ALGORITHM)
        return token

def decode_jwt(token):
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload