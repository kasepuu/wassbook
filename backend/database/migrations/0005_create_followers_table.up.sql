CREATE TABLE IF NOT EXISTS followers (
	"id" INTEGER UNIQUE,
	"userid" INTEGER NOT NULL,
	"targetid" INTEGER NOT NULL,
	"status" TEXT,
	PRIMARY KEY("id")
);
INSERT INTO followers (id, userid, targetid, status)
VALUES (1, 4, 1, 'following');
INSERT INTO followers (id, userid, targetid, status)
VALUES (2, 3, 1, 'following');
INSERT INTO followers (id, userid, targetid, status)
VALUES (3, 4, 3, 'following');
INSERT INTO followers (id, userid, targetid, status)
VALUES (4, 3, 4, 'following');