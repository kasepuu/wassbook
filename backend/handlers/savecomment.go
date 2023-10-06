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

func SaveComment(w http.ResponseWriter, r *http.Request) {
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

	var CommentData CommentForm
	err = json.Unmarshal(contentBytes, &CommentData)
	if err != nil {
		log.Println("Error unmarshaling JSON data:", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad Request"))
		return
	}
	CommentData.Date = time.Now().Format("02.01.2006 15:04")

	// Extract the image file
	file, handler, err := r.FormFile("file")
	if err != nil {
		CommentData.Filename = "-"
	} else {
		defer file.Close()

		// Save the image to a specific location
		currentDir, err := os.Getwd()
		if err != nil {
			log.Println("Error getting current working directory:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}

		imageDir := filepath.Join(currentDir, "backend/users/"+strconv.Itoa(CommentData.UserID))
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
		CommentData.Filename = uuidFileName + fileExt

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

	// Insert the data into the database
	statement, errS := sqlDB.DataBase.Prepare("INSERT INTO comments (postId, userId, date, content, filename) VALUES (?,?,?,?,?)")
	if errS != nil {
		log.Println("SQL preparation error:", errS)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer statement.Close()

	_, errExec := statement.Exec(
		CommentData.PostID,
		CommentData.UserID,
		CommentData.Date,
		CommentData.Content,
		CommentData.Filename,
	)
	if errExec != nil {
		log.Println("SQL execution error:", errExec)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Comment saved successfully!"))
}
