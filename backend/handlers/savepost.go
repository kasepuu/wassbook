package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func Savepost(w http.ResponseWriter, r *http.Request) {
	// Parse the form data including the image
	err := r.ParseMultipartForm(10 << 20) // Limit the file size to 10MB
	if err != nil {
		log.Println("Error parsing multipart form:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("File size too big!"))
		return
	}

	// Read the content blob from the form
	contentBlob, _, err := r.FormFile("content")
	if err != nil {
		log.Println("Error getting content blob:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer contentBlob.Close()

	// Read the content of the blob
	contentBytes, err := io.ReadAll(contentBlob)
	if err != nil {
		log.Println("Error reading content blob:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	// Unmarshal the JSON data from the contentBytes
	var PostData PostForm
	err = json.Unmarshal(contentBytes, &PostData)
	if err != nil {
		log.Println("Error unmarshaling JSON data:", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad Request"))
		return
	}
	PostData.Date = time.Now().Format("02.01.2006 15:04")
	// Log successful decoding
	log.Println("JSON data decoded successfully:", PostData)

	// Extract the image file
	file, handler, err := r.FormFile("file")
	if err != nil {
		PostData.Filename = "-"
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

		imageDir := filepath.Join(currentDir, "backend/users/"+strconv.Itoa(PostData.OriginalPosterID))
		err = os.MkdirAll(imageDir, os.ModePerm) // Create the directory if it doesn't exist
		if err != nil {
			log.Println("Error creating images directory:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}

		randomBytes := make([]byte, 16) // 16 bytes = 128 bits
		_, err = rand.Read(randomBytes)
		if err != nil {
			log.Println("Error")
		}
		randomFilename := hex.EncodeToString(randomBytes) + "_" + handler.Filename
		PostData.Filename = randomFilename

		// Construct the image path with the randomized filename
		imagePath := filepath.Join(imageDir, randomFilename)

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
	statement, errS := sqlDB.DataBase.Prepare("INSERT INTO posts (userId, fname, lname, date, content, groupId, filename) VALUES (?,?,?,?,?,?,?)")
	if errS != nil {
		log.Println("SQL preparation error:", errS)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer statement.Close()

	_, errExec := statement.Exec(
		PostData.OriginalPosterID,
		PostData.FirstName,
		PostData.LastName,
		PostData.Date,
		PostData.Content,
		PostData.GroupID,
		PostData.Filename,
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
