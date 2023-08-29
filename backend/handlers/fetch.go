package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func FetchSearchBarUsers(w http.ResponseWriter, r *http.Request) {
	searchInput := r.URL.Query().Get("filter")

	Users, fetchErr := fetchAllUsers(searchInput)
	if fetchErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Internal server issues!"))
		return
	}

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

	fmt.Println("fetch request received!", openedProfile, "profile opened, requested by:", requestedBy)

	UserInfo, fetchErr := fetchUserInformation(getUserID(openedProfile), 0)
	if fetchErr != nil {
		log.Println("Error fetching user information at profile request! Error Message:", fetchErr)
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte("User does not exist!"))

		return
	}

	//if requestedBy is not friends with openedprofile then -> hidePrivateInformation(UserInfo)

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(UserInfo)
	if err != nil {
		log.Println(err)
		return
	}
}

func hidePrivateInformation(user UserInfo) (newInfo PublicUserInfo) {
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
