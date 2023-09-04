package handler

import (
	"encoding/json"
	"net/http"

	// Import the necessary database driver package
	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func UpdatePrivateStatusHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID          int `json:"userID"`
		NewPrivateValue int `json:"newPrivateValue"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	// Assuming you have a function to update the private status in your database
	err = function.UpdatePrivateStatus(request.UserID, request.NewPrivateValue)
	if err != nil {
		http.Error(w, "Failed to update private status", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "Private status updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
