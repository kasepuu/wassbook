package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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
	FollowStatus  string //Praegu kustutasin followerid täiesti ära aga kui followerite arvu või kes followib tagasi saadaks oleks lahe küll. Vb saab kuskil mujal seda teha?
	PrivateStatus int
}

func getUserID(UserName string) (UserID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE LOWER(nickname) = LOWER(?) OR LOWER(email) = LOWER(?)", UserName, UserName).Scan(&UserID)
	return UserID
}
func getUserName(UserID int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT nickname FROM users WHERE id = ?", UserID).Scan(&UserName)
	return UserName
}

func SaveFollow(UserID int, ReceiverID int, Status string) {
	if followStatus(UserID, ReceiverID) != "following" || followStatus(UserID, ReceiverID) != "pending" {
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

func getFirstAndLastName(UserID int) (User UserInfo, err error) {
	User.UserID = UserID
	User.UserName = getUserName(UserID)

	var DateOfBirthFormatted string

	err = sqlDB.DataBase.QueryRow("SELECT fname, lname FROM users WHERE id = ?", UserID).Scan(&User.FirstName, &User.LastName)
	User.DateOfBirth = strings.Split(DateOfBirthFormatted, ".")
	return User, err

}

func followStatus(UserID int, TargetID int) (status string) {
	sqlDB.DataBase.QueryRow("SELECT status FROM followers WHERE userid = ? AND targetid = ?",
		UserID, TargetID).Scan(&status)
	return
}

func updatePrivateStatus(userID int, newPrivateValue int) error {
	_, err := sqlDB.DataBase.Exec("UPDATE users SET private = ? WHERE id = ?", newPrivateValue, userID)
	if err != nil {
		return err
	}
	return nil
}

func UpdatePrivateStatusHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID          int `json:"userID"`
		NewPrivateValue int `json:"newPrivateValue"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	// Assuming you have a function to update the private status in your database
	err = updatePrivateStatus(request.UserID, request.NewPrivateValue)
	if err != nil {
		http.Error(w, "Failed to update private status", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "Private status updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func fetchUserInformation(UserID int, RequesterID int) (User UserInfo, fetchErr error) {
	User.UserID = UserID
	User.UserName = getUserName(UserID)

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
	User.FollowStatus = followStatus(RequesterID, User.UserID)
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

// func getUserDescription(UserID int) (description string, err error) {
// 	err = sqlDB.DataBase.QueryRow("SELECT description FROM users WHERE id = ?", UserID).Scan(&description)
// 	return description, err
// }

func updateUserDescription(UserID int, newDescription string) error {
	_, err := sqlDB.DataBase.Exec("UPDATE users SET description = ? WHERE id = ?", newDescription, UserID)
	if err != nil {
		return err
	}
	return nil
}

func UpdateUserDescriptionHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID         int    `json:"userID"`
		NewDescription string `json:"newDescription"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	// Assuming you have a function to update the user's description in your database
	err = updateUserDescription(request.UserID, request.NewDescription)
	if err != nil {
		http.Error(w, "Failed to update user description", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "User description updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
