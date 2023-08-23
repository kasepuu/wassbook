package handler

import (
	"encoding/json"
	"log"
	"net/http"

	// Import the necessary database driver package
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func GetPosts(w http.ResponseWriter, r *http.Request) {
	rows, err := sqlDB.DataBase.Query("SELECT * FROM posts") // Adjust the query according to your table structure
	if err != nil {
		log.Println("Error querying posts:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer rows.Close()

	var posts []PostForm
	for rows.Next() {
		var post PostForm
		err := rows.Scan(
			&post.PostID,
			&post.OriginalPosterID,
			&post.FirstName,
			&post.LastName,
			&post.Date,
			&post.Content,
			&post.GroupID,
		)
		if err != nil {
			log.Println("Error scanning row:", err)
			continue
		}
		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
