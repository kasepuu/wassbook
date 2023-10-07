package groups

import (
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func GetUsers() ([]User, error) {
	var err error
	users := []User{}

	rows, err := sqlDB.DataBase.Query("select id, nickname as username, fname as firstname, lname as lastname, email from users")
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		user := User{}
		rows.Scan(
			&user.Id,
			&user.Username,
			&user.Firstname,
			&user.Lastname,
		)
		users = append(users, user)
	}

	return users, err
}

func CreateGroup(group Group) ([]Group, error) {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO groups (name, tag, ownerId, description) VALUES (?,?,?,?)")
	// currentTime := time.Now().Format(time.RFC3339)
	if err != nil {
		return nil, err
	}
	result, err := statement.Exec(group.Name, group.Tag, group.OwnerId, group.Description)
	groupId, _ := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	_, err = CreateMember(GroupInvite{ReceiverId: group.OwnerId, GroupId: int(groupId), Status: "accepted"}) // when creating group add creator as member
	if err != nil {
		return nil, err
	}

	groups, err := GetGroups()
	return groups, err
}

func CreateEvent(event Event) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO events (name, ownerId,groupId, description, date) VALUES (?,?,?, ?, ?)")
	if err != nil {
		return err
	}

	_, err = statement.Exec(event.Name, event.OwnerId, event.GroupId, event.Description, event.Date)

	return err
}

func CreateMember(invite GroupInvite) (int64, error) {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT OR REPLACE INTO groupMember (groupId, userId, status) VALUES (?, ?, ?)")
	if err != nil {
		return -1, err
	}

	result, err := statement.Exec(invite.GroupId, invite.ReceiverId, invite.Status)

	id, _ := result.LastInsertId()

	if err != nil {
		return -1, err
	}
	return id, err
}

func CreateEventMember(userId, eventId int, status string) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO eventMember (eventId, userId, status) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}

	_, err = statement.Exec(eventId, userId, status)

	return err
}

func GetGroups() ([]Group, error) {
	var err error
	groups := []Group{}

	rows, err := sqlDB.DataBase.Query("select groups.id, groups.name, groups.tag ,groups.description, fname || \" \" || lname as owner, ownerId from groups left join users on groups.ownerId = users.id")
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var group Group
		rows.Scan(
			&group.Id,
			&group.Name,
			&group.Tag,
			&group.Description,
			&group.Owner,
			&group.OwnerId,
		)
		groups = append(groups, group)
	}

	return groups, err
}

func GetGroupPosts(groupId int) ([]Post, error) {
	posts := []Post{}

	memberRows, err := sqlDB.DataBase.Query(`
	select posts.id, posts.userid, posts.date, posts.content, posts.groupId, posts.filename, users.nickname, groups.name, posts.fname, posts.lname
	from posts 
		left join users on posts.userid=users.id
		left join groups on posts.groupId = groups.id
	where groupId =  ? order by posts.id DESC`, groupId)
	if err != nil {
		return []Post{}, err
	}
	for memberRows.Next() {
		var post Post
		memberRows.Scan(
			&post.Id,
			&post.UserId,
			&post.Date,
			&post.Content,
			&post.GroupId,
			&post.Filename,
			&post.Username,
			&post.GroupName,
			&post.FirstName,
			&post.LastName,
		)
		comments, err := GetComments(post.Id)
		if err != nil {
			return []Post{}, err
		}

		post.Comments = comments

		posts = append(posts, post)
	}
	return posts, err
}

func GetGroup(groupId int) (Group, error) {
	group := Group{}

	err := sqlDB.DataBase.QueryRow(`
	select
		groups.id,
		groups.name,
		groups.tag, 
		groups.description, 
		fname || " " || lname as owner, 
		ownerId 
	from groups left join users 
	on groups.ownerId = users.id where groups.id = ?
	`, groupId).Scan(
		&group.Id,
		&group.Name,
		&group.Tag,
		&group.Description,
		&group.Owner,
		&group.OwnerId,
	)
	if err != nil {
		return group, err
	}

	group.AllUsers, err = GetAllMembers(groupId)

	if err != nil {
		return group, err
	}

	group.Events, group.Members, err = GetGroupEventsAndMembers(groupId)

	if err != nil {
		return group, err
	}

	group.Posts, err = GetGroupPosts(groupId)

	return group, err
}

func GetAllMembers(id int) ([]User, error) {
	users := []User{}

	query := `SELECT 
users.id, 
users.nickname, 
users.fname, 
users.lname, 
users.datejoined, 
users.email, 
IFNULL(groupMember.status, 'null') AS status 
FROM 
users 
LEFT JOIN 
groupMember 
ON 
users.id = groupMember.userId 
AND 
groupMember.groupId = ?`

	rows, err := sqlDB.DataBase.Query(query, id)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.Id,
			&user.Username,
			&user.Firstname,
			&user.Lastname,
			&user.Date,
			&user.Email,
			&user.Status,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	defer rows.Close()

	return users, nil
}

