CREATE TABLE IF NOT EXISTS users (
    id INTEGER UNIQUE,
    nickname TEXT UNIQUE,
    fname TEXT,
    lname TEXT,
    dateofbirth TEXT,
    datejoined TEXT,
    password TEXT,
    email TEXT UNIQUE,
    description TEXT,
    private INTEGER DEFAULT (0) NOT NULL,
    PRIMARY KEY (id)
)