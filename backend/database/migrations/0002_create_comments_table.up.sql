CREATE TABLE IF NOT EXISTS comments (
	"id" INTEGER,
	"postId" INTEGER,
	"userId" INTEGER,
	"content" TEXT,
	"date" TEXT,
	"filename" TEXT DEFAULT NULL,
	"groupId" INTEGER DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO comments (
		"id",
		"postId",
		"userId",
		"content",
		"date",
		"filename",
		"groupId"
	)
VALUES (
		1,
		3,
		3,
		'Caution, folks! Hiking: Where Trees Fight Back! 🌳⚔️ Watch out for those wild twigs and rebellious rocks! Stay safe, Adventure Time warriors! 😆',
		'07.10.2023 00:27',
		'090bb1d9-6e19-42e9-918a-b53f83d89f8b.png',
		NULL
	);