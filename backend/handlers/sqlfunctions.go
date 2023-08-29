package handler

import (
	"database/sql"
	"log"
	"strings"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

type UserInfo struct {
	UserID       int
	UserName     string
	FirstName    string
	LastName     string
	DateOfBirth  []string
	DateJoined   string
	Email        string
	Avatar       string
	Description  string
	FriendStatus string // on vajalik!!!
	//Praegu kustutasin followerid täiesti ära aga kui followerite arvu või kes followib tagasi saadaks oleks lahe küll. Vb saab kuskil mujal seda teha? 
}

func getUserID(UserName string) (UserID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE LOWER(nickname) = LOWER(?) OR LOWER(email) = LOWER(?)", UserName, UserName).Scan(&UserID)
	return UserID
}
func getUserName(UserID int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT nickname FROM users WHERE id = ?", UserID).Scan(&UserName)
	return UserName
}

func getFirstAndLastName(UserID int) (User UserInfo, err error) {
	User.UserID = UserID
	User.UserName = getUserName(UserID)

	var DateOfBirthFormatted string

	err = sqlDB.DataBase.QueryRow("SELECT fname, lname FROM users WHERE id = ?", UserID).Scan(&User.FirstName, &User.LastName)
	User.DateOfBirth = strings.Split(DateOfBirthFormatted, ".")
	return User, err
	
}

func friendStatus(UserID int, FriendID int) (status string) {
	sqlDB.DataBase.QueryRow("SELECT status FROM followers WHERE userid = ? AND friendid = ? OR userid = ? AND friendid = ?",
		UserID, FriendID, FriendID, UserID).Scan(&status)
	return
}

func fetchUserInformation(UserID int, RequesterID int) (User UserInfo, fetchErr error) {
	User.UserID = UserID
	User.UserName = getUserName(UserID)

	var DateOfBirthFormatted string

	fetchErr = sqlDB.DataBase.QueryRow(`SELECT id, nickname, fname, lname, dateofbirth, datejoined, email, avatar, description FROM users WHERE id = ?`, UserID).Scan(
		&User.UserID,
		&User.UserName,
		&User.FirstName,
		&User.LastName,
		&DateOfBirthFormatted,
		&User.DateJoined,
		&User.Email,
		&User.Avatar,
		&User.Description,
	)
	User.FriendStatus = friendStatus(User.UserID, RequesterID)
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

		user, err := getFirstAndLastName(id)
		if err != nil {
			log.Println("error fetching user information:", err)
			continue
		}

		users = append(users, user)
	}

	return users, nil
}
