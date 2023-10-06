CREATE TABLE IF NOT EXISTS comments (
	"id"	INTEGER,
	"postId"	INTEGER,
	"userId"	INTEGER,
	"content"	TEXT,
	"date"	TEXT,
	"filename"	TEXT DEFAULT NULL,
	"groupId"	INTEGER DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)