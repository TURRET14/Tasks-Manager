CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    login VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR (64) NOT NULL
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(3000),
    header VARCHAR(200),
    status_id SMALLINT,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creation_date TIMESTAMPTZ NOT NULL
);

CREATE TABLE task_assigned_users (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, task_id)
);