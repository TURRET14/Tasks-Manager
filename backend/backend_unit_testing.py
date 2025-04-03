import pytest
import sqlalchemy.pool
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.backend_db import Base, Users, get_db
from backend.backend_core import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=sqlalchemy.pool.StaticPool)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


client = TestClient(app)

def test_create_task_without_jwt():
    response = client.post("/tasks", json={"task_header": "TestTask", "task_text": "TestText", "task_status_id": "0", "task_assigned_user_login": ""})
    assert response.status_code == 401

def test_create_task_with_invalid_jwt():
    response = client.post("/tasks", json={"task_header": "TestTask", "task_text": "TestText", "task_status_id": "0", "task_assigned_user_login": ""}, headers={"Authorization": "Bearer INVALIDJWT"})
    assert response.status_code == 401

def test_authorization_invalid_password(test_db):
    test_db.add(Users(id=0,  login="UnitTestUser", password="VeryHardPassword", email="Test@gmail.com"))
    test_db.commit()
    response = client.post("/login", json={"login_input": "UnitTestUser", "password_input": "123456"})
    assert response.status_code == 401

def test_register_with_taken_login(test_db):
    test_db.add(Users(id=0, login="UnitTestUser", password="VeryHardPassword", email="Test@gmail.com"))
    test_db.commit()
    response = client.post("/register", json={"login_input": "UnitTestUser", "password_input": "123456", "email_input": "CoolEmail@gmail.com"})
    assert response.status_code == 409

def test_register_with_taken_email(test_db):
    test_db.add(Users(id=0, login="UnitTestUser", password="VeryHardPassword", email="CoolEmail@gmail.com"))
    test_db.commit()
    response = client.post("/register", json={"login_input": "AnotherUser", "password_input": "123456", "email_input": "CoolEmail@gmail.com"})
    assert response.status_code == 409