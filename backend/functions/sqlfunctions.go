package function

import (
	"database/sql"
	"log"
	"sort"
	"strings"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
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

func GetUserCredential(UserID int, column string) (credential string) {
	query := "SELECT " + column + "FROM users WHERE id = ?"
	sqlDB.DataBase.QueryRow(query, UserID).Scan(&credential)
	return credential
}

func GetGroupNameByID(GroupID int, Type string) (GroupName string) {
	// name || tag
	query := "SELECT " + Type + " FROM groups WHERE id = ?"
	sqlDB.DataBase.QueryRow(query, GroupID).Scan(&GroupName)
	return GroupName
}

func GetUserIdFomMessage(User string) (UserID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE username = ?", User).Scan(&UserID)
	return UserID
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

func FetchFollowRequests(targetID int, status string) (Users []int, err error) {
	// two types of status: following, pending
	// if status != "following" && status != "pending" {
	// 	return nil, errors.New("invalid status")
	// }

	sqlQuery := "SELECT userid FROM followers WHERE status = ? AND targetid = ?"
	rows, queryErr := sqlDB.DataBase.Query(sqlQuery, status, targetID)
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

	return Users, err
}

func FetchGroupJoinRequests(targetID int) (request []GroupRequest, err error) {
	// two types of status: following, pending
	status := "pending"
	sqlQuery := `
SELECT gm.userId, gm.groupId
FROM groupMember AS gm
JOIN groups AS g ON gm.groupId = g.id
WHERE gm.status = ? AND g.ownerId = ?
`
	rows, queryErr := sqlDB.DataBase.Query(sqlQuery, status, targetID)
	if queryErr != nil {
		log.Println("[Followers] - something went wrong while trying to QUERY:", queryErr)
		return nil, queryErr
	}
	defer rows.Close()

	for rows.Next() {
		var gRequest GroupRequest
		var userid, groupid int
		var userInfoErr error
		if scanErr := rows.Scan(&userid, &groupid); scanErr != nil {
			return nil, scanErr
		}

		gRequest.GroupInfo.ID = groupid
		gRequest.GroupInfo.Name = GetGroupNameByID(groupid, "tag")

		gRequest.UserInfo, userInfoErr = FetchUserInformation(userid, targetID)
		if userInfoErr != nil {
			log.Println("Error loading info for user:", userid)
			continue
		}
		request = append(request, gRequest)
	}

	return request, err
}

func FetchGroupInviteRequests(targetID int) (request []GroupRequest, err error) {
	status := "invited"
	sqlQuery := `
SELECT gm.userId, gm.groupId
FROM groupMember AS gm
JOIN groups AS g ON gm.groupId = g.id
WHERE gm.status = ?
`
	rows, queryErr := sqlDB.DataBase.Query(sqlQuery, status)
	if queryErr != nil {
		log.Println("[Followers] - something went wrong while trying to QUERY:", queryErr)
		return nil, queryErr
	}
	defer rows.Close()

	for rows.Next() {
		var gRequest GroupRequest
		var userid, groupid int
		var userInfoErr error
		if scanErr := rows.Scan(&userid, &groupid); scanErr != nil {
			return nil, scanErr
		}

		gRequest.GroupInfo.ID = groupid
		gRequest.GroupInfo.Name = GetGroupNameByID(groupid, "tag")
		gRequest.IsInvite = true

		gRequest.UserInfo, userInfoErr = FetchUserInformation(userid, targetID)
		if userInfoErr != nil {
			log.Println("Error loading info for user:", userid)
			continue
		}
		request = append(request, gRequest)
	}

	return request, err
}

func SetGroupStatus(userid int, groupid int, changeStatusTo string) error {
	query := "UPDATE groupMember SET status = ? WHERE userId = ? AND groupId = ?"

	if changeStatusTo == "remove" {
		query = "DELETE FROM groupMember WHERE userId = ? AND groupId = ?"
		_, err := sqlDB.DataBase.Exec(query, userid, groupid)
		return err
	}

	_, err := sqlDB.DataBase.Exec(query, changeStatusTo, userid, groupid)
	return err
}

func FetchUserInformation(UserID int, RequesterID int) (User UserInfo, fetchErr error) {
	User.UserID = UserID
	User.UserName = GetUserName(UserID)

	var DateOfBirthFormatted string

	fetchErr = sqlDB.DataBase.QueryRow(`SELECT id, nickname, fname, lname, dateofbirth, datejoined, email, description, private FROM users WHERE id = ?`, UserID).Scan(
		&User.UserID,
		&User.UserName,
		&User.FirstName,
		&User.LastName,
		&DateOfBirthFormatted,
		&User.DateJoined,
		&User.Email,
		&User.Description,
		&User.PrivateStatus,
	)
	User.FollowStatus = FollowStatus(RequesterID, User.UserID)
	User.DateOfBirth = strings.Split(DateOfBirthFormatted, " ")

	inputDate := User.DateJoined

	parsedTime, err := time.Parse(time.RFC3339Nano, inputDate)
	if err != nil {
		log.Println("Error parsing date:", err)
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
			log.Println("SQL error at message sorting:", err)
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

func GetGroupsInfo(userID int) (Groups []JoinedGroup) {
	rows, _ := sqlDB.DataBase.Query(`SELECT groupId FROM groupMember WHERE userId = ? AND status = 'accepted'`, userID)
	defer rows.Close()
	for rows.Next() {
		var group JoinedGroup
		rows.Scan(&group.GroupID)
		Groups = append(Groups, group)
	}
	Groups = GetGroupName(Groups, userID)
	return
}

func GetGroupMembers(groupID int) (Users []int) {
	rows, _ := sqlDB.DataBase.Query(`SELECT userId FROM groupMember WHERE status = 'accepted' AND groupId = ?`, groupID)
	defer rows.Close()
	for rows.Next() {
		var uid int
		rows.Scan(&uid)
		Users = append(Users, uid)
	}

	return Users
}

func GetGroupName(Groups []JoinedGroup, userID int) []JoinedGroup {
	var newGroupInfo []JoinedGroup
	for _, group := range Groups {
		sqlDB.DataBase.QueryRow(`SELECT name, id FROM groups WHERE id = ?`, group.GroupID).Scan(&group.GroupName, &group.GroupID)
		group.UserId = userID
		group.OtherMembers = GetOtherGroupMemebers(group.GroupID, userID)
		newGroupInfo = append(newGroupInfo, group)
	}

	return newGroupInfo
}

func GetGroupOwnerID(GroupID int) (ownerId int) {
	sqlDB.DataBase.QueryRow("SELECT ownerId FROM groups WHERE id = ?", GroupID).Scan(&ownerId)
	return ownerId
}

func GetOtherGroupMemebers(GroupID int, UserID int) (MemberIDs []int) {
	rows, _ := sqlDB.DataBase.Query(`SELECT userId FROM groupMember WHERE groupId = ? AND userId != ?`, GroupID, UserID)
	defer rows.Close()
	for rows.Next() {
		var memberID int
		rows.Scan(&memberID)
		MemberIDs = append(MemberIDs, memberID)
	}
	return
}

func GetMutualFollowers(userID int) ([]MutualFollower, error) {
	var followers []MutualFollower
	query := `
	SELECT f1.targetid
	FROM followers f1
	INNER JOIN followers f2 ON f1.userid = f2.targetid AND f1.targetid = f2.userid
	WHERE f1.status = 'following' AND f2.status = 'following' and f1.userid = ?
	`

	rows, err := sqlDB.DataBase.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var userid int
		err := rows.Scan(&userid)
		if err != nil {
			return nil, err
		}
		if userid != userID {
			followers = append(followers, MutualFollower{UserId: userid, UserName: GetUserName(userid)})
		}
	}

	return followers, nil
}

func GetProfileFollowers(userID int) ([]MutualFollower, error) {
	var followers []MutualFollower
	query := `
	SELECT DISTINCT followers.userid, users.nickname
	FROM followers
	LEFT JOIN users ON followers.userid = users.id
	WHERE followers.targetid = ?;
	`

	rows, err := sqlDB.DataBase.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var userId int
		var userName string
		err := rows.Scan(&userId, &userName)
		if err != nil {
			return nil, err
		}
		followers = append(followers, MutualFollower{UserId: userId, UserName: userName})
	}

	return followers, nil
}

func GetProfileFollowing(userID int) ([]MutualFollower, error) {
	var followers []MutualFollower
	query := `
	SELECT DISTINCT followers.targetid, users.nickname
	FROM followers
	LEFT JOIN users ON followers.targetid = users.id
	WHERE followers.userid = ?;
	`

	rows, err := sqlDB.DataBase.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var userId int
		var userName string
		err := rows.Scan(&userId, &userName)
		if err != nil {
			return nil, err
		}
		followers = append(followers, MutualFollower{UserId: userId, UserName: userName})
	}

	return followers, nil
}

func SetFollowStatus(RequesterID int, TargetID int, changeStatusTo string, changeStatusFrom string) error {
	// SetFollowStatus(RequesterID, TargetID, "following", "pending")
	// SetFollowStatus(RequesterID, TargetID, "remove", "pending")
	query := "UPDATE followers SET status = ? WHERE userid = ? AND targetid = ? AND status = ?"

	if changeStatusTo == "remove" {
		query = "DELETE FROM followers WHERE userid = ? AND targetid = ? AND status = ?"
		_, err := sqlDB.DataBase.Exec(query, RequesterID, TargetID, changeStatusFrom)
		return err
	}

	_, err := sqlDB.DataBase.Exec(query, changeStatusTo, RequesterID, TargetID, changeStatusFrom)
	if err != nil {
		return err
	}

	return nil
}

func SaveNotification(TargetID int, SenderID int, description string) error {
	row, err := sqlDB.DataBase.Prepare(`INSERT INTO notifications (targetid, senderid, description) 
	VALUES (?, ?, ?)`)
	if err != nil {
		log.Println("notification sql query error:", err)
		return err
	}

	_, execError := row.Exec(TargetID, SenderID, description)
	if execError != nil {
		log.Println("notification sql exec error:", execError)
	}

	return nil
}

func RemoveNotification(TargetID int, SenderID int, descriptionSlice string) error {
	row, err := sqlDB.DataBase.Prepare(`
		DELETE FROM notifications 
		WHERE targetid = ? 
		AND senderid = ? 
		AND description LIKE '%' || ? || '%'
	`)

	if err != nil {
		log.Println("remove notification sql query error:", err)
		return err
	}

	_, execError := row.Exec(TargetID, SenderID, descriptionSlice)
	if execError != nil {
		log.Println("remove notification sql exec error:", execError)
	}

	return nil
}

func ClearNotification(notificationID int, TargetID int, clearAll bool) error {
	var query string
	var args []interface{}
	if clearAll {
		query = "DELETE FROM notifications WHERE TargetID = ?"
		args = []interface{}{TargetID}
	} else {
		query = "DELETE FROM notifications WHERE ID = ? AND TargetID = ?"
		args = []interface{}{notificationID, TargetID}
	}

	_, err := sqlDB.DataBase.Exec(query, args...)
	if err != nil {
		log.Println("notification sql exec error:", err)
		return err
	}

	return nil
}

func LoadNotifications(TargetID int) ([]Notification, error) {
	rows, err := sqlDB.DataBase.Query("SELECT id, targetid, senderid, description FROM notifications WHERE TargetID = ?", TargetID)
	if err != nil {
		log.Println("notification sql query error:", err)
		return nil, err
	}
	defer rows.Close()

	notifications := []Notification{}

	for rows.Next() {
		var notification Notification
		if err := rows.Scan(&notification.ID, &notification.TargetID, &notification.SenderID, &notification.Description); err != nil {
			log.Println("notification scan error:", err)
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	if err := rows.Err(); err != nil {
		log.Println("notification rows error:", err)
		return nil, err
	}

	return notifications, nil
}
