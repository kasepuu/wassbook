package handler

import (
	"fmt"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Register request received!")
	// register functionality here
}
