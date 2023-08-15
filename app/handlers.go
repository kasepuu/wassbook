package app

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func GetPostListHandler(w http.ResponseWriter, r *http.Request) {
	posts := getAllPosts()
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(posts)
	if err != nil {
		log.Println(err)
		return
	}
}

func SendCommentList(w http.ResponseWriter, r *http.Request) {
	postId, err := strconv.Atoi(r.URL.Query().Get("PostID"))
	if err == nil {
		postData, comments := getAllComments(postId)

		response := CommentResponseWPostData{
			PostData: postData,
			Comments: comments,
		}

		w.WriteHeader(http.StatusOK)
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Println(err)
			return
		}
	} else {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad attempt!"))
	}
}

func AddPostHandler(w http.ResponseWriter, r *http.Request) {
	var newPostInfo NewPostInfo
	err := json.NewDecoder(r.Body).Decode(&newPostInfo)
	errorHandler(err)

	userId := r.URL.Query().Get("UserID")

	var emptyTitle = strings.TrimSpace(newPostInfo.Title) == ""
	var emptyContent = strings.TrimSpace(newPostInfo.Content) == ""
	var emptyCategory = strings.TrimSpace(newPostInfo.Categories) == ""

	if emptyTitle || emptyContent || emptyCategory {
		log.Println("Error creating a comment! Empty content!")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(newPostInfo.Title + " " + newPostInfo.Content))
		return
	} else {

		statement, _ := sqlDB.DataBase.Prepare("INSERT INTO posts (userId, title, content, categoryId, date) VALUES (?,?,?,?,?)")

		currentTime := time.Now().Format(time.RFC3339Nano)

		_, erro := statement.Exec(userId, newPostInfo.Title, newPostInfo.Content, getCategoryFromName(newPostInfo.Categories), currentTime)
		if erro != nil {
			log.Println("SQL [ERROR]: one per user")
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("TIPTOP!"))
	}
}

func AddCommentHandler(w http.ResponseWriter, r *http.Request) {
	var newCommentInfo NewCommentInfo
	err := json.NewDecoder(r.Body).Decode(&newCommentInfo)
	errorHandler(err)

	userId := r.URL.Query().Get("UserID")

	var emptyContent = strings.TrimSpace(newCommentInfo.Content) == ""

	if emptyContent {
		log.Println("Error creating a comment! Empty content!")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(newCommentInfo.Content + " " + newCommentInfo.PostID))
		return
	} else {
		statement, _ := sqlDB.DataBase.Prepare("INSERT INTO comments (userId, postId, content, datecommented) VALUES (?,?,?,?)")

		currentTime := time.Now().Format(time.RFC3339Nano)

		_, erro := statement.Exec(userId, newCommentInfo.PostID, newCommentInfo.Content, currentTime)
		if erro != nil {
			log.Println("SQL [ERROR]: one per user")
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("TIPTOP!"))
	}
}
