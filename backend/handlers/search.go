package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func GetSearchedUsers(w http.ResponseWriter, r *http.Request) {
	rows, _ := sqlDB.DataBase.Query("SELECT id FROM users")

	defer rows.Close()

	var userIDs []int

	for rows.Next() {

		var id int
		rows.Scan(&id)
		userIDs = append(userIDs, id)
	}

	var User []UserInfo

	for i := 0; i < len(userIDs); i++ {
		mingiNimi := fetchUserInformation(userIDs[i])

		User = append(User, mingiNimi)
	}
	fmt.Println(User)

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(User)
	if err != nil {
		log.Println(err)
		return
	}

}
