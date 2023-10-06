CREATE TABLE IF NOT EXISTS groups (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	"ownerId"	INTEGER NOT NULL,
	"description"	TEXT,
	PRIMARY KEY("id")
)