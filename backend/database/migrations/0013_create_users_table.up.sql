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
);
INSERT INTO users (
        nickname,
        fname,
        lname,
        dateofbirth,
        datejoined,
        password,
        email,
        description,
        private
    )
VALUES (
        'sass',
        'Kadri',
        'Tamm',
        '1990-05-15',
        '2023-10-06',
        '123',
        'kadri.tamm@example.com',
        'A creative soul passionate about art and nature.',
        0
    ),
    (
        'rain',
        'Mihkel',
        'Lepik',
        '1985-12-28',
        '2023-10-06',
        '123',
        'mihkel.lepik@example.com',
        'Tech enthusiast with a love for coding and problem-solving.',
        0
    ),
    (
        'kasepuu',
        'Laura',
        'Kask',
        '1988-07-19',
        '2023-10-06',
        '123',
        'laura.kask@example.com',
        'A bookworm who enjoys getting lost in fictional worlds.',
        0
    ),
    (
        'juss',
        'Martin',
        'Saar',
        '1992-03-02',
        '2023-10-06',
        '123',
        'martin.saar@example.com',
        'Fitness enthusiast and outdoor adventure seeker.',
        0
    ),
    (
        'andrei',
        'Kristjan',
        'Mets',
        '1983-09-10',
        '2023-10-06',
        '123',
        'kristjan.mets@example.com',
        'Music lover who plays multiple instruments and enjoys live performances.',
        0
    ),
    (
        'erik',
        'Liisa',
        'Kivimägi',
        '1995-11-24',
        '2023-10-06',
        '123',
        'liisa.kivimagi@example.com',
        'Foodie and aspiring chef exploring the culinary world.',
        0
    );