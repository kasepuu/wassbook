package groups

import (
	"fmt"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func CreateGroup(group Group) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO groups (name, ownerId, description) VALUES (?,?,?)")
	// currentTime := time.Now().Format(time.RFC3339)
	if err != nil {
		return err
	}
	result, err := statement.Exec(group.Name, group.OwnerId, group.Description)
	groupId, _ := result.LastInsertId()
	if err != nil {
		return err
	}

	err = CreateMember(group.OwnerId, int(groupId), "accepted") // when creating group add creator as member

	return err
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

func CreateMember(userId, groupId int, status string) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO groupMember (groupId, userId, status) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}

	_, err = statement.Exec(groupId, userId, status)

	return err
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
	var groups []Group

	rows, err := sqlDB.DataBase.Query("select groups.id, groups.name, groups.description, fname || \" \" || lname as owner, ownerId from groups left join users on groups.ownerId = users.id")
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var group Group
		rows.Scan(
			&group.Id,
			&group.Name,
			&group.Description,
			&group.Owner,
			&group.OwnerId,
		)
		groups = append(groups, group)
	}

	return groups, err
}

func GetGroup(id int) (Group, error) {
	var group Group

	err := sqlDB.DataBase.QueryRow(`
	select
		groups.id,
		groups.name, 
		groups.description, 
		fname || " " || lname as owner, 
		ownerId 
	from groups left join users 
	on groups.ownerId = users.id where groups.id = ?
	`, id).Scan(
		&group.Id,
		&group.Name,
		&group.Description,
		&group.Owner,
		&group.OwnerId,
	)
	if err != nil {
		return group, err
	}

	group.Events, group.Members = GetGroupEventsAndMembers(id)

	return group, err
}

func GetGroupEventsAndMembers(id int) ([]Event, []UserStruct) {
	var members []UserStruct
	var events []Event

	memberRows, err := sqlDB.DataBase.Query("select users.id, users.nickname from groupmember left join users on groupmember.userId = users.id where groupid = ?", id)
	if err != nil {
		fmt.Println(err.Error())
	}

	for memberRows.Next() {
		var member UserStruct
		memberRows.Scan(
			&member.Id,
			&member.Username,
		)
		members = append(members, member)
	}

	eventRows, err := sqlDB.DataBase.Query("select events.id, events.name, events.date, events.description, ownerId, nickname from events left join users on events.ownerId = users.id where groupId = ?", id)
	if err != nil {
		fmt.Println(err.Error())
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

	return events, members
}

func SavePost(post Post) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO posts (userId, date, content, groupId, filename) VALUES (?,?,?,?)")
	currentTime := time.Now().Format("29.08.2023 14:35")
	if err != nil {
		return err
	}
	_, err = statement.Exec(post.UserId, currentTime, post.Content, post.GroupId, post.Filename)
	// groupId, _ := result.LastInsertId()
	// if err != nil {
	// 	return err
	// }

	return err
}

func GetPosts(userId int) ([]Post, error) {
	var err error
	var posts []Post

	rows, err := sqlDB.DataBase.Query(
		`select posts.id, posts.userid, posts.date, posts.content, posts.groupId, posts.filename, users.nickname, groups.name
		from posts 		
			left join users on posts.userid=users.id
			left join groups on posts.groupId = groups.id
			left join groupMember on groupMember.userId = posts.userId
		where not posts.groupId = -1 and groupMember.userId =?
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
	var comments []Comment

	rows, err := sqlDB.DataBase.Query(
		`select comments.id, comments.userid, comments.postId, comments.content, comments.date, comments.filename, groupId, users.nickname 
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
		)
		comments = append(comments, comment)
	}

	return comments, err
}
