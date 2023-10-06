CREATE TABLE IF NOT EXISTS events (
	"id" INTEGER NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	"date" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"ownerId" INTEGER NOT NULL,
	"groupId" INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO events (
		"name",
		"date",
		"description",
		"ownerId",
		"groupId"
	)
VALUES (
		'Adventure Hike',
		'2023-11-29T02:03',
		'Get ready for an adrenaline-pumping virtual adventure! The Adventure Time crew is embarking on a thrilling hike, and this time, you''re coming with us ',
		3,
		2
	);
INSERT INTO events (
		"name",
		"date",
		"description",
		"ownerId",
		"groupId"
	)
VALUES (
		'Wilderness Quest',
		'2023-11-29T00:32',
		'🏞️ Calling All Adventure Timers! Prepare for the Ultimate Wilderness Quest! 🌲 Gear up, fellow adventurers! It''s time for an adrenaline-fueled journey',
		1,
		1
	);