package handler

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// https://www.youtube.com/watch?v=-Eei8eik1Io&ab_channel=NerdCademy

var SecretKEY = []byte("supermees") // key that protects the token, to avoid tampering with it
var api_key = "MegaTurvaline123"    // key that is required to Create JWT key

func CreateJWT() (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	// fetchUserInformation()

	claims["sub"] = "1"
	claims["username"] = "sinunimi"
	claims["exp"] = time.Now().Add(time.Hour).Unix() // make the token expire after 1h

	tokenStr, err := token.SignedString(SecretKEY)
	if err != nil {
		log.Println("Error signing token: ", err.Error())
		return "", err
	}

	fmt.Println("token created: ", tokenStr)
	return tokenStr, nil
}

func ValidateJWT(w http.ResponseWriter, r *http.Request) {
	if r.Header["Token"] != nil {
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
			fmt.Println(token, "<= on valid token!")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("you are authorized!"))
		}
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("not authorized"))
	}
}

func GetJwt(w http.ResponseWriter, r *http.Request) {
	if r.Header["Access"] != nil {
		if r.Header["Access"][0] == api_key {
			token, err := CreateJWT()
			if err != nil {
				fmt.Println(err)
				return
			}
			fmt.Fprint(w, token)
		}
	} else {
		log.Println("Access field empty or invalid!")
	}
}
