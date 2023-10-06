CREATE TABLE IF NOT EXISTS chat (
    messageid INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER,
    receiverid INTEGER,
    datesent TEXT,
    message TEXT
    )