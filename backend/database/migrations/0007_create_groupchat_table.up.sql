CREATE TABLE IF NOT EXISTS groupchat (
	"messageid" INTEGER,
	"userid" INTEGER,
	"receiverids" TEXT,
	"groupid" INTEGER,
	"datesent" TEXT,
	"message" TEXT,
	PRIMARY KEY("messageid")
);
INSERT INTO groupchat (
		messageid,
		userid,
		receiverids,
		groupid,
		datesent,
		message
	)
VALUES (
		1,
		1,
		'[4]',
		1,
		'2023-10-07T00:17:43.187232114+03:00',
		'I hope everyone''s having a fantastic day! 🚀 Just wanted to remind you all that our next adventure is just around the corner! We''ll be heading to [Adventure Destination] this [Date] for an epic hiking expedition. Get ready for breathtaking views, challenging trails, and, of course, loads of fun! 😚'
	);
INSERT INTO groupchat (
		messageid,
		userid,
		receiverids,
		groupid,
		datesent,
		message
	)
VALUES (
		2,
		4,
		'[1]',
		1,
		'2023-10-07T00:18:31.123636718+03:00',
		'Wow, Sass, that sounds amazing! 🌄 I''m pumped up and ready for the adventure. I''ve got my hiking boots and backpack all set. Can''t wait to explore [Adventure Destination] with the team! Count me in for the hike! 💪😄'
	);
INSERT INTO groupchat (
		messageid,
		userid,
		receiverids,
		groupid,
		datesent,
		message
	)
VALUES (
		3,
		3,
		'[1,4]',
		1,
		'2023-10-07T00:21:16.382060794+03:00',
		'I hope you''re all super excited for the hike! While I won''t be joining in this time, I wanted to let you know that I''ll be cheering you on from the comfort of my couch. 😄🛋️'
	);
INSERT INTO groupchat (
		messageid,
		userid,
		receiverids,
		groupid,
		datesent,
		message
	)
VALUES (
		4,
		1,
		'[4]',
		1,
		'2023-10-07T00:23:36.996861041+03:00',
		'🚀🚀🚀🚀'
	);
INSERT INTO groupchat (
		messageid,
		userid,
		receiverids,
		groupid,
		datesent,
		message
	)
VALUES (
		5,
		1,
		'[4]',
		1,
		'2023-10-07T00:23:58.371195127+03:00',
		'🌲 Nature here we come! I''m soooo excited! Can''t wait to see all the awesome plants and animals! 🦋🌿'
	);