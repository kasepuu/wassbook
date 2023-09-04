package handler

import (
	"fmt"
	"log"
	"net/http"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
	"github.com/dgrijalva/jwt-go"
)

// https://www.youtube.com/watch?v=-Eei8eik1Io&ab_channel=NerdCademy

var SecretKEY = []byte("supermees") // key that protects the token, to avoid tampering with it
var api_key = "MegaTurvaline123"    // key that is required to Create JWT key

func CreateJWT(username string) (string, error) {

	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	userInfo, fetchErr := function.FetchUserInformation(function.GetUserID(username), 0)
	if fetchErr != nil {
		log.Println("[sql] Something went wrong while Creating JWT", fetchErr)
		return "", fetchErr
	}
	claims["UserInfo"] = userInfo

	tokenStr, err := token.SignedString(SecretKEY)
	if err != nil {
		log.Println("Error signing token: ", err.Error())
		return "", err
	}

	_, deleteErr := sqlDB.DataBase.Exec("DELETE FROM sessions WHERE userid = ?", function.GetUserID(username))
	if deleteErr != nil {
		log.Printf("Error deleting session for user %s: %v", username, deleteErr)
		return "", fmt.Errorf("failed to delete session: %w", deleteErr)
	}

	_, execError := sqlDB.DataBase.Exec("INSERT INTO sessions (token, userid) VALUES (?,?)", tokenStr, function.GetUserID(username))
	if execError != nil {
		log.Println("There was an sql issue, when trying to insert a new token to the table:", execError.Error())
		return "", execError
	}

	return tokenStr, nil
}

func ValidateJWT(w http.ResponseWriter, r *http.Request) {
	if r.Header["Token"] != nil {
		// check if the token is saved
		var savedToken string
		rows := sqlDB.DataBase.QueryRow("SELECT token FROM sessions WHERE token = ?", r.Header["Token"][0])
		scanErr := rows.Scan(&savedToken)
		if scanErr != nil {
			log.Println("Expired token found!", scanErr)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("not authorized"))
			return
		}

		token, err := jwt.Parse(r.Header["Token"][0], func(t *jwt.Token) (interface{}, error) {
			_, ok := t.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("not authorized"))
			}
			return SecretKEY, nil
		})

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("not authorized"))
		}

		if token.Valid {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("you are authorized!"))
		}
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("not authorized"))
	}
}

func GetJwt(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("User")
	if r.Header["Access"] != nil {
		if r.Header["Access"][0] == api_key {
			token, err := CreateJWT(username)
			if err != nil {
				log.Println(err)
				return
			}
			fmt.Fprint(w, token)
		}
	} else {
		log.Println("Access field empty or invalid!")
	}
}
