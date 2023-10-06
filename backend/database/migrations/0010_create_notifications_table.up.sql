CREATE TABLE IF NOT EXISTS notifications (
	"id"	INTEGER UNIQUE,
	"targetid"	INTEGER,
	"senderid"	INTEGER,
	"description"	TEXT,
	"groupMemberId"	INTEGER,
	PRIMARY KEY("id")
)