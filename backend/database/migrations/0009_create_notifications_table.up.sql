CREATE TABLE IF NOT EXISTS notifications (
	"id" INTEGER UNIQUE,
	"targetid" INTEGER,
	"senderid" INTEGER,
	"description" TEXT,
	PRIMARY KEY("id"),
	UNIQUE("targetid", "senderid", "description") ON CONFLICT IGNORE
);