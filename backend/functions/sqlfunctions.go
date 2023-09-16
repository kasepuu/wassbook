package function

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

type UserInfo struct {
	UserID        int
	UserName      string
	FirstName     string
	LastName      string
	DateOfBirth   []string
	DateJoined    string
	Email         string
	Avatar        string
	Description   string
	FollowStatus  string
	PrivateStatus int
}

func GetUserID(UserName string) (UserID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE LOWER(nickname) = LOWER(?) OR LOWER(email) = LOWER(?)", UserName, UserName).Scan(&UserID)
	return UserID
}

func GetUserName(UserID int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT nickname FROM users WHERE id = ?", UserID).Scan(&UserName)
	return UserName
}

func GetUserIdFomMessage(User string) (userID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE username = ?", User).Scan(&userID)
	return
}

func SaveFollow(UserID int, ReceiverID int, Status string) {
	if FollowStatus(UserID, ReceiverID) != "following" || FollowStatus(UserID, ReceiverID) != "pending" {
		row, err := sqlDB.DataBase.Prepare(`INSERT INTO followers (userid, targetid, status) 
	VALUES (?, ?, ?)`)
		if err != nil {
			log.Println("followstatus sql query error:", err)
			return
		}
		_, execError := row.Exec(UserID, ReceiverID, Status)
		if execError != nil {
			log.Println("followstatus sql exec error:", execError)
		}
	}
}

func SaveNotification(UserID int, ReceiverID int, Type string) {
	row, err := sqlDB.DataBase.Prepare(`INSERT INTO notifications (userid, receiverid, type) 
	VALUES (?, ?, ?)`)
	if err != nil {
		log.Println("notification sql query error:", err)
		return
	}
	_, execError := row.Exec(UserID, ReceiverID, Type)
	if execError != nil {
		log.Println("notification sql exec error:", execError)
	}
}

func GetFirstAndLastName(UserID int) (User UserInfo, err error) {
	User.UserID = UserID
	User.UserName = GetUserName(UserID)

	var DateOfBirthFormatted string

	err = sqlDB.DataBase.QueryRow("SELECT fname, lname FROM users WHERE id = ?", UserID).Scan(&User.FirstName, &User.LastName)
	User.DateOfBirth = strings.Split(DateOfBirthFormatted, ".")
	return User, err
}

func FollowStatus(UserID int, TargetID int) (status string) {
	sqlDB.DataBase.QueryRow("SELECT status FROM followers WHERE userid = ? AND targetid = ?",
		UserID, TargetID).Scan(&status)
	return
}

func UpdatePrivateStatus(userID int, newPrivateValue int) error {
	_, err := sqlDB.DataBase.Exec("UPDATE users SET private = ? WHERE id = ?", newPrivateValue, userID)
	if err != nil {
		return err
	}
	return nil
}

func UpdateUserDescription(UserID int, newDescription string) error {
	_, err := sqlDB.DataBase.Exec("UPDATE users SET description = ? WHERE id = ?", newDescription, UserID)
	if err != nil {
		return err
	}
	return nil
}

func UpdateUsername(UserID int, newUsername string) error {
	_, err := sqlDB.DataBase.Exec("UPDATE users SET nickname = ? WHERE id = ?", newUsername, UserID)
	if err != nil {
		return err
	}
	return nil
}

func FetchUsersWithFollowStatus(targetID int, status string) (Users []int, err error) {
	// two types of status: following, pending
	if status != "following" && status != "pending" {
		return nil, errors.New("invalid status")
	}

	rows, queryErr := sqlDB.DataBase.Query("SELECT userid FROM followers WHERE status = ? AND targetid = ?", status, targetID)
	if queryErr != nil {
		log.Println("[Followers] - something went wrong while trying to QUERY:", queryErr)
		return nil, queryErr
	}
	defer rows.Close()

	for rows.Next() {
		var userid int
		if scanErr := rows.Scan(&userid); scanErr != nil {
			return nil, scanErr
		}
		Users = append(Users, userid)
	}

	return Users, nil
}

func FetchUserInformation(UserID int, RequesterID int) (User UserInfo, fetchErr error) {
	User.UserID = UserID
	User.UserName = GetUserName(UserID)

	var DateOfBirthFormatted string

	fetchErr = sqlDB.DataBase.QueryRow(`SELECT id, nickname, fname, lname, dateofbirth, datejoined, email, avatar, description, private FROM users WHERE id = ?`, UserID).Scan(
		&User.UserID,
		&User.UserName,
		&User.FirstName,
		&User.LastName,
		&DateOfBirthFormatted,
		&User.DateJoined,
		&User.Email,
		&User.Avatar,
		&User.Description,
		&User.PrivateStatus,
	)
	User.FollowStatus = FollowStatus(RequesterID, User.UserID)
	User.DateOfBirth = strings.Split(DateOfBirthFormatted, " ")

	inputDate := User.DateJoined

	parsedTime, err := time.Parse(time.RFC3339Nano, inputDate)
	if err != nil {
		fmt.Println("Error parsing date:", err)
		return
	}

	estonianLocation, _ := time.LoadLocation("Europe/Tallinn")
	formattedDate := parsedTime.In(estonianLocation).Format("02.01.2006 15:04:05")
	User.DateJoined = formattedDate

	return User, fetchErr
}

