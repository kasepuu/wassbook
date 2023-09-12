package handler

import (
	"io"
	"net/http"
	"strings"
)

func ImageHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	var userID string
	var imageID string
	// Expecting: /users/{userID}/{imageID}
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusNotFound)
		return
	} else if len(parts) == 4 {
		userID = parts[2]
		imageID = parts[3]
	} else if len(parts) == 5 {
		userID = parts[2]
		imageID = parts[4]
	}

	// Define a list of possible file extensions
	extensions := []string{".png", ".jpg", ".jpeg", ".gif"} // Add more extensions as needed

	var imagePath string
	var imageFile http.File
	var err error

	// Try to find the image file with various extensions
	if len(parts) == 5 {
		for _, ext := range extensions {
			imagePath = "./backend/users/" + userID + "/profilepic/" + imageID + ext
			imageFile, err = http.Dir("./").Open(imagePath)
			if err == nil {
				break // Found the image with an extension
			}
		}
	} else {
		imagePath = "./backend/users/" + userID + "/" + imageID
		imageFile, err = http.Dir("./").Open(imagePath)
	}

	if err != nil {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}
	defer imageFile.Close()

	_, err = io.Copy(w, imageFile)
	if err != nil {
		http.Error(w, "Error serving image", http.StatusInternalServerError)
		return
	}
}
