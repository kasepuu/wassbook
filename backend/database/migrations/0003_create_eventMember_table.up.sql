CREATE TABLE IF NOT EXISTS eventMember (
    userId INTEGER,
    eventId INTEGER,
    status VARCHAR(255),
    PRIMARY KEY (userId, eventId)
);
INSERT INTO eventMember (userId, eventId, status)
VALUES (3, 1, 'Going');
INSERT INTO eventMember (userId, eventId, status)
VALUES (1, 2, 'Going');
INSERT INTO eventMember (userId, eventId, status)
VALUES (4, 1, 'Going');