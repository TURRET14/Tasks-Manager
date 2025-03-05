import sqlalchemy.orm
from dotenv import load_dotenv
import os

load_dotenv()

class Base(sqlalchemy.orm.DeclarativeBase) : pass

class Users(Base):
    __tablename__ = "users"
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    login = sqlalchemy.Column(sqlalchemy.String)
    email = sqlalchemy.Column(sqlalchemy.String)
    password = sqlalchemy.Column(sqlalchemy.String)

class Tasks(Base):
    __tablename__ = "tasks"
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    header = sqlalchemy.Column(sqlalchemy.String)
    text = sqlalchemy.Column(sqlalchemy.String)
    status_id = sqlalchemy.Column(sqlalchemy.Integer)
    user_id = sqlalchemy.Column(sqlalchemy.Integer)
    creation_date = sqlalchemy.Column(sqlalchemy.Date)

SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

engine = sqlalchemy.create_engine(SQLALCHEMY_DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sqlalchemy.orm.sessionmaker(autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()