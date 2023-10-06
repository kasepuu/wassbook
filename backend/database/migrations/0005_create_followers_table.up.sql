CREATE TABLE IF NOT EXISTS followers (
	"id"	INTEGER UNIQUE,
	"userid"	INTEGER NOT NULL,
	"targetid"	INTEGER NOT NULL,
	"status"	TEXT,
	PRIMARY KEY("id")
)