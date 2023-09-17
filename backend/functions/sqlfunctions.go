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

func GetMutualFollowers(userID int) ([]MutualFollower, error) {
	var followers []MutualFollower

	/*	query2 := `
	    SELECT f1.*
	    FROM followers f1
	    INNER JOIN followers f2 ON f1.userid = f2.targetid AND f1.targetid = f2.userid
	    WHERE f1.status = 'following' AND f2.status = 'following'
	`*/

	query := `SELECT DISTINCT f1.userid
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
