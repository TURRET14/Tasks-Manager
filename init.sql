CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    login VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR (64) NOT NULL
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(3000),
    status_id SMALLINT,
    user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    header VARCHAR(200),
    creation_date TIMESTAMPTZ NOT NULL
);