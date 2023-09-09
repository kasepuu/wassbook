package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path"
	"strconv"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	// TODO mõelda, mis siis kui sisse logitud
	case "POST":
		b, err := io.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		var group function.Group

		err = json.Unmarshal(b, &group)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		err = function.CreateGroup(group)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("content-type", "application/json")

		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		w.WriteHeader(201)

	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	// TODO mõelda, mis siis kui sisse logitud
	case "POST":
		b, err := io.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		var event function.Event

		err = json.Unmarshal(b, &event)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		err = function.CreateEvent(event)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("content-type", "application/json")

		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		w.WriteHeader(201)

	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}

func GetGroups(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		groups, err := function.GetGroups()
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		users, _ := json.Marshal(groups)
		w.WriteHeader(200)
		w.Header().Set("content-type", "nviapplication/json")
		w.Write(users)
	}
}

func GetGroup(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		id, err := strconv.Atoi(path.Base(r.URL.Path))
		fmt.Println(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		groups, err := function.GetGroup(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		fmt.Println(id)


		users, _ := json.Marshal(groups)
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
		w.Write(users)
	}
}
