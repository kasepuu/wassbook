package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func FetchSearchBarUsers(w http.ResponseWriter, r *http.Request) {
	searchInput := r.URL.Query().Get("filter")

	Users, fetchErr := function.FetchAllUsers(searchInput)
	if fetchErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Internal server issues!"))
		return
	}
	Users = function.SortUsers(Users)

	// return only public information
	sensitiveInfo := make([]PublicUserInfo, len(Users))
	for i, user := range Users {
		sensitiveInfo[i] = hidePrivateInformation(user)
	}

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(sensitiveInfo)
	if err != nil {
		log.Println(err)
		return
	}
}

func FetchNotifications(w http.ResponseWriter, r *http.Request) {
	userid := r.URL.Query().Get("UserID")
	uid, err := strconv.Atoi(userid)
	if err != nil {
		log.Println("Invalid userid in FetchUsersTryingToFollow():", err)

		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad request, please try again!"))
		return
	}

	Notifications, notErr := function.LoadNotifications(uid)
	if notErr != nil {
		log.Println("Errors encountered when trying to fetch:", notErr)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	if len(Notifications) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.WriteHeader(http.StatusOK)
	encodeErr := json.NewEncoder(w).Encode(Notifications)
	if encodeErr != nil {
		log.Println(encodeErr)
		return
	}
}

func FetchUserRequests(w http.ResponseWriter, r *http.Request) {
	userid := r.URL.Query().Get("UserID")
	uid, err := strconv.Atoi(userid)
	if err != nil {
		log.Println("Invalid userid in FetchUsersTryingToFollow():", err)

		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad request, please try again!"))
		return
	}

	FollowRequests, fetchErr := function.FetchFollowRequests(uid, "pending")
	GroupRequests, fetchErr2 := function.FetchGroupJoinRequests(uid)
	GroupInvites, fetchErr3 := function.FetchGroupInviteRequests(uid)

	if fetchErr != nil || fetchErr2 != nil || fetchErr3 != nil {
		log.Println("Errors encountered when trying to fetch:", fetchErr)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}

	if len(FollowRequests) == 0 && len(GroupRequests) == 0 && len(GroupInvites) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var FollowerRequests []function.UserInfo
	for u := 0; u < len(FollowRequests); u++ {
		userinfo, err := function.FetchUserInformation(FollowRequests[u], 0)
		if err != nil {
			log.Println("Error at UserID:", FollowRequests[u], "- error message:", err)
			continue
		}

		FollowerRequests = append(FollowerRequests, userinfo)
	}

	type Response struct {
		FollowerRequests []function.UserInfo
		GroupRequests    []function.GroupRequest
		GroupInvites     []function.GroupRequest
	}

	var resp Response

	resp.FollowerRequests = FollowerRequests
	resp.GroupRequests = GroupRequests
	resp.GroupInvites = GroupInvites

	w.WriteHeader(http.StatusOK)
	encodeErr := json.NewEncoder(w).Encode(resp)
	if encodeErr != nil {
		log.Println(encodeErr)
		return
	}
}

func FetchCurrentProfile(w http.ResponseWriter, r *http.Request) {
	// fetch-current-profile/?ProfileName=${id}&RequestedBy
	openedProfile := r.URL.Query().Get("ProfileName")
	requestedBy := r.URL.Query().Get("RequestedBy")
	loggedUserId := function.GetUserID(requestedBy)

	UserInfo, fetchErr := function.FetchUserInformation(function.GetUserID(openedProfile), loggedUserId)
	if fetchErr != nil {
		log.Println("Error fetching user information at profile request! Error Message:", fetchErr)
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte("User does not exist!"))

		return
	}

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(UserInfo)
	if err != nil {
		log.Println(err)
		return
	}
}

