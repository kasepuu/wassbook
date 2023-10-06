CREATE TABLE IF NOT EXISTS posts (
	"id"	INTEGER,
	"userId"	INTEGER,
	"fname"	TEXT,
	"lname"	TEXT,
	"date"	TEXT,
	"content"	TEXT,
	"groupId"	INTEGER,
	"filename"	TEXT,
	"privacy"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
)