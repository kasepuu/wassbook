package handler

import (
	"io"
	"net/http"
	"strings"
)

func ImageHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")

	// Expecting: /users/{userID}/{imageID}.png
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	userID := parts[2]
	imageIDWithExtension := parts[3]
	// Determine the file extension from the image ID
	fileExtension := ""
	if strings.HasSuffix(imageIDWithExtension, ".png") {
		fileExtension = ".png"
	} else if strings.HasSuffix(imageIDWithExtension, ".jpg") {
		fileExtension = ".jpg"
	} else if strings.HasSuffix(imageIDWithExtension, ".jpeg") {
		fileExtension = ".jpeg"
	} else if strings.HasSuffix(imageIDWithExtension, ".gif") {
		fileExtension = ".gif"
	} else if strings.HasSuffix(imageIDWithExtension, ".bmp") {
		fileExtension = ".bmp"
	} else if strings.HasSuffix(imageIDWithExtension, ".webp") {
		fileExtension = ".webp"
	}

	// Set the appropriate content type based on the file extension
	switch fileExtension {
	case ".jpg", ".jpeg":
		w.Header().Set("Content-Type", "image/jpeg")
	case ".png":
		w.Header().Set("Content-Type", "image/png")
	case ".gif":
		w.Header().Set("Content-Type", "image/gif")
	case ".bmp":
		w.Header().Set("Content-Type", "image/bmp")
	case ".webp":
		w.Header().Set("Content-Type", "image/webp")
	default:
		http.Error(w, "Unsupported image format", http.StatusBadRequest)
		return
	}

	imagePath := "./backend/users/" + userID + "/" + imageIDWithExtension
	imageFile, err := http.Dir("./").Open(imagePath)
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
