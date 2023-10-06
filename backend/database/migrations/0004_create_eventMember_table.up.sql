CREATE TABLE IF NOT EXISTS eventMember (
    userId INTEGER,
    eventId INTEGER,
    status VARCHAR(255),
    PRIMARY KEY (userId, eventId)
)