func FetchAllUsers(filter string) (users []UserInfo, returnErr error) {
	query := "SELECT id FROM users"

	var rows *sql.Rows
	var sqlErr error

	if filter != "" {
		query += " WHERE fname LIKE ? OR lname LIKE ? OR nickname LIKE ?"
		filterValue := "%" + filter + "%"
		rows, sqlErr = sqlDB.DataBase.Query(query, filterValue, filterValue, filterValue)
	} else {
		return users, returnErr
		// rows, sqlErr = sqlDB.DataBase.Query(query)
	}
	if sqlErr != nil {
		log.Println("sql error at fetchAllUsers:", sqlErr)
		return users, returnErr
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			log.Println("error scanning user ID:", err)
			continue
		}

		user, err := GetFirstAndLastName(id)
		if err != nil {
			log.Println("error fetching user information:", err)
			continue
		}

		users = append(users, user)
	}

	return users, nil
}

func GetOnlineUsers() (onlineUsers []int) {
	rows, _ := sqlDB.DataBase.Query("SELECT userId FROM session")

	defer rows.Close()

	for rows.Next() {

		var id int
		rows.Scan(&id)
		onlineUsers = append(onlineUsers, id)
	}

	return onlineUsers
}

/*non-sql (o.o)*/
func RemoveFromSlice(slice []int, element int) []int {
	var result []int
	for _, item := range slice {
		if item != element {
			result = append(result, item)
		}
	}
	return result
}

func GetAllUsers(uid int) (users []UserResponse) {
	rows, _ := sqlDB.DataBase.Query("SELECT id, username FROM users WHERE id != ? ORDER BY username", uid)
	defer rows.Close()
	for rows.Next() {
		var user UserResponse
		rows.Scan(&user.UserID, &user.UserName)
		user.Status = GetOnlineStatus(user.UserID)
		users = append(users, user)
	}
	users = SortByLastMessage(users, uid)
	return
}

func SortByLastMessage(users []UserResponse, uid int) (sortedUsers []UserResponse) {
	sql := `SELECT messageid FROM chat WHERE (userid = ? AND receiverid = ?) OR
	(receiverid = ? AND userid = ?) ORDER BY messageid DESC LIMIT 1`

	for i := 0; i < len(users); i++ {
		rows, err := sqlDB.DataBase.Query(sql, uid, users[i].UserID, uid, users[i].UserID)
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()

		if rows.Next() {
			var user UserResponse

			user.UserID = users[i].UserID
			user.UserName = users[i].UserName
			user.Status = users[i].Status

			rows.Scan(&user.LastMessageID)

			sortedUsers = append(sortedUsers, user)
		} else {
			sortedUsers = append(sortedUsers, users[i])
		}
	}
	sort.Slice(sortedUsers, func(i, j int) bool {
		return sortedUsers[i].LastMessageID > sortedUsers[j].LastMessageID
	})

	return
}

func GetOnlineStatus(userId int) (isOnline bool) {
	isOnline = false
	var onlineUsersArray []int // sisaldab userid'sid
	for o := 0; o < len(onlineUsersArray); o++ {
		if onlineUsersArray[o] == userId {
			isOnline = true
			return isOnline
		}
	}
	return isOnline
}

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

	err = CreateGroupMember(group.OwnerId, int(groupId), "accepted") // when creating group add creator as member

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

func CreateGroupMember(userId, groupId int, status string) error {
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
			&member.UserID,
			&member.UserName,
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

func SaveGroupPost(post PostResponse) error {
	var err error
	statement, err := sqlDB.DataBase.Prepare("INSERT INTO posts (userId, date, content, groupId, filename) VALUES (?,?,?,?)")
	currentTime := time.Now().Format("29.08.2023 14:35")
	if err != nil {
		return err
	}
	_, err = statement.Exec(post.OriginalPosterID, currentTime, post.Content, post.GroupId, post.Filename)
	// groupId, _ := result.LastInsertId()
	// if err != nil {
	// 	return err
	// }

	return err
}

func GetGroupPosts(id int) ([]GroupPost, error) {
	var err error
	var posts []GroupPost

	rows, err := sqlDB.DataBase.Query(
		`select posts.id, posts.userid, posts.date, posts.content, posts.groupId, posts.filename, users.nickname, groups.name
		from posts 		
			left join users on posts.userid=users.id
			left join groups on posts.groupId = groups.id
			left join groupMember on groupMember.userId = posts.userId
		where not posts.groupId = -1 and groupMember.userId =? `, id)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var post GroupPost
		rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Date,
			&post.Content,
			&post.GroupId,
			&post.Filename,
			&post.Owner,
			&post.GroupName,
		)
		posts = append(posts, post)
	}

	return posts, err
}

func GetMutualFollowers(userID int) ([]MutualFollower, error) {
	var followers []MutualFollower

	/*	query2 := `
	    SELECT f1.*
	    FROM followers f1
	    INNER JOIN followers f2 ON f1.userid = f2.targetid AND f1.targetid = f2.userid
	    WHERE f1.status = 'following' AND f2.status = 'following'
	`*/

	query := `SELECT DISTINCT f1.*
	FROM followers f1, followers f2
	WHERE f1.userid = f2.targetid
	  AND f1.targetid = f2.userid
	  AND f1.status = 'following'
	  AND f2.status = 'following'
	`

	rows, err := sqlDB.DataBase.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var userid int
		var targetid int
		var status string

		err := rows.Scan(&id, &userid, &targetid, &status)
		if err != nil {
			return nil, err
		}
		if userid != userID {
			followers = append(followers, MutualFollower{UserId: userid, UserName: GetUserName(userid)})
		}
	}
	return followers, nil
}

// func GetCategories() []Category {
// 	var categories []Category
// 	rows, err := DataBase.Query("select * from category")
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	for rows.Next() {
// 		var category Category
// 		rows.Scan(
// 			&category.Id,
// 			&category.Name,
// 		)
// 		categories = append(categories, category)
// 	}

// 	return categories
// }
