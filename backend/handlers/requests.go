package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

// func SetFollowStatus(w http.ResponseWriter, r *http.Request, changeStatusTo string, changeStatusFrom string, RequesterID string, AccepterID string) {

func SetFollowStatus(w http.ResponseWriter, r *http.Request, changeStatusTo string, changeStatusFrom string) {
	// changeStatusTo -> following
	// changeStatusFrom -> pending
	RequesterID := r.URL.Query().Get("Requester")
	AccepterID := r.URL.Query().Get("Accepter")

	if RequesterID == "" || AccepterID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	query := "UPDATE followers SET status = ? WHERE userid = ? AND targetid = ? AND status = ?"
	if changeStatusTo == "remove" {
		query = "REMOVE FROM followers WHERE userid = ? and targetid = ? and status = ?"
		_, err := sqlDB.DataBase.Exec(query, RequesterID, AccepterID, changeStatusFrom)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusAccepted)
	}

	_, err := sqlDB.DataBase.Exec(query, changeStatusTo, RequesterID, AccepterID, changeStatusFrom)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
}

func SetFollowStatusAccepted(w http.ResponseWriter, r *http.Request) {
	SetFollowStatus(w, r, "following", "pending")
}

func SetFollowStatusDeclined(w http.ResponseWriter, r *http.Request) {
	SetFollowStatus(w, r, "remove", "pending")
}

func RequestUnfollow(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID   int `json:"UserID"`
		TargetID int `json:"TargetID"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)

	fmt.Println(request)

	if err != nil {
		w.WriteHeader(http.StatusConflict)
		return
	}
	_, sqlErr := sqlDB.DataBase.Exec("DELETE FROM followers WHERE userid = ? AND targetid = ?", request.UserID, request.TargetID)
	if sqlErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func RequestFollow(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID   int    `json:"UserID"`
		TargetID int    `json:"TargetID"`
		Status   string `json:"Status"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)

	fmt.Println(request)

	if err != nil {
		w.WriteHeader(http.StatusConflict)
		return
	}
	function.SaveFollow(request.UserID, request.TargetID, request.Status)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(request.Status))
}
