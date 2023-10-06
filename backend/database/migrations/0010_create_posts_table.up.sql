CREATE TABLE IF NOT EXISTS posts (
	"id" INTEGER,
	"userId" INTEGER,
	"fname" TEXT,
	"lname" TEXT,
	"date" TEXT,
	"content" TEXT,
	"groupId" INTEGER,
	"filename" TEXT,
	"privacy" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO posts (
		"id",
		"userId",
		"fname",
		"lname",
		"date",
		"content",
		"groupId",
		"filename",
		"privacy"
	)
VALUES (
		1,
		1,
		'Kadri',
		'Tamm',
		'2023-10-07T00:12:13+03:00',
		'Hey Team Adventure Time (ATime)! 🚀 Get ready for thrilling adventures and unforgettable experiences! 🚀 I''m thrilled to lead this group of amazing individuals on our quest for excitement and discovery. Whether it''s exploring unknown territories, conquering challenges, or simply enjoying the beauty of the world around us, together, we''ll make every moment an adventure. Our journey starts now! Let''s create memories, overcome obstacles, and make this adventure time truly epic. Strap in, team! The adventure awaits! Best, Sass',
		1,
		'',
		''
	);
INSERT INTO posts (
		"id",
		"userId",
		"fname",
		"lname",
		"date",
		"content",
		"groupId",
		"filename",
		"privacy"
	)
VALUES (
		2,
		1,
		'Kadri',
		'Tamm',
		'2023-10-07T00:14',
		'Hey friends, I''m beyond thrilled to announce the launch of a brand-new adventure group – Adventure Time (ATime)! 🚀✨ Are you someone who craves excitement, loves exploring the great outdoors, and dreams of unforgettable journeys? Look no further! Adventure Time is not just a group; it''s a community of like-minded souls ready to embark on thrilling escapades, conquer challenges, and create lasting memories together.',
		-1,
		'4ea6dfe6-4e42-4f27-9b96-1541662a419a.jpeg',
		'private'
	);
INSERT INTO posts (
		"id",
		"userId",
		"fname",
		"lname",
		"date",
		"content",
		"groupId",
		"filename",
		"privacy"
	)
VALUES (
		3,
		1,
		'Kadri',
		'Tamm',
		'2023-10-07T00:25',
		'Join Adventure Time: Where Every Day is Epic! Check out my group, Adventure Time!',
		-1,
		'-',
		'public'
	);