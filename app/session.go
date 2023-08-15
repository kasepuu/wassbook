// everything related to login/logout, sessions...
package app

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
	"github.com/gofrs/uuid"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var loginInfo LoginInfo
	err := json.NewDecoder(r.Body).Decode(&loginInfo)
	errorHandler(err)

	var password string
	var userId int
	rows := sqlDB.DataBase.QueryRow("SELECT password, id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?", strings.ToLower(loginInfo.Login), strings.ToLower(loginInfo.Login))
	scanErr := rows.Scan(&password, &userId)

	// on bad password
	if loginInfo.Password != password || scanErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Please check your password and account name and try again."))
		return
	}

	// on success
	response := LoginResponse{
		LoginName: getUserName(userId),
		UserID:    getUserId(loginInfo.Login),
		CookieKey: createCookie(w, loginInfo.Login),
	}

	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Println(err)
		return
	}
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var registerInfo RegisterInfo
	err := json.NewDecoder(r.Body).Decode(&registerInfo)
	errorHandler(err)

	var nicknameB, emailB bool
	var passwordB = strings.TrimSpace(registerInfo.Password) == ""
	var genderB = registerInfo.Gender == ""

	err1 := sqlDB.DataBase.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(?))", registerInfo.Username).Scan(&nicknameB)
	err2 := sqlDB.DataBase.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE lower(email) = lower(?))", registerInfo.Email).Scan(&emailB)

	if err1 == nil && err2 == nil {
		if emailB || nicknameB {
			responseMessage := ""
			if nicknameB {
				responseMessage = "name"
			} else if emailB {
				responseMessage = "email"
			} else if passwordB {
				responseMessage = "passwd"
			} else if genderB {
				responseMessage = "gendr"
			}

			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(registerInfo.Username + " " + registerInfo.Email + " " + "Bad register attempt! " + responseMessage))
			return
		} else {
			row, err := sqlDB.DataBase.Prepare("INSERT INTO users (username, password, email, age, gender, firstname, lastname) VALUES (?, ?, ?, ?, ?, ?, ?)")
			if err != nil {
				log.Println(err)
				return
			}

			_, erro := row.Exec(registerInfo.Username, registerInfo.Password, registerInfo.Email, registerInfo.Age, registerInfo.Gender, registerInfo.FirstName, registerInfo.LastName)
			if erro != nil {
				log.Println(erro)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write([]byte("Registration was successful!"))
		}
	} else {
		log.Println(err1)
		log.Println(err2)
		return
	}
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("UserID")
	currentSession := "session-" + userId
	http.SetCookie(w, &http.Cookie{
		Name:   currentSession,
		Value:  "0",
		MaxAge: -1,
	})

	id, err := strconv.Atoi(userId)
	if err == nil {
		removeSessionById(id)

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Logout was successful!"))
	} else {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad attempt!"))
	}

}

func HasCookieHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("CookieKey")
	uid := r.URL.Query().Get("UserID")

	var hasCookie bool
	err := sqlDB.DataBase.QueryRow("SELECT EXISTS(SELECT 1 FROM session WHERE key = ? AND userId = ?)", key, uid).Scan(&hasCookie)
	errorHandler(err)

	if hasCookie {
		response := map[string]string{
			"message": "Session for user found!",
		}
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			// Handle the JSON marshaling error, e.g., log the error and return an error response.
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResponse)
	} else {
		response := map[string]string{
			"message": "Session for user not found!",
		}
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			// Handle the JSON marshaling error, e.g., log the error and return an error response.
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write(jsonResponse)
	}
}

// functions

func createCookie(w http.ResponseWriter, loginInput string) string {
	userid := getUserId(loginInput)

	session := uuid.Must(uuid.NewV4()).String()
	http.SetCookie(w, &http.Cookie{
		Name:   "session-" + strconv.Itoa(userid),
		Value:  session,
		MaxAge: int(12 * time.Hour),
	})

	sqlDB.DataBase.Exec("DELETE FROM session WHERE userId = ?", userid)
	db, err := sqlDB.DataBase.Prepare("INSERT INTO session (key, userid) VALUES (?,?)")
	errorHandler(err)

	db.Exec(session, userid)

	return session
}

func SaveSession(key string, userId int) {
	sqlDB.DataBase.Exec("DELETE FROM session WHERE userId = ?", userId)

	statement, _ := sqlDB.DataBase.Prepare("INSERT INTO session (key, userId) VALUES (?,?)")
	_, err := statement.Exec(key, userId)
	if err != nil {
		log.Println("SQL [ERROR]: one per user")
	}
}
