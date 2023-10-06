CREATE TABLE IF NOT EXISTS groups (
	"id" INTEGER NOT NULL UNIQUE,
	"name" TEXT NOT NULL UNIQUE,
	"tag" TEXT NOT NULL UNIQUE,
	"ownerId" INTEGER NOT NULL,
	"description" TEXT,
	PRIMARY KEY("id")
);
INSERT INTO groups (id, name, tag, ownerId, description)
VALUES (
		1,
		'Adventure Time',
		'ATime',
		1,
		'Join us for exciting adventures and unforgettable experiences. It''s adventure time!'
	),
	(
		2,
		'Coach Warriors',
		'CW',
		3,
		'A community of comfort lovers, where relaxation meets camaraderie.'
	);