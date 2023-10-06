CREATE TABLE IF NOT EXISTS groupMember (
	"groupId"	INTEGER NOT NULL,
	"status"	TEXT NOT NULL,
	"userId"	INTEGER NOT NULL,
	PRIMARY KEY("groupId","userId")
)