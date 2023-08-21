package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

type User struct {
	UserID      int
	UserName    string
	FirstName   string
	LastName    string
	DateOfBirth string
	Password    string
	Email       string
	Avatar      string
	Description string
}

func Login(w http.ResponseWriter, r *http.Request) {
	var LoginDetails LoginForm
	err := json.NewDecoder(r.Body).Decode(&LoginDetails)
	if err != nil {
		log.Println("Error while decoding loginInfo:", err)
		w.Write([]byte("Internal issue, please try again later!"))
	}

	var password string
	var userId int
	query := "SELECT id, password FROM users WHERE LOWER(nickname) = ? OR LOWER(email) = ?"
	rows, errS := sqlDB.DataBase.Query(query, strings.ToLower(LoginDetails.Login), strings.ToLower(LoginDetails.Login))
	if errS != nil {
		log.Println("SQL error:", errS)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	if rows.Next() {
		err := rows.Scan(&userId, &password)
		if err != nil {
			log.Println("Error scanning row:", err)
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Please check your password and account name and try again."))
			return
		}
	} else {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Please check your password and account name and try again."))
		return
	}

	scanErr := rows.Scan(&userId, &password)

	// on bad password or bad login
	if LoginDetails.Password != password || scanErr != nil {
		fmt.Println(userId, password)

		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Please check your password and account name and try again."))
		return
	}

	fmt.Println(LoginDetails)

	// token := jwt.New(jwt.SigningMethodHS256)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login was a success!"))
}

// protected endpoint that requires JWT token
func ProtectedJWT(w http.ResponseWriter, r *http.Request) {

}

// user ability refresh tokens
func RefreshJWT(w http.ResponseWriter, r *http.Request) {

}