func GetGroupEventsAndMembers(id int) ([]Event, []User, error) {
	var members []User
	events := []Event{}

	rows, err := sqlDB.DataBase.Query(`
	select 				
		groupMember.status, 		
		users.id, 
		fname , 
		lname , 
		users.nickname
	from groupMember left join users on groupMember.userId = users.id 
	where groupMember.groupid=? and status = "accepted" `, id)
	if err != nil {
		return nil, nil, err
	}

	for rows.Next() {
		var user User
		rows.Scan(
			&user.Status,
			&user.Id,
			&user.Firstname,
			&user.Lastname,
			&user.Username,
		)
		members = append(members, user)
	}

	defer rows.Close()

	eventRows, err := sqlDB.DataBase.Query("select events.id, events.name, events.date, events.description, ownerId, nickname from events left join users on events.ownerId = users.id where groupId = ?", id)
	if err != nil {
		return nil, nil, err
	}
	for eventRows.Next() {
		var event Event
		eventRows.Scan(
			&event.Id,
			&event.Name,
			&event.Date,
			&event.Description,
			&event.OwnerId,
			&event.Owner,
		)
		events = append(events, event)
	}

	defer eventRows.Close()

	return events, members, nil
}

func SavePost(post Post) ([]Post, error) {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO posts (userId, fname, lname, date, content, groupId, filename) VALUES (?,?,?,?,?,?,?)")
	currentTime := time.Now().Format(time.RFC3339)
	if err != nil {
		return nil, err
	}

	fname := function.GetUserCredential(post.UserId, "fname")
	lname := function.GetUserCredential(post.UserId, "lname")

	_, err = statement.Exec(post.UserId, fname, lname, currentTime, post.Content, post.GroupId, post.Filename)

	if err != nil {
		return nil, err
	}

	posts, err := GetGroupPosts(post.GroupId)

	return posts, err
}

func GetPosts(userId int) ([]Post, error) {
	var err error
	posts := []Post{}

	rows, err := sqlDB.DataBase.Query(
		`select posts.id, posts.userid, posts.date, posts.content, posts.groupId, posts.filename, users.nickname, groups.name, posts.fname, posts.lname
		from posts 
		LEFT JOIN users on posts.userid = users.id
		LEFT JOIN groups on posts.groupId= groups.id
		where groupId in (select groupId from groupMember where userid = ? AND status = "accepted") 
		and not posts.groupId = -1
		ORDER BY posts.id DESC `, userId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var post Post
		rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Date,
			&post.Content,
			&post.GroupId,
			&post.Filename,
			&post.Username,
			&post.GroupName,
			&post.FirstName,
			&post.LastName,
		)

		comments, err := GetComments(post.Id)
		if err != nil {
			return nil, err
		}
		post.Comments = comments

		posts = append(posts, post)
	}

	return posts, err
}

func SaveComment(comment Comment) ([]Post, error) {
	var err error
	statement, err := sqlDB.DataBase.Prepare("Insert into comments (postId, userId, content, date, filename, groupId) values (?, ?, ?, ?, ?, ?)")
	currentTime := time.Now().Format("02.01.2006 15:04")
	if err != nil {
		return nil, err
	}
	_, err = statement.Exec(comment.PostId, comment.UserId, comment.Content, currentTime, comment.Filename, comment.GroupId)

	if err != nil {
		return nil, err
	}
	posts, err := GetPosts(comment.UserId)

	return posts, err
}

func GetComments(postId int) ([]Comment, error) {
	var err error
	comments := []Comment{}

	rows, err := sqlDB.DataBase.Query(
		`select comments.id, comments.userid, comments.postId, comments.content, comments.date, comments.filename, groupId, users.nickname, users.fname, users.lname
		from comments 
			left join users on comments.userId = users.id
		where postId = ?
		ORDER BY comments.id  DESC `, postId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var comment Comment
		rows.Scan(
			&comment.Id,
			&comment.UserId,
			&comment.PostId,
			&comment.Content,
			&comment.Date,
			&comment.Filename,
			&comment.GroupId,
			&comment.Username,
			&comment.FirstName,
			&comment.LastName,
		)
		comments = append(comments, comment)
	}

	return comments, err
}

func CreateNotification(notification Notification) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("Insert into notifications (targetid, senderid, description, groupMemberId) values (?, ?, ? , ?)")
	if err != nil {
		return err
	}
	_, err = statement.Exec(notification.SenderId, notification.ReceiverId, notification.Description, notification.GroupMemberId)

	if err != nil {
		return err
	}

	return err
}
