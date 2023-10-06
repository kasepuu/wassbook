CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT UNIQUE,
    "password" TEXT,
    "email" TEXT UNIQUE,
    "age" INTEGER,
    "gender" TEXT,
    "firstname" TEXT,
    "lastname" TEXT
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "key" TEXT UNIQUE,
    "userId" INTEGER UNIQUE
);

CREATE TABLE IF NOT EXISTS "comments" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "postId" INTEGER,
    "content" TEXT,
    "datecommented" TEXT
);

CREATE TABLE IF NOT EXISTS "category" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

CREATE TABLE IF NOT EXISTS "chat" (
    "messageid" INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "receiverId" INTEGER,
    "datesent" TEXT,
    "message" TEXT
);

CREATE TABLE IF NOT EXISTS "posts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "title" TEXT,
    "content" TEXT,
    "categoryId" INTEGER,
    "date" TEXT
);

INSERT INTO "users" ("username", "password", "email", "age", "gender", "firstname", "lastname") 
VALUES 
  ('m2nky', '123', 'm2nky@example.com', 25, 'Male', 'John', 'Doe'),
  ('7Eleven', '123', 'seven11@example.com', 30, 'Female', 'Jane', 'Smith'),
  ('Isabella', '123', 'isabella200@example.com', 24, 'Female', 'Isabella', 'Smelter');


-- Dummy comments for users
INSERT INTO "comments" ("userId", "postId", "content", "datecommented") 
VALUES 
  (1, 2, 'Your list looks great! I''ve used some of these tools too, and they are indeed helpful.', '2023-07-22T12:30:00.000000000Z'),
  (2, 1, 'Wow, that sounds like an amazing experience! I love spending time in nature too.', '2023-07-22T10:30:00.000000000Z'),
  (3, 1, 'Nature has its unique way of calming our minds. I''m glad you had a great time!', '2023-07-22T11:15:00.000000000Z'),
  (3, 2, 'I''m not a developer, but it''s interesting to see how technology plays a crucial role in your field.', '2023-07-22T13:15:00.000000000Z'),
  (1, 3, 'Your setup sounds impressive! It''s always exciting to see the performance improvements from hardware upgrades.', '2023-07-22T14:30:00.000000000Z'),
  (2, 3, 'I''ve been considering an upgrade too. Can you share the specs you chose?', '2023-07-22T15:15:00.000000000Z');


INSERT INTO "category" ("name") 
VALUES 
  ('Nature'),
  ('Software'),
  ('Hardware');

-- Dummy chat messages between m2nky (User ID: 1) and 7Eleven (User ID: 2) - 12 messages
INSERT INTO "chat" ("userId", "receiverId", "datesent", "message") 
VALUES 
  (1, 2, '2023-07-22T14:30:00.000000000Z', 'Hi 7Eleven, how are you?'),
  (2, 1, '2023-07-22T14:35:00.000000000Z', 'Hey m2nky, I''m doing great.'),
  (1, 2, '2023-07-22T15:00:00.000000000Z', 'Did you know monkeys are amazing creatures? They are so agile and intelligent.'),
  (2, 1, '2023-07-22T15:10:00.000000000Z', 'Oh, I agree! Monkeys are fascinating. I love watching nature documentaries about them.'),
  (1, 2, '2023-07-22T15:30:00.000000000Z', 'Nature never fails to amaze me. Have you been on any nature trips lately?'),
  (2, 1, '2023-07-22T16:00:00.000000000Z', "Not recently, but I'm planning a hiking trip next month. Do you have any recommendations?"),
  (1, 2, '2023-07-22T16:15:00.000000000Z', 'There are some breathtaking trails in the national park nearby. I can share more details later.'),
  (2, 1, '2023-07-22T16:30:00.000000000Z', "That sounds awesome! I'd love to learn more about those trails. Thanks!"),
  (1, 2, '2023-07-22T16:45:00.000000000Z', "Sure, I'll send you some links and tips later. Excited for your trip!"),
  (2, 1, '2023-07-22T17:00:00.000000000Z', "Thanks, m2nky! You're the best. I'll catch up with you later."),
  (1, 2, '2023-07-22T17:15:00.000000000Z', 'No problem. Enjoy the rest of your day, 7Eleven! Talk to you soon!'),
  (2, 1, '2023-07-22T17:30:00.000000000Z', 'You too, m2nky! Take care and have fun on your nature adventures!');

 -- Dummy chat messages between Isabella (User ID: 3) and others - 2 to 6 messages
INSERT INTO "chat" ("userId", "receiverId", "datesent", "message") 
VALUES 
  (3, 1, '2023-07-22T14:50:00.000000000Z', 'Hello m2nky, how are you doing today?'),
  (1, 3, '2023-07-22T14:55:00.000000000Z', "Hi Isabella, I'm doing well. How about you?"),
  (3, 2, '2023-07-22T15:20:00.000000000Z', "Hey 7Eleven, I heard you're into computers. Can you help me choose some hardware for my setup?"),
  (2, 3, '2023-07-22T15:25:00.000000000Z', "Of course, Isabella! I'd be happy to help. What are you looking to upgrade?"),
  (3, 1, '2023-07-22T15:45:00.000000000Z', "m2nky, it's been a while since we caught up. How's life treating you?"),
  (1, 3, '2023-07-22T15:50:00.000000000Z', "Hey Isabella, life's good. Busy with work, but also enjoying some outdoor adventures."),
  (3, 1, '2023-07-22T16:10:00.000000000Z', 'That sounds great! I miss our outdoor adventures. We should plan one soon.'),
  (1, 3, '2023-07-22T16:20:00.000000000Z', "Definitely! Let's find a date that works for both of us and explore nature again."),
  (3, 2, '2023-07-22T16:40:00.000000000Z', '7Eleven, thanks for helping me with the computer specs. I appreciate it!'),
  (2, 3, '2023-07-22T16:45:00.000000000Z', "You're welcome, Isabella! Feel free to reach out anytime if you need further assistance."),
  (3, 1, '2023-07-22T17:00:00.000000000Z', "m2nky, it's getting late here. Have a good night!"),
  (1, 3, '2023-07-22T17:05:00.000000000Z', 'Good night, Isabella! Take care and get some rest. Talk to you soon!');

-- Dummy posts for users
INSERT INTO "posts" ("userId", "title", "content", "categoryId", "date") 
VALUES 
  (1, 'Exploring Nature''s Beauty', 'Today, I went on a hiking trip and witnessed the mesmerizing beauty of nature. The scenery was breathtaking!', 1, '2023-07-22T10:00:00.000000000Z'),
  (2, 'My Favorite Software Tools', 'As a software developer, I rely on some fantastic tools to streamline my work. Here are my top picks!', 2, '2023-07-22T12:00:00.000000000Z'),
  (3, 'Upgrading My Hardware Setup', 'I recently upgraded my computer''s hardware, and the performance boost is incredible!', 3, '2023-07-22T14:00:00.000000000Z');
