package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strconv"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
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

		groups, err := function.GetGroups()
		toSend, _ := json.Marshal(groups)
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		w.WriteHeader(201)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)

	default:
		w.WriteHeader(401)
	}
}

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	switch r.Method {

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
		id, _ := strconv.Atoi(path.Base(r.URL.Path))

		groups, err := function.GetGroups()
		posts, postsErr := function.GetGroupPosts(id)
		
		if err != nil || postsErr != nil {
			http.Error(w, err.Error()+postsErr.Error(), http.StatusConflict)
			return
		}
		data := struct {
			Groups []function.Group
			Posts  []function.GroupPost
		}{
			Groups: groups,
			Posts:  posts,
		}
		users, _ := json.Marshal(data)
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
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

func GroupPosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		id, err := strconv.Atoi(path.Base(r.URL.Path))

		groups, err := function.GetGroupPosts(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		toSend, _ := json.Marshal(groups)
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)

	case "POST": //
		err := r.ParseMultipartForm(32 << 20) // 32 MB is the maximum file size
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()
		FAKEID := strconv.Itoa(2)
		f, err := os.OpenFile("./users/"+FAKEID+"/"+handler.Filename, os.O_WRONLY|os.O_CREATE, 0o666)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer f.Close()

		_, err = io.Copy(f, file)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func addGroupMember(w http.ResponseWriter, r *http.Request) {
}
