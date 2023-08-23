package handler

import (
	"encoding/json"
	"log"
	"net/http"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func Savepost(w http.ResponseWriter, r *http.Request) {
	var PostData PostForm
	log.Println("Request Headers:", r.Header)
	log.Println("Request Body:", r.Body)

	err := json.NewDecoder(r.Body).Decode(&PostData)
	if err != nil {
		log.Println("Error while decoding PostData:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	statement, errS := sqlDB.DataBase.Prepare("INSERT INTO posts (userId, fname, lname, date, content, groupId) VALUES (?,?,?,?,?,?)")
	if errS != nil {
		log.Println("SQL preparation error:", errS)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer statement.Close() // Close the prepared statement when done

	_, errExec := statement.Exec(
		PostData.OriginalPosterID,
		PostData.FirstName,
		PostData.LastName,
		PostData.Date,
		PostData.Content,
		PostData.GroupID,
	)
	if errExec != nil {
		log.Println("SQL execution error:", errExec)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Post saved successfully!"))
}
