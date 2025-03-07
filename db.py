import sqlalchemy.orm
from dotenv import load_dotenv
import os

load_dotenv()

class Base(sqlalchemy.orm.DeclarativeBase) : pass

class Users(Base):
    __tablename__ = "users"
    id = sqlalchemy.Column(sqlalchemy.BIGINT, primary_key=True)
    login = sqlalchemy.Column(sqlalchemy.VARCHAR(30))
    email = sqlalchemy.Column(sqlalchemy.VARCHAR(100))
    password = sqlalchemy.Column(sqlalchemy.VARCHAR(64))

class Tasks(Base):
    __tablename__ = "tasks"
    id = sqlalchemy.Column(sqlalchemy.BIGINT, primary_key=True)
    header = sqlalchemy.Column(sqlalchemy.VARCHAR(200))
    text = sqlalchemy.Column(sqlalchemy.VARCHAR(3000))
    status_id = sqlalchemy.Column(sqlalchemy.INTEGER)
    user_id = sqlalchemy.Column(sqlalchemy.BIGINT, sqlalchemy.ForeignKey("users.id"))
    creation_date = sqlalchemy.Column(sqlalchemy.DATETIME)

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