package handler

import (
	"strings"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

type UserInfo struct {
	UserID      int
	UserName    string
	FirstName   string
	LastName    string
	DateOfBirth []string
	DateJoined  string
	Email       string
	Avatar      string
	Description string
	Following   int
	Followers   int
}

func getUserID(UserName string) (UserID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE nickname = ? OR email = ?", UserName, UserName).Scan(&UserID)
	return UserID
}
func getUserName(UserID int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT nickname FROM users WHERE id = ?", UserID).Scan(&UserName)
	return UserName
}

func fetchUserInformation(UserID int) (User UserInfo) {
	User.UserID = UserID
	User.UserName = getUserName(UserID)

	var DateOfBirthFormatted string

	sqlDB.DataBase.QueryRow(`SELECT 
	id, nickname, fname, lname, dateofbirth, datejoined, email, avatar, description, following, followers	
	FROM users WHERE id = ?`, UserID).Scan(&User.UserID, &User.UserName, &User.FirstName, &User.LastName, &DateOfBirthFormatted, &User.DateJoined, &User.Email, &User.Avatar, &User.Description, &User.Following, &User.Followers)

	User.DateOfBirth = strings.Split(DateOfBirthFormatted, ".")

	return User
}

/* func getAllUsers(uid int) (users []UserResponse) {
	rows, _ := sqlDB.DataBase.Query("SELECT id, username FROM users WHERE id != ? ORDER BY username", uid)
	defer rows.Close()
	for rows.Next() {
		var user UserResponse
		rows.Scan(&user.UserID, &user.UserName)
		user.Status = getOnlineStatus(user.UserID)
		users = append(users, user)
	}
	users = sortByLastMessage(users, uid)
	return
}
 */