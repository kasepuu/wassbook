package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
	// sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func Register(w http.ResponseWriter, r *http.Request) {
	// register functionality here
	var RegisterDetails RegisterForm
	err := json.NewDecoder(r.Body).Decode(&RegisterDetails)
	if err != nil {
		log.Println("Something went wrong, while decoding register details")
		return
	}

	validDetails := fieldVerification(RegisterDetails)

	if !validDetails {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Please make sure that all fields are filled."))
		return
	}

	// creating a new account
	uname := RegisterDetails.UserName
	fname := function.Title(RegisterDetails.FirstName)
	lname := function.Title(RegisterDetails.LastName)
	email := strings.ToLower(RegisterDetails.Email)
	password := RegisterDetails.Password
	dateofbirth := RegisterDetails.DateOfBirth
	datejoined := time.Now().Format(time.RFC3339Nano)
	avatar := ""
	description := ""
	privateStatus := 1 // 0 -> public, 1 -> private

	var nameExists, emailExists bool
	err1 := sqlDB.DataBase.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE lower(nickname) = lower(?))", uname).Scan(&nameExists)
	err2 := sqlDB.DataBase.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE lower(email) = lower(?))", email).Scan(&emailExists)

	if err1 != nil || err2 != nil {
		log.Println("nameExists sql error: ", err1)
		log.Println("emailExists sql error: ", err2)
		return
	}

	if nameExists || emailExists {
		responseMessage := "Bad register attempt! " + func() string {
			if nameExists {
				return "The nickname is already in use!"
			}
			return "The email is already in use!"
		}()

		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(responseMessage))
		return
	}

	row, err := sqlDB.DataBase.Prepare(`INSERT INTO users (nickname, fname, lname, dateofbirth, datejoined, password, email, avatar, description, private) 
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		log.Println("register sql query error:", err)
		return
	}

	_, execError := row.Exec(uname, fname, lname, dateofbirth, datejoined, password, email, avatar, description, privateStatus)
	if execError != nil {
		log.Println("register sql exec error:", execError)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Registration was a success!"))
	// sqlDB.DataBase.Query("INSERT INTO users")
}

func fieldVerification(details RegisterForm) bool {
	regex := regexp.MustCompile("[0-9]")
	containsNumbersInFirstName := regex.MatchString(details.FirstName)
	containsNumbersInLastName := regex.MatchString(details.LastName)

	if strings.TrimSpace(details.FirstName) != "" &&
		strings.TrimSpace(details.LastName) != "" &&
		strings.TrimSpace(details.Email) != "" &&
		strings.TrimSpace(details.Password) != "" &&
		!containsNumbersInFirstName && !containsNumbersInLastName {
		return true // return true, since the fields are not empty & FirstName/LastName do not contain any numbers
	}

	return false // empty fields found or FirstName/LastName contain numbers
}