func FetchPosts(w http.ResponseWriter, r *http.Request) {
	currentUserId := r.URL.Query().Get("userID")

	stmt := `
	SELECT DISTINCT p.*
FROM posts AS p
LEFT JOIN (
  SELECT DISTINCT id, targetid
  FROM followers
  WHERE userId = ? AND status = 'following'
) AS f ON p.userid = f.targetId
WHERE 
  p.privacy = 'public'
  OR (p.privacy = 'private' AND f.id IS NOT NULL)
  OR (p.privacy = 'private' AND p.userId = ?)
  OR (
    p.privacy = 'almost_private' AND
    (
      p.userId = ? -- Posts created by the current user
      OR p.id IN (
        SELECT postId
        FROM privatePosts
        WHERE userId = ? -- Current user's ID in privatePosts
      )
    )
  );`

	rows, err := sqlDB.DataBase.Query(stmt, currentUserId, currentUserId, currentUserId, currentUserId)
	if err != nil {
		log.Fatalf("Err: %s", err)
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
			&post.Filename,
			&post.Privacy,
		)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}

		post.UserName = function.GetUserName(post.OriginalPosterID)

		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func FetchFollowersList(w http.ResponseWriter, r *http.Request) {
	currentUserId := r.URL.Query().Get("UserID")

	stmt := `
	SELECT DISTINCT followers.userid, users.nickname
	FROM followers
	LEFT JOIN users ON followers.userid = users.id
	WHERE followers.targetid = ?;
	`

	rows, err := sqlDB.DataBase.Query(stmt, currentUserId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	followers := make(map[string]string) // Create a map to store userid:nickname pairs

	for rows.Next() {
		var userid, nickname string

		err := rows.Scan(&userid, &nickname)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}

		followers[userid] = nickname
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(followers) // Encode the map as JSON and send it in the response
}

func FetchComments(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("postID")

	// Check if the "postID" parameter is empty or not provided
	if postID == "" {
		http.Error(w, "Missing 'postID' query parameter", http.StatusBadRequest)
		return
	}

	/*query := `SELECT id, postId, userId,
		(SELECT fname FROM users WHERE id = userid) AS fname,
		(SELECT lname FROM users WHERE id = userid) AS lname,
		content, date, filename
	FROM comments
	WHERE postId = ?`*/ // old query

	rows, err := sqlDB.DataBase.Query(`SELECT c.id, c.postId, c.userId, u.fname, u.lname, c.content, c.date, c.filename, u.nickname
	FROM comments c
	INNER JOIN users u ON c.userId = u.id
	WHERE c.postId = ?`, postID) // Adjust the query according to your table structure
	if err != nil {
		log.Println("Error querying posts:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	}
	defer rows.Close()

	var comments []CommentForm
	for rows.Next() {
		var comment CommentForm
		err := rows.Scan(
			&comment.CommentID,
			&comment.PostID,
			&comment.UserID,
			&comment.FirstName,
			&comment.LastName,
			&comment.Content,
			&comment.Date,
			&comment.Filename,
			&comment.UserName,
		)
		if err != nil {
			log.Println("Error scanning row:", err)
			continue
		}

		// comment.UserName = function.GetUserName(comment.UserID)

		comments = append(comments, comment)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func hidePrivateInformation(user function.UserInfo) (newInfo PublicUserInfo) {
	// return only public information
	newInfo = PublicUserInfo{
		UserID:     user.UserID,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		UserName:   user.UserName,
		Avatar:     user.Avatar,
		DateJoined: user.DateJoined,
	}

	return newInfo
}

func UpdateUserDescriptionHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID         int    `json:"userID"`
		NewDescription string `json:"newDescription"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	err = function.UpdateUserDescription(request.UserID, request.NewDescription)
	if err != nil {
		http.Error(w, "Failed to update user description", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "User description updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdateUserNameHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID      int    `json:"userID"`
		NewUsername string `json:"newUsername"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	err = function.UpdateUsername(request.UserID, request.NewUsername)
	if err != nil {
		http.Error(w, "Failed to update user description", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "User description updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdateProfilePictureHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userid")
	err := r.ParseMultipartForm(10 << 20) // Limit the file size to 10MB
	if err != nil {
		log.Println("Error parsing multipart form:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("File size too big!"))
		return
	}
	file, handler, err := r.FormFile("file")
	fileName := handler.Filename
	fileExt := filepath.Ext(fileName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal issue, please try again later!"))
		return
	} else {
		defer file.Close()

		// Construct the image directory for the user
		imageDir := filepath.Join("backend/users", userID+"/profilepic")
		err = os.MkdirAll(imageDir, os.ModePerm) // Create the directory if it doesn't exist
		if err != nil {
			log.Println("Error creating images directory:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}
		// Remove all files in the user's directory
		files, err := os.ReadDir(imageDir)
		if err != nil {
			log.Println("Error reading user's image directory:", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal issue, please try again later!"))
			return
		}
		for _, f := range files {
			err := os.Remove(filepath.Join(imageDir, f.Name()))
			if err != nil {
				log.Println("Error deleting existing file:", err)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Internal issue, please try again later!"))
				return
			}
		}

		// Save the new image to the specified location

		imagePath := filepath.Join(imageDir, "profilepic"+fileExt)
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

	response := map[string]string{"message": "User description updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func FetchPostsCreatedBy(w http.ResponseWriter, r *http.Request) {
	profileUserId := r.URL.Query().Get("userID")
	loggedUserId := r.URL.Query().Get("loggedUserID")
	rows, err := sqlDB.DataBase.Query(`SELECT DISTINCT p.*
	FROM posts AS p
	LEFT JOIN (
	  SELECT DISTINCT id, targetid
	  FROM followers
	  WHERE userId = ? AND status = 'following'
	) AS f ON p.userid = f.targetId
	WHERE 
	  (p.privacy = 'public'
	  OR (p.privacy = 'private' AND f.id IS NOT NULL)
	  OR (p.privacy = 'private' AND p.userId = ?)
	  OR (
		p.privacy = 'almost_private' AND
		(
		  p.userId = ? 
		  OR p.id IN (
			SELECT postId
			FROM privatePosts
			WHERE userId = ? 
		  )
		)
	  ))
	  AND p.userid = ?; 
	`, loggedUserId, loggedUserId, loggedUserId, loggedUserId, profileUserId)
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
			&post.Filename,
			&post.Privacy,
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

func DisplayMutualFollowers(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID int `json:"UserID"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)

	if err != nil {
		w.WriteHeader(http.StatusConflict)
		return
	}

	mutualFollowers, err := function.GetMutualFollowers(request.UserID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	// Convert the mutualFollowers slice to JSON and send it as a response
	responseJSON, err := json.Marshal(mutualFollowers)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJSON)
}
