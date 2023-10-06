package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var LoginDetails LoginForm
	err := json.NewDecoder(r.Body).Decode(&LoginDetails)
	if err != nil {
		log.Println("Error while decoding loginInfo:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	var password string
	var userId int
	query := "SELECT id, password FROM users WHERE LOWER(nickname) = ? OR LOWER(email) = ?"
	rows, errS := sqlDB.DataBase.Query(query, strings.ToLower(LoginDetails.Login), strings.ToLower(LoginDetails.Login))
	if errS != nil {
		log.Println("SQL error:", errS)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer rows.Close()

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

	// on bad password or bad login
	if LoginDetails.Password != password {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Please check your password and account name and try again."))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login was a success!"))
}
