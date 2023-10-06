CREATE TABLE IF NOT EXISTS groupMember (
	"groupId" INTEGER NOT NULL,
	"status" TEXT NOT NULL,
	"userId" INTEGER NOT NULL,
	PRIMARY KEY("groupId", "userId")
);
INSERT INTO groupMember (groupId, status, userId)
VALUES (1, 'accepted', 1);
INSERT INTO groupMember (groupId, status, userId)
VALUES (1, 'accepted', 4);
INSERT INTO groupMember (groupId, status, userId)
VALUES (1, 'accepted', 3);
INSERT INTO groupMember (groupId, status, userId)
VALUES (2, 'accepted', 3);
INSERT INTO groupMember (groupId, status, userId)
VALUES (2, 'accepted', 4);
INSERT INTO groupMember (groupId, status, userId)
VALUES (2, 'accepted', 1);