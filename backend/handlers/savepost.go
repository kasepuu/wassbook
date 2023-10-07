package handler

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
	"github.com/google/uuid"
)

func Savepost(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // Limit the file size to 10MB
	if err != nil {
		log.Println("Error parsing multipart form:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("File size too big!"))
		return
	}

	contentBlob, _, err := r.FormFile("content")
	if err != nil {
		log.Println("Error getting content blob:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer contentBlob.Close()

	contentBytes, err := io.ReadAll(contentBlob)
	if err != nil {
		log.Println("Error reading content blob:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	var PostData PostForm
	err = json.Unmarshal(contentBytes, &PostData)
	if err != nil {
		log.Println("Error unmarshaling JSON data:", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad Request"))
		return
	}
	PostData.Date = time.Now().Format(time.RFC3339Nano)
	file, handler, err := r.FormFile("file")
	if err != nil {
		PostData.Filename = "-"
	} else {
		defer file.Close()
		currentDir, err := os.Getwd()
		if err != nil {
			log.Println("Error getting current working directory:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}

		imageDir := filepath.Join(currentDir, "backend/users/"+strconv.Itoa(PostData.OriginalPosterID))
		err = os.MkdirAll(imageDir, os.ModePerm) // Create the directory if it doesn't exist
		if err != nil {
			log.Println("Error creating images directory:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}
		uuidFileName := uuid.New().String()
		fileExt := filepath.Ext(handler.Filename)
		imagePath := filepath.Join(imageDir, uuidFileName+fileExt)
		PostData.Filename = uuidFileName + fileExt

		f, err := os.Create(imagePath)
		if err != nil {
			log.Println("Error creating image file:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}
		defer f.Close()

		_, err = io.Copy(f, file)
		if err != nil {
			log.Println("Error copying image file:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}
	}

	statement := `INSERT INTO posts (userId, fname, lname, date, content, groupId, filename, privacy) VALUES (?,?,?,?,?,?,?,?)`
	id, errExec := sqlDB.DataBase.Exec(statement,
		PostData.OriginalPosterID,
		PostData.FirstName,
		PostData.LastName,
		PostData.Date,
		PostData.Content,
		PostData.GroupID,
		PostData.Filename,
		PostData.Privacy,
	)
	postId, err := id.LastInsertId()
	if err != nil {
		log.Println(err)
	}
	if errExec != nil {
		log.Println("SQL execution error:", errExec)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	if len(PostData.SelectedFollowers) != 0 {
		var arrayFollowersId []int
		for _, value := range PostData.SelectedFollowers {
			if value != "" {
				num, err := strconv.Atoi(value)
				if err != nil {
					log.Println(err)
					return
				}
				arrayFollowersId = append(arrayFollowersId, num)
			}
		}

		for _, selectedUserId := range arrayFollowersId {
			statement := `INSERT INTO privatePosts (postId, userId) VALUES (?, ?)`
			_, err = sqlDB.DataBase.Exec(statement, postId, selectedUserId)

			if err != nil {
				log.Println(err)
			}
		}
		if err != nil {
			log.Println(err)
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Post saved successfully!"))
}
