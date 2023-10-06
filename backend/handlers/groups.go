package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	groups "01.kood.tech/git/kasepuu/social-network/backend/functions/groups"
)

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		name := r.FormValue("name")
		description := r.FormValue("description")
		tag := r.FormValue("tag")
		userId := r.FormValue("userId")

		userInt, _ := strconv.Atoi(userId)

		groups, err := groups.CreateGroup(groups.Group{Name: name, Tag: tag, Description: description, OwnerId: userInt})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		toSend, _ := json.Marshal(groups)
		w.WriteHeader(http.StatusCreated)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)

	default:
		w.WriteHeader(http.StatusBadRequest)
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
		var event groups.Event

		err = json.Unmarshal(b, &event)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		err = groups.CreateEvent(event)

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

		allGroups, err := groups.GetGroups()
		posts, postsErr := groups.GetPosts(id)

		if err != nil || postsErr != nil {
			http.Error(w, err.Error()+postsErr.Error(), http.StatusConflict)
			return
		}
		data := struct {
			Groups []groups.Group
			Posts  []groups.Post
		}{
			Groups: allGroups,
			Posts:  posts,
		}
		users, _ := json.Marshal(data)
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
		w.Write(users)
	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}

func GetGroup(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		id, err := strconv.Atoi(path.Base(r.URL.Path))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		groups, err := groups.GetGroup(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		users, _ := json.Marshal(groups)
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
		w.Write(users)
	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}

func GroupPosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		id, err := strconv.Atoi(path.Base(r.URL.Path))
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		groups, err := groups.GetPosts(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		toSend, _ := json.Marshal(groups)
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)

	case "POST":
		err := r.ParseMultipartForm(32 << 20) // maxMemory 32MB
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		content := r.MultipartForm.Value["content"][0]
		userId := r.MultipartForm.Value["userId"][0]
		groupId := r.MultipartForm.Value["groupId"][0]

		userInt, _ := strconv.Atoi(userId)
		groupInt, _ := strconv.Atoi(groupId)

		var posts []groups.Post

		savedFile, noFileErr := saveFile(r, userId)

		if noFileErr != nil {
			posts, err = groups.SavePost(groups.Post{UserId: userInt, GroupId: groupInt, Filename: "", Content: content}) // SIIS KUI POLE FAILI
		} else {
			posts, err = groups.SavePost(groups.Post{UserId: userInt, GroupId: groupInt, Filename: savedFile, Content: content}) // FAIL SALVESTATUD
		}

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		toSend, _ := json.Marshal(posts)
		w.WriteHeader(http.StatusCreated)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)
	}
}

func SaveGroupComment(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		err := r.ParseMultipartForm(32 << 20) // maxMemory 32MB
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		content := r.MultipartForm.Value["content"][0]
		userId := r.MultipartForm.Value["userId"][0]
		postId := r.MultipartForm.Value["postId"][0]
		groupId := r.MultipartForm.Value["groupId"][0]

		userInt, _ := strconv.Atoi(userId)
		groupInt, _ := strconv.Atoi(groupId)
		postInt, _ := strconv.Atoi(postId)

		var posts []groups.Post

		savedFile, noFileErr := saveFile(r, userId)

		if noFileErr != nil {
			posts, _ = groups.SaveComment(groups.Comment{UserId: userInt, GroupId: groupInt, PostId: postInt, Content: content}) // SIIS KUI POLE FAILI
		} else {
			posts, _ = groups.SaveComment(groups.Comment{UserId: userInt, GroupId: groupInt, PostId: postInt, Filename: savedFile, Content: content}) // FAIL SALVESTATUD
		}

		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		toSend, _ := json.Marshal(posts)
		w.WriteHeader(http.StatusCreated)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)
	}
}

func CancelGroupJoin(w http.ResponseWriter, r *http.Request) {
	senderID := r.FormValue("senderId")
	receiverID := r.FormValue("receiverId")
	groupID := r.FormValue("groupId")

	sid, _ := strconv.Atoi(senderID)
	tid, _ := strconv.Atoi(receiverID)
	gid, _ := strconv.Atoi(groupID)

	err := function.SetGroupStatus(tid, gid, "remove")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = function.RemoveNotification(sid, tid, "your group")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GroupInvite(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		err := r.ParseMultipartForm(32 << 20) // maxMemory 32MB
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		senderId := r.MultipartForm.Value["senderId"][0]
		receiverId := r.MultipartForm.Value["receiverId"][0]
		groupId := r.MultipartForm.Value["groupId"][0]
		status := r.MultipartForm.Value["status"][0]

		senderInt, _ := strconv.Atoi(senderId)
		groupInt, _ := strconv.Atoi(groupId)
		receiverInt, _ := strconv.Atoi(receiverId)

		groups.CreateMember(groups.GroupInvite{GroupId: groupInt, ReceiverId: receiverInt, SenderId: senderInt, Status: status})

		users, err := groups.GetAllMembers(groupInt)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		toSend, _ := json.Marshal(users)
		w.WriteHeader(http.StatusCreated)
		w.Header().Set("content-type", "application/json")
		w.Write(toSend)
	}
}

func saveFile(r *http.Request, userId string) (string, error) {
	file, handler, err := r.FormFile("file")
	if err != nil {
		return "", err
	}

	fileData := handler.Header.Get("Content-Disposition")
	ext := filepath.Ext(fileData)
	ext = strings.TrimSuffix(ext, "\"")

	dst, err := os.CreateTemp("backend/users/"+userId, "post-images-*"+ext)
	if err != nil {
		return "", err
	}

	_, err = io.Copy(dst, file)

	savedFileName := "users/" + userId + "/" + filepath.Base(dst.Name())

	return savedFileName, err
}
