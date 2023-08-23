package handler

import (
	"database/sql"
	"log"
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
	Friends     bool // vb ple vaja
}

func getUserID(UserName string) (UserID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE LOWER(nickname) = LOWER(?) OR LOWER(email) = LOWER(?)", UserName, UserName).Scan(&UserID)
	return UserID
}
func getUserName(UserID int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT nickname FROM users WHERE id = ?", UserID).Scan(&UserName)
	return UserName
}

func fetchUserInformation(UserID int) (User UserInfo, fetchErr error) {
	User.UserID = UserID
	User.UserName = getUserName(UserID)

	var DateOfBirthFormatted string

	fetchErr = sqlDB.DataBase.QueryRow(`SELECT 
	id, nickname, fname, lname, dateofbirth, datejoined, email, avatar, description, following, followers	
	FROM users WHERE id = ?`, UserID).Scan(&User.UserID, &User.UserName, &User.FirstName, &User.LastName, &DateOfBirthFormatted, &User.DateJoined, &User.Email, &User.Avatar, &User.Description, &User.Following, &User.Followers)

	User.DateOfBirth = strings.Split(DateOfBirthFormatted, ".")

	return User, fetchErr
}

func fetchAllUsers(filter string) (users []UserInfo, returnErr error) {
	query := "SELECT id FROM users"

	var rows *sql.Rows
	var sqlErr error

	if filter != "" {
		query += " WHERE fname LIKE ? OR lname LIKE ?"
		filterValue := "%" + filter + "%"
		rows, sqlErr = sqlDB.DataBase.Query(query, filterValue, filterValue)
	} else {
		rows, sqlErr = sqlDB.DataBase.Query(query)
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

		user, err := fetchUserInformation(id)
		if err != nil {
			log.Println("error fetching user information:", err)
			continue
		}

		users = append(users, user)
	}

	return users, nil
}
