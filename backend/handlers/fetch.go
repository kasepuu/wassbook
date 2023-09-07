package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
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

func FetchCurrentProfile(w http.ResponseWriter, r *http.Request) {
	// fetch-current-profile/?ProfileName=${id}&RequestedBy
	openedProfile := r.URL.Query().Get("ProfileName")
	requestedBy := r.URL.Query().Get("RequestedBy")
	loggedUserId := function.GetUserID(requestedBy)

	fmt.Println("fetch request received!", openedProfile, "profile opened, requested by:", requestedBy)

	UserInfo, fetchErr := function.FetchUserInformation(function.GetUserID(openedProfile), loggedUserId)
	if fetchErr != nil {
		log.Println("Error fetching user information at profile request! Error Message:", fetchErr)
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte("User does not exist!"))

		return
	}
	//if requestedBy is not friends with openedprofile then -> hidePrivateInformation(UserInfo)
	// AND FOLLOW STATUS !!!!! TODO!
	if UserInfo.PrivateStatus == 1 && UserInfo.UserID != loggedUserId {
		UserInfo.Email = "Private"
		UserInfo.DateOfBirth = nil
		UserInfo.Description = "Private"
		UserInfo.DateJoined = "Private"
	}

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(UserInfo)
	if err != nil {
		log.Println(err)
		return
	}
}

func FetchPosts(w http.ResponseWriter, r *http.Request) {
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
			&post.Filename,
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

func FetchPostsCreatedBy(w http.ResponseWriter, r *http.Request) {

	var request struct {
		UserName string `json:"userName"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	rows, err := sqlDB.DataBase.Query("SELECT * FROM posts WHERE userId = (SELECT id FROM users WHERE nickname = ?)", request.UserName)
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
