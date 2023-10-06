CREATE TABLE IF NOT EXISTS groupchat (
	"messageid"	INTEGER,
	"userid"	INTEGER,
	"receiverids"	TEXT,
	"groupid"	INTEGER,
	"datesent"	TEXT,
	"message"	TEXT,
	PRIMARY KEY("messageid")
)